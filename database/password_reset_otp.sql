-- Password Reset OTP table for Forgot Password feature
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'password_reset_otp')
BEGIN
    CREATE TABLE password_reset_otp (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expiry_time DATETIME NOT NULL,
        used BIT DEFAULT 0
    );
    
    -- Create index for faster lookups
    CREATE INDEX idx_otp_email ON password_reset_otp(email);
END
GO

PRINT 'password_reset_otp table created successfully';
