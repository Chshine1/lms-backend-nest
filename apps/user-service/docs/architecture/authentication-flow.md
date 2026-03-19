# Authentication Flow

This document describes how users authenticate and how subsequent requests are authorized.

## Tenant Registration

Use manual registration for now.

## Registration

1. A new user is created via the User Service API (by an admin).
2. The User Service creates a record in `users` and the appropriate identity extension table (e.g., `students`).
3. A welcome email/notification may be sent (optional).

## Login

1. Client submits `tenant_code` (or subdomain), `username`, `password` to the User Service’s `/login` endpoint.
2. User Service looks up the tenant by `code`, then finds the user with `(tenant_id, username)`. Verifies password.
3. If valid, the User Service:
    - Fetches any tenant‑wide roles for the user from `user_roles`.
    - Builds JWT payload:
      ```json
      {
        "sub": 123,
        "tenant_id": 456,
        "identity_type": "teacher",
        "iat": 1617298342,
        "exp": 1617301942
      }
      ```
    - Signs the JWT using a symmetric key (HS256) or asymmetric (RS256). All microservices share the verification key.
4. Returns JWT to client.

## Token Usage

- The client includes the JWT in the `Authorization: Bearer <token>` header for all subsequent requests.
- Each microservice has a library to:
    - Validate the JWT signature.
    - Extract claims (user ID, tenant ID, roles).
    - Optionally call the User Service’s `/users/me` endpoint to get full profile if needed (e.g., to display user
      name).
- The service then applies its own authorization logic based on the claims.

## Token Renewal

- Short‑lived tokens (e.g., 15 minutes) with a refresh token mechanism.
- Refresh token stored securely (httpOnly cookie or client storage). The User Service provides a `/refresh` endpoint
  that issues a new access token if the refresh token is valid.

## Service‑to‑Service Authentication

For internal communication, services authenticate using mTLS or pre‑shared API keys. The User Service exposes internal
endpoints (e.g., `/internal/users/{id}`) that are only accessible by other services, not by end clients.

## Security Considerations

- Passwords hashed with bcrypt.
- Login rate limiting per IP and per user.
- JWT not stored server‑side (stateless).
- Refresh tokens are stored in a database (hashed) to allow revocation.
