-- Enable Realtime for the orders table
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Verify realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
