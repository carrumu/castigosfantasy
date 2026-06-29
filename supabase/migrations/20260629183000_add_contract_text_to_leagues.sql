-- Add contract_text column to leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS contract_text TEXT;
