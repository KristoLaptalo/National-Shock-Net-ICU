# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**National Shock Net ICU** - A patient management system for ICU shock patients in a national network of hospitals. The system handles patient submissions, admission criteria evaluation, and ongoing ICU care tracking with full patient anonymization.

### Key Features
- **ICU Subscription System**: Hospitals must subscribe (Basic/Standard/Premium/Unlimited tiers) before submitting patients
- **Admission Criteria Evaluation**: Mandatory criteria (MAP<65, SBP<90, Lactate>2, SCAI Stage, Shock Type) with scoring
- **Patient Anonymization**: No real names stored - patients identified by pseudonyms (e.g., `ALPHA-142K7X`) and QR codes
- **Workflow Tracking**: From submission → criteria check → approval → admission → daily checklists → discharge → archive

## Directory Structure

```
schemas/
├── flowcharts/           # Workflow diagrams
│   ├── national-shock-net-workflow.mmd   # Main 7-stage workflow
│   ├── shock-net-overview.mmd            # Simplified overview
│   ├── shock-net-daily-checklist.mmd     # ICU daily tasks
│   ├── admin-workflow.mmd                # Admin perspective (dashboard, approvals)
│   ├── hospital-workflow.mmd             # Hospital/user perspective (patient journey)
│   └── workflow-swimlanes.mmd            # Swimlane view (all actors)
├── er-diagrams/          # Database schemas
│   └── patient-database.mmd              # Full ER with 17 entities
├── sequence-diagrams/    # API interactions
├── architecture/         # System architecture
├── sql/                  # Database scripts
│   ├── schema.sql                        # Complete MySQL schema (deployment-ready)
│   └── sample-data.sql                   # Test data (10 patients)
├── app/                  # HTML UI mockups
│   ├── index.html                        # Hospital portal (patient workflow)
│   └── admin.html                        # Admin portal (network management)
└── output/               # Compiled PNG images
```

## Commands

### Compile Mermaid to PNG
```bash
mmdc -i <input.mmd> -o <output.png> -b white
```

### Compile all diagrams
```bash
mmdc -i flowcharts/national-shock-net-workflow.mmd -o output/national-shock-net-workflow.png -b white
mmdc -i flowcharts/admin-workflow.mmd -o output/admin-workflow.png -b white
mmdc -i flowcharts/hospital-workflow.mmd -o output/hospital-workflow.png -b white
mmdc -i flowcharts/workflow-swimlanes.mmd -o output/workflow-swimlanes.png -b white -w 2400
mmdc -i er-diagrams/patient-database.mmd -o output/patient-database-er.png -b white -w 2400
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

## Database Schema (MySQL)

### Tables (17 total)

**Infrastructure:** `hospital`, `icu_subscription`, `icu_unit`, `physician`, `admin_user`

**Patient Data:** `patient`, `admission`, `medical_history`, `working_diagnosis`, `shock_classification`

**Monitoring:** `hemodynamic_data`, `echocardiography`, `swan_ganz`, `blood_gas`, `ventilator_settings`, `laboratory_results`

**Other:** `pre_admission_medications`, `follow_up`, `outcome`, `audit_log`

### Patient Anonymization Fields
- `patient_code` - Generated identifier (e.g., ALPHA-142K7X)
- `qr_code` - Unique QR identifier (e.g., NSN-202601-8734521)
- `encrypted_identity` - AES-256 encrypted real name
- `national_id_hash` - SHA-256 hash for duplicate detection

### Deployment
```bash
mysql -u user -p database_name < sql/schema.sql
mysql -u user -p database_name < sql/sample-data.sql  # optional test data
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
