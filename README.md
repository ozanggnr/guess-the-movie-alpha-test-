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
