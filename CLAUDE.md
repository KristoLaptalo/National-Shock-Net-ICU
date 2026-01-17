# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**National Shock Net ICU** - A patient management system for ICU shock patients in a national network of hospitals. The system handles patient submissions, admission criteria evaluation, and ongoing ICU care tracking with full patient anonymization.

### Key Features
- **ICU Subscription System**: Hospitals must subscribe (Basic/Standard/Premium/Unlimited tiers) before submitting patients
- **Admission Criteria Evaluation**: Mandatory criteria (MAP<65, SBP<90, Lactate>2, SCAI Stage, Shock Type) with scoring
- **Privacy-Preserving Anonymization**: Two-phase architecture with TT (Tracking Token) for active cases and AID (Archive ID) for permanent registry
- **Workflow Tracking**: From submission → criteria check → approval → admission → daily checklists → discharge → archive

### Privacy Architecture (NEW)
The system implements a privacy-by-design model where:
- **TT (Tracking Token)**: Temporary UUID used during active patient tracking, destroyed on archive
- **AID (Archive ID)**: Generated only at archive time, permanent identifier for research
- **Registry ID**: Human-readable format (NSN-XXXX-XXXX-XXXX) for copying into Decursus Morbi
- **No cloud mapping**: Re-identification only possible at hospital via medical records
- **k-Anonymity**: Research view suppresses data where cohort size < 5

## Directory Structure

```
schemas/
├── flowcharts/           # Workflow diagrams
│   ├── national-shock-net-workflow.mmd   # Main 7-stage workflow
│   ├── shock-net-overview.mmd            # Simplified overview
│   ├── shock-net-daily-checklist.mmd     # ICU daily tasks
│   ├── admin-workflow.mmd                # Admin perspective (dashboard, approvals)
│   ├── hospital-workflow.mmd             # Hospital/user perspective (patient journey)
│   ├── workflow-swimlanes.mmd            # Swimlane view (all actors)
│   └── anonymization-flow.mmd            # Privacy architecture data flow
├── er-diagrams/          # Database schemas
│   ├── patient-database.mmd              # Full ER with anonymization layer
│   └── anonymization-architecture.mmd    # Focused privacy architecture diagram
├── sequence-diagrams/    # API interactions
├── architecture/         # System architecture
├── sql/                  # Database scripts
│   ├── schema.sql                        # Complete MySQL schema (hospital)
│   ├── sample-data.sql                   # Test data (10 patients)
│   └── anonymization-schema.sql          # Supabase/PostgreSQL privacy schema
├── app/                  # HTML UI mockups
│   ├── index.html                        # Hospital portal (patient workflow)
│   └── admin.html                        # Admin portal (network management)
├── shock-net-app/        # React Application (NEW)
│   ├── src/
│   │   ├── components/ui/                # Reusable UI components
│   │   ├── components/layout/            # Layout components (Header, Sidebar)
│   │   ├── features/auth/                # Authentication context
│   │   ├── lib/schemas/                  # Zod validation schemas
│   │   ├── pages/hospital/               # Hospital portal pages
│   │   ├── pages/admin/                  # Admin portal pages
│   │   ├── config/                       # Routes and constants
│   │   └── types/                        # TypeScript type definitions
│   └── package.json
└── output/               # Compiled PNG images
```

## Commands

### Compile Mermaid to PNG
```bash
mmdc -i <input.mmd> -o <output.png> -b white
```

### Compile all diagrams
```bash
# Workflow diagrams
mmdc -i flowcharts/national-shock-net-workflow.mmd -o output/national-shock-net-workflow.png -b white
mmdc -i flowcharts/admin-workflow.mmd -o output/admin-workflow.png -b white
mmdc -i flowcharts/hospital-workflow.mmd -o output/hospital-workflow.png -b white
mmdc -i flowcharts/workflow-swimlanes.mmd -o output/workflow-swimlanes.png -b white -w 2400
mmdc -i flowcharts/anonymization-flow.mmd -o output/anonymization-flow.png -b white -w 2400

# ER diagrams
mmdc -i er-diagrams/patient-database.mmd -o output/patient-database-er.png -b white -w 2400
mmdc -i er-diagrams/anonymization-architecture.mmd -o output/anonymization-architecture.png -b white -w 1800
```

### React Application Commands
```bash
cd shock-net-app

# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# TypeScript type checking
npx tsc -b

# Production build
npm run build

# Preview production build
npm run preview

# Lint check
npm run lint
```

## React Application (shock-net-app)

### Tech Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** with custom theme
- **React Router v6** for routing
- **Supabase** for backend (auth + database)
- **react-hook-form** + **Zod** for form validation

### Portal Routes

**Hospital Portal** (`/hospital/*`):
| Route | Page | Description |
|-------|------|-------------|
| `/hospital/dashboard` | DashboardPage | Stats, recent activity |
| `/hospital/patients` | PatientsPage | Patient list with filters |
| `/hospital/patients/new` | NewPatientPage | Submit new patient |
| `/hospital/admission/:id` | AdmissionPage | ICU admission form |
| `/hospital/daily-entry/:id` | DailyEntryPage | Daily data entry |
| `/hospital/discharge/:id` | DischargePage | Discharge & archive |
| `/hospital/subscription` | SubscriptionPage | Plan details |

**Admin Portal** (`/admin/*`):
| Route | Page | Description |
|-------|------|-------------|
| `/admin/dashboard` | DashboardPage | Network statistics |
| `/admin/cases` | CaseReviewPage | Approve/reject cases |
| `/admin/subscriptions` | SubscriptionsPage | Subscription requests |
| `/admin/hospitals` | HospitalsPage | Network hospitals |
| `/admin/reports` | ReportsPage | Analytics & export |
| `/admin/audit` | AuditLogPage | Activity history |
| `/admin/archive` | ArchiveLookupPage | Registry ID lookup |

### UI Components (`src/components/ui/`)
- **Button**: primary, secondary, danger, success, ghost variants
- **Input**: text, number, date with label/error states
- **Select**: dropdown with options array
- **Textarea**: multi-line text input
- **Checkbox**: with optional description
- **Card**: CardTitle, CardContent composition
- **Badge**: StatusBadge, TierBadge, ScaiBadge, AnonymizationBadge
- **Modal**: overlay dialog with close button
- **Spinner**: loading indicator
- **Form**: FormSection, FormRow for layout

### Form Validation Schemas (`src/lib/schemas/`)
- `patient.schema.ts` - New patient submission
- `admission.schema.ts` - ICU admission
- `daily-entry.schema.ts` - Daily monitoring data
- `discharge.schema.ts` - Discharge and outcome

### Custom Tailwind Colors
```css
shock-purple, shock-purple-light  /* Anonymization */
shock-green, shock-green-light    /* Success/approved */
shock-orange, shock-orange-light  /* Warning/pending */
shock-blue, shock-blue-light      /* Info/primary */
shock-red, shock-red-light        /* Danger/rejected */
shock-teal, shock-teal-light      /* Secondary accent */
```

## Medical Domain Context

### Shock Types
- Cardiogenic, Septic, Hypovolemic, Distributive, Obstructive, Mixed

### SCAI Shock Stages
- A (At risk), B (Beginning), C (Classic), D (Deteriorating), E (Extremis)

### Key Hemodynamic Parameters
- MAP (Mean Arterial Pressure) - target ≥65 mmHg
- Lactate - indicator of tissue perfusion
- Cardiac Output/Index
- CVP (Central Venous Pressure)
- ScvO2 (Central Venous Oxygen Saturation)

## Database Schema

### Hospital Database (MySQL - `schema.sql`)

**Tables (17 total):**

**Infrastructure:** `hospital`, `icu_subscription`, `icu_unit`, `physician`, `admin_user`

**Patient Data:** `patient`, `admission`, `medical_history`, `working_diagnosis`, `shock_classification`

**Monitoring:** `hemodynamic_data`, `echocardiography`, `swan_ganz`, `blood_gas`, `ventilator_settings`, `laboratory_results`

**Other:** `pre_admission_medications`, `follow_up`, `outcome`, `audit_log`

### Cloud Database (PostgreSQL/Supabase - `anonymization-schema.sql`)

**Privacy-preserving tables:**

| Table | Purpose |
|-------|---------|
| `active_tracking` | Active cases with TT (temporary), clinical JSONB data |
| `registry_archive` | Permanent archive with AID, aggregated data only |
| `anon_audit_log` | Audit trail (never logs TT, only AID after archive) |

**Key RPC Functions:**
- `create_tracking()` - Create new case, returns TT
- `get_tracking(tt)` - Fetch case by token (no enumeration)
- `update_tracking(tt, data)` - Append clinical data
- `set_tracking_outcome(tt, status)` - Record outcome before archive
- `close_and_archive_tracking(tt)` - **Point of no return**: destroys TT, creates AID + Registry ID
- `lookup_archive(registry_id)` - Query archive by NSN-XXXX-XXXX-XXXX

**Privacy Features:**
- RLS policies enforce role-based access
- PII validation on all JSONB fields
- k-anonymity view for researchers (`research_archive_safe`)
- No SELECT policy for clinicians (RPC-only access prevents enumeration)

### Deployment
```bash
# Hospital database (MySQL)
mysql -u user -p database_name < sql/schema.sql
mysql -u user -p database_name < sql/sample-data.sql  # optional test data

# Cloud database (Supabase)
# Paste sql/anonymization-schema.sql into Supabase SQL Editor
```

## Role-Based Workflows

The system provides different workflow views based on user role:

### Admin Perspective (`admin-workflow.mmd`)
- Dashboard with network statistics (pending approvals, active patients, hospitals online)
- Subscription management: review, approve/reject hospital subscriptions
- Patient case review: approve/reject/request-info on anonymized cases
- System monitoring and reports

### Hospital/User Perspective (`hospital-workflow.mmd`)
- Authentication and hospital dashboard
- Patient submission with automatic anonymization
- Status tracking: Pending → Under Review → Approved/Rejected → Admitted → Discharged
- Daily data entry: Hemodynamics, Blood Gas, Ventilator, Labs, Echo, Notes
- Discharge and outcome recording

### Swimlane Overview (`workflow-swimlanes.mmd`)
Four actor lanes showing responsibilities and handoffs:
- **Admin**: Subscription/case approvals, network monitoring
- **Hospital/Physician**: Patient submission, data entry, tracking
- **System**: Validation, anonymization, scoring, notifications
- **ICU Staff**: QR scanning, daily rounds, monitoring, discharge

## HTML Application Mockups

Static HTML/Tailwind CSS mockups demonstrating the UI for both portal types. Open directly in browser.

### Hospital Portal (`app/index.html`)
Complete 7-stage patient workflow:
- Login & Dashboard (subscription status, patient count)
- My Patients (list with status filters)
- New Patient (anonymization, clinical data, shock classification)
- ICU Admission (bed assignment, care team)
- Daily Entry (hemodynamics, blood gas, ventilator, labs, echo, notes)
- Discharge (outcome recording, case archival)
- Subscription management

### Admin Portal (`app/admin.html`)
Network administration interface:
- Dashboard (pending cases, subscriptions, active patients, hospitals online)
- Subscription Management (approve/reject with tier selection)
- Case Review (anonymized patient queue sorted by SCAI urgency, criteria scoring)
- Hospital Monitoring (usage meters, tier badges, expiry tracking)
- Reports & Analytics (date filters, report types, export options)
- Audit Log (system activity history)

### Technology
- Tailwind CSS via CDN
- Vanilla JavaScript (no build required)
- Consistent color scheme matching workflow diagrams

## Anonymization Architecture

### Data Flow Overview

```
HOSPITAL (On-Prem)                    CLOUD (Supabase)
┌─────────────────┐                   ┌─────────────────────────────┐
│ Patient: Ivan H │                   │      ACTIVE_TRACKING        │
│ OIB: 123456...  │──[anonymized]───►│  TT: abc-123 (temporary)    │
│                 │                   │  age_decade: 60, sex: M     │
│                 │◄──[returns TT]────│  shock_type: cardiogenic    │
│ Stores: TT      │                   │  hemodynamics: [...]        │
└────────┬────────┘                   └──────────────┬──────────────┘
         │                                           │
         │ [daily updates via TT]                    │
         │                                           │
         │ [archive request]                         ▼
         │                            ┌─────────────────────────────┐
         │                            │   close_and_archive(TT)     │
         │                            │   - Generate AID            │
         │                            │   - Generate Registry ID    │
         │                            │   - Aggregate data          │
         │                            │   - DELETE TT (destroyed)   │
         │                            └──────────────┬──────────────┘
         │                                           │
         │◄──[returns Registry ID]───────────────────┤
         │                                           ▼
┌────────┴────────┐                   ┌─────────────────────────────┐
│ Decursus Morbi  │                   │      REGISTRY_ARCHIVE       │
│ Patient: Ivan H │                   │  AID: xyz-789 (permanent)   │
│ Registry ID:    │                   │  Registry ID: NSN-A7B2-...  │
│ NSN-A7B2-C9D4   │                   │  aggregated_data: {...}     │
└─────────────────┘                   │  NO TT, NO NAME, NO OIB     │
                                      └─────────────────────────────┘
```

### Security Properties

| Property | Enforcement |
|----------|-------------|
| TT never in archive | Schema: `registry_archive` has no TT column |
| AID generated at archive time | Function: `close_and_archive_tracking()` |
| No enumeration of tokens | RLS: No SELECT policy for clinicians |
| PII blocked from JSONB | Constraint: `validate_no_pii()` check |
| k-anonymity for research | View: `research_archive_safe` suppresses small cohorts |
| Re-identification requires hospital access | Design: No mapping table in cloud |

### Roles and Access

| Role | active_tracking | registry_archive | audit_log |
|------|-----------------|------------------|-----------|
| `hospital_admin` | Full (RPC) | Full | Read |
| `clinician` | Create/Update (RPC) | Read | None |
| `researcher` | None | Read (k-anon view) | None |
| `service_role` | Full | Full | Full |

## Working with Diagrams

- Use `.mmd` file extension for Mermaid files
- Flowcharts: `flowchart TD` (top-down) or `flowchart LR` (left-right)
- ER diagrams: `erDiagram`
- Sequence diagrams: `sequenceDiagram`
- Use styling: `style NodeName fill:#E1BEE7` for anonymization steps (purple)
- Consistent color scheme across diagrams:
  - Purple `#E1BEE7` - Anonymization steps
  - Orange `#FFF3E0` - Decision nodes
  - Green `#C8E6C9` - Success/approval states
  - Red `#FFCDD2` - Rejection/error states
  - Blue `#E3F2FD` - Pending/info states
  - Grey `#ECEFF1` - Archive/system operations
