import express from "express";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller.js";


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
router.post("/logout", asyncHandler(logout));

router.get(
  "/test",
  authenticate,
  authorizeRole("owner", "admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "owner's authorization successful",
      user: req.user,
    });
  },
);
export default router;
