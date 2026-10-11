import Customer from "../models/customer.model.js";
import AppError from "../utils/AppError.js";

const createCustomer = async (customerData, organizationId) => {
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

const getAllCustomer = async (organizationId) => {
  const customer = await Customer.find({ organizationId }).populate(
    "organizationId",
    "orgName orgSlug",
  );
  //   await customer.populate("organizationId", "orgName orgSlug");
  return customer;
};
export { createCustomer, getAllCustomer };
