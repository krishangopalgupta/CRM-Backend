import {
  createCustomer,
  getAllCustomer,
} from "../services/customer.services.js";

const createcustomerController = async (req, res) => {
  const result = await createCustomer(req.body, req.user.organizationId);
  return res
    .status(201)
    .json({ success: true, message: "customer created successfully", result });
};

const getAllCustomerController = async (req, res) => {
  const result = await getAllCustomer(req.user?.organizationId);
  return res.status(200).json({
    success: true,
    message: "All customer fetched succesfully",
    result: result.length > 0 ? result : "No customer found",
  });
};

export { createcustomerController, getAllCustomerController };
