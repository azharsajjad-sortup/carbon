-- Add nullable serialNumber to item
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "serialNumber" TEXT;


