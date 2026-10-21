import express from "express";

// controller
import {
  createcustomer,
  getCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
  customerActivityHistory,
} from "../controllers/customer.controller.js";

// validation
import { customerSchema } from "../validations/schema.vaildation.js";

// middlewre
import validate from "../middleware/validation.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";

// routes
const router = express.Router();

router.use(authenticate);

// create customer
router.post(
  "/create-customer",
  authorizeRole("customer:create"),
  validate(customerSchema),
  asyncHandler(createcustomer),
);

// get single customer
router.get(
  "/get-customer/:id",
  authorizeRole("customer:read"),
  asyncHandler(getCustomer),
);

// get all customer
router.get(
  "/get-all-customers",
  authorizeRole("customer:read"),
  asyncHandler(getAllCustomer),
);

// update customer
router.put(
  "/update-customer/:id",
  authorizeRole("customer:update"),
  validate(customerSchema),
  asyncHandler(updateCustomer),
);

// delete customer
router.delete(
  "/delete-customer/:id",
  authorizeRole("customer:delete"),
  asyncHandler(deleteCustomer),
);

// restore customer no need to for authorizeRole to restore customer as anyone can restore the customer
router.put(
  "/restore-customer/:id",
  authorizeRole("customer:restore"),
  asyncHandler(restoreCustomer),
);

// get customer activity
router.get(
  "/:id/activity",
  authorizeRole("customer:read"),
  asyncHandler(customerActivityHistory),
);

export default router;
