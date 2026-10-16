import mongoose, { Schema } from "mongoose";

const invitationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked"],
      required: true,
      default: "pending",
    },
    lastSendAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// unique partial index that enforces uniqueness only for unaccepted invitatations
invitationSchema.index({
  organizationId: 1,
  email: 1,
  unique: true,
  partialFilterExpression: {
    status: "pending",
  },
});

// This means:
// 1. Two unaccepted invitations for the same organization and email? Rejected
// 2. An accepted invitation followed by a new invitation? Allowed
// 3. The same email invited by another organization? Allowed
const Invitation = new mongoose.model("Invitation", invitationSchema);

export default Invitation;
