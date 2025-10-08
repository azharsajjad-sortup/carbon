-- Create barcodeUpload table (mirroring modelUpload structure)
CREATE TABLE "barcodeUpload" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "name" TEXT NOT NULL,
  "size" BIGINT NOT NULL,
  "imagePath" TEXT NOT NULL,
  "serialNumber" TEXT,              
  "itemId" TEXT,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updatedBy" TEXT,

  CONSTRAINT "barcodeUpload_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "barcodeUpload_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "barcodeUpload_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company" ("id"),
  CONSTRAINT "barcodeUpload_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
  CONSTRAINT "barcodeUpload_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id")
);

-- Add to realtime publication
ALTER publication supabase_realtime ADD TABLE "barcodeUpload";

-- Enable RLS
ALTER TABLE "barcodeUpload" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (mirroring modelUpload policies)
CREATE POLICY "Employees can view barcode uploads" ON "barcodeUpload"
FOR SELECT USING (
    has_role('employee', "companyId")
);

CREATE POLICY "Employees with parts_create can create barcode uploads" ON "barcodeUpload"
FOR INSERT WITH CHECK (
    has_role('employee', "companyId")
    AND has_company_permission('parts_create', "companyId")
);

CREATE POLICY "Employees with parts_update can update barcode uploads" ON "barcodeUpload"
FOR UPDATE USING (
    has_role('employee', "companyId")
    AND has_company_permission('parts_update', "companyId")
);

CREATE POLICY "Employees with parts_delete can delete barcode uploads" ON "barcodeUpload"
FOR DELETE USING (
    has_role('employee', "companyId")
    AND has_company_permission('parts_delete', "companyId")
);

-- Create storage RLS policies for barcodes folder in 'private' bucket (mirroring models)
CREATE POLICY "Employees can view barcodes" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'private'
    AND has_role('employee', (storage.foldername(name))[1])
    AND (storage.foldername(name))[2] = 'barcodes'
);

CREATE POLICY "Employees with parts_view can upload barcodes" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'private'
    AND has_role('employee', (storage.foldername(name))[1])
    AND has_company_permission('parts_create', (storage.foldername(name))[1])
    AND (storage.foldername(name))[2] = 'barcodes'
);

CREATE POLICY "Employees with parts_update can update barcodes" ON storage.objects 
FOR UPDATE USING (
    bucket_id = 'private'
    AND has_role('employee', (storage.foldername(name))[1])
    AND has_company_permission('parts_update', (storage.foldername(name))[1])
    AND (storage.foldername(name))[2] = 'barcodes'
);

CREATE POLICY "Employees with parts_delete can delete barcodes" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'private'
    AND has_role('employee', (storage.foldername(name))[1])
    AND has_company_permission('parts_delete', (storage.foldername(name))[1])
    AND (storage.foldername(name))[2] = 'barcodes'
);

-- Add barcodeUploadId column to item table
ALTER TABLE "item" ADD COLUMN "barcodeUploadId" TEXT;

-- Add foreign key constraint for item.barcodeUploadId
ALTER TABLE "item"
  ADD CONSTRAINT "item_barcodeUploadId_fkey"
  FOREIGN KEY ("barcodeUploadId") REFERENCES "barcodeUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for the new foreign key
CREATE INDEX "item_barcodeUploadId_idx" ON "item" ("barcodeUploadId");
