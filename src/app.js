import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// import healthRouter from "./routes/health.routes.js";
// app.use("/api/v1", healthRouter);
import authRoute from "./routes/auth.route.js";
import customerRoute from "./routes/customer.route.js";
import errorHandler from "./middleware/error.middleware.js";
app.use("/api/v1/auth", authRoute);
app.use("/api/v1", customerRoute);
app.use(errorHandler);

export default app;
