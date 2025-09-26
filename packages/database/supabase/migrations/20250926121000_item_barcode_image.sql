-- Add nullable barcodeImagePath to item
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "barcodeImagePath" TEXT;


