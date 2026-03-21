# CogniCare+ — Digital Therapy Platform

> A comprehensive child therapy management platform built with Spring Boot + React.

## What is CogniCare+?

CogniCare+ helps therapists (doctors) manage therapy for children with cognitive disorders. Parents can track progress, doctors assign modules/sessions/prescriptions/VR videos, and children complete gamified therapy activities.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Chart.js |
| Backend | Spring Boot 3.2, Java 17, Spring Security, JWT |
| Database | SQL Server |
| Auth | JWT (JSON Web Token) |

## Features

| Role | Features |
|------|----------|
| Admin | Manage users, view parent feedback, global leaderboard |
| Doctor | Assign modules, sessions, prescriptions, VR videos, send reports to parents |
| Parent | Track child progress, activity feed, doctor reports, submit feedback to admin |
| Child | Complete therapy tasks, watch VR videos, download prescription PDFs, earn rewards |

## Project Structure

```
CogniCare+/
├── database/
│   └── schema.sql              # SQL Server schema (run this first)
├── backend/                     # Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/cognicare/
│       ├── controller/          # REST endpoints
│       ├── service/             # Business logic
│       ├── model/               # JPA entities
│       ├── dto/                 # Data transfer objects
│       ├── repository/          # JPA repositories
│       ├── config/              # Security config, CORS, exception handler
│       ├── security/            # JWT authentication
│       └── CogniCareApplication.java
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── pages/               # Dashboard pages (Admin, Doctor, Parent, Child)
│   │   ├── context/             # Auth context
│   │   ├── services/            # API service
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── .gitignore
├── README.md                    # This file
├── RUN_GUIDE.md                 # How to set up and run
└── USER_GUIDE.md                # How to use the app
```

## Quick Links

- [Run Guide](RUN_GUIDE.md) — How to install and run the project
- [User Guide](USER_GUIDE.md) — How to use the app for each role

## Screenshots

See the User Guide for descriptions of each dashboard and feature.

## License

MIT License
