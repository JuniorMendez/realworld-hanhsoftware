# QA Automation – RealWorld (Conduit) with Playwright

End-to-end tests (Playwright + TypeScript) for the **RealWorld “Conduit”** app.

* **Backend:** `gothinkster/node-express-realworld-example-app`
* **Frontend:** `gothinkster/react-redux-realworld-example-app`

> Why this project?
> It’s a realistic full-stack demo (auth, CRUD, feeds, comments) that’s widely used in the community, ideal for repeatable E2E testing and demonstrating POM, test data handling and positive/negative scenarios.

---

## Table of Contents

* [What’s included](#whats-included)
* [Prerequisites](#prerequisites)
* [Local setup](#local-setup)
* [Run the tests](#run-the-tests)
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
* **PostgreSQL 14+** running locally (for the RealWorld backend)
* RealWorld **backend** and **frontend** running locally:

  * Backend at `http://localhost:3333/api`
  * Frontend at `http://localhost:4100`

> The test suite points to the **frontend** via Playwright `baseURL` and the app calls the backend.

---

## Local setup

Clone this repo and install dependencies:

```bash
npm ci
npx playwright install
```

> If you’re on macOS and hit `fsevents` issues, ensure Node 18 LTS and reinstall deps.

### Environment (app under test)

Make sure your RealWorld app is up:

**Backend (example)**

```bash
# In the backend repo (node-express-realworld-example-app)
export DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/realworld?schema=public"
export JWT_SECRET="supersecreto_local"
export PORT=3333
npm start
```

**Frontend (example)**

```bash
# In the frontend repo (react-redux-realworld-example-app)
# Ensure the frontend points to http://localhost:3333/api
npm start
# App should be at http://localhost:4100
```

> The test project’s `playwright.config.ts` uses `baseURL` (default: `http://localhost:4100`).
> If you change ports/URLs, update the config or export `FRONT_URL`.

---

## Run the tests

Headless run:

```bash
npx playwright test
```

UI mode:

```bash
npx playwright test --ui
```

Open last HTML report:

```bash
npx playwright show-report
```

---

## Critical flows covered

| Area         | Scenario                                 | Type     | Assertions (high level)                                             |
| ------------ | ---------------------------------------- | -------- | ------------------------------------------------------------------- |
| **Auth**     | Sign-Up                                  | Positive | Navbar shows username, session stored                               |
| **Auth**     | Sign-In with created user                | Positive | Navbar shows username                                               |
| **Auth**     | Sign-In wrong password                   | Negative | Error state (no session)                                            |
| **Articles** | Create article & validate in Global Feed | Positive | POST returns 200/201, article title shown in feed                   |
| **Articles** | Create article with missing fields       | Negative | API returns **422**, editor stays on `/editor`, article not in feed |

> Tests rely on **global-setup** to create a fresh account and save `storage/auth.json`, enabling authenticated flows without repeating login UI.

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
│  ├─ auth.pom.spec.ts     # sign-up/sign-in flows
│  └─ article.pom.spec.ts  # create article (+ / -) and feed assertions
├─ global-setup.ts         # creates user via API + saves storage state
├─ playwright.config.ts    # baseURL, reporters, project settings
├─ README.md
└─ .gitignore
```

---

## Assumptions & modifications

* **Frontend API root** is set to `http://localhost:3333/api`.
  If your frontend still points to the public API, update its env or `agent.js` accordingly.
* **Global setup** creates a brand-new user and stores `storage/auth.json` + `storage/user.json`.
  These files are **git-ignored** and regenerated on each run.
* For article creation, the backend may return **200 or 201**; tests accept both.

---

## Troubleshooting

**“baseURL is not set”**
Your `playwright.config.ts` must define `use.baseURL` (or set `FRONT_URL` env). Example:

```ts
use: {
  baseURL: process.env.FRONT_URL || 'http://localhost:4100',
}
```

**Frontend shows errors like “missing authorization credentials”**
Ensure the frontend is using your local backend (`http://localhost:3333/api`) and you’re running with a valid session (global-setup creates it).

**TypeError: fsevents.watch is not a function**
Use Node 18 LTS and reinstall deps (`rm -rf node_modules && npm ci`).

**422 on article publish**
That’s expected for the negative case (missing required fields).
For the positive case, ensure you’re filling **title**, **description**, and **body**.

---

## License

MIT (or the license you prefer)

---
