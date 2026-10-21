import {
  createContactService,
  getContactService,
} from "../services/contact.services.js";

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
  const result = await getContactService(customerId, organizationId);

  res.status(200).json({
    success: true,
    message:
      result.length === 0
        ? "No record found"
        : "contat details fetched successfully",
    result: result.length === 0 ? [] : result,
  });
};

export { createContact, getContact };
