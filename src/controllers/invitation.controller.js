import {
  createInvitationService,
  acceptInvitationService,
} from "../services/invitations.service.js";
import AppError from "../utils/AppError.js";

const inviteMember = async (req, res) => {
  const { email } = req.body;
  const invitation = await createInvitationService(
    req.body.token,
    req.user?.organizationId,
    email,
    req.user?.userId,
  );

  // const { invitationExist } = invitation;
  const result = { expiresAt: invitation.expiresAt, email: invitation.email };

  if (process.env.NODE_ENV === "development") {
    const frontendUrl = process.env.FRONTEND_URI?.replace(/\/$/, "");
    if (!frontendUrl) {
      throw new AppError("frontend uri is not configured", 401);
    }

    result.invitationLink = `${frontendUrl}/accept-invitation?token=${encodeURIComponent(invitation.token)}`;

    // if (invitationExist) {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Invitation already exist",
    //     result,
    //   });
    // }
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

export { inviteMember, invitationAccept };
