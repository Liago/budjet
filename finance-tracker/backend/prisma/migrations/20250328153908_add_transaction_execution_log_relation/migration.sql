/*
  Warnings:

  - Added the required column `updatedAt` to the `AutomaticExecutionLog` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AutomaticExecutionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionDate" DATETIME NOT NULL,
    "processedPayments" INTEGER NOT NULL,
    "createdTransactions" INTEGER NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AutomaticExecutionLog" ("createdAt", "createdTransactions", "details", "executionDate", "id", "processedPayments", "totalAmount") SELECT "createdAt", "createdTransactions", "details", "executionDate", "id", "processedPayments", "totalAmount" FROM "AutomaticExecutionLog";
DROP TABLE "AutomaticExecutionLog";
ALTER TABLE "new_AutomaticExecutionLog" RENAME TO "AutomaticExecutionLog";
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" DECIMAL NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "executionLogId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_executionLogId_fkey" FOREIGN KEY ("executionLogId") REFERENCES "AutomaticExecutionLog" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "categoryId", "createdAt", "date", "description", "id", "type", "updatedAt", "userId") SELECT "amount", "categoryId", "createdAt", "date", "description", "id", "type", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
