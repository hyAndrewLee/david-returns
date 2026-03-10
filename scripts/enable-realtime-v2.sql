-- Enable Realtime for the orders table
-- This allows Supabase Realtime to listen for INSERT, UPDATE, and DELETE changes

alter publication supabase_realtime add table orders;
