CREATE TABLE IF NOT EXISTS "impersonation_audit" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" uuid NOT NULL,
  "admin_identifier" text NOT NULL,
  "action" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "impersonation_audit_action_check" CHECK ("action" IN ('start', 'stop'))
);

CREATE INDEX IF NOT EXISTS "impersonation_audit_customer_id_idx" ON "impersonation_audit" ("customer_id");
CREATE INDEX IF NOT EXISTS "impersonation_audit_created_at_idx" ON "impersonation_audit" ("created_at");

ALTER TABLE "impersonation_audit" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access on impersonation_audit" ON "impersonation_audit";
CREATE POLICY "service role full access on impersonation_audit"
  ON "impersonation_audit"
  AS PERMISSIVE
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);
