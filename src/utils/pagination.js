import mongoose from "mongoose";
import AppError from "./AppError.js";

const pageLimit = (q) => {
  let limit = Number(q.limit || 10);
  const cursor = q.cursor;

  // limit validation
  if (
    !Number.isInteger(limit) ||
    limit < 10 ||
    limit > 100
  ) {
    throw new AppError("Invalid limit", 400);
  }

  // cursor validation
  if (
    cursor !== undefined &&
    (typeof cursor !== "string" || cursor.length > 500)
  )
    throw new AppError("Invalid cursor", 400);

  const sort = q.sort ? q.sort.trim() : "newest";
  if (!["newest", "oldest"].includes(sort))
    throw new AppError("invalid sort options", 400);

  return { limit, cursor, sort };
};

const encodeCursor = (customer, organizationId) => {
  const cursorData = {
    createdAt: customer.createdAt.toISOString(),
    id: customer._id.toString(),
    organizationId: organizationId.toString(),
  };

  return Buffer.from(JSON.stringify(cursorData)).toString("base64url");
};

const decodeCursor = (value, organizationId) => {
  try {
    const decoded = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );

    const createdAt = new Date(decoded.createdAt);

    if (
      decoded.organizationId !== organizationId.toString() ||
      typeof decoded.createdAt !== "string" ||
      Number.isNaN(createdAt.getTime()) ||
      !mongoose.isValidObjectId(decoded.id)
    ) {
      throw new Error("Invalid cursor");
    }

    return {
      createdAt,
      id: new mongoose.Types.ObjectId(decoded.id),
    };
  } catch {
    throw new AppError("Invalid cursor", 400);
  }
};

export { pageLimit, decodeCursor, encodeCursor };
