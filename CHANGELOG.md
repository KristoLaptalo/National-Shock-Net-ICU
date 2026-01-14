# Changelog

All notable changes to the National Shock Net ICU project will be documented in this file.

## [0.6.0] - 2026-01-14

### Added
- **Ventilator Settings** table for mechanical ventilation data
  - Support for Dräger, Servo, Hamilton devices
  - Ventilation modes: CPAP, ASB, SIMV, PCV, VCV, BIPAP, APRV
  - Pressure settings: PEEP, Pinsp, Ppeak, Pmean, Pplat
  - Volume measurements: Vt, VTe, MV
  - Lung mechanics: compliance (static/dynamic), resistance
  - EtCO2 monitoring
- **Laboratory Results** table with comprehensive lab data
  - Complete Blood Count (RBC, Hgb, Hct, WBC differential)
  - Coagulation: PT/INR, APTT, Fibrinogen, D-dimer
  - Liver function: Bilirubin, AST, ALT, ALP, GGT, LDH
  - Renal function: Urea, Creatinine, eGFR with KDIGO staging
  - Cardiac markers: Troponin I/T, CK, CK-MB, BNP, NT-proBNP
  - Inflammatory: CRP, Procalcitonin, IL-6, Ferritin
  - Lipids, Thyroid, Proteins
- **Enhanced Blood Gas** table with CO-oximetry
  - Sample type tracking (Arterial/Venous/Mixed Venous)
  - Analyzer model documentation
  - CO-oximetry: tHb, O2Hb, COHb, MetHb, HHb
  - Full derived values: tCO2, HCO3 (actual/standard), BE (ECF/Blood)
  - P/F ratio calculation
- **Enhanced Hemodynamic Data** with monitor integration
  - NIBP and arterial line pressures
  - CVP, EtCO2 monitoring
  - Device model tracking
- SQL views for latest blood gas and ventilator data
- Sample data based on real ICU device outputs (GEM Premier 4000, Dräger Evita XL)

### Changed
- Updated ER diagram with 19 entities (added VENTILATOR_SETTINGS, LABORATORY_RESULTS)

## [0.5.0] - 2026-01-14

### Changed
- **Major schema update** based on clinical registry (Shock.xlsx - PATIENT GENERAL DATA)
- Restructured database to match real eCRF data collection form

### Added
- **Medical History** table with 28 comorbidity fields
  - Cardiovascular: CAD, prior revascularization, MI, CHF, valvular disease, AF, pacemaker
  - Neurological: CVD, TIA, hemiplegia, dementia, psychiatric
  - Metabolic: diabetes, hypertension, dyslipidemia, adiposity
  - Organ systems: liver, PAD, CKD, pulmonary, gastric
  - Oncology: leukemia, lymphoma, solid tumors
  - Charlson Comorbidity Index (calculated)
- **Working Diagnoses** table with 22 admission diagnoses
  - ACS (STEMI/NSTEMI), myocarditis, heart failure, Tako-Tsubo
  - Sepsis, pneumonia, ARDS, PE
  - Trauma (CNS, polytrauma, penetrating)
  - OHCA/IHCA
- **Shock Classification** with all types and sub-classifications
  - Cardiogenic + SCAI (A-E)
  - Distributive + type (Septic/Spinal)
  - Obstructive + type (Tamponade/PE/Pneumothorax)
  - Hypovolemic + ATLS (1-4)
  - Forrester classification (Dry/Wet, Warm/Cold)
  - SOFA Score
- **Echocardiography** table with complete echo parameters
  - LV/RV function, LVEF, GLS
  - All valve assessments
  - Doppler measurements (LVOT VTI, E/A waves, TR Vmax)
  - IVC assessment
- **Swan-Ganz** hemodynamics table
  - All pressures (PCWP, PAP, RVP, RAP)
  - CO (thermodilution & Fick), CI, PAPi
- **Blood Gas** with point-of-care labs
  - ABG values (pH, pO2, pCO2)
  - Electrolytes, lactate, HCO3, BE
  - Saturations (SaO2, ScvO2, SvO2)
- **Pre-admission Medications** table with 37 medication categories
  - Anticoagulants (warfarin, DOACs)
  - Antiplatelets (ASA, P2Y12 inhibitors)
  - Heart failure drugs (BB, ACEi, ARB, ARNI, MRA, SGLT2i)
  - Antiarrhythmics, statins, diabetes meds
- **Follow-up** tracking (6h, 12h, 24h, daily)
- **Outcome** with ICU and hospital mortality/discharge data

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
