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
const getAllCustomerService = async (
  organizationId,
  page,
  limit,
  search = "",
) => {
  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const skip = (page - 1) * limit;

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
  let [customer, totalCustomers] = await Promise.all([
    Customer.find(filter)
      .populate("organizationId", "orgName orgSlug")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),

    Customer.countDocuments(filter),
  ]);
  return { customer, totalCustomers };
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
