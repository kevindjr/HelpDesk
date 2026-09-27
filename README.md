# University IT Ticketing HelpDesk System

# Group Member

# Thaw Phone Thant - 6715029
# Wai Yan Thet Min - 6715037

---

# 1. Project Overview

The University IT HelpDesk System provides a centralized platform for handling IT support requests within a university environment.

Students and Faculty can submit IT problems and track their tickets. Technicians can view and work on tickets assigned to them. Administrators have full access to manage tickets, users, technician assignments, and system activity.

The system also integrates the **Gemini API** to automatically suggest a category for newly created tickets based on the ticket title and description.

## Main Ticket Workflow

```text
Student / Faculty
       |
       | Create Ticket
       v
     Open
       |
       | Administrator assigns Technician
       v
  In Progress
       |
       | Technician resolves problem
       v
   Resolved
```

A Student or Faculty member can cancel their own ticket while it is still **Open**:

```text
Open
  |
  | Cancel
  v
Cancelled
```

Cancelled tickets are treated as final and cannot continue through the normal workflow.

---

# 2. Main Features

## Authentication

* Microsoft Entra ID / University Microsoft account login
* OAuth 2.0 / OpenID Connect authentication flow
* JWT-based session authorization
* Role-based access control

## Student / Faculty

* Login using university Microsoft account
* Create IT support tickets
* View own tickets
* View ticket details
* Add comments
* Track ticket status
* Cancel own Open tickets

## Technician

* View assigned tickets
* View ticket details
* Add comments
* Update ticket status
* Move tickets from Open → In Progress
* Move tickets from In Progress → Resolved
* Cannot see unassigned tickets
* Cannot assign tickets to themselves or other technicians

## Administrator

* View all tickets
* View ticket details
* Add comments
* Assign technicians
* Manage users
* Change user roles
* Delete tickets
* View ticket activity/history
* Monitor ticket statuses

## AI Categorization

The system uses the Gemini API to automatically suggest categories such as:

* Hardware
* Software
* Network
* Account
* Other

The AI categorization is performed by the backend so that the API key is not exposed to the frontend.

## Ticket History

The system records important ticket actions, including:

* Status changes
* Technician assignments
* User responsible for the action
* Timestamp

---

# 3. Technology Stack

## Frontend

* React
* Vite
* Axios
* React Router
* Nginx

## Backend

* Node.js
* Express.js
* REST API
* Prisma ORM
* MySQL
* JWT
* Microsoft Entra ID / MSAL
* Gemini API

## Infrastructure

* Docker
* Docker Compose
* Docker Hub
* Azure Linux VM
* Azure Key Vault
* Nginx
* Let's Encrypt SSL

---

# 4. System Architecture

```text
                         University User
                               |
                               v
                    Microsoft Entra ID
                               |
                               v
                    React Frontend
                         (Nginx)
                               |
                         REST API
                               |
                               v
                    Node.js / Express
                               |
             +-----------------+-----------------+
             |                 |                 |
             v                 v                 v
          Prisma          Gemini API        JWT / RBAC
             |
             v
           MySQL
```

---

# 5. User Roles

The system contains four main roles.

| Role          | Main Permissions              |
| ------------- | ----------------------------- |
| Student       | Create and manage own tickets |
| Faculty       | Create and manage own tickets |
| Technician    | Manage assigned tickets       |
| Administrator | Full system management        |

## Ticket Visibility

### Student / Faculty

Can only see tickets they created.

### Technician

Can only see tickets assigned to them.

Technicians do not have an unassigned ticket queue.

### Administrator

Can see all tickets.

---

# 6. Ticket Status Workflow

The backend enforces valid ticket transitions.

```text
Open
  |
  v
InProgress
  |
  v
Resolved
```

Cancellation:

```text
Open
  |
  v
Cancelled
```

## Valid Transitions

```text
Open       → InProgress
InProgress → Resolved
Resolved   → No further transition
Cancelled  → No further transition
```

Students and Faculty can only cancel their own tickets while the ticket is `Open`.

The status rules are enforced by the backend API and are not dependent only on frontend buttons.

---

# 7. Project Structure

```text
HelpDesk/
│
├── docker-compose.yml
├── README.md
│
├── HelpDesk_Backend/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── app.js
│   │   │
│   │   ├── auth/
│   │   │   ├── authRoutes.js
│   │   │   └── entraAuth.js
│   │   │
│   │   ├── routes/
│   │   │   └── ticketRoutes.js
│   │   │
│   │   ├── controllers/
│   │   │   └── ticketController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── models/
│   │   │
│   │   └── config/
│   │       ├── prisma.js
│   │       ├── secrets.js
│   │       └── keyVault.js
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
└── HelpDesk_Frontend/
    │
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── vite.config.js
```

---

# 8. Backend Structure

The backend follows a structured Express.js architecture.

## Routes

Routes define the available API endpoints.

Example:

```text
GET    /api/tickets
GET    /api/tickets/:id
POST   /api/tickets
PUT    /api/tickets/:id
DELETE /api/tickets/:id

GET    /api/tickets/:id/history

GET    /api/tickets/:id/comments
POST   /api/tickets/:id/comments

POST   /api/tickets/:id/cancel
```

## Controllers

Controllers contain the main business logic.

For example:

* Creating tickets
* Updating tickets
* Assigning technicians
* Cancelling tickets
* Adding comments
* Retrieving ticket history
* Deleting tickets

## Middleware

Authentication middleware verifies the JWT before protected APIs are accessed.

Authorization logic then checks the user's role and ticket ownership.

For example:

```text
Request
   |
   v
JWT Authentication
   |
   v
Role / Permission Check
   |
   v
Controller
   |
   v
Database
```

---

# 9. Database

The system uses **MySQL** as its relational database and **Prisma ORM** for database access.

Main entities include:

```text
Role
User
Category
Ticket
TicketHistory
TicketComment
```

## Relationships

```text
Role
 |
 +---- User
        |
        +---- Ticket
        |
        +---- TicketComment
        |
        +---- TicketHistory

Category
 |
 +---- Ticket

Ticket
 |
 +---- TicketComment
 |
 +---- TicketHistory
```

## Prisma

Prisma manages:

* Database schema
* Migrations
* Database queries
* Relationships
* Type-safe database access

---

# 10. Authentication

The system uses Microsoft Entra ID for authentication.

The authentication flow is:

```text
User
 |
 | Login
 v
Microsoft Entra ID
 |
 | Authorization Code
 v
Backend Callback
 |
 | Verify / exchange code
 v
User Information
 |
 v
MySQL
 |
 | Find or create user
 v
JWT Generated
 |
 v
Frontend
```

The JWT contains information such as:

```text
userId
email
role
```

The frontend stores the token and sends it with API requests.

Example:

```text
Authorization: Bearer <JWT>
```

The backend verifies the token before allowing access to protected endpoints.

---

# 11. Role-Based Access Control

Role-based access control is enforced by the backend.

For example:

```text
Administrator
    ↓
Full access

Student / Faculty
    ↓
Own tickets only

Technician
    ↓
Assigned tickets only
```

The frontend also hides unauthorized functionality for a better user experience, but the backend remains responsible for enforcing security.

This prevents a user from bypassing the frontend and directly calling unauthorized APIs.

---

# 12. Gemini API Integration

When a new ticket is created, the backend sends the ticket title and description to Gemini.

Example:

```text
Title:
Laptop screen is flickering

Description:
The laptop screen keeps flickering and sometimes turns black.
```

Gemini may return:

```text
Hardware
```

The backend then matches the suggested category with the category stored in the database.

The general process is:

```text
Create Ticket
     |
     v
Ticket Title + Description
     |
     v
Gemini API
     |
     v
Suggested Category
     |
     v
Database
```

The Gemini API key is kept on the backend and is not exposed to the React frontend.

---

# 13. Docker Implementation

The project supports Docker for packaging and running the application.

There are two Docker images:

```text
kevnjr/helpdesk-backend:latest
kevnjr/helpdesk-frontend:latest
```

The database uses the official:

```text
mysql:8.4
```

Docker Hub stores the application images so that another computer does not need to build the application from source.

---

# 14. Backend Dockerfile

The backend Dockerfile:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

The image:

1. Uses Node.js 22
2. Installs dependencies
3. Copies the backend source
4. Generates the Prisma client
5. Exposes port 3000
6. Starts the Express server

---

# 15. Frontend Dockerfile

The frontend uses a multi-stage Docker build.

```dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

The first stage builds the React application.

The second stage uses Nginx to serve the generated frontend files.

---

# 16. Docker Compose

The project includes a `docker-compose.yml` file that runs the entire local system.

Example configuration:

```yaml
services:

  mysql:

    image: mysql:8.4

    container_name: helpdesk-mysql

    restart: unless-stopped

    environment:

      MYSQL_ROOT_PASSWORD: rootpassword

      MYSQL_DATABASE: helpdesk

      MYSQL_USER: helpdesk_user

      MYSQL_PASSWORD: helpdesk_password

    volumes:

      - mysql_data:/var/lib/mysql


  backend:

    image: kevnjr/helpdesk-backend:latest

    container_name: helpdesk-backend

    restart: unless-stopped

    ports:

      - "3001:3000"

    environment:

      DATABASE_URL: mysql://helpdesk_user:helpdesk_password@mysql:3306/helpdesk

      JWT_SECRET: docker-demo-secret

    depends_on:

      - mysql


  frontend:

    image: kevnjr/helpdesk-frontend:latest

    container_name: helpdesk-frontend

    restart: unless-stopped

    ports:

      - "3002:80"

    depends_on:

      - backend


volumes:

  mysql_data:
```

---

# 17. Running the Docker Version

## Requirements

Install:

* Docker Desktop
* Git

No Node.js, MySQL, or Prisma installation is required when using the Docker images.

---

# 18. Professor — Run Locally From GitHub

This is the recommended method for demonstrating the Docker implementation.

The professor does not need to build the Docker images.

The images are already available on Docker Hub.

## Step 1 — Clone the repository

```bash
git clone https://github.com/kevindjr/HelpDesk.git
```

## Step 2 — Enter the project

```bash
cd HelpDesk
```

## Step 3 — Pull the Docker images

```bash
docker compose pull
```

This downloads:

```text
kevnjr/helpdesk-backend:latest
kevnjr/helpdesk-frontend:latest
mysql:8.4
```

## Step 4 — Start the system

```bash
docker compose up -d
```

Docker Compose starts:

```text
helpdesk-mysql
helpdesk-backend
helpdesk-frontend
```

## Step 5 — Check the containers

```bash
docker compose ps
```

All required containers should be running.

## Step 6 — Open the application

Open a browser and go to:

```text
http://localhost:3002
```

---

# 19. Stopping the Docker Application

To stop the containers:

```bash
docker compose down
```

The MySQL volume is preserved.

Therefore, the database data remains available when the containers are started again.

Start the application again with:

```bash
docker compose up -d
```

---

# 20. Completely Resetting the Docker Database

If a completely fresh database is required:

```bash
docker compose down -v
```

Then:

```bash
docker compose up -d
```

WARNING:

`docker compose down -v` removes the Docker volumes, including the MySQL data.

Only use this when you intentionally want to reset the local database.

---

# 21. Running From Source Code Without Docker

The project can also be run directly from source code.

## Requirements

Install:

* Node.js 22+
* MySQL 8+
* Git

---

# 22. Clone the Project

```bash
git clone https://github.com/kevindjr/HelpDesk.git
cd HelpDesk
```

---

# 23. Backend Setup

Enter the backend folder:

```bash
cd HelpDesk_Backend
```

Install dependencies:

```bash
npm install
```

Create the backend environment file:

```text
.env
```

Configure the required local database connection.

Example:

```env
DATABASE_URL="mysql://helpdesk_user:helpdesk_password@localhost:3306/helpdesk"
JWT_SECRET="your-local-jwt-secret"
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate deploy
```

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:3000
```

---

# 24. Frontend Setup

Open another terminal.

Go to:

```bash
cd HelpDesk/HelpDesk_Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

The Vite configuration proxies API and authentication requests to the backend.

---

# 25. Running Both From Source

Terminal 1:

```bash
cd HelpDesk/HelpDesk_Backend
npm install
npm start
```

Terminal 2:

```bash
cd HelpDesk/HelpDesk_Frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 26. Docker Hub Image Build Process

The application images can be rebuilt when the source code changes.

## Login to Docker Hub

```bash
docker login
```

## Build and push backend

```bash
cd HelpDesk_Backend

docker build -t kevnjr/helpdesk-backend:latest .

docker push kevnjr/helpdesk-backend:latest
```

## Build and push frontend

```bash
cd ../HelpDesk_Frontend

docker build -t kevnjr/helpdesk-frontend:latest .

docker push kevnjr/helpdesk-frontend:latest
```

After the new images are pushed, another computer can retrieve them with:

```bash
docker compose pull
```

Then:

```bash
docker compose up -d
```

---

# 27. Useful Docker Commands

Check running containers:

```bash
docker ps
```

Check Compose services:

```bash
docker compose ps
```

View backend logs:

```bash
docker logs helpdesk-backend
```

View the latest backend logs:

```bash
docker logs helpdesk-backend --tail 100
```

View frontend logs:

```bash
docker logs helpdesk-frontend
```

View MySQL logs:

```bash
docker logs helpdesk-mysql
```

Stop the application:

```bash
docker compose down
```

Start the application:

```bash
docker compose up -d
```

Pull the newest images:

```bash
docker compose pull
```

Restart the services:

```bash
docker compose restart
```

---

# 28. API Overview

All protected ticket APIs require authentication.

## Authentication

```text
GET /auth/login
GET /auth/callback
```

## Tickets

```text
GET    /api/tickets
GET    /api/tickets/:id
POST   /api/tickets
PUT    /api/tickets/:id
DELETE /api/tickets/:id
```

## Comments

```text
GET  /api/tickets/:id/comments
POST /api/tickets/:id/comments
```

## History

```text
GET /api/tickets/:id/history
```

## Cancellation

```text
POST /api/tickets/:id/cancel
```

---

# 29. Security

The project follows several security practices.

## JWT Authentication

Protected API requests require a valid JWT.

## Role-Based Authorization

The backend verifies the user's role before performing restricted actions.

## Ticket Ownership

Students and Faculty can only access their own tickets.

## Technician Assignment

Technicians can only access tickets assigned to them.

## Administrator Permissions

Administrator-only operations are protected by backend role checks.

## Secret Management

Production secrets are not stored directly in the source code.

Production uses **Azure Key Vault** to store sensitive values such as:

* Database connection information
* JWT secret
* Gemini API key
* Microsoft Entra client secret

The Azure VM uses its managed identity to retrieve the secrets.

---

# 30. Production Deployment

The production version is deployed on an Azure Linux VM.

Main infrastructure:

```text
Internet
   |
   v
Nginx + HTTPS
   |
   +--------------------+
   |                    |
   v                    v
Frontend             Backend
                         |
                         v
                    MySQL
                         |
                         v
                   Azure Services
```

The production environment uses:

* Azure Linux VM
* Docker
* Node.js / Express
* React
* MySQL
* Prisma
* Nginx
* Let's Encrypt
* Azure Key Vault
* Managed Identity
* Microsoft Entra ID

---

# 31. Production URL

The deployed application is available at:

```text
https://thawphonethant-bad2026.koreacentral.cloudapp.azure.com/
```

The production environment is separate from the local Docker Compose demonstration environment.

---

# 32. Environment Variables

Production secrets should not be committed to GitHub.

The production configuration uses environment variables such as:

```env
NODE_ENV=production
PORT=3000
KEY_VAULT_URL=https://kevnjrthant-csx4110-kv.vault.azure.net/
AZURE_TENANT_ID=<tenant-id>
AZURE_CLIENT_ID=<client-id>
FRONTEND_URL=<production-url>
BACKEND_URL=<production-url>
```

Sensitive values such as:

```text
Database password
JWT secret
Gemini API key
Microsoft client secret
```

are retrieved from Azure Key Vault.

---

# 33. Prisma Migrations

Prisma migrations are stored inside:

```text
HelpDesk_Backend/prisma/migrations/
```

To apply existing migrations:

```bash
npx prisma migrate deploy
```

To generate Prisma Client:

```bash
npx prisma generate
```

For development, a new migration can be created with:

```bash
npx prisma migrate dev --name migration_name
```

---

# 34. Example Demo Scenario

The system can be demonstrated using the following workflow.

## Student

1. Login using Microsoft account
2. Create a hardware ticket
3. Show Gemini category
4. Add a comment
5. Create a network ticket
6. Show the different Gemini category
7. Create another ticket
8. Cancel the ticket while it is Open

## Administrator

1. Login as Administrator
2. View the student's tickets
3. View the Cancelled ticket
4. View the Open ticket
5. Add a comment
6. Open User Management
7. Change the student's role to Technician
8. Assign a ticket to another test technician
9. Assign another ticket to the new Technician

## Technician

1. Login as Technician
2. View assigned tickets
3. Open assigned ticket
4. Add a comment
5. Change status from Open → In Progress
6. Change status from In Progress → Resolved

## Administrator

1. Return to Administrator
2. View the resolved ticket
3. Open ticket activity/history
4. Show assignment and status changes

---

# 35. Troubleshooting

## Docker containers are not running

Run:

```bash
docker compose ps
```

Then check logs:

```bash
docker compose logs
```

---

## Backend is not responding

Check:

```bash
docker logs helpdesk-backend --tail 100
```

---

## MySQL connection problem

Check:

```bash
docker logs helpdesk-mysql --tail 100
```

Make sure the backend uses the Docker Compose database hostname:

```text
mysql
```

not:

```text
localhost
```

Inside Docker Compose, the backend connects to MySQL using:

```text
mysql://helpdesk_user:helpdesk_password@mysql:3306/helpdesk
```

---

## Port already in use

The Docker configuration uses:

```text
Frontend: 3002
Backend: 3001
```

If these ports are already being used, stop the existing application or change the host-side port in `docker-compose.yml`.

For example:

```yaml
ports:
  - "3010:3000"
```

would expose the backend through port 3010 on the host.

---

## Microsoft Login Problems

Microsoft Entra authentication requires the application's redirect URI to match a redirect URI registered in the Microsoft Entra application.

The production application uses the registered production callback:

```text
/auth/callback
```

Local authentication may require a separate localhost redirect URI and appropriate Entra application configuration.

---

# 36. Git Workflow

Clone the repository:

```bash
git clone https://github.com/kevindjr/HelpDesk.git
```

Update an existing clone:

```bash
git pull origin main
```

Check changes:

```bash
git status
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Update HelpDesk system"
```

Push:

```bash
git push origin main
```

---

# 37. Development Workflow

The recommended development workflow is:

```text
1. Modify source code
        |
        v
2. Test locally
        |
        v
3. Commit changes
        |
        v
4. Push to GitHub
        |
        v
5. Build Docker image
        |
        v
6. Push image to Docker Hub
        |
        v
7. docker compose pull
        |
        v
8. docker compose up -d
```

---

# 38. Docker Deployment Summary

The Docker implementation separates the application into independent services:

```text
             Docker Compose
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
    MySQL       Backend     Frontend
   mysql:8.4   kevnjr/...   kevnjr/...
       |           |
       |           |
       +-----------+
             |
        Docker Network
```

The MySQL data is stored in:

```text
mysql_data
```

which allows database data to survive normal container shutdowns and restarts.

---

# 39. Quick Start for Professor

For the simplest demonstration:

### Requirements

* Docker Desktop
* Git

### Commands

```bash
git clone https://github.com/kevindjr/HelpDesk.git

cd HelpDesk

docker compose pull

docker compose up -d

docker compose ps
```

Then open:

```text
http://localhost:3002
```

To stop:

```bash
docker compose down
```

To start again:

```bash
docker compose up -d
```

---

# 40. Project Summary

The University IT HelpDesk System provides a complete role-based workflow for managing university IT support requests.

The system combines:

```text
React
   +
Node.js / Express
   +
MySQL
   +
Prisma ORM
   +
Microsoft Entra ID
   +
JWT / RBAC
   +
Gemini API
   +
Docker
   +
Azure
```

The application supports the complete lifecycle of an IT support ticket from creation through assignment, technician processing, comments, and final resolution while maintaining an activity history.

The Docker implementation also allows the system to be reproduced on another computer using the Docker Hub images and Docker Compose without requiring the professor to build the application manually.
