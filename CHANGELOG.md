# Changelog

All notable changes to the National Shock Net ICU project will be documented in this file.

## [0.4.0] - 2026-01-14

### Added
- ICU Subscription system for hospitals
  - Subscription tiers: Basic, Standard, Premium, Unlimited
  - Contract management with monthly submission limits
  - Subscription validation before patient submission
- Admission Criteria evaluation system
  - Mandatory criteria: MAP<65, SBP<90, Lactate>2, SCAI Stage, Shock Type
  - Criteria scoring and validation
  - Appeal process for edge cases
- Patient Anonymization
  - Pseudonym generation (e.g., ALPHA-142K7X)
  - QR code identifiers (e.g., NSN-202601-8734521)
  - AES-256 encrypted identity storage
  - SHA-256 hashed national ID for duplicate detection
  - Identity access logging
- Updated workflow to 7 stages (0-6) including subscription prerequisite
- Updated ER diagram with 16 entities
- Updated SQL schema with stored procedures and views

## [0.3.0] - 2026-01-14

### Added
- Patient database ER diagram (`er-diagrams/patient-database.mmd`)
- MySQL schema (`sql/patient-database-schema.sql`)
- Database tables: patient, admission, hospital, physician, vital_signs, lab_result, medication, intervention, checklist, discharge
- Foreign key relationships and indexes

## [0.2.0] - 2026-01-14

### Added
- National Shock Net ICU workflow (`flowcharts/national-shock-net-workflow.mmd`)
- Workflow overview diagram (`flowcharts/shock-net-overview.mmd`)
- Daily ICU checklist diagram (`flowcharts/shock-net-daily-checklist.mmd`)
- 6-stage workflow: Submit → Criteria → Approve → Admit → Monitor → Archive
- Mermaid CLI integration for PNG compilation

## [0.1.0] - 2026-01-14

### Added
- Initial project setup
- Directory structure: flowcharts, er-diagrams, sequence-diagrams, architecture
- Example templates for each diagram type
- CLAUDE.md with basic project guidance
