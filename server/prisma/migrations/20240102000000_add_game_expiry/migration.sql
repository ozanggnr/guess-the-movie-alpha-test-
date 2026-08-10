-- AlterTable: add expiresAt to Game
-- Games expire 2 hours after creation by default.
-- Existing rows (if any) get a sensible default.
ALTER TABLE "Game" ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '2 hours';

-- CreateIndex
CREATE INDEX "Game_expiresAt_idx" ON "Game"("expiresAt");
