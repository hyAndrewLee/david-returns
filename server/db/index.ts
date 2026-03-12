import "server-only"

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { sql } from "drizzle-orm"
import * as schema from "./schema"

type DrizzleDb = PostgresJsDatabase<typeof schema>

let _adminDb: DrizzleDb | null = null

const getConnectionString = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  return connectionString
}

const getAdminDb = (): DrizzleDb => {
  if (!_adminDb) {
    _adminDb = drizzle({ client: postgres(getConnectionString()), schema })
  }
  return _adminDb
}

export const adminDb = new Proxy({} as DrizzleDb, {
  get(_, prop) {
    return (getAdminDb() as any)[prop]
  },
})

type SupabaseToken = {
  iss?: string
  sub?: string
  aud?: string[] | string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  role?: string
}

export const createDrizzle = (
  token: SupabaseToken,
  { admin, client: rlsClient }: { admin: DrizzleDb; client: DrizzleDb },
) => ({
  admin,
  rls: (async (transaction: Parameters<DrizzleDb["transaction"]>[0], ...rest: any[]) => {
    return await rlsClient.transaction(async (tx) => {
      try {
        await tx.execute(sql`
          select set_config('request.jwt.claims', '${sql.raw(JSON.stringify(token))}', TRUE);
          select set_config('request.jwt.claim.sub', '${sql.raw(token.sub ?? "")}', TRUE);
          set local role ${sql.raw(token.role ?? "anon")};
        `)
        return await transaction(tx as any)
      } finally {
        await tx.execute(sql`
          select set_config('request.jwt.claims', NULL, TRUE);
          select set_config('request.jwt.claim.sub', NULL, TRUE);
          reset role;
        `)
      }
    }, ...rest)
  }) as DrizzleDb["transaction"],
})

export const createDrizzleSupabaseClient = async (accessToken?: string) => {
  if (!accessToken) {
    return { admin: adminDb, rls: adminDb.transaction.bind(adminDb) }
  }

  const payload = JSON.parse(
    Buffer.from(accessToken.split(".")[1], "base64").toString(),
  ) as SupabaseToken

  return createDrizzle(payload, { admin: adminDb, client: adminDb })
}

export { schema }
