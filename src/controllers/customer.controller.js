import {
  createCustomerService,
  getCustomerService,
  getAllCustomerService,
  updateCustomerService,
} from "../services/customer.services.js";

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
  const result = await getAllCustomerService(req.user?.organizationId);
  return res.status(200).json({
    success: true,
    result: result.length > 0 ? result : [],
  });
};

const updateCustomer = async (req, res) => {
  const customer = await updateCustomerService(
    req.params.id,
    req.user.organizationId,
    req.body
  );
  
  return res.status(200).json({
    success: true,
    customer,
  })
};

export { createcustomer, getCustomer, getAllCustomer, updateCustomer };
