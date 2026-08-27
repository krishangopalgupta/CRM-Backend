
// import dotenv from "dotenv";
import connectDB from "../config/db.js";
// dotenv.config();

import Organization from "../models/organization.model.js";
import User from "../models/user.model.js";

await connectDB();

// const organization = await Organization.create({
//   name: "mogiqo india pvt ltd",
//   email: "kr@gmail.com",
//   address: "xyz, sector 101, Noida",
//   slug: "mogiqo-india",
// });
// console.log("organization created: ", organization);

const user = await User.create({
    name: "Rahul",
    email: "Rahul@gmail.com",
    phone: "9884848283",
    password: "abcd",
    organizationId: "6a902b46785c2d6e1bd70f0c",
    role: "Manager",
});

console.log(user)

// await User.findByIdAndDelete(user?._id);
// await Organization.findByIdAndDelete(user.organizationId);



// const userWithOrgDetails = await User.findById(user?._id).populate("organizationId");
// console.log("userWithOrgDetails", userWithOrgDetails);
