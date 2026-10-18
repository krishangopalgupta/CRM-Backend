import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

// invitationId checker
const isValidObjectId = (objectId, name) => {
  if (!mongoose.isValidObjectId(objectId)) throw new AppError(`Invalid ${name}`, 400);
};

export { isValidObjectId };
