// import dotenv from 'dotenv';

// import app from './app.js';
// import connectDB from './config/db.js';

// dotenv.config();
// const PORT = process.env.PORT

// await connectDB();

// app.listen((PORT), () => {
//     console.log(`server is running on ${PORT}`);
// })

import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();
const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exitCode = 1;
  }
};

startServer();
