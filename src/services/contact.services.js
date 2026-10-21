import Contact from "../models/contact.model.js";
import AppError from "../utils/AppError.js";
import { isValidObjectId } from "../validations/ObjectIdValidations.js";

const createContactService = async (
  customerId,
  organizationId,
  userId,
  contactData,
) => {
  isValidObjectId(customerId, "customerId");
  isValidObjectId(organizationId, "organizationId");
  isValidObjectId(userId, "userId");

  const { name, email, role } = contactData;
  const phone = contactData?.phone ?? null;

  // 1. Confirm that the customer exists, is active,
  // and belongs to this organization.
  const customerExist = await Contact.exists({
    organizationId,
    customerId,
    isDeleted: false,
  });
  if (!customerExist) throw new AppError("customer doesn't exist", 404);

  // 2. Check for an existing email under this customer.
  // Deleted contacts also reserve their email.
  const contactExist = await Contact.exists({
    organizationId,
    customerId,
    isDeleted: false,
    email,
  });
  if (contactExist) throw new AppError("customer is already exist", 409);

  // 3. Create the contact using trusted server-side IDs.
  let contact;
  try {
    contact = await Contact.create({
      organizationId,
      customerId,
      createdBy: userId,
      name,
      email,
      phone,
      role,
      createdBy: userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("customer is already exist", 409);
    }
  }

  await contact.populate([
    { path: "organizationId", select: "orgName" },
    { path: "customerId", select: "name" },
  ]);
  return contact;
};

export { createContactService };
