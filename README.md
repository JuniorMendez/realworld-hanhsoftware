
# QA Automation – RealWorld (Conduit) with Playwright

![Playwright](https://img.shields.io/badge/Playwright-TS-blue?logo=playwright) ![Node](https://img.shields.io/badge/Node-18%2B-green) ![E2E](https://img.shields.io/badge/Tests-E2E-orange)

End-to-end tests (Playwright + TypeScript) for the **RealWorld “Conduit”** app.

* **Backend:** `gothinkster/node-express-realworld-example-app`
* **Frontend:** `gothinkster/react-redux-realworld-example-app`

> Why this project?
> It’s a realistic full-stack demo (auth, CRUD, feeds, comments) that’s widely used in the community—ideal for repeatable E2E testing and demonstrating POM, positive/negative scenarios, and robust test data handling.

---

## Table of Contents

* [What’s included](#whats-included)
* [Prerequisites](#prerequisites)
* [Set up the RealWorld app locally](#set-up-the-realworld-app-locally)

  * [1) Clone & run the backend (API)](#1-clone--run-the-backend-api)
  * [2) Clone & run the frontend (UI)](#2-clone--run-the-frontend-ui)
  * [3) Quick smoke check](#3-quick-smoke-check)
* [Set up and run the tests](#set-up-and-run-the-tests)
* [Critical flows covered](#critical-flows-covered)
* [Project structure](#project-structure)
* [Assumptions & modifications](#assumptions--modifications)
* [Troubleshooting](#troubleshooting)
* [License](#license)

---

## What’s included

* **Playwright + TypeScript** test suite
* **Page Object Model (POM)**
* **Global setup** that creates a fresh user via API and stores an **authenticated** storage state (so tests don’t depend on execution order)
* HTML reports and artifacts via Playwright

---

## Prerequisites

* **Node.js 18+ (LTS)**
* **PostgreSQL 14+** running locally
* Ability to run the RealWorld **backend** and **frontend** locally:

  * Backend at `http://localhost:3333/api`
  * Frontend at `http://localhost:4100`

---

## Set up the RealWorld app locally

### 1) Clone & run the backend (API)

**Repo:** `gothinkster/node-express-realworld-example-app`

```bash
git clone https://github.com/gothinkster/node-express-realworld-example-app.git
cd node-express-realworld-example-app
npm ci
```

Create your DB and user (example; adjust to your local setup):

```bash
# In psql or your GUI:
CREATE DATABASE realworld;
-- Create a user and grant privileges (adjust user/pass as needed)
CREATE USER rw_user WITH PASSWORD 'rw_password';
GRANT ALL PRIVILEGES ON DATABASE realworld TO rw_user;
```

Create `.env` in the **backend** root:

```bash
# node-express-realworld-example-app/.env
DATABASE_URL="postgresql://rw_user:rw_password@localhost:5432/realworld?schema=public"
JWT_SECRET="supersecreto_local"
PORT=3333
```

Generate Prisma client and run migrations:

```bash
# Prisma schema lives at: src/prisma/schema.prisma
npx prisma generate --schema src/prisma/schema.prisma

# Option A (idempotent in CI): 
npx prisma migrate deploy --schema src/prisma/schema.prisma

# Option B (local/dev):
npx prisma migrate dev --schema src/prisma/schema.prisma --name init
```

Start the backend:

```bash
npm start
# API should be at http://localhost:3333/api
```

> If you see env var conflicts between `.env` and `src/prisma/.env`, consolidate into **one** `.env` in the project root (the commands above assume that).

---

### 2) Clone & run the frontend (UI)

**Repo:** `gothinkster/react-redux-realworld-example-app`

```bash
git clone https://github.com/gothinkster/react-redux-realworld-example-app.git
cd react-redux-realworld-example-app
npm ci
```

Point the frontend to your local API by creating **`.env.development.local`**:

```bash
# react-redux-realworld-example-app/.env.development.local
REACT_APP_API_ROOT=http://localhost:3333/api
```

Start the frontend:

```bash
npm start
# App should be at http://localhost:4100
```

> On macOS, if you hit `TypeError: fsevents.watch is not a function`, make sure you’re on Node 18 LTS and reinstall deps (`rm -rf node_modules && npm ci`).

---

### 3) Quick smoke check

* Backend health:

  ```bash
  curl -i "http://localhost:3333/api/articles?limit=1&offset=0"
  # Expect HTTP/1.1 200 OK with {"articles":[],"articlesCount":0} on a fresh DB
  ```
* Frontend health:

  * Open `http://localhost:4100` and ensure the app loads without console errors.

Once both are OK, you’re ready to run the tests.

---

## Set up and run the tests

Install Playwright deps and browsers (in **this repo**):

```bash
npm ci
npx playwright install
```

Run headless:

```bash
npx playwright test
```

Run with UI:

```bash
npx playwright test --ui
```

Open the last HTML report:

```bash
npx playwright show-report
```

> The tests use `baseURL` from `playwright.config.ts`. If your frontend runs elsewhere, set:
>
> ```bash
> FRONT_URL="http://localhost:4100" npx playwright test
> ```

---

## Critical flows covered

| Area         | Scenario                                    | Type     | Assertions (high level)                                     |
| ------------ | ------------------------------------------- | -------- | ----------------------------------------------------------- |
| **Auth**     | Sign-Up                                     | Positive | Navbar shows username, session stored                       |
| **Auth**     | Sign-In with created user                   | Positive | Navbar shows username                                       |
| **Auth**     | Sign-In with wrong password                 | Negative | Error state (no session)                                    |
| **Articles** | Create article & validate in Global Feed    | Positive | POST returns 200/201, article title shown in feed           |
| **Articles** | Create article with missing required fields | Negative | API returns **422**, stays on `/editor`, no article in feed |

The suite uses a **global setup** that creates a fresh account via API and saves `storage/auth.json` (authenticated state) + `storage/user.json`. Tests can run in any order without re-logging.

---

## Project structure

```
realworld-hanhsoftware/
├─ pages/                  # Page Objects (POM)
│  ├─ AuthPage.ts
│  ├─ EditorPage.ts
│  ├─ HomePage.ts
│  ├─ Navbar.ts
│  └─ ArticlePage.ts
├─ support/
│  ├─ data-factory.ts      # test data generators (e.g., newArticle)
│  └─ fixtures.ts          # custom fixtures (navbar, editor, etc.)
├─ storage/
│  ├─ .gitkeep             # auth.json & user.json are ignored
│  └─ (auth.json, user.json at runtime)
├─ tests/
│  ├─ auth.pom.spec.ts     # sign-up/sign-in (+/-)
│  └─ article.pom.spec.ts  # create article (+ / -) and feed assertions
├─ global-setup.ts         # creates user via API + saves storage state
├─ playwright.config.ts    # baseURL, reporters, project settings
├─ README.md
└─ .gitignore
```

---

## Assumptions & modifications

* **Frontend API root** must point to the local backend:
  `REACT_APP_API_ROOT=http://localhost:3333/api` (see `.env.development.local` in the frontend).
* **Global setup** creates a brand-new user and stores `storage/auth.json` + `storage/user.json` in this repo.
  These files are **git-ignored** and regenerated on each run.
* For article creation, the backend may return **200 or 201**; tests accept both.
* The tests navigate the **UI** (`baseURL` defaults to `http://localhost:4100`) and the app itself calls the API.

---

## Troubleshooting

**“baseURL is not set” in tests**
Ensure `use.baseURL` exists in `playwright.config.ts` or export `FRONT_URL`:

```bash
FRONT_URL="http://localhost:4100" npx playwright test
```

**Frontend calls public API (productionready) instead of local**
Create/verify `react-redux-realworld-example-app/.env.development.local`:

```bash
REACT_APP_API_ROOT=http://localhost:3333/api
```

Restart the frontend dev server after changes.

**401 / 422 errors in Editor or Feed**

* 401: Your session is invalid—re-run tests so **global-setup** recreates `auth.json`.
* 422 on publish: That’s expected in the **negative** test (missing fields).

**Prisma / DB errors (P1010 or permission denied)**
Grant your DB user rights to the `public` schema or run:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO rw_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rw_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rw_user;
```

Then re-run `npx prisma migrate dev` (or `deploy`) and `npm start`.

**macOS fsevents/watch error**
Use Node 18 LTS and reinstall deps:

```bash
rm -rf node_modules package-lock.json
npm ci
```

---

## License

MIT (or your preferred license)

---
