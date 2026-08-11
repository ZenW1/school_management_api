# Feature: Authentication & Authorization

## Overview
The security backbone of the application. Handles multi-role access control, secure logins, token management, and safeguards sensitive data.

## Core Capabilities
* **Access Control:** Role-Based Access Control (RBAC) supporting Student, Facilitator, Manager, and Admin profiles.
* **Token Management:** JWT-based stateless authentication with Refresh Tokens.
* **Account Recovery:** Secure password reset flows.
* **Security:** Password hashing (bcrypt) and request validation.

## Database Schema (PostgreSQL)
*(See `Users` table in Student Management for core schema)*

## API Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account | Public/Admin |
| `POST` | `/auth/login` | Authenticate and retrieve JWT | Public |
| `POST` | `/auth/refresh-token` | Exchange refresh token for JWT | Public |
| `POST` | `/auth/logout` | Invalidate current session | Authenticated |
| `POST` | `/auth/forgot-password`| Request password reset email | Public |
| `POST` | `/auth/reset-password` | Reset password using email token| Public |
