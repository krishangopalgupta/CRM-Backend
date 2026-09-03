import { z } from "zod";
import AppError from "../utils/AppError.js";

const validate = (schema) => {
  return (req, _, next) => {
    try {
      const parsedData = schema.parse(req.body);
      req.body = parsedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues
          .map((issue) => {
            const path = issue.path.join(".");
            return `${path} : ${issue.message}`;
          })
          .join(", ");

        return next(new AppError(message, 400));
      }
      next(error);
    }
  };
};

export default validate;
