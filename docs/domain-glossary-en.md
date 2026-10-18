# English Domain Glossary & Ubiquitous Language

This document standardizes the domain vocabulary across the codebase in English, adhering to `docs/pattern-system-design.md`.

---

## 1. Core Domain Entities

| Portuguese Term | English Canonical Name | Type / Interface | Description |
| :--- | :--- | :--- | :--- |
| `Usuario` | `User` | `User` | Authenticated system actor with role permissions |
| `Perfil` | `UserRole` | `UserRole` | RBAC role: `'reception' \| 'professional' \| 'patient'` |
| `Profissional` | `Professional` | `Professional` | Healthcare doctor/specialist in the clinic |
| `Paciente` | `Patient` | `Patient` | Patient receiving consultations |
| `Consulta` | `Appointment` | `Appointment` | Scheduled clinical consultation slot |
| `TipoConsulta` | `AppointmentType` | `AppointmentType` | `'primeira'` (first 60m) or `'retorno'` (follow-up 30m) |
| `StatusConsulta` | `AppointmentStatus` | `AppointmentStatus` | `'agendada' \| 'cancelada' \| 'realizada' \| 'faltou'` |
| `Agenda` | `DailySchedule` | `DailySchedule` | Daily schedule of appointments and day-off state |
| `Folga` | `DayOff` / `BlockedDay` | `boolean` | Day blocked off from scheduling |
| `RelatorioFaltas`| `AbsenceReport` | `AbsenceReport` | Metrics, rates, and list of absences |
| `ListaEspera` | `WaitingList` | `WaitingListEntry` | Waiting list when slots are full |

---

## 2. Shared Utilities and Formatting

| Portuguese Term | English Canonical Name | Function |
| :--- | :--- | :--- |
| `diaUtil` | `isBusinessDay(date)` | Validates Monday to Friday working day |
| `dataValida` | `isValidDate(date)` | Validates YYYY-MM-DD formatted string |
| `hojeEmRecife` | `getTodayInClinicTimezone()` | Gets current date in clinic timezone (`America/Recife`) |
| `validarHorario`| `validateAppointmentSlot(date, time, type)` | Validates clinic business rules |
| `EXPEDIENTE` | `CLINIC_HOURS` | Working hours: 08:00–12:00 and 13:00–18:00 |
| `GRADE` | `TIME_SLOTS` | 30-minute schedule grid increments |

---

## 3. Architecture Layers (Feature-Sliced Design)

All frontend business logic, custom hooks, services, and queries must be named in English:
- `shared/api/http-client.ts`: HTTP communication
- `shared/lib/cache/query-keys.ts`: Query key factory (`professionals`, `patients`, `appointments`, `reports`)
- `entities/*/api/*-api.ts`: Domain APIs (`professionalApi`, `appointmentApi`, `patientApi`, `reportApi`)
- `features/*/model/use-*.ts`: User use case hooks (`useLoginForm`, `useScheduleAppointment`)
- `widgets/layout/app-shell.tsx`: Application shell and layout composition
