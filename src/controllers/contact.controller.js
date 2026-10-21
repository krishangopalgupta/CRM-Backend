import { createContactService } from "../services/contact.services.js";

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
    result,
  });
};
export { createContact };
