import Customer from "../models/customer.model.js";
import AppError from "../utils/AppError.js";

// create the customer
const createCustomerService = async (customerData, organizationId) => {
  const { name, email, phone } = customerData;

  const doesEmailAlreadyExist = await Customer.findOne({
    organizationId,
    $or: [{ email }, { phone }],
  });
  if (doesEmailAlreadyExist)
    throw new AppError("customer is already exist", 409);

  const customer = await Customer.create({
    name,
    email,
    phone,
    organizationId,
  });
  await customer.populate("organizationId", "orgName orgSlug");
  return customer;
};

// get single customer
const getCustomerService = async (customerId, organizationId) => {
  const customer = await Customer.findOne({
    _id: customerId,
    organizationId,
  }).populate("organizationId", "orgName orgSlug");

  if (!customer) throw new AppError("customer not found");
  return customer;
};

// get all customer
const getAllCustomerService = async (organizationId) => {
  const customer = await Customer.find({ organizationId }).populate(
    "organizationId",
    "orgName orgSlug",
  );
  return customer;
};

// update customer
const updateCustomerService = async (
  customerId,
  organizationId,
  customerData,
) => {
  const { name, email, phone } = customerData;

  const updatedData = {};
  if (name) updatedData.name = name;
  if (phone) updatedData.phone = phone;
  if (email) updatedData.email = email;

  const customer = await Customer.findByIdAndUpdate(
    { _id: customerId, organizationId },
    { $set: updatedData },
    { returnDocument: "after", runValidators: true },
  );
  if (!customer) throw new AppError("customer not found", 404);
  return customer;
};

export {
  createCustomerService,
  getCustomerService,
  getAllCustomerService,
  updateCustomerService,
};
