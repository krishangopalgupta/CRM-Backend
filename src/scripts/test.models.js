import dotenv from "dotenv";
import connectDB from "../config/db.js";
dotenv.config();
await connectDB();


// import Organization from "../models/organization.model.js";
// import User from "../models/user.model.js";


// const organization = await Organization.create({
//   name: "mogiqo india pvt ltd",
//   email: "kr@gmail.com",
//   address: "xyz, sector 101, Noida",
//   slug: "mogiqo-india",
// });
// console.log("organization created: ", organization);

// const user = await User.create({
//     name: "Rahul",
//     email: "Rahul@gmail.com",
//     phone: "9884848283",
//     password: "abcd",
//     organizationId: "6a902b46785c2d6e1bd70f0c",
//     role: "Manager",
// });

// console.log(user)

// const organization = await Organization.find();
// const organization = await Organization.findById("6a902b0cef857c8d6dfdb3bb");
// console.log("Organization Document", organization);

// const deletedOrganization = await Organization.findByIdAndDelete("6a902b0cef857c8d6dfdb3bb");
// console.log("deleted", deletedOrganization);

// await User.findByIdAndDelete(user?._id);
// await Organization.findByIdAndDelete(user.organizationId);



// const userWithOrgDetails = await User.findById(user?._id).populate("organizationId");
// console.log("userWithOrgDetails", userWithOrgDetails);
