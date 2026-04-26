UPDATE "orders" SET "status" = 'cancelled' WHERE "status" NOT IN ('scheduled', 'picked_up', 'sent_to_carrier', 'in_transit', 'completed', 'cancelled');
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_check" CHECK ("status" IN ('scheduled', 'picked_up', 'sent_to_carrier', 'in_transit', 'completed', 'cancelled'));
