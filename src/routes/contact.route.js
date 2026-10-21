import express from "express";
const router = express.Router();

import { contactSchema } from "../validations/schema.vaildation.js";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import validate from "../middleware/validation.middleware.js";

import { createContact } from "../controllers/contact.controller.js";

router.use(authenticate);
router.post(
  "/create-contact/:id",
  validate(contactSchema),
  authorizeRole("contact:create"),
  asyncHandler(createContact),
);

export default router;
