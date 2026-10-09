import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

import User from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import RefreshSession from "../models/refreshSession.model.js";
import AppError from "../utils/AppError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";

const registerUser = async (userData) => {
  const { organization, user } = userData;
  const { name, email, phone, password } = user;

  // User Email Checker
  const doesUserExist = await User.findOne({ $or: [{ email }, { phone }] });
  if (doesUserExist) {
    throw new AppError("User is already Exist", 409);
  }

  const { orgName, orgEmail, orgPhone, orgAddress } = organization;

  // organization Email Checker
  const doesOrgEmailAlreadyExist = await Organization.findOne({ orgEmail });
  if (doesOrgEmailAlreadyExist) {
    throw new AppError("Organization email is already exist", 409);
  }

  // Organization Slug Checker
  const orgSlug = orgName.trim().toLowerCase().replace(/\s+/g, "-");
  const doesOrganizationSlugExist = await Organization.findOne({ orgSlug });
  if (doesOrganizationSlugExist) {
    throw new AppError("Organization's slug is already Exist", 409);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [createdOrganization] = await Organization.create(
      [
        {
          orgName,
          orgEmail,
          orgPhone,
          orgAddress,
          orgSlug,
        },
      ],
      { session },
    );

    const [createdUser] = await User.create(
      [
        {
          name,
          email,
          phone,
          password,
          organizationId: createdOrganization._id,
          role: "owner",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return {
      createdOrganization,
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("email or password is incorrect", 404);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError("email or password is incorrect", 404);
  }

  const tokenId = crypto.randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user?._id, tokenId);

  if (!accessToken || !refreshToken)
    throw new AppError("Token generation failed", 500);

  await RefreshSession.create({
    userId: user?._id,
    tokenId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!decoded) throw new AppError("Token is invalid or expired", 401);

  const { userId, tokenId } = decoded;
  const session = await RefreshSession.findOne({
    userId,
    tokenId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) throw new AppError("User is not authorized", 401);

  const user = await User.findById(userId);
  if (!user) throw new AppError("User is not authorized", 401);

  return generateAccessToken(user);
};

export { registerUser, loginUser, refreshAccessToken };
