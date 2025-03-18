-- CreateTable
CREATE TABLE "RecurrentPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "description" TEXT,
    "interval" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "nextPaymentDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurrentPayment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecurrentPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
