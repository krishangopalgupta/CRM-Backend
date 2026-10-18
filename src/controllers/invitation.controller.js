import {
  createInvitationService,
  acceptInvitationService,
  resendInvitationServive,
  getAllInvitationService,
} from "../services/invitations.service.js";

import { pageLimit } from "../utils/pagination.js";
import AppError from "../utils/AppError.js";

const inviteMember = async (req, res) => {
  const invitation = await createInvitationService(
    req.user?.organizationId,
    req.body.email,
    req.user?.userId,
  );

  const result = {
    expiresAt: invitation.expiresAt,
    email: invitation.email,
    _id: invitation?._id,
  };

  if (process.env.NODE_ENV === "development") {
    const frontendUrl = process.env.FRONTEND_URI?.replace(/\/$/, "");
    if (!frontendUrl) {
      throw new AppError("frontend uri is not configured", 401);
    }

    result.invitationLink = `${frontendUrl}/accept-invitation?token=${encodeURIComponent(invitation.token)}`;
  }

  res.status(201).json({
    success: true,
    message: "invitation created successfully",
    result,
  });
};

const invitationAccept = async (req, res) => {
  const result = await acceptInvitationService(req.body);
  return res.status(201).json({
    success: true,
    message: "Invitation accepted and account created successfully",
    result,
  });
};

const resendInvitation = async (req, res) => {
  const invitationId = req.params.id;

  const invitation = await resendInvitationServive(
    invitationId,
    req.user?.organizationId,
  );

  let result = {
    expiresAt: invitation.expiresAt,
    token: invitation.token,
    email: invitation.email,
  };

  if (process.env.NODE_ENV === "development") {
    const frontendUrl = process.env.FRONTEND_URI?.replace(/\/$/, "");
    result.invitationUrl = `${frontendUrl}/accept-invitation?token=${encodeURIComponent(invitation.token)}`;
  }

  return res.status(200).json({
    success: true,
    message: "Invitation has been created Successfully",
    result,
  });
};

const allInvitations = async (req, res) => {
  const search = req.query.search ? req.query.search.trim() : "";
  if (search.length > 100)
    throw new AppError("search must be at most 100 character", 400);

  const { limit, cursor, sort } = pageLimit(req.query);
  const status = req.query.status ?? "pending";
  if (!["pending", "revoked", "accepted"].includes(status)) {
    throw new AppError("Invalid Status", 400);
  }

  const result = await getAllInvitationService(
    req.user?.organizationId,
    limit,
    search,
    sort,
    cursor,
    status,
  );

  return res.status(200).json({
    success: true,
    result: result.invitations,
    pagination: {
      limit,
      hasNextPage: result.hasNextPage,
      nextCursor: result.nextCursor,
    },
  });
};

export { inviteMember, invitationAccept, resendInvitation, allInvitations };
