import express from "express";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import { register } from "../controllers/auth.controller.js";

import { registrationSchema } from "../validations/auth.vaildation.js";
import validate from "../middleware/validation.middleware.js";
const router = express.Router();

router.post("/register", validate(registrationSchema), asyncHandler(register));
export default router;