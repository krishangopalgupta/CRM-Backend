import { Router } from "express";
const router = Router();

import {
  inviteMember,
  invitationAccept,
  resendInvitation,
} from "../controllers/invitation.controller.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  acceptInvitationSchema,
  invitationSchema,
} from "../validations/auth.vaildation.js";

// No authentication for the member when he join token itself is the authentication
router.post(
  "/accept-invitation",
  validate(acceptInvitationSchema),
  asyncHandler(invitationAccept),
);

router.use(authenticate);
router.post(
  "/invite-member",
  authorizeRole("member:invite"),
  validate(invitationSchema),
  asyncHandler(inviteMember),
);

router.post(
  "/resend-invitation/:id",
  authorizeRole("member:invite"),
  asyncHandler(resendInvitation),
);

export default router;
