import express from "express";

// controller
import {
  createcustomerController,
  getAllCustomerController,
} from "../controllers/customer.controller.js";

// validation
import { customerSchema } from "../validations/auth.vaildation.js";

// middlewre
import validate from "../middleware/validation.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";

// routes
const router = express.Router();
router.post(
  "/create-customer",
  authenticate,
  validate(customerSchema),
  asyncHandler(createcustomerController),
);

router.get(
  "/get-all-customers",
  authenticate,
  asyncHandler(getAllCustomerController),
);

export default router;
