import {
  createContactService,
  deleteContactService,
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

const getContact = async (req, res) => {
  const customerId = req.params?.id;
  const organizationId = req.user?.organizationId;
  const { limit, cursor, sort, search } = pageLimit(req.query);
  const result = await getContactService(
    customerId,
    organizationId,
    limit,
    cursor,
    sort,
    search,
  );

  res.status(200).json({
    success: true,
    message:
      result.length === 0
        ? "No record found"
        : "contat details fetched successfully",
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
    message: result.changed
      ? "details updated successfully"
      : "no record updates",
    result: result.contact,
    changes: result.changes,
  });
};

const deleteContact = async (req, res) => {
  const organizationId = req.user?.organizationId;
  const userId = req.user?.userId;
  const customerId = req.params?.id;
  const contactId = req.params?.contactId;

  const result = await deleteContactService(
    organizationId,
    userId,
    customerId,
    contactId,
  );

  return res
    .status(204)
    .json({ success: true, message: "contact delete successfully" });
};

export { createContact, getContact, updateContact, deleteContact };
