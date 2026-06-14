-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'HABIT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "startDate" TEXT NOT NULL,
    "reminderTime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Habit" ("createdAt", "description", "frequency", "id", "name", "reminderTime", "startDate", "status", "type", "userId") SELECT "createdAt", "description", "frequency", "id", "name", "reminderTime", "startDate", "status", "type", "userId" FROM "Habit";
DROP TABLE "Habit";
ALTER TABLE "new_Habit" RENAME TO "Habit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
