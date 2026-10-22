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

  const contactExist = await Contact.findById(filter);
  if (!contactExist) throw new AppError("customer doesn't exist", 404);

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
    return;
  }

  const updatedContact = await Contact.findOneAndUpdate(
    filter,
    { $set: updatedData, lastUpdatedBy: userId },
    { returnDocument: "after", runValidators: true },
  ).populate([
    { path: "lastUpdatedBy", select: "name" },
    { path: "organizationId", select: "orgName" },
  ]);

  return updatedContact;
};
export { createContactService, getContactService, updateContactService };
