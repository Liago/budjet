# Finance Tracker Database Schema

This document outlines the database schema for the Finance Tracker application.

## Entity Relationship Diagram

```
+----------------+       +----------------+       +----------------+
|      User      |       |   Transaction  |       |    Category    |
+----------------+       +----------------+       +----------------+
| id             |       | id             |       | id             |
| email          |       | amount         |       | name           |
| password       |       | description    |       | icon           |
| firstName      |       | date           |       | color          |
| lastName       |       | type           |       | userId         |
| createdAt      |<----->| categoryId     |<----->| isDefault      |
| updatedAt      |       | userId         |       | createdAt      |
+----------------+       | createdAt      |       | updatedAt      |
                         | updatedAt      |       +----------------+
                         +----------------+
                                 ^
                                 |
                         +----------------+
                         |      Tag       |
                         +----------------+
                         | id             |
                         | name           |
                         | userId         |
                         | transactionId  |
                         | createdAt      |
                         | updatedAt      |
                         +----------------+
```

## Tables

### User

Stores user account information.

| Column     | Type      | Description                   |
|------------|-----------|-------------------------------|
| id         | UUID      | Primary key                   |
| email      | String    | User's email (unique)         |
| password   | String    | Hashed password               |
| firstName  | String    | User's first name             |
| lastName   | String    | User's last name              |
| createdAt  | DateTime  | Record creation timestamp     |
| updatedAt  | DateTime  | Record update timestamp       |

### Category

Represents transaction categories (e.g., Food, Transportation, Salary).

| Column     | Type      | Description                   |
|------------|-----------|-------------------------------|
| id         | UUID      | Primary key                   |
| name       | String    | Category name                 |
| icon       | String    | Icon identifier               |
| color      | String    | Color code (hex)              |
| userId     | UUID      | Foreign key to User           |
| isDefault  | Boolean   | Whether it's a default category |
| createdAt  | DateTime  | Record creation timestamp     |
| updatedAt  | DateTime  | Record update timestamp       |

### Transaction

Represents income or expense transactions.

| Column      | Type      | Description                   |
|-------------|-----------|-------------------------------|
| id          | UUID      | Primary key                   |
| amount      | Decimal   | Transaction amount            |
| description | String    | Transaction description       |
| date        | DateTime  | Transaction date              |
| type        | Enum      | 'INCOME' or 'EXPENSE'         |
| categoryId  | UUID      | Foreign key to Category       |
| userId      | UUID      | Foreign key to User           |
| createdAt   | DateTime  | Record creation timestamp     |
| updatedAt   | DateTime  | Record update timestamp       |

### Tag

Represents tags that can be attached to transactions for additional categorization.

| Column        | Type      | Description                   |
|---------------|-----------|-------------------------------|
| id            | UUID      | Primary key                   |
| name          | String    | Tag name                      |
| userId        | UUID      | Foreign key to User           |
| transactionId | UUID      | Foreign key to Transaction    |
| createdAt     | DateTime  | Record creation timestamp     |
| updatedAt     | DateTime  | Record update timestamp       |

## Relationships

- **User to Transaction**: One-to-Many (A user can have multiple transactions)
- **User to Category**: One-to-Many (A user can have multiple categories)
- **Category to Transaction**: One-to-Many (A category can be used for multiple transactions)
- **Transaction to Tag**: One-to-Many (A transaction can have multiple tags)

## Prisma Schema

The database schema will be implemented using Prisma ORM. Here's a sample Prisma schema:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String
  firstName    String
  lastName     String
  transactions Transaction[]
  categories   Category[]
  tags         Tag[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Category {
  id           String        @id @default(uuid())
  name         String
  icon         String?
  color        String?
  isDefault    Boolean       @default(false)
  user         User          @relation(fields: [userId], references: [id])
  userId       String
  transactions Transaction[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@unique([name, userId])
}

enum TransactionType {
  INCOME
  EXPENSE
}

model Transaction {
  id          String          @id @default(uuid())
  amount      Decimal
  description String?
  date        DateTime
  type        TransactionType
  category    Category        @relation(fields: [categoryId], references: [id])
  categoryId  String
  user        User            @relation(fields: [userId], references: [id])
  userId      String
  tags        Tag[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model Tag {
  id            String        @id @default(uuid())
  name          String
  user          User          @relation(fields: [userId], references: [id])
  userId        String
  transactions  Transaction[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([name, userId])
}
``` 