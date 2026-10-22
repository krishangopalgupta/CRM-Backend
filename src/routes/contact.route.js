import express from "express";
const router = express.Router();

import { contactSchema, updateContactSchema } from "../validations/schema.vaildation.js";

import authenticate from "../middleware/auth.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
  createContact,
  getContact,
  updateContact,
} from "../controllers/contact.controller.js";

router.use(authenticate);
router.post(
  "/create-contact/:id",
  validate(contactSchema),
  authorizeRole("contact:create"),
  asyncHandler(createContact),
);


router.patch(
  "/update-contact/:id/:contactId",
  validate(updateContactSchema),
  authorizeRole("contact:update"),
  asyncHandler(updateContact),
);
export default router;
