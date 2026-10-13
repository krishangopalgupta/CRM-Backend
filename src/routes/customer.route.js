import express from "express";

// controller
import {
  createcustomer,
  getCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";

// validation
import { customerSchema } from "../validations/auth.vaildation.js";

// middlewre
import validate from "../middleware/validation.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";

// routes
const router = express.Router();

router.use(authenticate);
router.post(
  "/create-customer",
  authorizeRole("customer:create"),
  validate(customerSchema),
  asyncHandler(createcustomer),
);
router.get(
  "/get-customer/:id",
  authorizeRole("customer:read"),
  asyncHandler(getCustomer),
);
router.get(
  "/get-all-customers",
  authorizeRole("customer:read"),
  asyncHandler(getAllCustomer),
);
router.put(
  "/update-customer/:id",
  authorizeRole("customer:update"),
  asyncHandler(updateCustomer),
);
router.delete(
  "/delete-customer/:id",
  authorizeRole("customer:delete"),
  asyncHandler(deleteCustomer),
);

export default router;
