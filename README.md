QA Automation – RealWorld (Conduit) with Playwright
What is this?

This repository contains end-to-end tests (Playwright + TypeScript) against the RealWorld “Conduit” app:

Backend: gothinkster/node-express-realworld-example-app

Frontend: gothinkster/react-redux-realworld-example-app

Why this project?

It’s a full-stack demo (auth, CRUD, feeds, comments) close to a real product.

Stable and widely used in the community → good for repeatable testing.

Clear user flows let us implement positive & negative scenarios and show test design, POM, and data handling.

What the tests cover

Implemented with a Page Object Model (POM) and run against a locally hosted frontend/backend:

Auth

Sign-Up (positive)

Sign-In (positive) using the user created in setup

Sign-In (negative) with wrong password

Articles

Create article (positive) and validate it appears in Global Feed

Create article (negative) with missing required fields → expect API 422 and no article in feed

The suite uses a global setup to create a fresh user via API and stores an authenticated storage state so test flows don’t depend on execution order.

Prerequisites

Node.js: 18.x LTS recommended

PostgreSQL: 14+ running locally

Git and a modern shell

If you’re on macOS and see fsevents/chokidar watcher errors in the frontend, prefer Node 18 and the default dev server.

1) Backend – Node/Express + Prisma

Clone the backend (or use your fork):

git clone https://github.com/gothinkster/node-express-realworld-example-app.git
cd node-express-realworld-example-app


Create .env in the backend root:

# .env
DATABASE_URL="postgresql://<PG_USER>:<PG_PASSWORD>@localhost:5432/realworld?schema=public"
JWT_SECRET="supersecreto_local"
PORT=3333


Install & prepare DB:

npm ci
npx prisma generate --schema src/prisma/schema.prisma
npx prisma migrate dev --schema src/prisma/schema.prisma --name init


Run the API:

npm start


Quick health check:

curl -i http://localhost:3333/api/tags
# expected: 200 OK with {"tags":[]}

2) Frontend – React/Redux RealWorld

Clone the frontend (or your fork) in a separate folder:

git clone https://github.com/gothinkster/react-redux-realworld-example-app.git
cd react-redux-realworld-example-app


Point the UI to your local API by creating .env.development.local:

# .env.development.local
REACT_APP_API_ROOT=http://localhost:3333/api


Install & run:

npm ci
npm start
# dev server usually on http://localhost:4100


Open http://localhost:4100 to verify the app loads.

3) Tests – Playwright

The following assumes tests live in this repository (with its own package.json).

Install:

npm ci
npx playwright install

Project structure (excerpt)
tests/
  pages/
    navbar.page.ts
    home.page.ts
    editor.page.ts
    article.page.ts
  support/
    fixtures.ts            # registers POMs as fixtures, sets baseURL
    data-factory.ts        # random data builders
  storage/
    auth.json              # Playwright storage state (created by setup)
    user.json              # generated user (created by setup)
  global-setup.ts          # creates user via API and saves storage state
playwright.config.ts       # baseURL, project, reporter, globalSetup

How the setup works

global-setup.ts calls the backend API to register a new user, signs in, and writes:

storage/auth.json → Playwright storageState (JWT cookie/localStorage)

storage/user.json → user credentials (used in assertions)

playwright.config.ts includes:

globalSetup: './tests/global-setup.ts'

use: { baseURL: 'http://localhost:4100', storageState: 'tests/storage/auth.json' }

Running the tests

Make sure backend (3333) and frontend (4100) are up.

Headless full run:

npx playwright test


Interactive UI mode:

npx playwright test --ui


Headed single project:

npx playwright test --project=chromium --headed


Filter by title:

npx playwright test -g "Articles (POM)"


Open the HTML report:

npx playwright show-report

Key assumptions & small tweaks

Ports

Backend: 3333

Frontend: 4100
If you change either, update:

Frontend .env.development.local → REACT_APP_API_ROOT

Playwright baseURL in playwright.config.ts (for the UI)

Any API base URL used by global-setup.ts

User session

Tests rely on the global setup to create a brand-new user per test run and save an authenticated storage state. This makes tests order-independent.

Status codes

Article creation may return 201 (Created) or 200 depending on the backend version; assertions accept either 200/201.

No app code changes required

Tests assume a stock clone of both RealWorld projects. Only environment variables and local DB migrations are required.

If you previously edited the frontend API client, ensure it reads the base URL from REACT_APP_API_ROOT and uses the app’s stored JWT (default RealWorld does).

PostgreSQL & Prisma

Prisma uses the connection string from backend .env. If you see env conflicts (e.g., another .env under src/prisma/), consolidate into the root .env.

Troubleshooting

401 Unauthorized / articles feed errors

Confirm REACT_APP_API_ROOT=http://localhost:3333/api and restart the frontend dev server.

Make sure backend is running and reachable.

Clear app storage (localStorage) and reload.

fsevents.watch is not a function (macOS)

Use Node 18 LTS for the frontend dev server.

Prisma migrate errors

Ensure Postgres is running and your DATABASE_URL is correct.

If you recreated the database, re-run prisma generate and prisma migrate dev.

Scripts (quick reference)

Backend:

# from node-express-realworld-example-app
npm ci
npx prisma generate --schema src/prisma/schema.prisma
npx prisma migrate dev --schema src/prisma/schema.prisma --name init
npm start


Frontend:

# from react-redux-realworld-example-app
echo 'REACT_APP_API_ROOT=http://localhost:3333/api' > .env.development.local
npm ci
npm start


Tests:

# from this repo
npm ci
npx playwright install
npx playwright test
npx playwright show-report

Tech highlights

Playwright + TypeScript

Page Object Model (POM): pages/*

Global auth bootstrap with storage state (global-setup.ts)

Randomized test data via small factory helpers

Robust assertions: combine UI checks with API response validation