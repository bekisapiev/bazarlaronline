-- Migration: Add missing fields to reports table
-- Description: Add ability to report orders and reporter contact info
-- Date: 2025-12-05

-- Add reported_order_id column to reports table
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS reported_order_id UUID REFERENCES orders(id) ON DELETE CASCADE;

-- Add reporter contact fields
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS reporter_phone VARCHAR(20);

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS reporter_email VARCHAR(255);

-- Add comments to document the fields
COMMENT ON COLUMN reports.reported_order_id IS 'Foreign key to orders table for order reports';
COMMENT ON COLUMN reports.reporter_phone IS 'Reporter phone number (editable by user)';
COMMENT ON COLUMN reports.reporter_email IS 'Reporter email address (editable by user)';
