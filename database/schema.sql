-- =====================================================
-- COGNICARE+ DATABASE SCHEMA - SQL SERVER
-- =====================================================

-- Drop tables if exist (in correct order due to foreign keys)
IF OBJECT_ID('rewards', 'U') IS NOT NULL DROP TABLE rewards;
IF OBJECT_ID('child_intake', 'U') IS NOT NULL DROP TABLE child_intake;
IF OBJECT_ID('feedback', 'U') IS NOT NULL DROP TABLE feedback;
IF OBJECT_ID('prescription', 'U') IS NOT NULL DROP TABLE prescription;
IF OBJECT_ID('session', 'U') IS NOT NULL DROP TABLE session;
IF OBJECT_ID('assignment', 'U') IS NOT NULL DROP TABLE assignment;
IF OBJECT_ID('child', 'U') IS NOT NULL DROP TABLE child;
IF OBJECT_ID('doctor', 'U') IS NOT NULL DROP TABLE doctor;
IF OBJECT_ID('parent', 'U') IS NOT NULL DROP TABLE parent;
IF OBJECT_ID('modules', 'U') IS NOT NULL DROP TABLE modules;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;

-- =====================================================
-- USERS TABLE (Common login table with roles)
-- =====================================================
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'PARENT', 'DOCTOR', 'CHILD')),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- =====================================================
-- PARENT TABLE
-- =====================================================
CREATE TABLE parent (
    parent_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(500),
    approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by INT,
    approved_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- =====================================================
-- DOCTOR TABLE
-- =====================================================
CREATE TABLE doctor (
    doctor_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(200),
    license_number VARCHAR(100),
    phone VARCHAR(20),
    years_of_experience INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =====================================================
-- CHILD TABLE
-- =====================================================
CREATE TABLE child (
    child_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    parent_id INT NOT NULL,
    doctor_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    diagnosis VARCHAR(500),
    medical_report_path VARCHAR(500),
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_score INT DEFAULT 0,
    level INT DEFAULT 1,
    avatar VARCHAR(100) DEFAULT 'default',
    login_username VARCHAR(255),
    temp_password VARCHAR(255),
    temp_password_shown_at DATETIME,
    profile_image VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parent(parent_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- =====================================================
-- CHILD INTAKE TABLE (Parent submits child details + report)
-- =====================================================
CREATE TABLE child_intake (
    intake_id INT IDENTITY(1,1) PRIMARY KEY,
    parent_id INT NOT NULL,
    child_first_name VARCHAR(100) NOT NULL,
    child_last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10),
    diagnosis VARCHAR(500),
    cognitive_level VARCHAR(50),
    doctor_feedback TEXT,
    questionnaire_json TEXT,
    medical_report_path VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES parent(parent_id) ON DELETE CASCADE
);

-- =====================================================
-- MODULES TABLE
-- =====================================================
CREATE TABLE modules (
    module_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    duration_minutes INT,
    points_reward INT DEFAULT 10,
    icon VARCHAR(50),
    content TEXT,
    vr_video_url VARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);

-- =====================================================
-- ASSIGNMENT TABLE (Doctor assigns modules to children)
-- =====================================================
CREATE TABLE assignment (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    child_id INT NOT NULL,
    module_id INT NOT NULL,
    assigned_by INT NOT NULL,
    difficulty_level VARCHAR(20) DEFAULT 'EASY' CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
    due_date DATE,
    is_completed BIT DEFAULT 0,
    score INT DEFAULT 0,
    completed_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(module_id),
    FOREIGN KEY (assigned_by) REFERENCES doctor(doctor_id)
);

-- =====================================================
-- SESSION TABLE (Therapy sessions with Google Meet)
-- =====================================================
CREATE TABLE session (
    session_id INT IDENTITY(1,1) PRIMARY KEY,
    child_id INT NOT NULL,
    doctor_id INT NOT NULL,
    session_title VARCHAR(300) NOT NULL,
    session_type VARCHAR(50) CHECK (session_type IN ('VIDEO', 'IN_PERSON', 'VR')),
    google_meet_link VARCHAR(500),
    scheduled_at DATETIME NOT NULL,
    duration_minutes INT,
    video_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'DELETED')),
    notes TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- =====================================================
-- VR VIDEO ASSIGNMENT TABLE (Doctor assigns YouTube videos to children)
-- =====================================================
CREATE TABLE vr_video_assignment (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    child_id INT NOT NULL,
    doctor_id INT NOT NULL,
    video_title VARCHAR(300) NOT NULL,
    youtube_url VARCHAR(500) NOT NULL,
    description TEXT,
    duration_minutes INT,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- =====================================================
-- PRESCRIPTION TABLE
-- =====================================================
CREATE TABLE prescription (
    prescription_id INT IDENTITY(1,1) PRIMARY KEY,
    child_id INT NOT NULL,
    doctor_id INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    dosage VARCHAR(200),
    frequency VARCHAR(200),
    start_date DATE,
    end_date DATE,
    file_path VARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- =====================================================
-- FEEDBACK TABLE
-- =====================================================
CREATE TABLE feedback (
    feedback_id INT IDENTITY(1,1) PRIMARY KEY,
    session_id INT,
    child_id INT,
    parent_id INT,
    doctor_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    feedback_type VARCHAR(50) CHECK (feedback_type IN ('SESSION', 'GENERAL', 'IMPROVEMENT', 'REPORT', 'PARENT_FEEDBACK')),
    report_title VARCHAR(300),
    seen BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (session_id) REFERENCES session(session_id) ON DELETE NO ACTION,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE NO ACTION,
    FOREIGN KEY (parent_id) REFERENCES parent(parent_id) ON DELETE NO ACTION,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE NO ACTION
);

-- =====================================================
-- REWARDS/BADGES TABLE
-- =====================================================
IF OBJECT_ID('rewards', 'U') IS NOT NULL DROP TABLE rewards;
CREATE TABLE rewards (
    reward_id INT IDENTITY(1,1) PRIMARY KEY,
    child_id INT NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(50),
    description TEXT,
    earned_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_parent_approval_status ON parent(approval_status);
CREATE INDEX idx_child_parent ON child(parent_id);
CREATE INDEX idx_child_doctor ON child(doctor_id);
CREATE INDEX idx_assignment_child ON assignment(child_id);
CREATE INDEX idx_assignment_module ON assignment(module_id);
CREATE INDEX idx_assignment_completed ON assignment(is_completed);
CREATE INDEX idx_session_child ON session(child_id);
CREATE INDEX idx_session_doctor ON session(doctor_id);
CREATE INDEX idx_prescription_child ON prescription(child_id);
CREATE INDEX idx_feedback_session ON feedback(session_id);

-- =====================================================
-- INSERT DEFAULT ADMIN USER (password: admin123)
-- =====================================================
INSERT INTO users (email, password_hash, role, is_active)
VALUES ('admin@cognicare.com', '$2a$10$mDk16yoOR5KleLrGUH.KY.9et441qsdGrZEboig8TUe0uWQzGrygK', 'ADMIN', 1);

-- =====================================================
-- INSERT DEFAULT MODULES
-- =====================================================
INSERT INTO modules (name, description, category, difficulty, duration_minutes, points_reward, icon, content, vr_video_url) VALUES
('Memory Match', 'Match pairs of cards to improve memory', 'MEMORY', 'EASY', 10, 20, 'brain', 'Flip cards and find matching pairs', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('Color Sorting', 'Sort colors by category', 'COGNITIVE', 'EASY', 8, 15, 'palette', 'Click and drag colors to correct bins', 'https://www.youtube.com/embed/LXb3EKWsInQ'),
('Number Sequence', 'Complete the number pattern', 'MATH', 'MEDIUM', 12, 25, 'calculator', 'Fill in missing numbers in sequences', 'https://www.youtube.com/embed/jNQXAC9IVRw'),
('Shape Recognition', 'Identify and match shapes', 'VISUAL', 'EASY', 10, 15, 'shapes', 'Match shapes to their shadows', 'https://www.youtube.com/embed/9bZkp7q19f0'),
('Breathing Exercise', 'Guided breathing for relaxation', 'RELAXATION', 'EASY', 5, 10, 'wind', 'Follow the breathing pattern', 'https://www.youtube.com/embed/tybOi4hjZFQ'),
('Story Completion', 'Complete the story', 'LANGUAGE', 'MEDIUM', 15, 30, 'book', 'Choose the right ending for stories', 'https://www.youtube.com/embed/kJQP7kiw5Fk'),
('Focus Timer', 'Improve concentration', 'ATTENTION', 'HARD', 20, 40, 'clock', 'Complete tasks within time limit', 'https://www.youtube.com/embed/V-_O7nl0Ii0'),
('Emotion Match', 'Match emotions with faces', 'SOCIAL', 'EASY', 10, 20, 'smile', 'Identify emotions from expressions', 'https://www.youtube.com/embed/UxxajLWwzqY');

-- =====================================================
-- CONTACT MESSAGE TABLE
-- =====================================================
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

PRINT 'Database schema created successfully!';
