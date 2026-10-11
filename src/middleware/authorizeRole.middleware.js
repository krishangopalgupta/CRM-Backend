import AppError from "../utils/AppError.js";

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return next(
        new AppError("You're not allowed to perform this action", 403),
      );
    }
    next();
  };
};

export default authorizeRole;
