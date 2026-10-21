import { z } from "zod";

const organizationSchema = z.object({
  orgName: z.string().trim().min(3),
  orgEmail: z.string().trim(),
  orgPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  orgAddress: z.string().trim().min(10),
});

const userSchema = z
  .object({
    name: z.string().trim().min(5),
    email: z.string().trim().email(),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    password: z.string().trim().min(8),
  })
  .strict();

const registrationSchema = z.object({
  organization: organizationSchema,
  user: userSchema,
});

const loginSchema = z.object({
  email: z.string().trim(),
  password: z.string().min(8),
});

const customerSchema = z.object({
  name: z.string().trim(),
  email: z.string().trim().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
});

const invitationSchema = z.object({
  email: z.string().trim().email(),
});

const acceptInvitationSchema = z.object({
  token: z.string().trim().min(1).max(100),
  password: z.string().min(8),
  name: z.string().min(5).max(20),
  phone: z.string().regex(/^[6-9]\d{9}$/),
});

const contactSchema = z
  .object({
    name: z.string().trim().max(20),
    email: z.string().trim().email(),
    role: z.string().trim().max(20),
    phone: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/)
        .optional()
        .nullable(),
    ),
  })
  .strict();

export {
  registrationSchema,
  loginSchema,
  customerSchema,
  invitationSchema,
  contactSchema,
  acceptInvitationSchema,
};
