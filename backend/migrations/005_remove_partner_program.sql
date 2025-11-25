-- Migration: Remove Partner Program, Keep Only Referral Program
-- Created: 2025-11-25

-- Remove partner_percent from products table
ALTER TABLE products DROP COLUMN IF EXISTS partner_percent;

-- Remove partner-related columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS referral_id;
ALTER TABLE orders DROP COLUMN IF EXISTS referral_commission;
ALTER TABLE orders DROP COLUMN IF EXISTS platform_commission;

-- Drop old constraint if exists
ALTER TABLE products DROP CONSTRAINT IF EXISTS check_partner_percent;
