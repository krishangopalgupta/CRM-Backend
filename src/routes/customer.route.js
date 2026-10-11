import express from "express";

// controller
import {
  createcustomer,
  getCustomer,
  getAllCustomer,
} from "../controllers/customer.controller.js";

// validation
import { customerSchema } from "../validations/auth.vaildation.js";

// middlewre
import validate from "../middleware/validation.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";

// routes
const router = express.Router();

router.use(authenticate);
router.post(
  "/create-customer",
  validate(customerSchema),
  asyncHandler(createcustomer),
);

router.get("/get-customer/:id", asyncHandler(getCustomer));
router.get("/get-all-customers", asyncHandler(getAllCustomer));

export default router;
