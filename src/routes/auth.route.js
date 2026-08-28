import express from "express";
import { register } from "../controllers/auth.controller.js";
import asyncHandler from '../middleware/asyncHandler.middleware.js'
const router = express.Router();

router.post("/register", asyncHandler(register));
export default router;
