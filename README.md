# Ledger — Expense Tracker (3-tier)

- **Presentation tier**: `frontend/` — plain HTML/CSS/JS, calls the API with `fetch`
- **Application tier**: `backend/` — Node.js + Express, serves the API and the frontend
- **Data tier**: MySQL — one `expenses` table

## 1. Install MySQL and create the database

Install MySQL locally if you haven't already, then run:

```bash
mysql -u root -p < backend/schema.sql
```

This creates the `expense_tracker` database and the `expenses` table.

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set `DB_USER` / `DB_PASSWORD` to your MySQL credentials.

## 3. Install dependencies and run

```bash
npm install
npm start
```

You should see:

```
Expense tracker server running at http://localhost:4000
```

## 4. Open the app

Go to **http://localhost:4000** in your browser. The frontend is served by the same
Express server, so there's nothing extra to start — one server handles both the API
(`/api/expenses`) and the static site.

## API reference

| Method | Route                  | Description                          |
|--------|-------------------------|--------------------------------------|
| GET    | `/api/expenses`         | List all expenses, newest first      |
| GET    | `/api/expenses/summary` | Current month total + by category    |
| POST   | `/api/expenses`         | Create an expense                    |
| DELETE | `/api/expenses/:id`     | Delete an expense                    |

`POST` body:
```json
{ "amount": 250, "category": "Food", "expense_date": "2026-09-25", "note": "Lunch" }
```

## Running with Docker

```bash
cp .env.example .env        # edit DB_PASSWORD inside if you want
docker compose up -d --build
```

This starts two containers: `db` (MySQL 8, with `schema.sql` auto-loaded on first
boot) and `app` (the Node/Express server). Once both are healthy, open
**http://localhost:4000**.

Useful commands:
```bash
docker compose ps            # check container status
docker compose logs -f app   # tail the app's logs
docker compose down          # stop everything
docker compose down -v       # stop and wipe the MySQL data volume too
```

## CI/CD with Jenkins

The included `Jenkinsfile` defines a pipeline that: installs dependencies, runs a
syntax check, builds a Docker image, pushes it to Docker Hub, then deploys with
`docker compose` and runs a health check.

Before running it in Jenkins, set up two credentials in **Manage Jenkins → Credentials**:
- `dockerhub-creds` — Username/Password credential for your Docker Hub account
- `expense-db-password` — Secret text credential holding your MySQL password

Also update `IMAGE_NAME` in the `Jenkinsfile` to your own Docker Hub repo
(e.g. `yourusername/expense-tracker`).

## Notes

- Validation (positive amount, known category, valid date) happens in `routes/expenses.js` on the server — never trust the browser alone.
- `mysql2/promise` is used with a connection pool (`db.js`) rather than a single connection, so the server can handle concurrent requests.
- To add user accounts later, you'd add a `users` table, a `user_id` foreign key on `expenses`, and auth middleware in Express — ask if you want that built out.
