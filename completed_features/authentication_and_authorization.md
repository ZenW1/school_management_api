# Feature: Authentication & Authorization

## Overview
This feature handles user registration, login, logout, and token-based authentication using JSON Web Tokens (JWT). It also includes role-based access control (RBAC) to ensure only authorized users can access specific endpoints.

## Core Capabilities
* **User Registration:** Securely registers new users and hashes their passwords using `bcrypt`.
* **Login System:** Authenticates users and generates both an Access Token (short-lived) and a Refresh Token (long-lived).
* **Token Refreshing:** Allows users to request a new Access Token without logging in again by providing a valid Refresh Token.
* **Logout:** Clears the user's refresh token from the database, effectively logging them out across devices.
* **Guards & Roles:** Utilizes `JwtAuthGuard` to protect routes and `RolesGuard` along with a `@Roles()` decorator to enforce role-based access (`ADMIN`, `MANAGER`, `FACILITATOR`, `STUDENT`).

## Key Technologies Used
- `@nestjs/jwt` and `@nestjs/passport` for JWT generation and validation.
- `passport-jwt` strategy for extracting tokens from the Authorization header.
- `bcrypt` for password hashing.

## Key Files
- `src/auth/auth.module.ts`: Configures JWT and Passport.
- `src/auth/auth.service.ts`: Business logic for login, registration, and token generation.
- `src/auth/auth.controller.ts`: API endpoints for auth operations.
- `src/common/guards/jwt-auth.guard.ts`: Global JWT validation guard.
- `src/common/guards/roles.guard.ts`: Enforces `@Roles()` decorator requirements.
- `src/user/entity/user.entity.ts`: Stores hashed password and refresh token fields.
