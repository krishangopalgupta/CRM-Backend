import mongoose from "mongoose";
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

  const customer = await Customer.findOne({
    _id: customerId,
    organizationId,
  }).populate("organizationId", "orgName orgSlug");

  if (!customer) throw new AppError("customer not found");
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
  const filter = { organizationId };
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

// customer activity history

const deleteCustomerService = async (customerId, organizationId) => {
  const customer = await Customer.findOneAndDelete({
    _id: customerId,
    organizationId,
  });
  if (!customer) throw new AppError("customer not found", 404);
  return customer;
};

export {
  createCustomerService,
  getCustomerService,
  getAllCustomerService,
  updateCustomerService,
  deleteCustomerService,
};
