-- Migration: Add purchase_price to products table
-- Description: Add purchase_price field for Business tariff warehouse management
-- Date: 2025-12-05

-- Add purchase_price column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10, 2);

-- Add comment to document the field
COMMENT ON COLUMN products.purchase_price IS 'Purchase/cost price for warehouse tracking (Business tariff only)';
