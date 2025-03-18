# Finance Tracker API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

### Register

```
POST /auth/register
```

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Login

```
POST /auth/login
```

Authenticate a user and get a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Users

### Get Current User

```
GET /users/me
```

Get the current authenticated user's information.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Update User

```
PATCH /users/me
```

Update the current authenticated user's information.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Categories

### Get All Categories

```
GET /categories
```

Get all categories for the authenticated user.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Food",
    "icon": "food",
    "color": "#FF5733",
    "isDefault": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Transportation",
    "icon": "car",
    "color": "#33FF57",
    "isDefault": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Create Category

```
POST /categories
```

Create a new category.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "name": "Entertainment",
  "icon": "movie",
  "color": "#3357FF"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Entertainment",
  "icon": "movie",
  "color": "#3357FF",
  "isDefault": false,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Update Category

```
PATCH /categories/:id
```

Update a category.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "name": "Entertainment & Leisure",
  "color": "#5733FF"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Entertainment & Leisure",
  "icon": "movie",
  "color": "#5733FF",
  "isDefault": false,
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Delete Category

```
DELETE /categories/:id
```

Delete a category.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```
204 No Content
```

## Transactions

### Get All Transactions

```
GET /transactions
```

Get all transactions for the authenticated user.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Query Parameters:**
```
startDate: 2023-01-01 (optional)
endDate: 2023-01-31 (optional)
type: INCOME|EXPENSE (optional)
categoryId: uuid (optional)
page: 1 (optional, default: 1)
limit: 10 (optional, default: 10)
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 50.00,
      "description": "Grocery shopping",
      "date": "2023-01-01T00:00:00.000Z",
      "type": "EXPENSE",
      "category": {
        "id": "uuid",
        "name": "Food",
        "icon": "food",
        "color": "#FF5733"
      },
      "tags": [
        {
          "id": "uuid",
          "name": "Groceries"
        }
      ],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Create Transaction

```
POST /transactions
```

Create a new transaction.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Grocery shopping",
  "date": "2023-01-01T00:00:00.000Z",
  "type": "EXPENSE",
  "categoryId": "uuid",
  "tags": ["Groceries", "Food"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "amount": 50.00,
  "description": "Grocery shopping",
  "date": "2023-01-01T00:00:00.000Z",
  "type": "EXPENSE",
  "category": {
    "id": "uuid",
    "name": "Food",
    "icon": "food",
    "color": "#FF5733"
  },
  "tags": [
    {
      "id": "uuid",
      "name": "Groceries"
    },
    {
      "id": "uuid",
      "name": "Food"
    }
  ],
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Update Transaction

```
PATCH /transactions/:id
```

Update a transaction.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Request Body:**
```json
{
  "amount": 55.00,
  "description": "Grocery shopping at Walmart",
  "tags": ["Groceries", "Food", "Walmart"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "amount": 55.00,
  "description": "Grocery shopping at Walmart",
  "date": "2023-01-01T00:00:00.000Z",
  "type": "EXPENSE",
  "category": {
    "id": "uuid",
    "name": "Food",
    "icon": "food",
    "color": "#FF5733"
  },
  "tags": [
    {
      "id": "uuid",
      "name": "Groceries"
    },
    {
      "id": "uuid",
      "name": "Food"
    },
    {
      "id": "uuid",
      "name": "Walmart"
    }
  ],
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Delete Transaction

```
DELETE /transactions/:id
```

Delete a transaction.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Response:**
```
204 No Content
```

## Reports

### Get Monthly Summary

```
GET /reports/monthly
```

Get a monthly summary of income and expenses.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Query Parameters:**
```
year: 2023 (optional, default: current year)
month: 1 (optional, default: current month)
```

**Response:**
```json
{
  "income": 5000.00,
  "expense": 3000.00,
  "balance": 2000.00,
  "categories": [
    {
      "id": "uuid",
      "name": "Food",
      "icon": "food",
      "color": "#FF5733",
      "amount": 1000.00,
      "percentage": 33.33
    },
    {
      "id": "uuid",
      "name": "Transportation",
      "icon": "car",
      "color": "#33FF57",
      "amount": 500.00,
      "percentage": 16.67
    }
  ]
}
```

### Get Annual Summary

```
GET /reports/annual
```

Get an annual summary of income and expenses.

**Headers:**
```
Authorization: Bearer jwt-token
```

**Query Parameters:**
```
year: 2023 (optional, default: current year)
```

**Response:**
```json
{
  "income": 60000.00,
  "expense": 40000.00,
  "balance": 20000.00,
  "months": [
    {
      "month": 1,
      "income": 5000.00,
      "expense": 3000.00,
      "balance": 2000.00
    },
    {
      "month": 2,
      "income": 5000.00,
      "expense": 3500.00,
      "balance": 1500.00
    }
  ]
}
``` 