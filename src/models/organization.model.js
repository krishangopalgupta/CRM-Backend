import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      required: true,
      trim: true,
    },
    orgEmail: {
      type: String,
      required: true,
      trim: true,
    },
    orgPhone: {
      type: String,
      trim: true,
    },
    orgAddress: {
      type: String,
      required: true,
      trim: true,
    },
    orgSlug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
