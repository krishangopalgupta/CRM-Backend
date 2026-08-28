import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import healthRouter from "./routes/health.routes.js";
import authRoute from "./routes/auth.route.js";
import errorHandler from "./middleware/error.middleware.js";
app.use("/api/v1", healthRouter);
app.use("/api/v1/auth", authRoute);


app.use(errorHandler)

export default app;
