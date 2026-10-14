import { Router } from "express";
const router = Router();

import inviteMember from "../controllers/invitation.controller.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";
import validate from "../middleware/validation.middleware.js";
import { invitationSchema } from "../validations/auth.vaildation.js";

router.use(authenticate);
router.post(
  "/invite-member",
  authorizeRole("member:invite"),
  validate(invitationSchema),
  asyncHandler(inviteMember),
);

export default router;
