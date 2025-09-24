CREATE TABLE lookup (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    parentLookupId INTEGER REFERENCES lookup(id) ON DELETE CASCADE
);
