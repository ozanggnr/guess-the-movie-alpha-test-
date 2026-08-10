-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ACTIVE', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "RoundResult" AS ENUM ('CORRECT', 'INCORRECT', 'SKIPPED');

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "imdbId" TEXT,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "year" INTEGER NOT NULL,
    "overview" TEXT,
    "posterUrl" TEXT,
    "genres" TEXT[],
    "trailerYoutubeId" TEXT,
    "trailerTitle" TEXT,
    "trailerChannel" TEXT,
    "trailerDuration" INTEGER,
    "isTrailerAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "status" "GameStatus" NOT NULL DEFAULT 'ACTIVE',
    "score" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '2 hours',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "guess" TEXT,
    "result" "RoundResult",
    "guessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_imdbId_key" ON "Movie"("imdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_trailerYoutubeId_key" ON "Movie"("trailerYoutubeId");

-- CreateIndex
CREATE INDEX "Movie_imdbId_idx" ON "Movie"("imdbId");

-- CreateIndex
CREATE INDEX "Movie_year_idx" ON "Movie"("year");

-- CreateIndex
CREATE INDEX "Movie_isTrailerAvailable_idx" ON "Movie"("isTrailerAvailable");

-- CreateIndex
CREATE INDEX "Game_movieId_idx" ON "Game"("movieId");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Round_gameId_roundNumber_key" ON "Round"("gameId", "roundNumber");

-- CreateIndex
CREATE INDEX "Round_gameId_idx" ON "Round"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
