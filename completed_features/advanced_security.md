# Feature: Advanced Security Implementation

## Overview
This feature fortifies the application against common web vulnerabilities, brute-force attacks, and data leaks. It implements standard security best practices across the entire NestJS application architecture.

## Core Capabilities
* **HTTP Security Headers:** Utilizes `helmet` to automatically set secure HTTP headers (e.g., preventing Cross-Site Scripting (XSS), Content Security Policy).
* **Rate Limiting:** Employs `@nestjs/throttler` to prevent brute-force attacks and Denial of Service (DoS). Currently configured to limit a single IP to a maximum of 10 requests per 60 seconds globally.
* **CORS Configuration:** Enables Cross-Origin Resource Sharing (CORS) so that frontend applications (React, mobile apps) can securely communicate with the API.
* **Automatic Password Stripping:** Uses the `class-transformer` library (`@Exclude()`) alongside `ClassSerializerInterceptor` to guarantee that sensitive data (passwords, refresh tokens) is automatically stripped from all outgoing API responses.
* **Refresh Token Hashing:** Secures the database against breaches by cryptographically hashing long-lived refresh tokens (using `bcrypt`) before they are stored in the database.

## Key Technologies Used
- `helmet`
- `@nestjs/throttler`
- `class-transformer` (ClassSerializerInterceptor)
- `bcrypt`

## Key Files
- `src/main.ts`: Global application of Helmet, CORS, and the ClassSerializerInterceptor.
- `src/app.module.ts`: Configuration and injection of the `ThrottlerModule` and global `ThrottlerGuard`.
- `src/auth/auth.service.ts`: Hashing logic for refresh tokens.
- `src/user/entity/user.entity.ts`: Sensitive fields protected with `@Exclude()`.
