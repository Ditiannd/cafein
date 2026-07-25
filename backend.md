Before implementing the backend, update the implementation plan to match the actual project architecture and deployment strategy.

The current implementation plan assumes:
- JSON file-based database
- Local persistence
- No external database

This is no longer the intended architecture.

## Project Stack

This project will be deployed to a VPS using Coolify.

The backend must use:

- PostgreSQL
- Drizzle ORM
- Next.js API Routes (App Router)
- JWT Authentication (HttpOnly Cookies)
- TypeScript

Do NOT use:
- JSON file database
- localStorage persistence
- mock database
- file-based storage

Those are only temporary development implementations and must be completely removed.

## Database

Use PostgreSQL as the single source of truth.

Use Drizzle ORM for:

- schema definition
- migrations
- relationships
- queries
- transactions

Create a proper relational database schema based on the PRD, frontend, and project documentation.

Normalize the database appropriately.

## Deployment

The application will be deployed with Coolify on a VPS.

The backend must be production-ready.

Assume PostgreSQL is running as a separate service/container managed by Coolify.

Configuration must rely entirely on environment variables.

Example:

DATABASE_URL=

No hardcoded credentials.

No filesystem persistence.

## API

Keep using Next.js API Routes.

Generate RESTful endpoints according to:

- prd.md
- project_docs.md
- backend documentation
- existing frontend implementation

Do not generate endpoints that are not used by the frontend unless documented.

## Authentication

Continue using JWT stored inside HttpOnly cookies.

Implement proper:

- login
- logout
- session validation
- RBAC
- middleware

Admin and Barista permissions must follow the project documentation.

## Frontend Integration

Replace every remaining mock implementation with real API calls.

No mockDb.

No JSON adapters.

Everything should communicate through the backend.

## Documentation

Update the backend implementation plan accordingly.

Replace every section referring to the JSON database with PostgreSQL + Drizzle.

Document:

- schema
- migrations
- tables
- relationships
- API routes
- authentication
- deployment
- environment variables
- backend architecture

## Important

Do not simplify the implementation just to make local development easier.

The priority is a production-ready architecture that will be deployed on a VPS using Coolify with PostgreSQL and Drizzle ORM.

All future backend development must follow this updated architecture.
