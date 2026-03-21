# Run Guide — CogniCare+

> Step-by-step instructions to set up and run CogniCare+ on any machine.

---

## Prerequisites

| Tool | Minimum Version | Download |
|------|----------------|----------|
| Java | 17 | https://adoptium.net/ |
| Maven | 3.8+ | https://maven.apache.org/download.cgi |
| Node.js | 18+ | https://nodejs.org/ |
| SQL Server | 2019+ | https://www.microsoft.com/en-us/sql-server |

---

## Step 1 — Database Setup

### 1.1 Create the database

Open SQL Server Management Studio (SSMS) and run:

```sql
CREATE DATABASE CogniCareDB;
```

### 1.2 Run the schema

Open `database/schema.sql` in SSMS and execute it. This creates all tables:
- `users`, `parent`, `doctor`, `child`
- `session`, `assignment`, `prescription`
- `feedback`, `rewards`, `modules`
- `vr_video_assignment`

### 1.3 Configure database user (optional)

If you want a dedicated database user:

```sql
CREATE LOGIN cognicare_app WITH PASSWORD = 'YourStrongPassword!';
CREATE USER cognicare_app FOR LOGIN cognicare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO cognicare_app;
```

---

## Step 2 — Backend Setup

### 2.1 Update database config

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost\\SQLEXPRESS;databaseName=CogniCareDB;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YOUR_PASSWORD
```

> **Note**: Change `localhost\\SQLEXPRESS` to match your SQL Server instance name.
> Change `sa` and `YOUR_PASSWORD` to your SQL Server credentials.

### 2.2 Build the backend

```bash
cd backend
mvn clean install
```

This downloads dependencies and compiles the code. First run takes 2-3 minutes.

### 2.3 Run the backend

```bash
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

You should see:
```
Started CogniCareApplication in X.XX seconds
```

---

## Step 3 — Frontend Setup

### 3.1 Install dependencies

```bash
cd frontend
npm install
```

### 3.2 Run the development server

```bash
npm run dev
```

Frontend starts on **http://localhost:5173**

### 3.3 (Optional) Change backend URL

If your backend runs on a different port, create `frontend/.env`:

```
VITE_API_URL=http://localhost:YOUR_PORT
```

---

## Step 4 — Create Admin Account

Run this in SSMS to create the first admin user:

```sql
-- Create user record
INSERT INTO users (email, password, role, is_active)
VALUES ('admin@cognicare.com', '$2a$10$...hashed_password...', 'ADMIN', 1);

-- Create admin record (adjust user_id based on the inserted ID)
INSERT INTO admin (user_id, first_name, last_name)
VALUES (1, 'Admin', 'User');
```

Or temporarily set `spring.jpa.hibernate.ddl-auto=create` in `application.properties` to let Hibernate create tables with demo data (WARNING: this drops existing data).

---

## Troubleshooting

### Backend fails to start
- Check database credentials in `application.properties`
- Verify SQL Server is running
- Make sure the database `CogniCareDB` exists

### Frontend can't reach backend
- Ensure backend is running on port 8080
- Check CORS is configured (already done in SecurityConfig)
- Verify `VITE_API_URL` in `frontend/.env` if changed

### Validation errors
- Run `database/schema.sql` — it includes all necessary CHECK constraints
- Make sure `vr_video_assignment` table exists (part of schema.sql)

### Build failures
- Java: make sure JAVA_HOME points to Java 17+
- Node: run `node -v` to check version (need 18+)
- Maven: run `mvn -v` to check version (need 3.8+)
