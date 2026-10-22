import {
  createContactService,
  getContactService,
  updateContactService,
} from "../services/contact.services.js";

import { pageLimit } from "../utils/pagination.js";

const createContact = async (req, res) => {
  const customerId = req.params?.id;
  const organizationId = req.user?.organizationId;
  const userId = req.user?.userId;
  const result = await createContactService(
    customerId,
    organizationId,
    userId,
    req.body,
  );

  res.status(201).json({
    success: true,
    message:
      result.length === 0 ? "No record found" : "contact created successfully",
    result: result.length === 0 ? [] : result,
  });
};

const updateContact = async (req, res) => {
  const organizationId = req.user?.organizationId;
  const userId = req.user?.userId;
  const customerId = req.params?.id;
  const contactId = req.params?.contactId;
  const result = await updateContactService(
    organizationId,
    userId,
    customerId,
    contactId,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message:
      result === undefined
        ? "no record updates"
        : "details updated successfully",
    result,
  });
};

export { createContact, getContact, updateContact };
