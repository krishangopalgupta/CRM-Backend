import mongoose from "mongoose";
import Organization from "../models/organization.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

const registerUser = async (userData) => {
  const { organization, user } = userData;

  const { name, email, phone, password } = user;
  const isUserEmailAlreadyExist = await User.findOne({ email });
  if (isUserEmailAlreadyExist) throw new AppError("User Already Exist", 409);

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
export { registerUser };
