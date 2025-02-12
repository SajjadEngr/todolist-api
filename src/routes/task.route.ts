import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  taskCreateSchema,
  taskUpdateSchema,
  taskIdSchema,
  tokenSchema,
} from "../schemas/task.schema.js";
import TaskService from "../services/task.service.js";

const task = new Hono();
const service = new TaskService();

task.post(
  "/create",
  zValidator("json", taskCreateSchema),
  zValidator("header", tokenSchema),
  async (ctx) => {
    const validate = await ctx.req.valid("json");
    let token = await ctx.req.valid("header").token.replace("Bearer ", "");
    try {
      const { message, status, data } = await service.addTask(token, {
        ...validate,
        dueDate: new Date(validate.dueDate),
      });
      return ctx.json({ message, data }, status);
    } catch (error: any) {
      console.log(error.message);
      return ctx.json({ message: "Internal Error" }, 500);
    }
  }
);

task.put(
  "/update",
  zValidator("json", taskUpdateSchema),
  zValidator("header", tokenSchema),
  zValidator("param", taskIdSchema),
  async (ctx) => {
    const validate = await ctx.req.valid("json");
    let token = await ctx.req.valid("header").token.replace("Bearer ", "");
    const id = await ctx.req.valid("param").id;
    try {
      const { message, status } = await service.updateTask(token, id, validate);
      return ctx.json({ message }, status);
    } catch (error: any) {
      console.log(error.message);
      return ctx.json({ message: "Internal Error" }, 500);
    }
  }
);

task.delete(
  "/delete",
  zValidator("header", tokenSchema),
  zValidator("param", taskIdSchema),
  async (ctx) => {
    let token = await ctx.req.valid("header").token.replace("Bearer ", "");
    try {
      const id = await ctx.req.valid("param").id;
      const { message, status } = await service.deleteTask(token, id);
      return ctx.json({ message }, status);
    } catch (error: any) {
      console.log(error.message);
      return ctx.json({ message: "Internal Error" }, 500);
    }
  }
);

task.get(
  "/:id",
  zValidator("param", taskIdSchema),
  zValidator("header", tokenSchema),
  async (ctx) => {
    const { id } = ctx.req.valid("param");
    let token = await ctx.req.valid("header").token.replace("Bearer ", "");
    try {
      const { message, status, data } = await service.getTaskById(token, id);
      return ctx.json({ message, data }, status);
    } catch (error: any) {
      console.log(error.message);
      return ctx.json({ message: "Internal Error" }, 500);
    }
  }
);

task.get("/", zValidator("header", tokenSchema), async (ctx) => {
  let token = await ctx.req.valid("header").token.replace("Bearer ", "");
  try {
    const { message, status, data } = await service.getTasks(token);
    return ctx.json({ message, data }, status);
  } catch (error: any) {
    console.log(error.message);
    return ctx.json({ message: "Internal Error" }, 500);
  }
});

export default task;
