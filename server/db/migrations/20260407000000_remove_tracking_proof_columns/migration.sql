ALTER TABLE "orders" DROP COLUMN IF EXISTS "tracking_status";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "tracking_number";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "picked_up_at";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "delivered_at";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "return_confirmed_at";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "proof_pickup_url";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "proof_delivery_url";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "proof_return_url";
