-- Migration to change userId column from UUID to VARCHAR in purchases table
-- This fixes the issue where non-UUID user IDs were rejected

-- First, drop any foreign key constraints that might reference userId
DO $$
BEGIN
    -- Check if there are any foreign key constraints on userId column
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name LIKE '%userId%'
        AND table_name = 'purchases'
    ) THEN
        -- Drop all constraints that reference userId
        ALTER TABLE purchases DROP CONSTRAINT IF EXISTS "FK_purchases_userId";
        ALTER TABLE purchases DROP CONSTRAINT IF EXISTS "UQ_purchases_userId";
    END IF;
END $$;

-- Change the userId column type from UUID to VARCHAR
ALTER TABLE purchases
ALTER COLUMN "userId" TYPE VARCHAR(255) USING "userId"::VARCHAR(255);

-- Note: We cannot recreate the foreign key constraint because users.id is still UUID
-- The userId field will now be optional and can reference both UUID and string user identifiers

-- Create index for better performance
CREATE INDEX IF NOT EXISTS "IDX_purchases_userId" ON "purchases"("userId");

-- Add comment to document the change
COMMENT ON COLUMN purchases."userId" IS 'User identifier - now supports both UUID and string formats (no foreign key constraint)';