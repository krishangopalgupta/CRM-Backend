// import mongoose from "mongoose";
// import dns from "node:dns";

// import { DB_NAME } from "../constants.js";

// dns.setServers(["8.8.8.8", "8.8.4.4"]);
// const connectDB = async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URI}/${DB_NAME}`,
//       {
//         family: 4,
//       },
//     );

//     console.log("Database Connected!", connectionInstance.connection.host);
//   } catch (error) {
//     console.log("Error in the database connection", error);
//     process.exit(1);
//   }
// };

// export default connectDB;



import mongoose from "mongoose";
import dns from "node:dns";

import { DB_NAME } from "../constants.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async ({
  uri = process.env.MONGODB_URI,
  dbName = DB_NAME,
} = {}) => {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  try {
    const connectionInstance = await mongoose.connect(
      uri,
      {
        dbName,
        family: 4,
      },
    );

    console.log(
      "Database Connected!",
      connectionInstance.connection.host,
      connectionInstance.connection.name,
    );

    return connectionInstance;
  } catch (error) {
    console.error("Error in the database connection", error);
    throw error;
  }
};

export default connectDB;
