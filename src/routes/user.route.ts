import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  userRegisterSchema,
  userLoginSchema,
  userUpdateSchema,
  tokenSchema,
} from "../schemas/user.schema.js";
import UserService from "./services/user.service.js";

const user = new Hono();
const service = new UserService();

user.post("/register", zValidator("json", userRegisterSchema), async (ctx) => {
  const validate = await ctx.req.valid("json");
  try {
    const { message, status, data } = await service.addUser(validate);
    return ctx.json({ message, data }, status);
  } catch (error: any) {
    console.log(error.message);
    return ctx.json({ message: "Internal Error" }, 500);
  }
});

user.post("/login", zValidator("json", userLoginSchema), async (ctx) => {
  const validate = await ctx.req.valid("json");
  try {
    const { message, status, data } = await service.loginUser(validate);
    return ctx.json({ message, data }, status);
  } catch (error: any) {
    console.log(error.message);
    return ctx.json({ message: "Internal Error" }, 500);
  }
});

user.put(
  "/update",
  zValidator("json", userUpdateSchema),
  zValidator("header", tokenSchema),
  async (ctx) => {
    const validate = await ctx.req.valid("json");
    let token = await ctx.req.valid("header").token.replace("Bearer ", "");

    try {
      const { message, status } = await service.updateUser(token, validate);
      return ctx.json({ message }, status);
    } catch (error: any) {
      console.log(error.message);
      return ctx.json({ message: "Internal Error" }, 500);
    }
  }
);

user.delete("/delete", zValidator("header", tokenSchema), async (ctx) => {
  let token = await ctx.req.valid("header").token.replace("Bearer ", "");
  try {
    const { message, status } = await service.deleteUser(token);
    return ctx.json({ message }, status);
  } catch (error: any) {
    console.log(error.message);
    return ctx.json({ message: "Internal Error" }, 500);
  }
});

user.get("/me", zValidator("header", tokenSchema), async (ctx) => {
  let token = await ctx.req.valid("header").token.replace("Bearer ", "");
  try {
    const { message, status, data } = await service.getMe(token);
    return ctx.json({ message, data }, status);
  } catch (error: any) {
    console.log(error.message);
    return ctx.json({ message: "Internal Error" }, 500);
  }
});

export default user;
