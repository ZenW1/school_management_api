# Feature: Administrative Dashboard

## Overview
The control center for school administrators, providing real-time data, actionable insights, and comprehensive reporting to assist in decision-making.

## Core Capabilities
* **Overview Metrics:** Real-time counts of active students and facilitators.
* **Enrollment Stats:** Track historical and current enrollment data.
* **Occupancy & Load:** Monitor class capacities and facilitator workloads.
* **Performance Tracking:** Aggregate attendance reports and grade distributions.

## API Endpoints (Aggregation based)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/overview` | Overall school statistics | Admin/Manager |
| `GET` | `/dashboard/enrollment` | Enrollment stats & trends | Admin/Manager |
| `GET` | `/dashboard/attendance` | Macro attendance analytics | Admin/Manager |
| `GET` | `/reports/grades` | School-wide grade distribution | Admin/Manager |
| `GET` | `/reports/performance` | Student performance aggregate | Admin/Manager |
| `GET` | `/reports/facilitator-load`| Facilitator workload/hours | Admin/Manager |
