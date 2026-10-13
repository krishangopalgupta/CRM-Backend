import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true },
);

customerSchema.index({ organizationId: 1, email: 1 }, { unique: true });
customerSchema.index({ organizationId: 1, phone: 1 }, { unique: true });
customerSchema.index({ organizationId: 1, createdAt: -1, _id: -1 });
const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
