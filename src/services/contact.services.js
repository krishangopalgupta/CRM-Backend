import mongoose from "mongoose";
import Contact from "../models/contact.model.js";
import Customer from "../models/customer.model.js";
import AppError from "../utils/AppError.js";
import { isValidObjectId } from "../validations/ObjectIdValidations.js";
import { decodeCursor, encodeCursor } from "../utils/pagination.js";

const createContactService = async (
  customerId,
  organizationId,
  userId,
  contactData,
) => {
  isValidObjectId(customerId, "customerId");
  isValidObjectId(organizationId, "organizationId");
  isValidObjectId(userId, "userId");

  const { name, email, role } = contactData;
  const phone = contactData?.phone ?? null;

  // 1. Confirm that the customer exists, is active,
  // and belongs to this organization.
  const customerExist = await Customer.exists({
    organizationId,
    customerId,
    isDeleted: false,
  });
  if (!customerExist) throw new AppError("customer doesn't exist", 404);

  // 2. Check for an existing email under this customer.
  // Deleted contacts also reserve their email.
  const contactExist = await Contact.exists({
    organizationId,
    customerId,
    isDeleted: false,
    email,
  });
  if (contactExist) throw new AppError("customer is already exist", 409);

  // 3. Create the contact using trusted server-side IDs.
  let contact;
  try {
    contact = await Contact.create({
      organizationId,
      customerId,
      createdBy: userId,
      name,
      email,
      phone,
      role,
      createdBy: userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("customer is already exist", 409);
    }
  }

  await contact.populate([
    { path: "organizationId", select: "orgName" },
    { path: "customerId", select: "name" },
  ]);
  return contact;
};

// it creates problem during generation of cursor because of organizationId we need to pass contactId too for that we've to change the pagination
const getContactService = async (
  customerId,
  organizationId,
  limit,
  cursor,
  sort,
  search,
) => {
  isValidObjectId(customerId, "customerId");
  isValidObjectId(organizationId, "organizationId");
  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const customerExist = await Customer.exists({
    _id: customerId,
    organizationId,
    isDeleted: false,
  });
  if (!customerExist) throw new AppError('customer doesn"t exist', 404);

  const customerObjectId = new mongoose.Types.ObjectId(customerId);
  const organizationObjectId = new mongoose.Types.ObjectId(organizationId);
  const filter = {
    customerId: customerObjectId,
    organizationId: organizationObjectId,
    isDeleted: false,
  };

  if (search) {
    const searchRegex = new Regex(escapeRegex(search, "i"));
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const operator = sort === "newest" ? "$lt" : "$gt";
  if (cursor) {
    const decodedCursorValue = decodeCursor(cursor, organizationId);
    filter.$and = [
      {
        $or: [
          { createdAt: { [operator]: decodedCursorValue.createdAt } },
          {
            createdAt: decodedCursorValue.createdAt,
            _id: {
              [operator]: new mongoose.Types.ObjectId(decodedCursorValue?.id),
            },
          },
        ],
      },
    ];
  }

  let sortOrder =
    sort === "newest" ? { createdAt: -1, _id: -1 } : { createdAt: 1, _id: 1 };
  const contact = await Contact.aggregate([
    { $match: filter },
    { $sort: sortOrder },
    { $limit: limit + 1 },
    {
      $lookup: {
        from: "organizations",
        localField: "organizationId",
        foreignField: "_id",
        as: "orgDetails",
      },
    },

    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerDetails",
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        email: 1,
        role: 1,
        createdAt: 1,
        "orgDetails._id": 1,
        "orgDetails.orgName": 1,
        "customerDetails._id": 1,
        "customerDetails.name": 1,
      },
    },
  ]);

  const hasNextPage = contact.length > limit;
  if (hasNextPage) contact.pop();

  const lastContact = contact.at(-1);
  return {
    contact,
    limit,
    hasNextPage,
    nextCursor:
      hasNextPage && lastContact
        ? encodeCursor(lastContact, organizationId)
        : null,
  };
};

const updateContactService = async (
  organizationId,
  userId,
  customerId,
  contactId,
  contactData,
) => {
  isValidObjectId(organizationId);
  isValidObjectId(customerId);
  isValidObjectId(userId);
  isValidObjectId(contactId);

  const customerExist = await Customer.exists({
    _id: customerId,
    organizationId,
    isDeleted: false,
  });
  if (!customerExist) throw new AppError("customer doesn't exist", 404);

  const filter = {
    _id: contactId,
    customerId,
    organizationId,
    isDeleted: false,
  };

  const contactExist = await Contact.findOne(filter);
  if (!contactExist) throw new AppError("contact doesn't exist", 404);

  const { name, email, phone, role } = contactData;
  let updatedData = {};
  if (name) updatedData.name = name;
  if (email) updatedData.email = email;
  if (phone) updatedData.phone = phone;
  if (role) updatedData.role = role;

  const changes = Object.keys(updatedData).filter((field) => {
    return contactExist[field] !== updatedData[field];
  });

  if (changes.length === 0) {
    return {
      contact: contactExist,
      changed: false,
    };
  }

  const updatedContact = await Contact.findOneAndUpdate(
    filter,
    { $set: { ...updatedData, lastUpdatedBy: userId } },
    { returnDocument: "after", runValidators: true },
  ).populate([
    { path: "lastUpdatedBy", select: "name" },
    { path: "organizationId", select: "orgName" },
  ]);

  return updatedContact;
};

const deleteContactService = async (
  organizationId,
  userId,
  customerId,
  contactId,
) => {
  isValidObjectId(organizationId);
  isValidObjectId(customerId);
  isValidObjectId(userId);
  isValidObjectId(contactId);

  const customerExist = await Customer.exists({
    _id: customerId,
    organizationId,
    isDeleted: false,
  });
  if (!customerExist) throw new AppError("customer doesn't exist", 404);

  const filter = {
    _id: contactId,
    customerId,
    organizationId,
    isDeleted: false,
  };

  const contact = await Contact.findOneAndUpdate(
    filter,
    {
      $set: { isDeleted: true, deletedBy: userId, deletedAt: Date.now() },
    },
    { returnDocument: "after", runValidators: true },
  );
  if (!contact)
    throw new AppError("contact doesn't exist or already deleted", 404);

  return contact;
};

// chatgpt
// const updateContactService = async (
//   organizationId,
//   userId,
//   customerId,
//   contactId,
//   contactData,
// ) => {
//   isValidObjectId(organizationId, "organizationId");
//   isValidObjectId(customerId, "customerId");
//   isValidObjectId(userId, "userId");
//   isValidObjectId(contactId, "contactId");

//   // 1. Verify that the customer belongs to this organization.
//   const customerExist = await Customer.exists({
//     _id: customerId,
//     organizationId,
//     isDeleted: false,
//   });

//   if (!customerExist) {
//     throw new AppError("Customer doesn't exist", 404);
//   }

//   // 2. Scope the contact to this customer and organization.
//   const filter = {
//     _id: contactId,
//     customerId,
//     organizationId,
//     isDeleted: false,
//   };

//   const contactExist = await Contact.findOne(filter);

//   if (!contactExist) {
//     throw new AppError("Contact doesn't exist", 404);
//   }

//   // 3. Build a partial update using only allowed fields.
//   const allowedFields = ["name", "email", "phone", "role"];
//   const updatedData = {};

//   for (const field of allowedFields) {
//     if (Object.hasOwn(contactData, field)) {
//       updatedData[field] = contactData[field];
//     }
//   }

//   // 4. Find actual changes.
//   const changes = Object.keys(updatedData)
//     .filter((field) => {
//       const oldValue = contactExist[field] ?? null;
//       const newValue = updatedData[field] ?? null;

//       return oldValue !== newValue;
//     })

//   // 5. Nothing changed: don't update lastUpdatedBy.
//   if (changes.length === 0) {
//     return {
//       contact: contactExist,
//       changed: false,
//       changes,
//     };
//   }

//   // 6. Update only the matching active contact.
//   let updatedContact;

//   try {
//     updatedContact = await Contact.findOneAndUpdate(
//       filter,
//       {
//         $set: {
//           ...updatedData,
//           lastUpdatedBy: userId,
//         },
//       },
//       {
//         returnDocument: "after",
//         runValidators: true,
//       },
//     );
//   } catch (error) {
//     if (error.code === 11000) {
//       throw new AppError("A contact with this email already exists", 409);
//     }

//     throw error;
//   }

//   if (!updatedContact) {
//     throw new AppError("Contact doesn't exist", 404);
//   }

//   await updatedContact.populate([
//     { path: "lastUpdatedBy", select: "name" },
//     { path: "organizationId", select: "orgName" },
//   ]);

//   return {
//     contact: updatedContact,
//     changed: true,
//   };
// };

export {
  createContactService,
  getContactService,
  updateContactService,
  deleteContactService,
};
