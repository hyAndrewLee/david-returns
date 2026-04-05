import { defineConfig } from "drizzle-kit"

const databaseUrl = new URL(process.env.DATABASE_URL!)
const isLocal = databaseUrl.hostname === "127.0.0.1" || databaseUrl.hostname === "localhost"

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema/index.ts",
  out: "./server/db/migrations",
  dbCredentials: {
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port) || 5432,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.slice(1),
    ssl: isLocal ? false : "require",
  },
  verbose: true,
  strict: true,
  schemaFilter: ["public"],
  entities: {
    roles: {
      provider: "supabase",
    },
  },
})
