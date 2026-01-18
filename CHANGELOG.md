# Changelog

All notable changes to the National Shock Net ICU project will be documented in this file.

## [0.13.2] - 2026-01-18

### Added - Demo Login Credentials

#### Authentication Bypass for Testing
- Added demo credentials that work without Supabase backend
- Credentials displayed on login pages for easy access

#### Demo Users (`src/features/auth/AuthContext.tsx`)
| Portal | Email | Password | Role |
|--------|-------|----------|------|
| Hospital | `demo@hospital.com` | `demo123` | clinician |
| Admin | `admin@shocknet.com` | `admin123` | hospital_admin |

#### Login Page Updates
- Added credential hint boxes to HospitalLoginPage and AdminLoginPage
- Styled with portal-appropriate colors

## [0.13.1] - 2026-01-16

### Fixed - Build Errors & Type Compatibility

#### Spinner Component Usage
- Replaced `<Spinner fullPage />` with `<FullPageSpinner />` in admin pages
- Fixed imports in AuditLogPage, CaseReviewPage, HospitalsPage, SubscriptionsPage

#### Route References
- Fixed `ROUTES.ADMIN.LOGIN` → `ROUTES.ADMIN_LOGIN` in AdminLayout
- Fixed `ROUTES.HOSPITAL.LOGIN` → `ROUTES.HOSPITAL_LOGIN` in HospitalLayout

#### Type Definitions
- Updated `OutcomeStatus` in `patient.types.ts` to match discharge schema values
- Fixed `AppRole` comparison in AdminLayout (`'hospital_admin'` instead of `'admin'`)
- Fixed `AuditLogEntry` field access (`event_time`, `metadata` instead of `created_at`, `event_data`)

#### RPC Function Updates
- Extended `updateTracking()` to accept `medical_history`, `mcs`, `pre_admission_medications`
- Simplified `DischargePage` outcome status mapping

#### Form Type Compatibility
- Added `as any` cast to zodResolver in MCSPage, MedicationsPage, MedicalHistoryPage
- Resolves react-hook-form/Zod type incompatibilities

#### Cleanup
- Removed unused `MOCK_ARCHIVED_CASE` from ArchiveLookupPage
- Removed unused `CardTitle` import from MedicationsPage
- Removed unused `errors` destructuring from MedicationsPage, MedicalHistoryPage
- Fixed HospitalsPage tier comparison (handle null tier)

### Build Status
- ✅ TypeScript compilation passes
- ✅ Vite production build succeeds (719KB bundle)
- ⚠️ Bundle size warning (consider code splitting)

## [0.13.0] - 2026-01-16

### Added - Medical History Form (28 Fields)

#### Medical History Entry Page (`src/pages/hospital/MedicalHistoryPage.tsx`)
- **Collapsible Sections** - 8 categories with expand/collapse and field counts
- **Visual Indicators** - Sections highlight when conditions are selected
- **Conditional Fields** - Detail inputs appear when parent conditions are selected
- **History Categories**:
  - **Cardiovascular**: CAD, Prior Revascularization, History of MI, Chronic HF (NYHA I-IV), Severe Valvular Disease, Atrial Fib/Flutter, Implanted Pacemaker/ICD
  - **Neurological**: CVD/Stroke, TIA, Hemiplegia, Dementia, Psychiatric Disorder
  - **Metabolic**: Diabetes (Diet/Oral/Insulin), Hypertension, Dyslipidemia, Adiposity (BMI threshold)
  - **Organ Systems**: Liver Disease (Child-Pugh), PAD, CKD (KDIGO staging), Pulmonary Disease (COPD/restrictive), GI Disease
  - **Autoimmune**: Connective Tissue Disease, CTD type specification
  - **Oncology**: Leukemia, Lymphoma, Solid Tumor (metastatic/non-metastatic)
  - **Infectious/Other**: HIV/AIDS, Immunosuppression
  - **Social/Family**: Smoking status, Alcohol use, Family history of cardiac disease
- **Charlson Comorbidity Index** - Fields for calculated CCI with severity levels

#### Medical History Validation Schema (`src/lib/schemas/medical-history.schema.ts`)
- Zod schemas for all 8 history categories
- Binary schema for yes/no fields (0/1)
- Multi-level enums for severity grades (NYHA, Child-Pugh, KDIGO)
- Optional conditional fields for detail specifications
- Combined schema with full type inference

#### Routes & Navigation
- Added `/hospital/medical-history` and `/hospital/medical-history/:tt` routes
- Added "History" tab to hospital portal navigation

#### NewPatientPage Updates
- Added "Recommended Next Steps" section after patient submission
- Quick links to Complete Medical History, Add Pre-admission Medications, ICU Admission
- Updated Medical History section description noting "complete detailed 28-field history after submission"

## [0.12.0] - 2026-01-16

### Added - Pre-Admission Medications Form

#### Medications Entry Page (`src/pages/hospital/MedicationsPage.tsx`)
- **Collapsible Sections** - 9 medication categories with expand/collapse
- **Visual Indicators** - Sections highlight when medications are selected
- **Medication Categories**:
  - **Anticoagulants**: Warfarin, DOACs (Dabigatran, Apixaban, Rivaroxaban, Edoxaban) with dosing
  - **Antiplatelets**: Aspirin, Clopidogrel, Ticagrelor, Prasugrel
  - **Heart Failure (GDMT)**: Beta-blockers, ACEi, ARB, ARNI, MRA, SGLT2i with dose levels (≤25%, ≤50%, >50%) and specific drug names
  - **Diuretics**: Furosemide (with dose tiers), Torasemide, Thiazides
  - **Pulmonary HTN**: Sildenafil, Tadalafil, Bosentan, Ambrisentan, Riociguat, Epoprostenol
  - **Antiarrhythmics**: Flecainide, Propafenone, Verapamil/Diltiazem, Amiodarone, Mexiletine, Sotalol, Dronedarone
  - **Lipid Lowering**: Statins (with dose levels and names), Ezetimibe, PCSK9 inhibitors, Fibrates
  - **Diabetes**: Metformin, Insulin (type + regimen), DPP-4i, GLP-1 agonists, Pioglitazone, Sulfonylureas
  - **Other**: Immunomodulators, Steroids, Chemotherapy, Inhalers, PPI, Thyroid, Psychotropics, Opioids
- **Medication Reconciliation** - Status checkbox with source tracking (patient, family, pharmacy, records)
- **Allergies & Adverse Reactions** - Dedicated fields for drug allergies and previous ADRs
- **Additional Notes** - Free text for compliance, recent changes, holding instructions

#### Medications Validation Schema (`src/lib/schemas/medications.schema.ts`)
- Zod schemas for all 9 medication categories
- Dose level enums matching SQL schema (0-No, 1-≤25%, 2-≤50%, 3->50%)
- DOAC dosing options with specific regimens
- Drug name option arrays for common medications:
  - Beta-blockers: Bisoprolol, Carvedilol, Metoprolol, Nebivolol, Atenolol
  - ACE inhibitors: Ramipril, Perindopril, Lisinopril, Enalapril, Captopril
  - ARBs: Losartan, Valsartan, Candesartan, Irbesartan, Telmisartan
  - SGLT2i: Dapagliflozin, Empagliflozin, Canagliflozin
  - Statins: Atorvastatin, Rosuvastatin, Simvastatin, Pravastatin
  - GLP-1 agonists: Semaglutide, Liraglutide, Dulaglutide, Tirzepatide

#### Routes & Navigation
- Added `/hospital/medications` and `/hospital/medications/:tt` routes
- Added Medications tab after "New Patient" in hospital portal workflow

## [0.11.0] - 2026-01-16

### Added - Mechanical Circulatory Support (MCS) Form

#### MCS Entry Page (`src/pages/hospital/MCSPage.tsx`)
- **Device Selection** - Support for 14 device types:
  - IABP (Intra-Aortic Balloon Pump)
  - Impella variants (2.5, CP, 5.0, 5.5, RP)
  - VA-ECMO, VV-ECMO, ECPELLA
  - TandemHeart, LVAD, RVAD, BiVAD, TAH
- **Insertion Details** - Date, time, location, access site
- **Device-Specific Settings**:
  - IABP: Ratio (1:1, 1:2, 1:3), augmentation %
  - Impella: P-level (P1-P9), flow, motor current, purge settings, placement signal
  - ECMO: Flow, RPM, FiO2, sweep gas, membrane pressures, anticoagulation (heparin, ACT, anti-Xa)
- **ECMO Cannulation** - Arterial/venous cannula sizes and locations
- **Complications Tracking** - 10 complication types with details:
  - Bleeding, Hemolysis (LDH, plasma-free Hgb)
  - Limb ischemia, Thrombosis, Stroke (type)
  - Infection, Migration, Vascular injury
  - Air embolism, Pump failure
- **Weaning Protocol** - Weaning status, protocol selection, notes
- **Device Removal** - Date, time, reason, notes

#### MCS Validation Schema (`src/lib/schemas/mcs.schema.ts`)
- Zod schemas for all MCS data structures
- Device type, indication, removal reason enums
- Settings schemas for IABP, Impella, ECMO
- Complications schema with conditional fields
- UI option arrays for form dropdowns

#### Routes & Navigation
- Added `/hospital/mcs` and `/hospital/mcs/:tt` routes
- Added MCS tab to hospital portal navigation

## [0.10.0] - 2026-01-15

### Added - Supabase Integration (Stage Four - Partial)

#### Authentication Integration
- **Login Pages** connected to real Supabase auth
  - `HospitalLoginPage.tsx` - Uses `supabase.auth.signInWithPassword()`
  - `AdminLoginPage.tsx` - Uses `supabase.auth.signInWithPassword()`
- **Layout Components** with auth context
  - `HospitalLayout.tsx` - Real logout with `supabase.auth.signOut()`
  - `AdminLayout.tsx` - Real logout with user info from auth context

#### Hospital Portal RPC Integration
- **NewPatientPage** → `createTracking()` RPC
  - Parses age bracket to decade
  - Bundles admission criteria, diagnosis, and medical history
  - Returns real TT from database
- **AdmissionPage** → `updateTracking()` RPC
  - Stores admission data in notes array
  - Uses TT from URL params
- **DailyEntryPage** → `updateTracking()` RPC
  - Updates SCAI stage, hemodynamics, labs, ventilator, notes
  - Structured data by category
- **DischargePage** → `setTrackingOutcome()` + `closeAndArchiveTracking()` RPCs
  - Records outcome with full discharge data
  - Archives case and returns Registry ID
  - Consent-based archival flow

#### Admin Portal RPC Integration
- **AdminDashboardPage** → `getRegistryStatistics()` RPC
  - Fetches total active patients from database
  - Other stats (pending cases, subscriptions) remain mock pending new RPCs
- **ArchiveLookupPage** → `lookupArchive()` RPC
  - Real search by Registry ID (NSN-XXXX-XXXX-XXXX)
  - Displays ArchiveRecord fields (age_decade, shock_type, SCAI stages, etc.)
  - Error handling for failed searches
- **CaseReviewPage** → `getPendingCases()`, `approveCase()`, `rejectCase()` RPCs
  - Fetches pending cases sorted by SCAI urgency
  - Approve/reject workflow with modal confirmations
  - Loading, error, and empty states
- **SubscriptionsPage** → `getPendingSubscriptions()`, `approveSubscription()`, `rejectSubscription()` RPCs
  - Fetches pending subscription requests
  - Tier selection on approval
  - Rejection with reason capture
- **HospitalsPage** → `getNetworkHospitals()` RPC
  - Real hospital list with usage statistics
  - Dynamic active/expiring counts
  - Last activity timestamps
- **AuditLogPage** → `getAuditLog()` RPC
  - Real audit entries with pagination
  - Filter by event type
  - Search within results

### Added (Phase 4) - RPC Functions

#### TypeScript Wrappers (`src/lib/supabase/rpc.ts`)
- **Hospital Portal Functions**
  - `getHospitalActiveCases(hospitalId)` - Get active cases for a hospital
  - `getHospitalDashboardStats(hospitalId)` - Get hospital-specific statistics
- **Admin Case Management**
  - `getPendingCases()` - Get all pending cases (sorted by SCAI urgency)
  - `approveCase(tt, notes?)` - Approve a case
  - `rejectCase(tt, reason)` - Reject a case with reason
- **Admin Subscription Management**
  - `getPendingSubscriptions()` - Get pending subscription requests
  - `approveSubscription(hospitalId, tier)` - Approve with tier selection
  - `rejectSubscription(hospitalId, reason)` - Reject with reason
- **Admin Monitoring**
  - `getNetworkHospitals()` - Get all hospitals with usage stats
  - `getAuditLog(filters?)` - Query audit log with filters

#### SQL Functions (`sql/anonymization-schema.sql`)
- Added `hospital` table for multi-tenant support
- Added `subscription` table for tier management
- Added `approval_status` column to `active_tracking`
- 10 new PostgreSQL RPC functions matching TypeScript wrappers
- Row Level Security policies for new tables

### Pending (Phase 5)
- Custom React hooks for data fetching (usePatients, useDashboardStats, etc.)

## [0.9.0] - 2026-01-15

### Added - Admin Portal (Stage Three)
- **Admin Dashboard** (`src/pages/admin/DashboardPage.tsx`)
  - Network statistics cards (pending cases, subscriptions, active patients, hospitals)
  - Urgent cases preview with SCAI badges
  - Subscription requests overview with tier badges
  - Recent activity feed with color-coded status indicators
- **Case Review Page** (`src/pages/admin/CaseReviewPage.tsx`)
  - Approve/reject workflow for patient submissions
  - Confirmation modals with case details
  - Rejection reason input
  - Filter by all cases or urgent only (SCAI D/E)
  - Admission criteria scoring display
- **Subscriptions Management** (`src/pages/admin/SubscriptionsPage.tsx`)
  - Hospital subscription request queue
  - Tier upgrade/new subscription filtering
  - Approval modal with tier selection override
  - TierBadge display for current → requested tier
- **Hospitals Monitoring** (`src/pages/admin/HospitalsPage.tsx`)
  - Network hospital list with status tracking
  - Usage meters with progress bars
  - Monthly limit visualization
  - Expiration date warnings
  - Search by hospital name/ID
- **Reports & Analytics** (`src/pages/admin/ReportsPage.tsx`)
  - Report type selector (Network Overview, Patient Outcomes, etc.)
  - Date range filters
  - Key metrics display (Total Patients, Monthly Admissions, LOS, Survival Rate)
  - Shock Type Distribution chart
  - SCAI Stage Distribution chart with color coding
  - Export options (PDF, CSV, Excel)
- **Audit Log** (`src/pages/admin/AuditLogPage.tsx`)
  - System activity history with timestamps
  - Action type filtering
  - Search by actor, target, or details
  - Color-coded action badges
  - Pagination controls
- **Archive Lookup** (`src/pages/admin/ArchiveLookupPage.tsx`)
  - Registry ID search (NSN-XXXX-XXXX-XXXX format)
  - Comprehensive result display with patient summary
  - ICU stay metrics (days, vent days, pressor days)
  - Complications and interventions badges
  - Outcome status with destination
  - Privacy notice explaining anonymization

### Fixed
- TypeScript compilation errors with type-only imports
- react-hook-form + zodResolver type incompatibilities
- Zod boolean schema defaults using `.optional().default()` pattern
- Removed unused imports across all admin and hospital pages

## [0.8.0] - 2026-01-15

### Added - Hospital Portal Forms (Stage Two)
- **New Patient Page** (`src/pages/hospital/NewPatientPage.tsx`)
  - Demographics section with age bracket and sex selection
  - Shock classification with type and SCAI stage
  - Admission criteria checkboxes (MAP, SBP, Lactate)
  - Working diagnosis input
  - Medical history checkboxes (CAD, HF, DM, HTN, etc.)
  - TT generation on successful submission
- **ICU Admission Page** (`src/pages/hospital/AdmissionPage.tsx`)
  - Bed assignment (ICU unit, bed number)
  - Care team assignment (physician, nurse)
  - Admission details (datetime, source)
  - Initial assessment (GCS, SOFA scores)
  - Invasive monitoring checkboxes
  - Vasopressor and ventilation status
- **Daily Entry Page** (`src/pages/hospital/DailyEntryPage.tsx`)
  - Tabbed interface: Hemodynamics, Blood Gas, Ventilator, Labs, Echo, Notes
  - Current SCAI stage tracking
  - Comprehensive hemodynamic parameters
  - Blood gas analysis with sample type
  - Ventilator settings
  - Laboratory results (CBC, Chemistry, Cardiac markers, Coagulation)
  - Echocardiography findings
  - Interventions and clinical notes
- **Discharge Page** (`src/pages/hospital/DischargePage.tsx`)
  - Discharge details (datetime, destination)
  - Outcome status selection
  - ICU stay summary metrics
  - Complications checkboxes
  - Interventions checkboxes
  - Discharge condition assessment
  - Archive consent with Registry ID generation
- **My Patients Page** (`src/pages/hospital/PatientsPage.tsx`)
  - Patient list with status filtering
  - SCAI and status badges
  - Quick actions (Daily Entry, Discharge)

### Added - UI Components
- Select component with label and error states
- Textarea component with multi-line support
- Checkbox component with description
- FormSection component for grouping fields
- FormRow component for responsive grid layouts

### Added - Form Validation
- Zod schemas for all forms:
  - `patient.schema.ts` - New patient validation
  - `admission.schema.ts` - ICU admission validation
  - `daily-entry.schema.ts` - Daily monitoring validation
  - `discharge.schema.ts` - Discharge and outcome validation

## [0.7.0] - 2026-01-15

### Added - React Application Foundation (Stage One)
- **Project Setup**
  - React 18 + TypeScript + Vite scaffolding
  - Tailwind CSS v4 with custom theme colors
  - Feature-based folder structure
- **UI Component Library**
  - Button (primary, secondary, danger, success, ghost variants)
  - Input with label and error states
  - Card with title and content sections
  - Badge variants (StatusBadge, TierBadge, ScaiBadge, AnonymizationBadge)
  - Modal with overlay and close button
  - Spinner (full-page and inline)
- **Layout Components**
  - AppShell wrapper for portal layouts
  - HospitalHeader with tier badge and user info
  - AdminSidebar with dark theme and badge counts
  - TabNavigation for hospital portal
- **Routing**
  - React Router v6 configuration
  - Hospital portal routes (7 tabs)
  - Admin portal routes (7 sidebar items)
  - Protected routes with role-based access
- **Authentication**
  - AuthContext with Supabase session management
  - Login pages for hospital and admin portals
  - ProtectedRoute component
- **Supabase Integration**
  - Client singleton configuration
  - Type definitions for auth and database

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
