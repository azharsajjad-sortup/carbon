-- Insert default employee status data (Global lookup table - only 3 records total)
INSERT INTO "employeeStatus" ("id", "code", "name", "parentStatusId", "createdBy")
VALUES 
    ('1', 'Available', 'Available', NULL, 'system'),
    ('2', 'In Transit', 'In Transit', NULL, 'system'),
    ('3', 'Unavailable', 'Unavailable', NULL, 'system')
ON CONFLICT ("id") DO NOTHING;
