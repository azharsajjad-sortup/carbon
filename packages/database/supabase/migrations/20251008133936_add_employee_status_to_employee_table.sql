-- Add employeeStatusId column to employee table
ALTER TABLE "employee" 
ADD COLUMN "employeeStatusId" TEXT NOT NULL DEFAULT '3';

-- Add foreign key constraint to employeeStatus table (global lookup)
ALTER TABLE "employee" 
ADD CONSTRAINT "employee_employeeStatusId_fkey" 
FOREIGN KEY ("employeeStatusId") 
REFERENCES "employeeStatus"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create index for performance
CREATE INDEX "employee_employeeStatusId_idx" ON "employee" ("employeeStatusId");
