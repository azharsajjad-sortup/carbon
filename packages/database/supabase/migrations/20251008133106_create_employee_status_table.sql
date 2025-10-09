-- Create Employee Status table (Global lookup table)
CREATE TABLE "employeeStatus" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentStatusId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT "employeeStatus_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "employeeStatus_parentStatusId_fkey" FOREIGN KEY ("parentStatusId") REFERENCES "employeeStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "employeeStatus_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id"),
    CONSTRAINT "employeeStatus_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id")
);

-- Create indexes
CREATE INDEX "employeeStatus_parentStatusId_idx" ON "employeeStatus" ("parentStatusId");

-- Enable RLS
ALTER TABLE "employeeStatus" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Global table - all users can read, only admins can modify)
CREATE POLICY "SELECT" ON "employeeStatus" FOR SELECT USING (true);

CREATE POLICY "INSERT" ON "employeeStatus" FOR INSERT WITH CHECK (
    has_company_permission('users_update', (SELECT "companyId" FROM "userToCompany" WHERE "userId" = auth.uid()::text LIMIT 1))
);

CREATE POLICY "UPDATE" ON "employeeStatus" FOR UPDATE USING (
    has_company_permission('users_update', (SELECT "companyId" FROM "userToCompany" WHERE "userId" = auth.uid()::text LIMIT 1))
);

CREATE POLICY "DELETE" ON "employeeStatus" FOR DELETE USING (
    has_company_permission('users_delete', (SELECT "companyId" FROM "userToCompany" WHERE "userId" = auth.uid()::text LIMIT 1))
);
