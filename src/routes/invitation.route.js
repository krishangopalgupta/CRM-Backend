import { Router } from "express";
const router = Router();

import {
  inviteMember,
  invitationAccept,
  resendInvitation,
  allInvitations,
} from "../controllers/invitation.controller.js";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRole from "../middleware/authorizeRole.middleware.js";
import validate from "../middleware/validation.middleware.js";
import {
  acceptInvitationSchema,
  invitationSchema,
} from "../validations/schema.vaildation.js";

// No authentication for the member when he join token itself is the authentication
router.post(
  "/accept-invitation",
  validate(acceptInvitationSchema),
  asyncHandler(invitationAccept),
);

router.use(authenticate);
router.post(
  "/invite-member",
  authorizeRole("invitation:create"),
  validate(invitationSchema),
  asyncHandler(inviteMember),
);

router.put(
  "/resend-invitation/:id",
  authorizeRole("invitation:create"),
  asyncHandler(resendInvitation),
);

router.get(
  "/all-invitations",
  authorizeRole("invitation:read"),
  asyncHandler(allInvitations),
);

export default router;
