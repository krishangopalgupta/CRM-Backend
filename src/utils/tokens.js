import jwt from "jsonwebtoken";

const generateAccessToken = async (user) => {
  const { userId, role, organizationId } = user;
  return jwt.sign(
    {
      userId,
      role,
      organizationId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
};

const generateRefreshToken = async (user) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
};

export { generateAccessToken, generateRefreshToken };
