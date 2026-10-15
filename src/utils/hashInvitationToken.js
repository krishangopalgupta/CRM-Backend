import crypto from "node:crypto";

export const hashInvitationToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

