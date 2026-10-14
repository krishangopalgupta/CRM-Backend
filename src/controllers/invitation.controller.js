import createInvitationService from "../services/invitations.service.js";

const inviteMember = async (req, res) => {
  const { email } = req.body;
  const invitation = await createInvitationService(
    req.user?.organizationId,
    email,
    req.user?.userId,
  );

  res.status(201).json({
    success: true,
    message: "invitation created successfully",
    result: { expiresAt: invitation.expiresAt, email: invitation.email },
  });
};

export default inviteMember;
