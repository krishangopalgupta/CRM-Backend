import mongoose, { Types } from "mongoose";
import Customer from "../models/customer.model.js";
import { decodeCursor, encodeCursor } from "../utils/pagination.js";
import AppError from "../utils/AppError.js";
import { isValidObjectId } from "../validations/ObjectIdValidations.js";
import customerActivity from "../models/customerActivity.model.js";

// create the customer
const createCustomerService = async (
  customerData,
  { organizationId, userId },
) => {
  isValidObjectId(organizationId, "organizationId");
  isValidObjectId(userId, "userId");

  const { name, email, phone } = customerData;

  const session = await mongoose.startSession();
  let customer;
  try {
    await session.withTransaction(async () => {
      const doesEmailAlreadyExist = await Customer.findOne({
        organizationId,
        isDeleted: false,
        $or: [{ email }, { phone }],
      }).session(session);

      if (doesEmailAlreadyExist)
        throw new AppError("customer is already exist", 409);

      [customer] = await Customer.create(
        [
          {
            name,
            email,
            phone,
            organizationId,
            createdBy: userId,
            lastUpdatedBy: userId,
          },
        ],
        { session },
      );

      await customerActivity.create(
        [
          {
            organizationId,
            customerId: customer?._id,
            performedBy: userId,
            action: "customer.created",
            changeFields: ["name", "email", "phone"],
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  await customer.populate("organizationId", "orgName orgSlug");
  return customer;
};

// get single customer
const getCustomerService = async (customerId, organizationId) => {
  isValidObjectId(customerId, "customerId");
  isValidObjectId(organizationId, "organizationId");

  const customerObjectId = new Types.ObjectId(customerId);
  const organizationObjectId = new Types.ObjectId(organizationId);

  const customer = await Customer.aggregate([
    {
      $match: {
        _id: customerObjectId,
        organizationId: organizationObjectId,
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: "organizations",
        localField: "organizationId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              orgName: 1,
              orgEmail: 1,
              orgSlug: 1,
            },
          },
        ],

        as: "organizationDetails",
      },
    },

    {
      $unwind: {
        path: "$organizationDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        createdBy: 1,
        lastUpdatedBy: 1,
        organizationDetails: 1,
      },
    },
  ]);

  if (customer.length === 0)
    throw new AppError("customer is either deleted or doesn't exist", 404);
  return customer;
};

// get all customer
const getAllCustomerService = async (
  organizationId,
  limit,
  search = "",
  sort = "newest",
  cursorValue,
) => {
  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // restrict the query to the organization filter
  const filter = { organizationId, isDeleted: false };
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const operator = sort === "newest" ? "$lt" : "$gt";
  if (cursorValue) {
    const cursor = decodeCursor(cursorValue, organizationId);
    filter.$and = [
      {
        $or: [
          { createdAt: { [operator]: cursor.createdAt } },
          {
            createdAt: cursor.createdAt,
            _id: { [operator]: cursor.id },
          },
        ],
      },
    ];
  }

  let sortOrder = {};
  if (sort === "oldest") sortOrder = { createdAt: 1, _id: 1 };
  else sortOrder = { createdAt: -1, _id: -1 };

  const customers = await Customer.find(filter)
    .populate("organizationId", "orgName orgSlug")
    .sort(sortOrder)
    .limit(limit + 1);

  const hasNextPage = customers.length > limit;
  if (hasNextPage) customers.pop();

  const lastCustomer = customers.at(-1);

  return {
    customers,
    hasNextPage,
    nextCursor:
      hasNextPage && lastCustomer
        ? encodeCursor(lastCustomer, organizationId)
        : null,
  };
};

// update customer
const updateCustomerService = async (
  customerId,
  customerData,
  { organizationId, userId },
) => {
  isValidObjectId(customerId, "customerId");
  isValidObjectId(userId, "userId");

  const session = await mongoose.startSession();

  let updatedCustomer, customerUpdateHistory;
  try {
    await session.withTransaction(async () => {
      const existingCustomer = await Customer.findOne({
        organizationId,
        _id: customerId,
        isDeleted: false,
      }).session(session);
      if (!existingCustomer) throw new AppError("customer doesn't exist", 404);

      const { name, email, phone } = customerData;
      let updatedData = {};
      if (name) updatedData.name = name;
      if (phone) updatedData.phone = phone;
      if (email) updatedData.email = email;

      const changes = Object.keys(updatedData)
        .filter((field) => {
          return existingCustomer[field] !== updatedData[field];
        })
        .map((field) => {
          return {
            field,
            oldValue: existingCustomer[field],
            newValue: updatedData[field],
          };
        });

      if (changes.length === 0) {
        console.log(changes);
        return;
      }

      updatedCustomer = await Customer.findOneAndUpdate(
        {
          organizationId,
          _id: customerId,
          isDeleted: false,
        },
        { $set: updatedData, lastUpdatedBy: userId },
        { returnDocument: "after", runValidators: true, session },
      );

      [customerUpdateHistory] = await customerActivity.create(
        [
          {
            organizationId,
            customerId,
            performedBy: userId,
            action: "customer.update",
            changes,
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return { updatedCustomer, customerUpdateHistory };
};

// customer delete service
const deleteCustomerService = async (customerId, organizationId, userId) => {
  isValidObjectId(customerId);
  isValidObjectId(organizationId);
  isValidObjectId(userId);

  const session = await mongoose.startSession();

  let customer;
  try {
    // both the operation will happened inside the transaction if customer not found just revoked the transaction
    await session.withTransaction(async () => {
      customer = await Customer.findOneAndUpdate(
        {
          _id: customerId,
          organizationId,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
            deletedBy: userId,
            deletedAt: new Date(),
            lastUpdatedBy: userId,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
          session,
        },
      );

      if (!customer) {
        throw new AppError("Customer is either deleted or doesn't exist", 404);
      }

      await customerActivity.create(
        [
          {
            organizationId,
            customerId,
            performedBy: userId,
            action: "customer.deleted",
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return customer;
};

// customer restored service
const restoreCustomerService = async (
  customerId,
  organizationId,
  userId,
) => {
  isValidObjectId(customerId);
  isValidObjectId(organizationId);
  isValidObjectId(userId);

  const session = await mongoose.startSession();

  let customer;
  try {
    // both the operation will happened inside the transaction if customer not found just revoked the transaction
    await session.withTransaction(async () => {
      customer = await Customer.findOneAndUpdate(
        {
          _id: customerId,
          organizationId,
          isDeleted: true,
        },
        {
          $set: {
            isDeleted: false,
            deletedBy: null,
            deletedAt: null,
            lastUpdatedBy: userId,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
          session,
        },
      );

      if (!customer) {
        throw new AppError("Customer is either restored or doesn't exist", 404);
      }

      await customerActivity.create(
        [
          {
            organizationId,
            customerId,
            performedBy: userId,
            action: "customer.restored",
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return customer;
};
// customer activity history service
const customerActivityHistoryService = async (
  customerId,
  organizationId,
  limit,
  cursor,
  sort,
  search = "",
) => {
  isValidObjectId(customerId);
  isValidObjectId(organizationId);

  const customerObjectId = new Types.ObjectId(customerId);
  const organizationObjectId = new Types.ObjectId(organizationId);

  const customerExist = await customerActivity.exists({
    customerId: customerObjectId,
    organizationId: organizationObjectId,
  });
  if (!customerExist) throw new AppError("customer doesn't exist", 404);

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = {
    customerId: customerObjectId,
    organizationId: organizationObjectId,
  };

  // const result = await cus
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { performedBy: searchRegex },
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
  const activity = await customerActivity.aggregate([
    { $match: filter },
    { $sort: sortOrder },
    { $limit: limit + 1 },

    {
      $lookup: {
        from: "users",
        localField: "performedBy",
        foreignField: "_id",
        // pipeline: [
        //   {
        //     $project: {
        //       _id: 1,
        //       name: 1,
        //       email: 1,
        //       role: 1,
        //       phone: 1,
        //     },
        //   },
        // ],
        as: "performer",
      },

      $lookup: {
        from: "organizations",
        localField: "organizationId",
        foreignField: "_id",
        as: "orgDetails",
      },
    },

    {
      $unwind: {
        path: "$performer",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 1,
        organizationId: 1,
        customerId: 1,
        performedBy: 1,
        action: 1,
        changes: 1,
        createdAt: 1,
        // performer: 1,
        "performer._id": 1,
        "performer.email": 1,
        "performer.name": 1,
        "orgDetails.orgName": 1,
      },
    },
  ]);

  let hasNextPage = activity.length > limit;
  if (hasNextPage) activity.pop();

  const lastActivity = activity.at(-1);
  return {
    activity,
    limit,
    hasNextPage,
    nextCursor:
      lastActivity && hasNextPage
        ? encodeCursor(lastActivity, organizationId)
        : null,
  };
};

export {
  createCustomerService,
  getCustomerService,
  getAllCustomerService,
  updateCustomerService,
  deleteCustomerService,
  restoreCustomerService,
  customerActivityHistoryService,
};
