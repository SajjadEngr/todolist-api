import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

class UserService {
  private hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private generateAuthToken(userId: number): string {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }
    const secretKey = process.env.DATABASE_URL;
    const token = jwt.sign({ id: userId }, secretKey, { expiresIn: "30d" });
    return token;
  }

  private verifyToken(token: string): { id: number } | null {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined");
    }
    const secretKey = process.env.DATABASE_URL;
    try {
      return jwt.verify(token, secretKey) as { id: number };
    } catch (error) {
      return null;
    }
  }

  public async addUser(form: {
    email: string;
    password: string;
  }): Promise<IResultService> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, form.email));
      if (existingUser.length > 0) {
        return { message: "this email already registered!", status: 401 };
      }

      // Hash the password
      const hashedPassword = await this.hashPassword(form.password);

      const newUser: typeof users.$inferInsert = {
        email: form.email,
        password: hashedPassword,
      };
      // Insert the new user into the database
      await db.insert(users).values(newUser);

      // Generate auth token
      const token = this.generateAuthToken(Number(newUser.id));
      const { id, password, ...data } = newUser;
      return {
        message: "register successfully :)",
        status: 201,
        data: { token, data },
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async loginUser(form: {
    email: string;
    password: string;
  }): Promise<IResultService> {
    try {
      // Check if user exists
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, form.email));
      if (user.length === 0) {
        return { message: "Invalid email or password!", status: 401 };
      }

      // Compare password
      const validPassword = await bcrypt.compare(
        form.password,
        user[0].password
      );
      if (!validPassword) {
        return { message: "Invalid email or password!", status: 401 };
      }

      // Generate auth token
      const token = this.generateAuthToken(Number(user[0].id));
      const { id, password, ...data } = user[0];
      return {
        message: "Login successful :)",
        status: 200,
        data: { token, data },
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async updateUser(
    token: string,
    form: { email?: string; password?: string }
  ): Promise<IResultService> {
    try {
      const decodedToken = this.verifyToken(token);
      if (!decodedToken) {
        return { message: "Invalid token", status: 401 };
      }

      const userId = decodedToken.id;

      // Check if user exists
      const user = await db.select().from(users).where(eq(users.id, userId));
      if (user.length === 0) {
        return { message: "User not found", status: 404 };
      }

      const updateFields: Partial<{ email: string; password: string }> = {};

      // Check if there are any fields to update
      if (form.email) {
        updateFields.email = form.email;
      }
      if (form.password) {
        updateFields.password = await this.hashPassword(form.password);
      }

      if (Object.keys(updateFields).length === 0) {
        return { message: "No changes provided", status: 401 };
      }

      // Update the user in the database
      await db.update(users).set(updateFields).where(eq(users.id, userId));

      return {
        message: "User updated successfully :)",
        status: 200,
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async deleteUser(token: string): Promise<IResultService> {
    try {
      const decodedToken = this.verifyToken(token);
      if (!decodedToken) {
        return { message: "Invalid token", status: 401 };
      }

      const userId = decodedToken.id;

      // Check if user exists
      const user = await db.select().from(users).where(eq(users.id, userId));
      if (user.length === 0) {
        return { message: "User not found", status: 404 };
      }

      // Delete the user from the database
      await db.delete(users).where(eq(users.id, userId));

      return {
        message: "User deleted successfully :)",
        status: 200,
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async getMe(token: string): Promise<IResultService> {
    try {
      const decodedToken = this.verifyToken(token);
      if (!decodedToken) {
        return { message: "Invalid token", status: 401 };
      }

      const userId = decodedToken.id;

      // Check if user exists
      const user = await db.select().from(users).where(eq(users.id, userId));
      if (user.length === 0) {
        return { message: "User not found", status: 404 };
      }

      const { id, password, ...data } = user[0];
      return {
        message: "User retrieved successfully :)",
        status: 200,
        data: { id, ...data },
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }
}

export default UserService;
