import { z } from "zod";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must be at least 8 characters long and contain at least one letter and one number"
    ),
});

export const tokenSchema = z.object({
  token: z.string(),
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must be at least 8 characters long and contain at least one letter and one number"
    )
    .optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
