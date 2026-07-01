# Scheduling Write Workflows Guide

Scheduling writes are exposed through governed transactional endpoints.

| Workflow | Endpoint | Event |
|---|---|---|
| Create appointment | `/api/v4/global-command-intelligence/write-workflows/scheduling/appointments` | `appointment.created` |
| Update appointment | `/api/v4/global-command-intelligence/write-workflows/scheduling/appointments/{appointmentId}` | `appointment.updated` |
| Cancel appointment | `/api/v4/global-command-intelligence/write-workflows/scheduling/appointments/{appointmentId}/cancel` | `appointment.cancelled` |
| Check in appointment | `/api/v4/global-command-intelligence/write-workflows/scheduling/appointments/{appointmentId}/check-in` | `appointment.checked_in` |
| Complete appointment | `/api/v4/global-command-intelligence/write-workflows/scheduling/appointments/{appointmentId}/complete` | `appointment.completed` |

Appointment writes require authenticated Live Mode and tenant-scoped authorization.
