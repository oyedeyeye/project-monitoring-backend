# Analytics API - Ondo State PPIMU

This is the backend API for the Ondo State PPIMU Analytics Dashboard, built with [NestJS](https://nestjs.com/) and Prisma (configured with MariaDB driver adapters).

## 📚 API Documentation (Swagger)

The API is fully documented using Swagger. Once you start the application locally, you can view the interactive documentation, complete with endpoint descriptions, payload schemas, and authentication testing at:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

## 📚 For Frontend Developers

If you are a frontend developer integrating this API with the dashboard UI, please refer to the **[Frontend API Guide (AGENTS.md)](./AGENTS.md)**. 

The guide contains complete details on:
- **Authentication flow** (JWT login/register)
- **Direct Password Assignment**: Admins can supply a direct password on creation (via `POST /auth/register`) or update it manually (via `PUT /users/:id`), bypassing passwordless setups.
- **Role-Based Access Control** (`WEBMASTER_ADMIN`, `PPIMU_ADMIN`, `MDA_OFFICER`)
- **Available endpoints** for Projects, MDAs, Users, and Progress Updates.
- **Unified Offset Pagination** (`GET /progress-updates` supporting page/limit query parameters and `{ data, meta }` response layout)
- **Workflow examples** showing exactly which endpoints to call.

---

## 🛠️ Project Setup

```bash
# Install dependencies
npm install
```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and ensure you have the correct MariaDB database URL and JWT secret configured:
```env
DATABASE_URL="mariadb://user:password@host:port/dbname"
```

## 🚀 Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## 🗄️ Database Management (Prisma)

```bash
# Apply migrations to your database
npx prisma migrate dev

# Seed the database with initial CSV data
npx prisma db seed

# Open Prisma Studio (Database GUI)
npx prisma studio
```

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
