import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const authenticate = (req, _, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication Required", 401);
    }

    const accessToken = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );
    req.user = decodedToken;
    next();
  } catch (error) {
    throw new AppError("Token Expired or invalid", 401);
  }
};

export default authenticate;
