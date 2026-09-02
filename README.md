Instant Mechanic — Live Vehicle Service Operations Dashboard

A production-style full-stack operations dashboard for monitoring vehicle service bookings, customers, mechanics, services, vehicles, and revenue in real time.

The project was built as a Full Stack Developer Internship technical assignment for Instant Mechanic.

🚗 Project Overview

Instant Mechanic is a vehicle-service operations platform where an operations team can monitor:

Total bookings

Today's bookings

Completed, pending, and cancelled bookings

Revenue

Active mechanics

Customers

Vehicles

Services

Booking trends

Revenue trends

Booking status distribution

Service/category performance

The dashboard uses a real backend API and PostgreSQL database rather than hardcoded frontend data.

The application also includes JWT authentication, role-based access, Swagger/OpenAPI documentation, WebSocket-based real-time updates, database migrations, realistic seed data, and performance optimization.

✨ Key Features

Dashboard

Total bookings

Today's bookings

Completed bookings

Pending bookings

Cancelled bookings

Total revenue

Active mechanics

Customer information

Real-time connection status

Analytics

Bookings over time

Revenue over time

Booking status distribution

Service/category breakdown

Operational statistics

Bookings

Booking ID

Customer

Vehicle

Service

Mechanic

Status

Amount

Scheduled date/time

Search

Filtering

Sorting

Pagination

Customers

Customer list

Customer details

Search

Booking count

Total spending

Database-backed customer statistics

Mechanics

Mechanic list

Current status

Jobs/bookings information

Assigned booking information

Authentication & Security

JWT authentication

Password hashing

Protected API endpoints

Admin role

Active/inactive user status

Environment-based configuration

No credentials stored in source code

Real-Time Updates

The application uses WebSockets for live booking updates.

Architecture:

Booking/API Event
      ↓
FastAPI WebSocket
      ↓
WebSocket Manager
      ↓
Connected Dashboard Clients
      ↓
Live UI Update

API Documentation

FastAPI automatically provides:

Swagger UI

OpenAPI schema

Interactive API testing

API documentation is available at:

https://YOUR_BACKEND_URL/docs

🏗️ Architecture

                    ┌─────────────────────┐
                    │       User          │
                    │   Browser / Client  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Next.js         │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                 HTTP / REST   │   WebSocket
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
            API Routes     Services      WebSocket
                 │             │          Manager
                 └─────────────┼─────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     SQLAlchemy      │
                    │        ORM          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │      Database       │
                    └─────────────────────┘

🛠️ Tech Stack

Frontend

Next.js

React

TypeScript

HTML

CSS

Backend

Python

FastAPI

SQLAlchemy

Pydantic

JWT Authentication

Uvicorn

Database

PostgreSQL

Alembic

SQLAlchemy ORM

Real-Time

WebSockets

Testing & Performance

Swagger/OpenAPI

Locust

Grafana Cloud k6

Development Tools

Git

GitHub

VS Code

Deployment

Current development/working deployment:

Frontend: Render

Backend: Render

Database: PostgreSQL

Target assignment deployment:

Frontend: Vercel

Backend: AWS

Database: PostgreSQL / AWS managed database

📁 Project Structure

instant-mechanic-dashboard/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── bookings.py
│   │   │       ├── customers.py
│   │   │       ├── dashboard.py
│   │   │       ├── mechanics.py
│   │   │       ├── vehicles.py
│   │   │       ├── analytics.py
│   │   │       └── websocket.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   │
│   │   ├── database/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── requirements.txt
│   ├── seed.py
│   └── .env.example
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   ├── next.config.*
│   └── .env.example
│
└── README.md

The exact file structure may evolve as the project is developed.

🗄️ Database

The application uses PostgreSQL as the primary relational database.

Main entities include:

Users
  │
  └── Authentication / Roles

Customers
  │
  └── Bookings
       │
       ├── Vehicle
       ├── Mechanic
       └── Service

Main tables:

users

customers

vehicles

mechanics

services

bookings

🌱 Seed Data

The project contains realistic sample data for development and testing.

Current seed dataset:

Entity

Records

Customers

60

Mechanics

25

Services

15

Vehicles

120

Bookings

600

The data contains:

Multiple booking statuses

Different booking dates

Different service types

Different booking amounts

Customer/vehicle/mechanic relationships

This allows the dashboard and analytics pages to behave like a real operations system.

🔄 Booking Status

Bookings support operational status values such as:

PENDING
ASSIGNED
MECHANIC_ON_THE_WAY
COMPLETED
CANCELLED

The WebSocket layer is designed to allow connected dashboard clients to receive live booking-related updates.

🔐 Authentication

Authentication uses JWT tokens.

Basic authentication flow:

User Login
    ↓
POST /api/auth/login
    ↓
FastAPI validates credentials
    ↓
Password hash verification
    ↓
JWT access token
    ↓
Client sends:
Authorization: Bearer <token>
    ↓
Protected API

Passwords are stored as hashes and are not stored as plain text.

🔌 API

The backend exposes REST APIs for the dashboard.

Main API areas include:

/api/auth
/api/dashboard
/api/bookings
/api/mechanics
/api/customers
/api/vehicles
/api/analytics

Examples:

GET  /api/dashboard
GET  /api/bookings
GET  /api/mechanics
GET  /api/customers
GET  /api/vehicles
GET  /api/analytics

Real-time WebSocket endpoint:

/ws/bookings

Swagger documentation:

https://YOUR_BACKEND_URL/docs

OpenAPI JSON:

https://YOUR_BACKEND_URL/openapi.json

API routes may be extended as the project evolves. Swagger/OpenAPI is the source of truth for the deployed API.

⚡ Performance Optimization

During load testing, a performance bottleneck was identified in the customer endpoint.

Problem

The original customer API executed additional database queries inside a loop for every customer.

This created an N+1 query pattern:

Get customers
     ↓
For every customer:
     ├── COUNT bookings
     └── SUM completed booking amount

For approximately 60 customers, one API request could generate roughly 120+ database operations.

Optimization

The endpoint was redesigned to calculate booking statistics using SQL aggregation and a grouped subquery.

Conceptually:

PostgreSQL
    ↓
GROUP BY customer_id
    ↓
COUNT(bookings)
SUM(completed booking amounts)
    ↓
JOIN with customers
    ↓
Single optimized result

Result

During local load testing with 100 concurrent users:

Before optimization
Average response time: ~2138 ms

After optimization
Average response time: ~113 ms

This reduced the average response time by approximately 95% for that endpoint under the tested workload.

🧪 Load Testing

The application was tested using Locust and Grafana Cloud k6.

Local Load Testing

Tested concurrent users:

10 users
50 users
100 users
250 users

At 100 concurrent users, the optimized customer endpoint showed a significant performance improvement.

At 250 concurrent users, the application continued returning successful responses but latency increased significantly. This helped identify the limits of the local development environment and the need for appropriate production compute/database resources.

Cloud Load Testing

Grafana Cloud k6 was also used to test the deployed backend.

The testing process helped identify database connection contention on the initial configuration.

The SQLAlchemy connection pool was then configured with explicit pool settings for the test environment.

The purpose of load testing was not simply to generate traffic, but to identify bottlenecks and improve the application.

🧰 Local Development Setup

1. Clone the repository

git clone https://github.com/ajay398/instant-mechanic-dashboard.git
cd instant-mechanic-dashboard

Backend Setup

2. Open the backend directory

cd backend

3. Create a virtual environment

Windows:

python -m venv venv

Activate it:

Git Bash

source venv/Scripts/activate

Windows CMD

venv\Scripts\activate

PowerShell

venv\Scripts\Activate.ps1

4. Install dependencies

pip install -r requirements.txt

5. Configure environment variables

Create:

backend/.env

Example:

DATABASE_URL=postgresql://username:password@localhost:5432/instant_mechanic
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

Do not commit the real .env file to GitHub.

6. Run database migrations

From the backend directory:

alembic upgrade head

7. Seed the database

python seed.py

The seed script is intended for development/sample-data setup. Review the script before running it against an existing production database because seed behavior can modify existing data.

8. Start the backend

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health

Frontend Setup

9. Open a new terminal

From the project root:

cd frontend

10. Install dependencies

npm install

11. Configure environment variables

Create:

frontend/.env.local

Example:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

For production, replace the value with the deployed backend URL.

12. Start the frontend

npm run dev

The frontend will normally be available at:

http://localhost:3000

🔑 Environment Variables

Backend

DATABASE_URL=
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

Frontend

NEXT_PUBLIC_API_URL=

Never commit:

.env
.env.local
database passwords
JWT secrets
API keys
private credentials

☁️ Deployment

Frontend

The assignment deployment target is Vercel.

Production URL:

[YOUR_VERCEL_FRONTEND_URL]

Frontend environment variable:

NEXT_PUBLIC_API_URL=[YOUR_AWS_BACKEND_URL]

Backend

The assignment deployment target is AWS.

Production backend URL:

[YOUR_AWS_BACKEND_URL]

Swagger:

[YOUR_AWS_BACKEND_URL]/docs

Health:

[YOUR_AWS_BACKEND_URL]/health

🔗 Live Links

Update these values before submitting the assignment.

Frontend

[YOUR_VERCEL_FRONTEND_URL]

Backend

[YOUR_AWS_BACKEND_URL]

API Documentation

[YOUR_AWS_BACKEND_URL]/docs

GitHub

https://github.com/ajay398/instant-mechanic-dashboard

🤖 AI Usage

AI tools were used as development assistance during the project.

Tools

ChatGPT

Areas where AI assistance was used

Project planning

Architecture discussions

Backend/API design

Database design

Debugging

Frontend development assistance

WebSocket implementation assistance

Deployment troubleshooting

Load-testing setup

Performance analysis

README/documentation preparation

Developer contribution

AI-generated suggestions were reviewed, tested, modified, and integrated into the project.

The final application was locally tested, deployed, debugged, and performance-tested.

The developer understands the architecture and major implementation decisions and can explain or modify the submitted code.

🧠 Engineering Decisions

Why FastAPI?

FastAPI provides:

High-performance API development

Automatic OpenAPI documentation

Type validation with Pydantic

Async support

Easy WebSocket integration

Why PostgreSQL?

PostgreSQL provides:

Strong relational data modeling

Foreign-key relationships

Aggregation/query capabilities

Transaction support

Production-ready relational database functionality

Why SQLAlchemy?

SQLAlchemy provides:

ORM-based database access

Relationship management

Query composition

Database abstraction

Why WebSockets?

The dashboard represents a live operations environment. WebSockets allow the server to communicate booking-related updates to connected clients without requiring a complete browser refresh.

🧪 Testing Strategy

The project was tested at multiple levels:

API testing

Swagger/OpenAPI was used to test backend endpoints.

Functional testing

The dashboard was tested for:

Authentication

Dashboard loading

Booking data

Customer data

Mechanics

Vehicles

Analytics

Real-time connection

Load testing

Locust and Grafana Cloud k6 were used to evaluate:

Concurrent users

Request throughput

Response latency

HTTP failure rate

Endpoint performance

Database connection behavior

📊 Project Highlights

The most important engineering improvements made during development include:

Built a complete full-stack dashboard.

Connected the frontend to a real FastAPI backend.

Used PostgreSQL instead of hardcoded dashboard data.

Added realistic seed data with 600 bookings.

Added JWT authentication.

Added admin role support.

Added WebSocket real-time connectivity.

Added Alembic database migrations.

Added Swagger/OpenAPI documentation.

Identified and fixed an N+1 database query problem.

Performed concurrent-user load testing.

Investigated database connection contention during cloud testing.

Deployed the application publicly.

🚀 Future Improvements

Possible production improvements include:

Redis caching

Background task processing

Advanced database indexing

Automated CI/CD

Docker containerization

Automated test suite

Error monitoring

Rate limiting

Horizontal backend scaling

Database connection pooling

Pagination at the database query level

Advanced role-based permissions

Mechanic location/map integration

CSV export

Booking detail pages

Mobile-specific dashboard improvements

👨‍💻 Author

Ajay

Full Stack Developer / Python Developer

GitHub:

https://github.com/ajay398/instant-mechanic-dashboard

📄 Internship Assignment

This project was developed for the Instant Mechanic Full Stack Developer Internship technical assignment.

The assignment evaluates:

Product thinking

Frontend development

Backend architecture

API design

Database design

Engineering and performance

Deployment

Problem solving

AI-assisted development

Attention to detail

The project was developed with the goal of delivering a realistic, production-style vehicle service operations dashboard.