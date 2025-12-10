# Backend Container Missing: Requirements and Integration Guide

## Overview

This repository does not include a `recipe_backend` container. The frontend is implemented in `recipe_frontend` and expects a REST API backend to be available. This document outlines the backend requirements, expected endpoints and behaviors, data models, authentication, CORS policy, pagination conventions, error response shape, and seed data recommendations. It also includes guidance for running locally alongside the frontend (port 3000) using `REACT_APP_API_BASE`, and suggestions for adding an OpenAPI specification.

You should align your backend implementation with `kavia-docs/docs/api-contract.md` to ensure compatibility with this frontend.

## Required Endpoints

Your backend should expose the following endpoints over HTTPS (or HTTP in local development). Path names can be adjusted if you also update the frontend accordingly, but the functionality should be preserved.

### Auth
- POST `/auth/register` — Create a new user account
- POST `/auth/login` — Exchange credentials for access and refresh tokens
- POST `/auth/refresh` — Exchange a valid refresh token for a new access token
- POST `/auth/logout` — Invalidate refresh token(s)
- GET `/auth/me` — Return the authenticated user profile

Authentication should use JWT Bearer tokens for access; refresh token rotation is recommended.

### Recipes
- GET `/recipes` — List recipes (supports pagination and optional filters like `category`, `q` for keyword, `ingredients`)
- GET `/recipes/{id}` — Get a single recipe by ID

### Categories
- GET `/categories` — List available recipe categories

### Search
- GET `/search` — Search recipes by keyword and/or ingredients (can be consolidated with `/recipes` if filtering supports both)

### Favorites (Authenticated)
- GET `/users/me/favorites` — List the current user’s favorite recipes (paginated)
- POST `/recipes/{id}/favorite` — Mark a recipe as favorite
- DELETE `/recipes/{id}/favorite` — Remove a recipe from favorites

### Notes (Authenticated)
- GET `/recipes/{id}/notes` — List notes for the given recipe authored by the current user
- POST `/recipes/{id}/notes` — Create a note for a recipe
- PUT `/recipes/{id}/notes/{noteId}` — Update a note (owner-only)
- DELETE `/recipes/{id}/notes/{noteId}` — Delete a note (owner-only)

## Core Data Models

The following minimal models should be supported. Add fields as necessary for your domain, but keep the names below stable to match the frontend’s expectations.

### User
- id: string | number (unique)
- email: string (unique)
- passwordHash: string (server-only, never exposed)
- displayName: string
- createdAt: datetime

### Recipe
- id: string | number (unique)
- title: string
- summary: string
- imageUrl: string (optional)
- ingredients: array of strings
- instructions: string or array of steps
- categoryId: string | number
- createdAt: datetime
- updatedAt: datetime

### Category
- id: string | number (unique)
- name: string (unique)
- slug: string (unique)

### Note
- id: string | number (unique)
- userId: string | number (owner)
- recipeId: string | number
- content: string
- createdAt: datetime
- updatedAt: datetime

### Favorite
- id: string | number (unique) — or implicit composite key (userId, recipeId)
- userId: string | number
- recipeId: string | number
- createdAt: datetime

## Authentication

- Access token: JWT Bearer token used in the `Authorization: Bearer <token>` header for API requests.
- Refresh token: Long-lived token for obtaining new access tokens via `/auth/refresh`.
- Token transport:
  - Access token can be returned in the login response body and stored by the frontend (e.g., memory/localStorage).
  - Refresh token should be httpOnly secure cookie where possible to reduce XSS risk; you may also return it in the response body if cookie transport is not feasible, but ensure secure storage on the client.
- Token rotation for refresh tokens is recommended to reduce replay risk.
- The frontend Axios client is configured with `withCredentials: true`, so cookie-based refresh flows are supported.

## CORS Policy

Enable CORS to allow the frontend origin (local dev: `http://localhost:3000`). A typical policy for local development:
- Allowed origins: `http://localhost:3000`
- Allowed headers: `Content-Type`, `Authorization`, `Accept`
- Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- Credentials: true (if using cookies for session/refresh)
- Expose any custom headers the client needs

In production, restrict the origins list to your deployed frontend’s origin(s).

## Pagination Conventions

Use standard query params:
- `page`: 1-based page index (default 1)
- `limit`: items per page (default 20, max 100)

Response envelope for paginated endpoints should include:
```
{
  "data": [ ...items ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "hasNextPage": true
  }
}
```

Alternatively, cursor-based pagination is acceptable, but ensure the frontend is updated to handle it.

## Error Response Shape

For consistency, return errors in a predictable JSON shape:
```
{
  "error": "Bad Request",
  "message": "Email is already in use",
  "status": 400,
  "details": { "field": "email" }
}
```

- `error`: brief error type or summary
- `message`: human-readable description
- `status`: HTTP status code
- `details`: optional object providing field-level or contextual information

The frontend displays messages from `message` or `error` if present.

## Recommended Seed Data

Seed a few categories and recipes to support browsing and testing.

### Categories
- { id: 1, name: "Breakfast", slug: "breakfast" }
- { id: 2, name: "Lunch", slug: "lunch" }
- { id: 3, name: "Dinner", slug: "dinner" }
- { id: 4, name: "Dessert", slug: "dessert" }
- { id: 5, name: "Vegetarian", slug: "vegetarian" }

### Sample Recipes
- Pancakes (category: Breakfast)
  - ingredients: flour, milk, eggs, sugar, baking powder
  - instructions: mix, rest, cook on griddle
- Grilled Chicken Salad (category: Lunch)
  - ingredients: chicken breast, lettuce, tomatoes, cucumber, olive oil
  - instructions: grill, chop, toss
- Spaghetti Bolognese (category: Dinner)
  - ingredients: spaghetti, ground beef, tomato sauce, onion, garlic
  - instructions: simmer sauce, boil pasta, combine
- Chocolate Brownies (category: Dessert)
  - ingredients: cocoa, sugar, butter, eggs, flour
  - instructions: mix, bake

### Test Users
- user: `test@example.com`, password: `Password123!`
- user: `demo@example.com`, password: `Password123!`

## Alignment with API Contract

Before building your backend, review and align with:
- `kavia-docs/docs/api-contract.md`

Ensure endpoint paths, payloads, and response shapes match the contract. If you need to deviate, update the contract and the frontend accordingly.

## Local Development with the Frontend

The frontend runs at `http://localhost:3000` by default (`npm start`). Configure the backend base URL via the frontend environment:
- Set `REACT_APP_API_BASE` (preferred) or `REACT_APP_BACKEND_URL` in `recipe_frontend/.env`, for example:
  - `REACT_APP_API_BASE=http://localhost:8080`

Then run:
- Backend at `http://localhost:8080` (or your chosen port)
- Frontend: `cd recipe_frontend && npm start` → http://localhost:3000

The frontend strips trailing slashes from the API base URL automatically.

## Minimal Guidance for Any Language/Framework

Any modern web framework can satisfy the requirements above. Ensure these capabilities:
- Routing for the endpoints listed in this document
- JSON serialization/deserialization
- JWT access tokens and refresh token support
- CORS configuration allowing the frontend origin
- Pagination helpers
- Validation and consistent error handling

Examples:
- Node.js/Express or Fastify (with `cors`, `jsonwebtoken`, `cookie-parser`)
- Python/FastAPI or Flask
- Go/Fiber or Gin
- Java/Spring Boot
- Ruby on Rails API mode

## OpenAPI Specification Suggestions

Add an OpenAPI (Swagger) spec to document your backend:
- Define schemas for User, Recipe, Category, Note, Favorite
- Describe request and response types, including error responses and pagination envelopes
- Tag endpoints by domain (auth, recipes, categories, search, favorites, notes)
- Include security schemes for Bearer auth and cookie if using refresh tokens

Expose Swagger UI and JSON at convenient routes, e.g.:
- `/docs` for Swagger UI
- `/openapi.json` or `/swagger.json` for the spec

Keeping the spec in version control ensures the frontend stays in sync with backend changes.

## Security Considerations

- Hash passwords with a strong algorithm (e.g., bcrypt/argon2)
- Validate and sanitize all inputs
- Implement rate limiting on auth endpoints
- Use HTTPS in production
- Set secure, httpOnly, sameSite cookie attributes for refresh tokens when used

## Next Steps

1. Stand up a minimal backend with the endpoints and models listed here.
2. Seed categories and sample recipes.
3. Configure CORS to allow the frontend origin.
4. Set `REACT_APP_API_BASE` in `recipe_frontend/.env` to point at your backend.
5. Verify flows: register → login → browse → search → favorite → notes.
6. Add and publish an OpenAPI spec to document the API.
