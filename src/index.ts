import { serve } from "@hono/node-server";
import { configDotenv } from "dotenv";
import { Hono } from "hono";
import user from "./routes/user.route.js";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "dotenv/config";

// Initialize the Hono app
const app = new Hono().basePath("/api/v1");

// Use CORS middleware
app.use(cors());

// Use logger middleware
app.use(logger());

// Define the /user route
app.route("/user", user);

// Get the port from environment variables
const port = Number(process.env.PORT) || 3000; // Default to port 3000 if not specified

// Log the server start message
console.log(`Server is running on http://localhost:${port}`);

// Start the server
serve({
  fetch: app.fetch,
  port,
});
