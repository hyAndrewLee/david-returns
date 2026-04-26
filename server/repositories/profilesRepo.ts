import "server-only"

import { eq } from "drizzle-orm"
import { adminDb } from "@/server/db"
import { profiles } from "@/server/db/schema"

export type ProfileBasicRow = {
  id: string
  email: string | null
  fullName: string | null
}

export const findProfileBasicById = async (id: string): Promise<ProfileBasicRow | null> => {
  const [row] = await adminDb
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
    })
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1)
  return row ?? null
}
