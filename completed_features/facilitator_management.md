# Facilitator Management Feature

## Overview
The Facilitator Management feature handles the core lifecycle of system facilitators (teachers, instructors). It integrates tightly with the User module for authentication while maintaining separate profile data for academic operations.

## Architecture

### Entities
- **Facilitator**: Tracks academic metadata, status, performance, and soft deletes.
- **Relation**: One-to-One relationship with the `User` entity (`@JoinColumn({ name: 'userId' })`).

### Status Enum (`FacilitatorStatus`)
- `ACTIVE`
- `INACTIVE`
- `ON_LEAVE`
- `RETIRED`

## Implemented Endpoints
**Base Route:** `/facilitators`

| Method | Route | Roles | Description |
|---|---|---|---|
| POST | `/` | ADMIN | Creates a Facilitator and corresponding User account simultaneously. |
| GET | `/` | USER | Lists all facilitators with associated User data. |
| GET | `/:id` | USER | Gets details of a specific facilitator. |
| PATCH | `/:id` | ADMIN | Updates a facilitator (using `PartialType(OmitType(...))`). |
| DELETE | `/:id` | ADMIN | Soft deletes a facilitator. |
| PATCH | `/:id/status` | ADMIN | Updates the facilitator's status (e.g., to ON_LEAVE). |

## Key Technical Decisions
1. **User Auto-creation**: Facilitators are automatically created with an underlying User account (using a Transaction in `FacilitatorService`).
2. **Strict DTO Mapping**: We used `@nestjs/swagger`'s `PartialType(OmitType(CreateFacilitatorDto, ['email', 'password']))` to ensure sensitive fields cannot be accidentally overwritten via standard update endpoints.
3. **Role Enforcement**: Implemented global RBAC using `Role.USER` for open-authenticated endpoints and `Role.ADMIN` for destructive/sensitive actions.
4. **Soft Deletes**: Soft deletes are enforced so that historical class data linked to retired facilitators remains intact.

*Note: Endpoints for grading and scheduling (e.g., `/:id/schedule`) are currently stubbed out pending Phase 2/3.*
