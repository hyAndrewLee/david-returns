-- Add pickup_method column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_method TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.pickup_method IS 'How the courier should pick up the package: "Hand it to us" or "Leave at my door"';
