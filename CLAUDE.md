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
│   └── shock-net-daily-checklist.mmd     # ICU daily tasks
├── er-diagrams/          # Database schemas
│   └── patient-database.mmd              # Full ER with 17 entities
├── sequence-diagrams/    # API interactions
├── architecture/         # System architecture
├── sql/                  # Database scripts
│   ├── schema.sql                        # Complete MySQL schema (deployment-ready)
│   └── sample-data.sql                   # Test data (10 patients)
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

## Working with Diagrams

- Use `.mmd` file extension for Mermaid files
- Flowcharts: `flowchart TD` (top-down) or `flowchart LR` (left-right)
- ER diagrams: `erDiagram`
- Sequence diagrams: `sequenceDiagram`
- Use styling: `style NodeName fill:#E1BEE7` for anonymization steps (purple)
