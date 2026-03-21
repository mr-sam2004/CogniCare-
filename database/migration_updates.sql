-- Migration script for CogniCare+ updates
-- Run these SQL commands to update existing database

-- 1. Add profile_image column to child table
ALTER TABLE child ADD profile_image VARCHAR(500);

-- 2. Add seen and report_title columns to feedback table
ALTER TABLE feedback ADD report_title VARCHAR(300);
ALTER TABLE feedback ADD seen BIT DEFAULT 0;

-- 3. Create contact_message table
CREATE TABLE contact_message (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    subject NVARCHAR(200),
    message NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);

-- 4. Add video_url column to session table (if not exists)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('session') AND name = 'video_url')
BEGIN
    ALTER TABLE session ADD video_url VARCHAR(500);
END

-- 5. Update feedback type CHECK constraint to include new types
-- First drop the existing constraint if it exists
DECLARE @constraint_name NVARCHAR(200)
SELECT @constraint_name = name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('feedback') AND definition LIKE '%feedback_type%'

IF @constraint_name IS NOT NULL
BEGIN
    EXEC('ALTER TABLE feedback DROP CONSTRAINT ' + @constraint_name)
END

-- Add new constraint with all types
ALTER TABLE feedback ADD CONSTRAINT CHK_feedback_type 
CHECK (feedback_type IN ('GENERAL', 'PARENT_FEEDBACK', 'REPORT'));

-- 6. Update session status CHECK constraint to include DELETED
DECLARE @session_constraint_name NVARCHAR(200)
SELECT @session_constraint_name = name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('session') AND definition LIKE '%status%'

IF @session_constraint_name IS NOT NULL
BEGIN
    EXEC('ALTER TABLE session DROP CONSTRAINT ' + @session_constraint_name)
END

-- Add new constraint with all statuses
ALTER TABLE session ADD CONSTRAINT CHK_session_status 
CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'DELETED'));

PRINT 'Migration completed successfully!';
