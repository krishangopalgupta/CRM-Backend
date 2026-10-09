import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user?._id,
      role: user.role,
      organizationId: user.organizationId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
};

const generateRefreshToken = (userId, tokenId) => {
  return jwt.sign(
    {
      userId,
      tokenId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
};

export { generateAccessToken, generateRefreshToken };
