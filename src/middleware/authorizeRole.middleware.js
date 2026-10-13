import { rolePermissions } from "../constants/roles.js";
import AppError from "../utils/AppError.js";

const authorizeRole = (...allowedRoles) => {
  return (req, _, next) => {
    const userRole = req.user?.role;
    const userPermission = rolePermissions[userRole] ?? [];

    if (!userRole) return next(new AppError("Authentication required", 401));
    // every is used for read or export allowed role simultaneously
    const hasPermission = allowedRoles.every((permission) => {
      console.log(permission);
      return userPermission.includes(permission);
    });

    if (!hasPermission) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
};

export default authorizeRole;
