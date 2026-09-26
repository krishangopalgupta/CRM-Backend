import express from "express";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import { register, login, refresh } from "../controllers/auth.controller.js";

import {
  registrationSchema,
  loginSchema,
} from "../validations/auth.vaildation.js";
import validate from "../middleware/validation.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", validate(registrationSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));

router.get("/test", authenticate, (req, res) => {
  res
    .status(200)
    .json({ message: "Authentication Successfull", user: req.user });
});

export default router;
