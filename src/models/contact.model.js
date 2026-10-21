import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// An email can belong to only one contact
// within a particular customer, including soft-deleted contacts.
contactSchema.index(
  {
    organizationId: 1,
    customerId: 1,
    email: 1,
  },
  { unique: true },
);

// Efficient customer contact listing and pagination.
contactSchema.index({
  organizationId: 1,
  customerId: 1,
  createdAt: -1,
  _id: -1,
});

const Contact = mongoose.model("contact", contactSchema);
export default Contact;
