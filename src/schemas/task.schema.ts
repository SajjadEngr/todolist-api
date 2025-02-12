import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(3).max(255),
  status: z.enum(["pending", "in_progress", "completed"]),
  dueDate: z.string().datetime(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(3).max(255).optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  dueDate: z.date().optional(),
});

export const taskIdSchema = z.object({
  id: z.number(),
});

export const tokenSchema = z.object({
  token: z.string(),
});
