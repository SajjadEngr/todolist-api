import db from "../db/index.js";
import { todos, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

class TaskService {
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

  private async getUserById(userId: number): Promise<any> {
    const user = await db.select().from(users).where(eq(users.id, userId));
    return user.length ? user[0] : null;
  }

  private async verifyUser(token: string): Promise<{ id: number } | null> {
    const decoded = this.verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await this.getUserById(decoded.id);
    return user ? decoded : null;
  }

  public async addTask(
    token: string,
    form: {
      title: string;
      description?: string;
      dueDate?: Date;
    }
  ): Promise<IResultService> {
    try {
      const decoded = await this.verifyUser(token);
      if (!decoded) {
        return { message: "Invalid token or user not found", status: 401 };
      }

      const newTask: typeof todos.$inferInsert = {
        userId: decoded.id,
        title: form.title,
        description: form.description,
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
      };

      // Insert the new task into the database
      await db.insert(todos).values(newTask);

      return {
        message: "Task added successfully :)",
        status: 201,
        data: newTask,
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async getTasks(token: string): Promise<IResultService> {
    try {
      const decoded = await this.verifyUser(token);
      if (!decoded) {
        return { message: "Invalid token or user not found", status: 401 };
      }

      // Get tasks for the user
      const tasks = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, decoded.id));

      return {
        message: "Tasks retrieved successfully :)",
        status: 200,
        data: tasks,
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async getTaskById(
    token: string,
    taskId: number
  ): Promise<IResultService> {
    try {
      const decoded = await this.verifyUser(token);
      if (!decoded) {
        return { message: "Invalid token or user not found", status: 401 };
      }

      // Get task by ID
      const task = await db.select().from(todos).where(eq(todos.id, taskId));
      if (task.length === 0) {
        return { message: "Task not found", status: 404 };
      }

      return {
        message: "Task retrieved successfully :)",
        status: 200,
        data: task[0],
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async updateTask(
    token: string,
    taskId: number,
    form: {
      title?: string;
      description?: string;
      status?: "pending" | "in_progress" | "completed";
      dueDate?: Date;
    }
  ): Promise<IResultService> {
    try {
      const decoded = await this.verifyUser(token);
      if (!decoded) {
        return { message: "Invalid token or user not found", status: 401 };
      }

      // Check if task exists
      const task = await db.select().from(todos).where(eq(todos.id, taskId));
      if (task.length === 0) {
        return { message: "Task not found", status: 404 };
      }

      const updateFields: Partial<typeof todos.$inferInsert> = {};

      // Check if there are any fields to update
      if (form.title) {
        updateFields.title = form.title;
      }
      if (form.description) {
        updateFields.description = form.description;
      }
      if (form.status) {
        updateFields.status = form.status;
      }
      if (form.dueDate) {
        updateFields.dueDate = form.dueDate;
      }

      if (Object.keys(updateFields).length === 0) {
        return { message: "No changes provided", status: 401 };
      }

      // Update the task in the database
      await db.update(todos).set(updateFields).where(eq(todos.id, taskId));

      return {
        message: "Task updated successfully :)",
        status: 200,
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }

  public async deleteTask(
    token: string,
    taskId: number
  ): Promise<IResultService> {
    try {
      const decoded = await this.verifyUser(token);
      if (!decoded) {
        return { message: "Invalid token or user not found", status: 401 };
      }

      // Check if task exists
      const task = await db.select().from(todos).where(eq(todos.id, taskId));
      if (task.length === 0) {
        return { message: "Task not found", status: 404 };
      }

      // Delete the task from the database
      await db.delete(todos).where(eq(todos.id, taskId));

      return {
        message: "Task deleted successfully :)",
        status: 200,
      };
    } catch (error: any) {
      console.log(error.message);
      return { message: "Unknown error", status: 500 };
    }
  }
}

export default TaskService;
