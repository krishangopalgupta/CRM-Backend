import {
  createCustomerService,
  getCustomerService,
  getAllCustomerService,
  updateCustomerService,
  deleteCustomerService,
} from "../services/customer.services.js";
import pagination from "../utils/pagination.js";

const createcustomer = async (req, res) => {
  const result = await createCustomerService(req.body, req.user.organizationId);
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
  const { page, limit } = pagination(req.query);
  const { customer, totalCustomers } = await getAllCustomerService(
    req.user?.organizationId,
    page,
    limit,
  );

  const totalPages = Math.ceil(totalCustomers / limit);
  return res.status(200).json({
    success: true,
    result: customer ? customer : [],
    pagination: {
      currentPage: page,
      limit,
      totalCustomers,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1 && totalPages > 0,
    },
  });
};

const updateCustomer = async (req, res) => {
  const result = await updateCustomerService(
    req.params.id,
    req.user.organizationId,
    req.body,
  );

  return res.status(200).json({
    success: true,
    result,
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
