import { randomBytes, createHash } from "node:crypto";
import Invitation from "../models/invitation.model.js";
import AppError from "../utils/AppError.js";

// hash the token
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

// create invitation service
const createInvitationService = async (organizationId, email, invitedBy) => {
  const normalizedEmail = email.trim().toLowerCase();

  //   Don't invite an existing email member again
  const invitationExist = await Invitation.findOne({
    organizationId,
    email: normalizedEmail,
  });
  if (invitationExist) {
    throw new AppError("Invitation is already created", 409);
  }

  const doesInvitationRevoked = await Invitation.findOne({
    organizationId,
    email: normalizedEmail,
    status: "pending",
  });
  if (doesInvitationRevoked) {
    if (doesInvitationRevoked.expiresAt > new Date()) {
      throw new AppError("An active invitation already exist", 409);
    }

    // An expired pending invitation must be revoked
    // before another invitation can be created.
    doesInvitationRevoked.status = "revoked";
    await Invitation.save();
  }

  //   generate a cryptographically random token
  const token = randomBytes(32).toString("base64url");
  if (!token) throw new AppError("Token is generated", 400);
  const tokenHash = hashToken(token);
  if (!tokenHash) throw new AppError("Hash token is not generate", 400);

  let expiresAt = new Date(Date.now() + 48 * 24 * 24 * 1000);
  try {
    await Invitation.create({
      email: normalizedEmail,
      organizationId,
      invitedBy,
      tokenHash,
      expiresAt,
      status: "pending",
    });
  } catch (error) {
    // The unique index also protects against concurrent requests.
    if (error.code === 11000) {
      throw new AppError("An invitation already exists for this email", 409);
    }
    throw error;
  }

  return { token, expiresAt, email: normalizedEmail };
};

export default createInvitationService;
