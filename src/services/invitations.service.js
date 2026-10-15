import { randomBytes } from "node:crypto";
import Invitation from "../models/invitation.model.js";
import { hashInvitationToken } from "../utils/hashInvitationToken.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

// create invitation service
const createInvitationService = async (organizationId, email, invitedBy) => {
  const normalizedEmail = email.trim().toLowerCase();

  //   Don't invite an existing email member again
  const invitationExist = await Invitation.findOne({
    organizationId,
    email: normalizedEmail,
  });
  if (invitationExist) {
    // return { invitationExist };
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
  if (!token) throw new AppError("Token is not generated", 400);
  const tokenHash = hashInvitationToken(token);
  if (!tokenHash) throw new AppError("Hash token is not generated", 400);

  let expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  let member;
  try {
    member = await Invitation.create({
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

  return { token, expiresAt, email: normalizedEmail, _id: member?._id };
};

const acceptInvitationService = async ({ token, name, password, phone }) => {
  if (typeof token !== "string" || token.length === 0) {
    throw new AppError("token is required", 401);
  }

  const tokenHash = hashInvitationToken(token);

  let createdUser;
  const session = await mongoose.startSession();
  // find a valid, unexpired, or pending invitation
  try {
    await session.withTransaction(async () => {
      const invitation = await Invitation.findOne({
        tokenHash,
        status: "pending",
        acceptedAt: null,
        expiresAt: { $gt: new Date() },
      }).session(session);

      if (!invitation) {
        throw new AppError("token is invalid, expired or used", 400);
      }

      // update the invitation with in the transaction;
      const claimed = await Invitation.updateOne(
        {
          _id: invitation._id,
          status: "pending",
          acceptedAt: null,
          expiresAt: { $gt: new Date() },
        },
        {
          $set: {
            acceptedAt: new Date(),
            status: "accepted",
          },
        },
        { session },
      );

      if (claimed.modifiedCount !== 1) {
        throw new AppError(
          "Invitation is invalid, expired or already User",
          400,
        );
      }

      // create the member
      const users = await User.create(
        [
          {
            name,
            email: invitation.email,
            phone,
            password,
            role: "member",
            organizationId: invitation.organizationId,
          },
        ],
        { session },
      );
      createdUser = users[0];
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(
        "An account with this email already exists in this organization",
        409,
      );
    }
    throw error;
  } finally {
    await session.endSession();
  }

  const { id, email, role, organizationId } = createdUser;
  return {
    id,
    name: createdUser.name,
    email,
    phone: createdUser.phone,
    role,
    organizationId,
  };
};

const resendInvitationService = async (invitationId, organizationId) => {
  const INVITATION_TTL_MS = 48 * 60 * 60 * 1000;
  const RESEND_COOLDOWN_MS = 60 * 1000;

  const invitation = await Invitation.findOne({
    _id: invitationId,
    organizationId,
    status: "pending",
  });

  if (!invitation) {
    throw new AppError("Pending invitation not found", 404);
  }

  const now = new Date();
  const cooldownBefore = new Date(now.getTime() - RESEND_COOLDOWN_MS);

  const token = randomBytes(32).toString("base64url");
  const hashedToken = hashInvitationToken(token);

  let expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
  const doesMemberExist = await Invitation.findOneAndUpdate(
    {
      _id: invitationId,
      organizationId,
      status: "pending",
      $or: [{ lastSendAt: null }, { lastSendAt: { $lte: cooldownBefore } }],
    },
    {
      $set: {
        tokenHash: hashedToken,
        expiresAt,
        lastSendAt: now,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!doesMemberExist) {
    throw new AppError(
      "Invitation is resent recently or is no longer pending",
      429,
    );
  }

  return {
    token,
    expiresAt,
    email: doesMemberExist.email,
    _id: doesMemberExist?._id,
  };
};
export {
  createInvitationService,
  acceptInvitationService,
  resendInvitationService,
};
