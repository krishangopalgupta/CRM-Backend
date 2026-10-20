import mongoose, { Schema } from "mongoose";

const customerActivitySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Organization",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    action: {
      type: String,
      enum: ["customer.created", "customer.update", "customer.deleted"],
      required: true,
    },
    changes: {
      type: [
        {
          field: {
            type: String,
            required: true,
          },
          oldValue: {
            type: Schema.Types.Mixed,
            default: null,
          },
          newValue: {
            type: Schema.Types.Mixed,
            default: null,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

customerActivitySchema.index({
  organizationId: 1,
  customerId: 1,
  createdBy: -1,
  _id: -1,
});

// Efficiently retrieve a customer's activity history,
// newest activity first, within its organization.
const customerActivity = mongoose.model(
  "customerActivity",
  customerActivitySchema,
);

// Why are we building it this way?
// - organizationId — ensures activity queries are tenant-scoped.
// - customerId — connects each event to the relevant customer.
// - performedBy — identifies the user who performed the action.
// - action — records whether the customer was created or updated.
// - changedFields — records which fields changed, without storing old and new phone numbers or email addresses in the audit log.
// - Compound index — makes it efficient to retrieve one customer's history in reverse chronological order.

// customer:read/update	RBAC permission	Permission to read customers
// customer.updated	Activity event	A customer was updated

// In your CRM, we use colons for permissions because that's already your established convention in rolePermissions.
// For activity events, I used dot notation to separate the resource from the event: customer.created.

export default customerActivity;
