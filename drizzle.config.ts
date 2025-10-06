import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema.ts",   // your schema file (you need to create this)
  out: "./drizzle",            // folder where migrations will be saved
  dialect: "postgresql",       // or "mysql" or "sqlite"
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // use .env for DB connection
  },
});

