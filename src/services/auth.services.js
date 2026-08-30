import Organization from "../models/organization.model.js";
import User from "../models/user.model.js";

const registerUser = async (userData) => {
  const { organization, user } = userData;

 const { orgName, orgEmail, orgPhone, orgAddress } = organization;

  const slug = orgName.toLowerCase().trim().replace(/\s+/g, "-");
  const createdOrganization = await Organization.create({
    orgName,
    orgEmail,
    orgPhone,
    orgAddress,
    orgSlug: slug,
  });

  const { name, email, phone, password } = user;
  const createdUser = await User.create({
    name,
    email,
    phone,
    password,
    role: "Admin",
    organizationId: createdOrganization._id,
  });
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
};

export { registerUser };
