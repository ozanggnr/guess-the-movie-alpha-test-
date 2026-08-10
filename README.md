# MovieGuess 🎬

A cinematic movie-guessing game where players watch progressively longer trailer clips and race to identify the film before all four rounds are up.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS v3, React Router v6 |
| Backend    | Node.js, Express, TypeScript                   |
| Database   | PostgreSQL + Prisma ORM                        |
| Deployment | Railway                                         |
| APIs       | YouTube Data API v3, TMDB                      |

---

## Monorepo Structure

```
/
├── client/                  # React frontend (Vite)
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database models
│   │   ├── seed.ts          # 10 seed movies with pre-verified trailer IDs
│   │   └── migrations/      # SQL migration files
│   └── src/
│       ├── services/
│       │   ├── youtube.service.ts          # YouTube trailer search
│       │   ├── movie.ingestion.service.ts  # Movie + trailer ingestion
│       │   ├── movie.service.ts            # Movie DB queries (safe payloads)
│       │   └── game.service.ts             # Game DB queries
│       ├── controllers/
│       │   ├── health.controller.ts
│       │   └── movie.controller.ts
│       └── routes/
│           ├── index.ts
│           ├── health.routes.ts
│           └── movie.routes.ts
├── package.json             # Root workspace config
├── railway.toml             # Railway service definitions
└── .gitignore
```

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 14 running locally (or use a Railway PostgreSQL plugin)
- A **YouTube Data API v3** key → [Google Cloud Console](https://console.cloud.google.com/)

---

## Local Development Setup

### 1. Clone & install

```bash
git clone <your-repo-url>
cd movieguess
npm install
```

### 2. Configure environment variables

**Backend:**
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/movieguess
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
PORT=4000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend:**
```bash
cp client/.env.example client/.env
# VITE_API_URL=http://localhost:4000  (already set)
```

### 3. Set up the database

```bash
# Create the PostgreSQL database
createdb movieguess

# Run Prisma migrations
cd server
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed 10 example movies (no API key needed for seed)
npm run db:seed
```

### 4. Start development servers

```bash
# From the root
npm run dev
```

- **Frontend** → http://localhost:5173
- **Backend** → http://localhost:4000

### 5. Verify

```bash
# Health check
curl http://localhost:4000/api/health
# → { "status": "ok" }

# Random movie (safe payload only — no title exposed)
curl http://localhost:4000/api/movies/random
# → { "movieId": "...", "trailerYoutubeId": "..." }

# Available movie count
curl http://localhost:4000/api/movies/count
# → { "availableMovies": 10 }
```

---

## Database

```bash
cd server

# Run pending migrations
npx prisma migrate deploy

# Create a new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (GUI browser)
npx prisma studio

# Seed the database
npm run db:seed

# Reset database (dev only — destroys all data)
npm run db:reset
```

---

## Movie Ingestion (Adding New Movies)

The **YouTube API is only called during ingestion** — never during gameplay.

```bash
cd server
npm run ingest
```

This will run the ingest script which adds new movies to the database and automatically finds the best official trailer on YouTube.
Movies that already have a trailer are skipped to preserve YouTube API quota.

If you need to force-update existing trailers:
```bash
npm run ingest:update-trailers
```

You can customize the list of movies in `server/src/scripts/ingest.ts`.

---

## API Reference

### `GET /api/health`
```json
{ "status": "ok" }
```

### `GET /api/movies/random`
Returns a random movie safe for gameplay. **Never contains title or answer.**
```json
{
  "movieId": "clxxxxx",
  "trailerYoutubeId": "TcMBFSGVi1c"
}
```

### `GET /api/movies/count`
```json
{ "availableMovies": 10 }
```

---

## Railway Deployment

### Services

| Service    | Source    | Start Command              |
|------------|-----------|----------------------------|
| `client`   | `client/` | Nginx (Docker)             |
| `server`   | `server/` | `node dist/server.js`      |
| `postgres` | Plugin    | Managed by Railway         |

### Steps

1. Create a new Railway project
2. Add a **PostgreSQL** plugin — Railway auto-injects `DATABASE_URL`
3. Deploy `server/` — set env vars from `.env.example`
4. Deploy `client/` — set `VITE_API_URL` to your backend Railway URL
5. The server Dockerfile automatically runs `prisma migrate deploy` on startup

---

## Game Rules

| Round | Trailer Duration | Points |
|-------|-----------------|--------|
| 1     | 1 second        | 1,000  |
| 2     | 3 seconds       | 750    |
| 3     | 5 seconds       | 500    |
| 4     | 10 seconds      | 250    |

- Correct guess → game ends, score based on round
- All 4 rounds failed → game lost (0 points)

---

## Development Phases

- [x] **Phase 1** — Project Foundation (monorepo, tooling, health endpoint, homepage)
- [x] **Phase 2** — Database & Movie System (Prisma schema, YouTube service, movie ingestion, `/api/movies/random`)
- [ ] Phase 3 — Authentication & User Accounts
- [ ] Phase 4 — Core Game Engine
- [ ] Phase 5 — Scoring System
- [ ] Phase 6 — Daily Challenge Mode
- [ ] Phase 7 — Leaderboards
- [ ] Phase 8 — Social Features
- [ ] Phase 9 — Admin Dashboard
- [ ] Phase 10 — Production Hardening & Launch

---

## License

MIT
