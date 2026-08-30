import { z } from "zod";

const organizationSchema = z.object({
  orgName: z.string().trim().min(3),
  orgEmail: z.string().trim().email(),
  orgPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  orgAddress: z.string().trim().min(10),
});

const userSchema = z.object({
  name: z.string().trim().min(5),
  email: z.string().trim().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8),
}).strict();

const registrationSchema = z.object({
  organization: organizationSchema,
  user: userSchema,
});

export { registrationSchema };
