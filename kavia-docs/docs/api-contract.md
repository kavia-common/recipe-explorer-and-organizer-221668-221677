# Recipe Backend REST API Contract

## Overview

This document specifies the REST API used by the Recipe App frontend to communicate with the backend service (“recipe_backend”). It is derived from the actual API client usage in the frontend codebase and must remain in sync with it. The API primarily uses JSON over HTTPS, with JWT Bearer authentication for protected routes.

- Base URL: Derived at runtime from environment variables:
  - REACT_APP_API_BASE (preferred)
  - REACT_APP_BACKEND_URL (fallback)
- All routes below are relative to the base URL.
- Content type for requests: application/json unless stated otherwise.
- Responses are JSON.

## Authentication

### Auth Scheme

- JWT Bearer in the Authorization header:
  - Authorization: Bearer <token>
- Token is set and cleared by the frontend via setAuthToken and persisted by the app’s AuthContext layer.
- Some endpoints support cookie-based sessions (withCredentials=true on the Axios client). The API SHOULD support either JWT via Authorization header or secure HTTP-only cookies.

### Endpoints

1) POST /auth/login
- Purpose: Login with email and password.
- Request body:
  {
    "email": "string",
    "password": "string"
  }
- Response 200:
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "token": "string"  // optional if using cookies; present if using JWT
  }
- Errors:
  - 400 Invalid request
  - 401 Invalid credentials
  - Standard error format (see Errors)

2) POST /auth/register
- Purpose: Register a new user.
- Request body:
  {
    "name": "string",      // optional
    "email": "string",
    "password": "string"
  }
- Response 201:
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "token": "string" // optional; present if issuing JWT on registration
  }
- Errors:
  - 400 Validation error (e.g., email already used)
  - 409 Conflict (duplicate email)
  - Standard error format

3) POST /auth/refresh
- Purpose: Refresh the current auth session.
- Request: No body
- Response 200:
  {
    "token": "string", // optional if using cookies
    "user": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
- Errors: 401 if not authenticated/refresh invalid

4) POST /auth/logout
- Purpose: Log out current user. Clears session/cookie if applicable.
- Request: No body
- Response 204 No Content (or 200 { "success": true })
- Errors: 401 if not authenticated

5) GET /auth/me
- Purpose: Returns current authenticated user profile.
- Response 200:
  {
    "id": "string",
    "name": "string",
    "email": "string"
  }
- Errors: 401 if not authenticated

## Categories

Two endpoints are used in the app to fetch categories. Either can be implemented; both may be supported.

1) GET /categories
- Purpose: List all available categories used for browsing.
- Response 200:
  [
    {
      "id": "string",
      "name": "string",
      "slug": "string"
    }
  ]

2) GET /recipes/categories
- Purpose: List categories scoped under recipes.
- Response 200: same shape as /categories

## Recipes

### List Recipes
GET /recipes

- Purpose: Fetch a paginated list of recipes with optional filters.
- Query parameters:
  - page: number (default 1)
  - pageSize: number (default 12 or backend default)
  - category: string (category id or slug)
  - q: string (search query)
  - ingredients: string | string[] (can appear multiple times)
- Response 200 (Paginated):
  {
    "items": [
      {
        "id": "string",
        "title": "string",
        "image": "string",
        "summary": "string",
        "category": { "id": "string", "name": "string", "slug": "string" }
      }
    ],
    "page": 1,
    "pageSize": 12,
    "total": 100,
    "hasMore": true
  }
- Notes:
  - ingredients can be provided as repeated parameters (e.g., ingredients=egg&ingredients=milk) and/or as a comma-separated string.

### Get Recipe Detail
GET /recipes/:id

- Purpose: Retrieve a single recipe by its id.
- Response 200:
  {
    "id": "string",
    "title": "string",
    "image": "string",
    "summary": "string",
    "ingredients": [
      { "name": "string", "amount": "string" }
    ],
    "instructions": "string",
    "category": { "id": "string", "name": "string", "slug": "string" },
    "isFavorite": true  // optional convenience field
  }
- Errors: 404 if recipe not found

### Search Recipes
GET /recipes/search

- Purpose: Search recipes by text query and/or ingredients/category.
- Query parameters:
  - q: string
  - category: string
  - ingredients: string | string[]
  - page: number
  - pageSize: number
- Response 200 (Paginated): same as GET /recipes list response

## Favorites

Favorites are exposed in two forms: per recipe (for quick toggle) and user-wide listing.

### Per-Recipe Favorite Toggle
- Requires authentication (JWT Bearer)
- Endpoints:

1) GET /recipes/:id/favorites
- Purpose: Get current user’s favorite status for a recipe.
- Response 200:
  {
    "favorite": true,
    "recipeId": "string"
  }
- Errors: 401 if unauthenticated, 404 if recipe not found

2) POST /recipes/:id/favorites
- Purpose: Add the recipe to current user’s favorites.
- Request body: none
- Response 201:
  {
    "favorite": true,
    "recipeId": "string"
  }

3) DELETE /recipes/:id/favorites
- Purpose: Remove the recipe from user’s favorites.
- Response 200:
  {
    "favorite": false,
    "recipeId": "string"
  }

### User Favorites Listing
- Requires authentication (JWT Bearer)

1) GET /users/me/favorites
- Query parameters:
  - page: number (default 1)
  - pageSize: number (default 12)
- Response 200 (Paginated):
  {
    "items": [
      {
        "id": "string",
        "title": "string",
        "image": "string",
        "summary": "string"
      }
    ],
    "page": 1,
    "pageSize": 12,
    "total": 42,
    "hasMore": true
  }

2) POST /users/me/favorites/:recipeId
- Purpose: Add a recipe to current user’s favorites.
- Response 201:
  {
    "favorite": true,
    "recipeId": "string"
  }

3) DELETE /users/me/favorites/:recipeId
- Purpose: Remove a recipe from current user’s favorites.
- Response 200:
  {
    "favorite": false,
    "recipeId": "string"
  }

## Notes

Notes are user-authored per-recipe comments/annotations.

- Requires authentication (JWT Bearer)
- Endpoints:

1) GET /recipes/:id/notes
- Purpose: List notes for the given recipe by the current user (or all user notes if designed as shared; frontend expects current user’s notes).
- Response 200:
  [
    {
      "id": "string",
      "recipeId": "string",
      "content": "string",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]

2) POST /recipes/:id/notes
- Purpose: Create a new note for the recipe.
- Request body:
  {
    "content": "string"
  }
- Response 201:
  {
    "id": "string",
    "recipeId": "string",
    "content": "string",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
- Errors: 400 validation, 401 unauthenticated, 404 recipe not found

3) PUT /recipes/:id/notes/:noteId
- Purpose: Update an existing note.
- Request body:
  {
    "content": "string"
  }
- Response 200:
  {
    "id": "string",
    "recipeId": "string",
    "content": "string",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
- Errors: 400 validation, 401 unauthenticated, 404 note not found or recipe not found, 403 if note does not belong to user

4) DELETE /recipes/:id/notes/:noteId
- Purpose: Delete a note.
- Response 204 No Content (or 200 with the deleted note object)
- Errors: 401 unauthenticated, 404 note not found, 403 if note does not belong to user

## Pagination Conventions

- All list endpoints that support pagination SHOULD return the following object structure:
  {
    "items": [ ... ],
    "page": 1,
    "pageSize": 12,
    "total": 42,
    "hasMore": true
  }
- The frontend implements infinite scroll based on hasMore and item counts.

## Error Format

Centralized error handling in the frontend expects a consistent shape. The backend SHOULD return:

- Error response:
  {
    "message": "Human-readable error",
    "code": "OPTIONAL_MACHINE_CODE",
    "details": { ... } // optional dictionary for validation errors or context
  }

- HTTP status codes:
  - 400 Bad Request (validation)
  - 401 Unauthorized (login required/token invalid)
  - 403 Forbidden (insufficient permissions)
  - 404 Not Found (resource does not exist)
  - 409 Conflict (duplicates)
  - 422 Unprocessable Entity (validation detail, optional)
  - 429 Too Many Requests (rate limiting, optional)
  - 500 Internal Server Error
  - 503 Service Unavailable

The frontend will show tailored messages for 401, 403, and 5xx via toast notifications.

## CORS Requirements

The frontend Axios client is configured with withCredentials: true, meaning the backend SHOULD:

- Set appropriate CORS headers:
  - Access-Control-Allow-Origin: REACT_APP_FRONTEND_URL
  - Access-Control-Allow-Credentials: true
  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  - Access-Control-Allow-Headers: Authorization, Content-Type
- Handle preflight OPTIONS requests for the above routes.
- When using cookies, ensure SameSite=None; Secure; HttpOnly is set as appropriate.

## Security and Auth Considerations

- JWT Bearer tokens should be validated on each protected endpoint.
- If both cookies and JWT are supported, Authorization header takes precedence when present.
- Rate limiting is recommended for auth endpoints and high-traffic search endpoints.
- Input validation and output encoding should be applied to prevent injection.
- Only the owner of a note may update or delete it.

## Environment Variables

Frontend reads the following relevant variables for backend interaction:

- REACT_APP_API_BASE: Preferred API base URL
- REACT_APP_BACKEND_URL: Fallback API base URL
- REACT_APP_FRONTEND_URL: Used for CORS configuration on the backend
- REACT_APP_NODE_ENV: Environment indicator for frontend
- REACT_APP_WS_URL: Not used in the current REST API but reserved for websockets
- REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_FEATURE_FLAGS, REACT_APP_EXPERIMENTS_ENABLED: Operational flags not directly impacting the API shape

## Example Requests

Login:
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret"
}
```

Search:
```http
GET /recipes/search?q=chicken&ingredients=garlic&ingredients=lemon&page=1&pageSize=12
```

Create Note:
```http
POST /recipes/123/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Try reducing salt by half."
}
```

## Versioning

- Current API version: v1 (implicit). If/when versioning is introduced, prefix endpoints with /v1/.

## Changelog

- Initial contract created based on frontend API client usage.

