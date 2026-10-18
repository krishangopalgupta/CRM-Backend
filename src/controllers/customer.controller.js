import {
  createCustomerService,
  getCustomerService,
  getAllCustomerService,
  updateCustomerService,
  deleteCustomerService,
} from "../services/customer.services.js";
import AppError from "../utils/AppError.js";
import { pageLimit } from "../utils/pagination.js";

const createcustomer = async (req, res) => {
  const result = await createCustomerService(req.body, req.user);
  return res
    .status(201)
    .json({ success: true, message: "customer created successfully", result });
};

const getCustomer = async (req, res) => {
  const result = await getCustomerService(
    req.params.id,
    req.user.organizationId,
  );
  return res.status(200).json({
    success: true,
    result,
  });
};

const getAllCustomer = async (req, res) => {
  const search = req.query.search ? req.query.search.trim() : "";
  if (search.length > 100)
    throw new AppError("search must be at most 100 character", 400);

  const { limit, cursor, sort } = pageLimit(req.query);

  const result = await getAllCustomerService(
    req.user?.organizationId,
    limit,
    search,
    sort,
    cursor,
  );

  return res.status(200).json({
    success: true,
    result: result.customers,
    pagination: {
      limit,
      hasNextPage: result.hasNextPage,
      nextCursor: result.nextCursor,
    },
  });
};

const updateCustomer = async (req, res) => {
  const result = await updateCustomerService(req.params.id, req.body, req.user);

  return res.status(200).json({
    success: true,
    result: result ?? "Data is not being changed",
  });
};

const deleteCustomer = async (req, res) => {
  const result = await deleteCustomerService(
    req.params.id,
    req.user.organizationId,
  );
  return res
    .status(204)
    .json({ success: true, message: "deleted successfully", result: result });
};

export {
  createcustomer,
  getCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
};
