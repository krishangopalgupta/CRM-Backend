import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Organization from "../models/organization.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";

const isUserEmailAlreadyExist = async (email) => {
  return await User.findOne({ email });
};

const registerUser = async (userData) => {
  const { organization, user } = userData;

  const { name, email, phone, password } = user;
  if (!(await isUserEmailAlreadyExist(email)))
    throw new AppError("User Already Exist", 409);

  const { orgName, orgEmail, orgPhone, orgAddress } = organization;
  const orgSlug = orgName.toLowerCase().trim().replace(/\s+/g, "-");
  const isCompanySlugExist = await Organization.findOne({ orgSlug });
  if (isCompanySlugExist) throw new AppError("Slug is already exist", 409);

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
          role: "Admin",
          organizationId: createdOrganization._id,
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
        role: createdUser.role,
        organizationId: createdUser.organizationId,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const loginUser = async (loginDetails) => {
  const { email, password } = loginDetails;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Email or password is incorrect", 404);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new AppError("email or Password is incorrect");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded.userId);
  console.log(user);
  if (!user) {
    throw new AppError("User doesn't exist", 401);
  }

  const accessToken = generateAccessToken(user);

  return accessToken;
};

export { registerUser, loginUser, refreshAccessToken };
