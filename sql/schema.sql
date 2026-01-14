-- =============================================================================
-- NATIONAL SHOCK NET ICU - COMPLETE DATABASE SCHEMA
-- Version: 0.7.0
-- Based on Clinical Registry: Shock.xlsx + OCR Data from ICU Devices
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- 1. INFRASTRUCTURE TABLES
-- =============================================================================

CREATE TABLE hospital (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(300),
    phone VARCHAR(20),
    type ENUM('University', 'General', 'Regional', 'Private') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE icu_subscription (
    subscription_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    subscription_tier ENUM('Basic', 'Standard', 'Premium', 'Unlimited') NOT NULL,
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_beds INT NOT NULL DEFAULT 10,
    max_monthly_submissions INT NOT NULL DEFAULT 50,
    current_month_submissions INT DEFAULT 0,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

CREATE TABLE icu_unit (
    icu_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('Medical', 'Surgical', 'Cardiac', 'Coronary', 'Neuro', 'Trauma', 'Mixed') NOT NULL,
    total_beds INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

CREATE TABLE physician (
    physician_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

CREATE TABLE admin_user (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'SuperAdmin', 'Reviewer', 'DataManager') NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    can_view_identity BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================================================
-- 2. PATIENT (ANONYMIZED)
-- =============================================================================

CREATE TABLE patient (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,

    -- Anonymization
    patient_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Anonymized patient code',
    qr_code VARCHAR(100) NOT NULL UNIQUE COMMENT 'QR identifier',
    encrypted_identity VARBINARY(512) COMMENT 'AES-256 encrypted real identity',
    national_id_hash VARCHAR(64) UNIQUE COMMENT 'SHA-256 hash for duplicate detection',

    -- Demographics (GENERAL DATA)
    date_of_birth DATE NOT NULL,
    age INT COMMENT 'Calculated from DOB',
    gender ENUM('M', 'F') NOT NULL,
    weight_kg DECIMAL(5,2) COMMENT 'Weight in kg',
    height_cm DECIMAL(5,2) COMMENT 'Height in cm',
    bsa DECIMAL(4,2) COMMENT 'Body Surface Area - Calculated',
    bmi DECIMAL(4,1) COMMENT 'BMI - Calculated',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_patient_code (patient_code)
);

-- =============================================================================
-- 3. ADMISSION (CENTRAL TABLE)
-- =============================================================================

CREATE TABLE admission (
    admission_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    subscription_id INT NOT NULL,
    icu_id INT NOT NULL,
    physician_id INT NOT NULL,
    approved_by INT,

    case_number VARCHAR(20) NOT NULL UNIQUE,
    date_of_admission DATE NOT NULL COMMENT 'Format DD/MM/YYYY',
    date_of_shock_onset DATE COMMENT 'Format DD/MM/YYYY',

    -- Point of Referral
    point_of_referral TINYINT COMMENT '0-ER / 1-Ward / 2-Other ICU / 3-Other Hospital',
    referral_hospital VARCHAR(200) COMMENT 'If point_of_referral = 3',

    status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Admitted', 'Discharged', 'Archived') DEFAULT 'Pending',
    bed_number VARCHAR(20),

    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    admission_date DATETIME,

    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (subscription_id) REFERENCES icu_subscription(subscription_id),
    FOREIGN KEY (icu_id) REFERENCES icu_unit(icu_id),
    FOREIGN KEY (physician_id) REFERENCES physician(physician_id),
    FOREIGN KEY (approved_by) REFERENCES admin_user(admin_id),

    INDEX idx_admission_status (status),
    INDEX idx_admission_date (date_of_admission)
);

-- =============================================================================
-- 4. MEDICAL HISTORY (COMORBIDITIES)
-- =============================================================================

CREATE TABLE medical_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL UNIQUE,

    -- Cardiovascular
    cad TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Coronary Artery Disease',
    prior_revascularization TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Prior CABG/PCI',
    history_mi TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: History of MI',
    chronic_heart_failure TINYINT DEFAULT 0 COMMENT '0-No / 1-DCM / 2-ICM / 3-Valvular / 4-Other',
    severe_valvular_disease TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    atrial_fib_flutter TINYINT DEFAULT 0 COMMENT '0-No / 1-Parox / 2-Persistent / 3-Permanent',
    implanted_pacemaker TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes / 2-ICD / 3-CRT/CRT-D',

    -- Neurological
    cerebrovascular_disease TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    prior_tia_insult TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    hemiplegia_motor_deficit TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    dementia TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    psychiatric_disease TINYINT DEFAULT 0 COMMENT '0-No / 1-Compensated / 2-Decompensated',

    -- Metabolic
    diabetes TINYINT DEFAULT 0 COMMENT '0-No / 1-Uncomplicated / 2-End-organ Damage',
    hypertension TINYINT DEFAULT 0 COMMENT '0-No / 1-Controlled / 2-Uncontrolled',
    dyslipidemia TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    adiposity TINYINT DEFAULT 0 COMMENT '0-No / 1-Overweight / 2-Obese (auto by BMI)',

    -- Organ Systems
    liver_disease TINYINT DEFAULT 0 COMMENT '0-No / 1-Mild / 2-Moderate / 3-Severe',
    peripheral_artery_disease TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    chronic_kidney_disease TINYINT DEFAULT 0 COMMENT '0-No / 1-Mild / 2-Moderate / 3-End-stage',
    chronic_pulmonary_disease TINYINT DEFAULT 0 COMMENT '0-No / 1-Mild / 2-Moderate / 3-Severe',
    pulmonary_hypertension TINYINT DEFAULT 0 COMMENT '0-No / 1-Mild / 2-Severe / 3-Unknown',
    chronic_gastric_disorder TINYINT DEFAULT 0 COMMENT '0-No / 1-GERD / 2-Gastritis / 3-PUD',

    -- Autoimmune/Connective
    connective_tissue_disorder TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    autoimmune_disorder TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Oncology
    leukemia TINYINT DEFAULT 0 COMMENT '0-No / 1-Acute / 2-Chronic / 3-Prior',
    lymphoma TINYINT DEFAULT 0 COMMENT '0-No / 1-Acute / 2-Chronic / 3-Prior',
    solid_organ_tumor TINYINT DEFAULT 0 COMMENT '0-No / 1-Localized / 2-Metastatic',

    -- Infectious
    hiv_aids TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Calculated Score
    charlson_comorbidity_index INT COMMENT 'Calculated',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE
);

-- =============================================================================
-- 5. WORKING DIAGNOSES AT ADMISSION
-- =============================================================================

CREATE TABLE working_diagnosis (
    diagnosis_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL UNIQUE,

    -- Cardiac
    acute_coronary_syndrome TINYINT DEFAULT 0 COMMENT '0-No / 1-STEMI / 2-NSTEMI',
    acute_myocarditis TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    heart_failure TINYINT DEFAULT 0 COMMENT '0-No / 1-Acute on chronic / 2-First presentation',
    takotsubo_syndrome TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    peripartum_cardiomyopathy TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    acute_aortic_syndrome TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    electrical_storm TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Pulmonary/Sepsis
    sepsis TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    pneumonia TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    ards TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    pulmonary_embolism TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Multi-system
    multi_organ_failure TINYINT DEFAULT 0 COMMENT '0-No / 2-Two / 3-Three / 4-Four+',

    -- Trauma
    trauma_cns TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    polytrauma TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    penetrating_injury TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    trauma_other TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Other
    postpartum_hemorrhage TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    heat_shock TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    dehydration TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    drowning TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    intracerebral_hemorrhage TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Cardiac Arrest
    out_of_hospital_cardiac_arrest TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes (OHCA)',
    in_hospital_cardiac_arrest TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes (IHCA)',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE
);

-- =============================================================================
-- 6. SHOCK CLASSIFICATION
-- =============================================================================

CREATE TABLE shock_classification (
    classification_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL UNIQUE,

    -- Cardiogenic Shock
    shock_cardiogenic TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    scai_classification CHAR(1) COMMENT 'A / B / C / D / E - Calculated in eCRF',

    -- Distributive Shock
    shock_distributive TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    distributive_type TINYINT COMMENT '1-Septic / 2-Spinal injury',

    -- Obstructive Shock
    shock_obstructive TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    obstructive_type TINYINT COMMENT '1-Tamponade / 2-PE / 3-Tension Pneumothorax',

    -- Hypovolemic Shock
    shock_hypovolemic TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    atls_classification TINYINT COMMENT '1 / 2 / 3 / 4 - Calculated in eCRF',

    -- Mixed (auto-calculated if 2+ present)
    shock_mixed TINYINT DEFAULT 0 COMMENT 'Calculated automatically',

    -- Forrester Classification
    congestion TINYINT COMMENT '1-Dry / 2-Wet',
    perfusion TINYINT COMMENT '1-Warm / 2-Cold',

    -- SOFA Score
    sofa_score INT COMMENT 'Sequential Organ Failure Assessment',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE
);

-- =============================================================================
-- 7. HEMODYNAMIC DATA (Multiple timepoints)
-- Source: ICU Monitors (Drager Infinity, Philips, GE)
-- =============================================================================

CREATE TABLE hemodynamic_data (
    hemo_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT 'admission / 6h / 12h / 24h / day2 / day3...',

    -- Non-invasive BP
    nibp_systolic INT COMMENT 'Non-invasive BP Systolic (mmHg)',
    nibp_diastolic INT COMMENT 'Non-invasive BP Diastolic (mmHg)',
    nibp_map INT COMMENT 'Non-invasive MAP (mmHg)',

    -- Arterial Line
    art_systolic INT COMMENT 'Arterial Line Systolic (mmHg)',
    art_diastolic INT COMMENT 'Arterial Line Diastolic (mmHg)',
    art_map INT COMMENT 'Arterial Line MAP (mmHg)',

    -- Heart Rate & Rhythm
    pulse INT COMMENT 'Heart rate (bpm)',
    rhythm VARCHAR(50) COMMENT 'Cardiac rhythm',

    -- Respiratory
    respiratory_rate INT COMMENT 'Breaths per minute',
    spo2 INT COMMENT 'Oxygen saturation (%)',
    etco2 INT COMMENT 'End-tidal CO2 (mmHg)',

    -- Pressures
    cvp DECIMAL(4,1) COMMENT 'Central Venous Pressure (mmHg)',

    -- Temperature
    body_temperature DECIMAL(3,1) COMMENT 'Temperature (C)',

    -- Device Info
    monitor_device VARCHAR(50) COMMENT 'Monitor model (e.g., Drager Infinity)',

    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_hemo_admission (admission_id),
    INDEX idx_hemo_timepoint (timepoint)
);

-- =============================================================================
-- 8. ECHOCARDIOGRAPHY
-- =============================================================================

CREATE TABLE echocardiography (
    echo_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT 'admission / follow-up',

    echo_performed TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Ventricular Function
    lv_function_visual TINYINT COMMENT '0-Reduced / 1-Preserved',
    rv_function_visual TINYINT COMMENT '0-Reduced / 1-Preserved',
    lvef INT COMMENT 'LV Ejection Fraction (%)',
    lvef_assessment TINYINT COMMENT '0-2D visual / 1-Calculation',
    gls INT COMMENT 'Global Longitudinal Strain (%)',

    -- Valve Assessment (0-None / 1-Severe / 2-Less than severe)
    mitral_regurgitation TINYINT DEFAULT 0,
    mitral_stenosis TINYINT DEFAULT 0,
    aortic_regurgitation TINYINT DEFAULT 0,
    aortic_stenosis TINYINT DEFAULT 0,
    tricuspid_regurgitation TINYINT DEFAULT 0,
    pulmonary_stenosis TINYINT DEFAULT 0,
    pulmonary_regurgitation TINYINT DEFAULT 0,

    -- Doppler Measurements
    lvot_vti DECIMAL(5,2) COMMENT 'LVOT Velocity Time Integral',
    lvot_diameter DECIMAL(4,2) COMMENT 'LVOT Diameter (cm)',
    e_wave_velocity DECIMAL(5,2) COMMENT 'E wave velocity (cm/s)',
    deceleration_time_e DECIMAL(5,1) COMMENT 'DT E wave (ms)',
    a_wave_velocity DECIMAL(5,2) COMMENT 'A wave velocity (cm/s)',
    pv_systolic_velocity DECIMAL(5,2) COMMENT 'Pulmonary vein systolic (cm/s)',
    pv_diastolic_velocity DECIMAL(5,2) COMMENT 'Pulmonary vein diastolic (cm/s)',
    tr_vmax DECIMAL(4,2) COMMENT 'Tricuspid regurgitation Vmax (m/s)',
    pf_acceleration_time DECIMAL(5,1) COMMENT 'Pulmonary flow AccT (ms)',

    -- IVC Assessment
    ivc_status TINYINT COMMENT '0-Normal / 1-Dilated+preserved / 2-Dilated<50% / 3-Dilated fixed',

    performed_at DATETIME,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_echo_admission (admission_id)
);

-- =============================================================================
-- 9. SWAN-GANZ CATHETER HEMODYNAMICS
-- =============================================================================

CREATE TABLE swan_ganz (
    sg_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL,

    sg_performed TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Pressures (mmHg)
    pcwp INT COMMENT 'Pulmonary Capillary Wedge Pressure',
    spap INT COMMENT 'Systolic Pulmonary Artery Pressure',
    mpap INT COMMENT 'Mean Pulmonary Artery Pressure',
    dpap INT COMMENT 'Diastolic Pulmonary Artery Pressure',
    srvp INT COMMENT 'Systolic Right Ventricular Pressure',
    drvp INT COMMENT 'Diastolic Right Ventricular Pressure',
    rap INT COMMENT 'Right Atrial Pressure',

    -- Cardiac Output
    co_thermodilution DECIMAL(4,2) COMMENT 'CO Thermodilution (L/min)',
    co_fick DECIMAL(4,2) COMMENT 'CO Fick method (L/min)',
    cardiac_index DECIMAL(3,2) COMMENT 'Calculated (L/min/m2)',
    papi DECIMAL(4,2) COMMENT 'Pulmonary Artery Pulsatility Index - Calculated',

    performed_at DATETIME,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_sg_admission (admission_id)
);

-- =============================================================================
-- 10. BLOOD GAS / POINT-OF-CARE LABS
-- Source: GEM Premier 4000, Radiometer ABL, Siemens RAPIDPoint
-- =============================================================================

CREATE TABLE blood_gas (
    gas_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT 'admission / 6h / 12h / 24h / dayX',

    -- Sample Info
    sample_type ENUM('Arterial', 'Venous', 'Mixed Venous', 'Capillary') DEFAULT 'Arterial',
    sample_datetime DATETIME,
    analyzer_model VARCHAR(50) COMMENT 'GEM Premier 4000, ABL800, etc.',

    -- Measured Values - Blood Gas
    ph DECIMAL(4,3),
    pco2 DECIMAL(5,1) COMMENT 'Partial pressure CO2',
    pco2_unit ENUM('mmHg', 'kPa') DEFAULT 'kPa',
    po2 DECIMAL(5,1) COMMENT 'Partial pressure O2',
    po2_unit ENUM('mmHg', 'kPa') DEFAULT 'kPa',

    -- Measured Values - Electrolytes
    sodium DECIMAL(5,1) COMMENT 'Na+ (mmol/L)',
    potassium DECIMAL(4,2) COMMENT 'K+ (mmol/L)',
    chloride DECIMAL(5,1) COMMENT 'Cl- (mmol/L)',
    calcium_ionized DECIMAL(4,3) COMMENT 'Ca++ ionized (mmol/L)',

    -- Measured Values - Metabolites
    glucose DECIMAL(5,2) COMMENT 'Glucose (mmol/L)',
    lactate DECIMAL(4,2) COMMENT 'Lactate (mmol/L)',

    -- CO-Oximetry (from GEM Premier)
    thb DECIMAL(5,1) COMMENT 'Total Hemoglobin (g/L)',
    o2hb DECIMAL(5,1) COMMENT 'Oxyhemoglobin (%)',
    cohb DECIMAL(4,1) COMMENT 'Carboxyhemoglobin (%)',
    methb DECIMAL(4,1) COMMENT 'Methemoglobin (%)',
    hhb DECIMAL(4,1) COMMENT 'Deoxyhemoglobin (%)',
    so2_measured DECIMAL(5,1) COMMENT 'Oxygen Saturation measured (%)',

    -- Derived/Calculated Values
    tco2 DECIMAL(4,1) COMMENT 'Total CO2 (mmol/L)',
    hco3_actual DECIMAL(4,1) COMMENT 'Actual Bicarbonate (mmol/L)',
    hco3_standard DECIMAL(4,1) COMMENT 'Standard Bicarbonate (mmol/L)',
    be_ecf DECIMAL(4,1) COMMENT 'Base Excess ECF (mmol/L)',
    be_blood DECIMAL(4,1) COMMENT 'Base Excess Blood (mmol/L)',
    anion_gap DECIMAL(4,1) COMMENT 'Anion Gap (mmol/L)',
    ca_corrected DECIMAL(4,3) COMMENT 'Ca++ corrected to pH 7.4 (mmol/L)',
    so2_calculated DECIMAL(5,1) COMMENT 'Oxygen Saturation calculated (%)',
    hct_calculated DECIMAL(4,1) COMMENT 'Hematocrit calculated (%)',

    -- P/F Ratio (calculated)
    pf_ratio DECIMAL(5,1) COMMENT 'PaO2/FiO2 ratio',

    -- Saturations from different sources
    sao2 DECIMAL(4,1) COMMENT 'Arterial saturation (%)',
    scvo2 DECIMAL(4,1) COMMENT 'Central venous O2 sat (%) - from CVC',
    svo2 DECIMAL(4,1) COMMENT 'Mixed venous O2 sat (%) - from PA catheter',

    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    collected_by INT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_gas_admission (admission_id),
    INDEX idx_gas_timepoint (timepoint)
);

-- =============================================================================
-- 11. VENTILATOR SETTINGS
-- Source: Drager Evita XL, Servo-i, Hamilton, etc.
-- =============================================================================

CREATE TABLE ventilator_settings (
    vent_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT 'admission / 6h / 12h / 24h / dayX',

    -- Device Info
    device_manufacturer VARCHAR(50) COMMENT 'Drager, Servo, Hamilton, etc.',
    device_model VARCHAR(50) COMMENT 'Evita XL, Servo-i, etc.',

    -- Ventilation Mode
    vent_mode VARCHAR(30) COMMENT 'CPAP, ASB, SIMV, PCV, VCV, BIPAP, APRV, etc.',
    patient_type VARCHAR(20) DEFAULT 'Adult' COMMENT 'Adult / Pediatric / Neonatal',

    -- Oxygenation Settings
    fio2 INT COMMENT 'Fraction of Inspired O2 (%)',

    -- Pressure Settings (cmH2O or mbar)
    peep DECIMAL(4,1) COMMENT 'Positive End-Expiratory Pressure',
    ps_above_peep DECIMAL(4,1) COMMENT 'Pressure Support / dPASB above PEEP',
    pinsp DECIMAL(4,1) COMMENT 'Inspiratory Pressure (for PCV)',
    ppeak DECIMAL(4,1) COMMENT 'Peak Airway Pressure - measured',
    pmean DECIMAL(4,1) COMMENT 'Mean Airway Pressure - measured',
    pplat DECIMAL(4,1) COMMENT 'Plateau Pressure - measured',

    -- Volume Settings/Measurements (L or mL)
    vt_set DECIMAL(5,3) COMMENT 'Tidal Volume Set (L)',
    vt_measured DECIMAL(5,3) COMMENT 'Tidal Volume Measured/Inspired (L)',
    vte DECIMAL(5,3) COMMENT 'Expired Tidal Volume (L)',

    -- Rate Settings/Measurements
    rr_set INT COMMENT 'Respiratory Rate Set (breaths/min)',
    rr_total INT COMMENT 'Total Respiratory Rate - measured',
    rr_spontaneous INT COMMENT 'Spontaneous Respiratory Rate',

    -- Minute Ventilation (L/min)
    mv_total DECIMAL(5,2) COMMENT 'Total Minute Volume',
    mv_spontaneous DECIMAL(5,2) COMMENT 'Spontaneous Minute Volume',

    -- Flow Settings
    flow_trigger DECIMAL(4,2) COMMENT 'Flow Trigger (L/min)',
    insp_time DECIMAL(3,2) COMMENT 'Inspiratory Time (s)',
    ie_ratio VARCHAR(10) COMMENT 'I:E Ratio (e.g., 1:2)',
    ramp_time DECIMAL(4,2) COMMENT 'Ramp/Rise Time (s)',

    -- Lung Mechanics - Measured
    compliance_static DECIMAL(5,1) COMMENT 'Static Compliance (mL/cmH2O)',
    compliance_dynamic DECIMAL(5,1) COMMENT 'Dynamic Compliance (mL/cmH2O)',
    resistance DECIMAL(5,1) COMMENT 'Airway Resistance (cmH2O/L/s)',

    -- Monitoring
    etco2 INT COMMENT 'End-tidal CO2 (mmHg)',
    spo2_vent INT COMMENT 'SpO2 from ventilator (%)',

    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_vent_admission (admission_id),
    INDEX idx_vent_timepoint (timepoint)
);

-- =============================================================================
-- 12. LABORATORY RESULTS
-- Source: Hospital Laboratory Information System (LIS)
-- =============================================================================

CREATE TABLE laboratory_results (
    lab_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL,
    collected_at DATETIME,
    resulted_at DATETIME,

    -- COMPLETE BLOOD COUNT (CBC)
    rbc DECIMAL(4,2) COMMENT 'Red Blood Cells (x10^12/L)',
    hemoglobin DECIMAL(4,1) COMMENT 'Hemoglobin (g/L)',
    hematocrit DECIMAL(5,3) COMMENT 'Hematocrit (L/L)',
    mcv DECIMAL(5,1) COMMENT 'Mean Corpuscular Volume (fL)',
    mch DECIMAL(4,1) COMMENT 'Mean Corpuscular Hemoglobin (pg)',
    mchc DECIMAL(4,1) COMMENT 'Mean Corpuscular Hb Concentration (g/L)',
    rdw DECIMAL(4,1) COMMENT 'Red Cell Distribution Width (%)',
    reticulocytes DECIMAL(4,1) COMMENT 'Reticulocytes (%)',

    -- WHITE BLOOD CELLS
    wbc DECIMAL(5,2) COMMENT 'White Blood Cells (x10^9/L)',
    neutrophils_pct DECIMAL(4,1) COMMENT 'Neutrophils (%)',
    neutrophils_abs DECIMAL(5,2) COMMENT 'Neutrophils Absolute (x10^9/L)',
    lymphocytes_pct DECIMAL(4,1) COMMENT 'Lymphocytes (%)',
    lymphocytes_abs DECIMAL(4,2) COMMENT 'Lymphocytes Absolute (x10^9/L)',
    monocytes_pct DECIMAL(4,1) COMMENT 'Monocytes (%)',
    monocytes_abs DECIMAL(4,2) COMMENT 'Monocytes Absolute (x10^9/L)',
    eosinophils_pct DECIMAL(4,1) COMMENT 'Eosinophils (%)',
    eosinophils_abs DECIMAL(4,2) COMMENT 'Eosinophils Absolute (x10^9/L)',
    basophils_pct DECIMAL(4,1) COMMENT 'Basophils (%)',
    basophils_abs DECIMAL(4,2) COMMENT 'Basophils Absolute (x10^9/L)',

    -- PLATELETS
    platelets DECIMAL(5,0) COMMENT 'Platelets (x10^9/L)',
    mpv DECIMAL(4,1) COMMENT 'Mean Platelet Volume (fL)',

    -- COAGULATION
    pt_seconds DECIMAL(4,1) COMMENT 'Prothrombin Time (s)',
    pt_inr DECIMAL(4,2) COMMENT 'INR',
    aptt DECIMAL(4,1) COMMENT 'Activated Partial Thromboplastin Time (s)',
    fibrinogen DECIMAL(4,2) COMMENT 'Fibrinogen (g/L)',
    d_dimer DECIMAL(6,2) COMMENT 'D-Dimer (mg/L FEU)',
    antithrombin DECIMAL(5,1) COMMENT 'Antithrombin III (%)',

    -- LIVER FUNCTION
    bilirubin_total DECIMAL(5,1) COMMENT 'Total Bilirubin (umol/L)',
    bilirubin_direct DECIMAL(5,1) COMMENT 'Direct Bilirubin (umol/L)',
    ast DECIMAL(5,0) COMMENT 'AST/GOT (U/L)',
    alt DECIMAL(5,0) COMMENT 'ALT/GPT (U/L)',
    alp DECIMAL(5,0) COMMENT 'Alkaline Phosphatase (U/L)',
    ggt DECIMAL(5,0) COMMENT 'Gamma-GT (U/L)',
    ldh DECIMAL(5,0) COMMENT 'Lactate Dehydrogenase (U/L)',

    -- RENAL FUNCTION
    urea DECIMAL(5,1) COMMENT 'Urea/BUN (mmol/L)',
    creatinine DECIMAL(5,0) COMMENT 'Creatinine (umol/L)',
    egfr DECIMAL(5,1) COMMENT 'eGFR (mL/min/1.73m2)',
    egfr_category VARCHAR(10) COMMENT 'KDIGO Category (G1-G5)',
    uric_acid DECIMAL(5,0) COMMENT 'Uric Acid (umol/L)',

    -- ELECTROLYTES (from lab, not blood gas)
    sodium_lab DECIMAL(5,1) COMMENT 'Sodium (mmol/L)',
    potassium_lab DECIMAL(4,2) COMMENT 'Potassium (mmol/L)',
    chloride_lab DECIMAL(5,1) COMMENT 'Chloride (mmol/L)',
    calcium_total DECIMAL(4,2) COMMENT 'Total Calcium (mmol/L)',
    calcium_corrected DECIMAL(4,2) COMMENT 'Corrected Calcium (mmol/L)',
    phosphate DECIMAL(4,2) COMMENT 'Phosphate (mmol/L)',
    magnesium DECIMAL(4,2) COMMENT 'Magnesium (mmol/L)',

    -- PROTEINS
    total_protein DECIMAL(4,1) COMMENT 'Total Protein (g/L)',
    albumin DECIMAL(4,1) COMMENT 'Albumin (g/L)',
    globulin DECIMAL(4,1) COMMENT 'Globulin (g/L)',

    -- INFLAMMATORY MARKERS
    crp DECIMAL(6,1) COMMENT 'C-Reactive Protein (mg/L)',
    procalcitonin DECIMAL(6,2) COMMENT 'Procalcitonin (ng/mL)',
    il6 DECIMAL(7,1) COMMENT 'Interleukin-6 (pg/mL)',
    ferritin DECIMAL(6,0) COMMENT 'Ferritin (ug/L)',

    -- CARDIAC MARKERS
    troponin_i DECIMAL(8,3) COMMENT 'Troponin I (ng/L)',
    troponin_t DECIMAL(8,3) COMMENT 'Troponin T (ng/L)',
    ck DECIMAL(6,0) COMMENT 'Creatine Kinase (U/L)',
    ck_mb DECIMAL(5,1) COMMENT 'CK-MB (U/L)',
    bnp DECIMAL(7,0) COMMENT 'BNP (pg/mL)',
    nt_probnp DECIMAL(7,0) COMMENT 'NT-proBNP (pg/mL)',

    -- GLUCOSE/METABOLIC
    glucose_lab DECIMAL(5,2) COMMENT 'Glucose (mmol/L)',
    hba1c DECIMAL(4,1) COMMENT 'HbA1c (%)',

    -- LIPIDS
    cholesterol_total DECIMAL(4,2) COMMENT 'Total Cholesterol (mmol/L)',
    hdl DECIMAL(4,2) COMMENT 'HDL Cholesterol (mmol/L)',
    ldl DECIMAL(4,2) COMMENT 'LDL Cholesterol (mmol/L)',
    triglycerides DECIMAL(4,2) COMMENT 'Triglycerides (mmol/L)',

    -- THYROID
    tsh DECIMAL(6,3) COMMENT 'TSH (mIU/L)',
    ft4 DECIMAL(4,1) COMMENT 'Free T4 (pmol/L)',
    ft3 DECIMAL(4,2) COMMENT 'Free T3 (pmol/L)',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_lab_admission (admission_id),
    INDEX idx_lab_timepoint (timepoint)
);

-- =============================================================================
-- 13. PRE-ADMISSION MEDICATIONS
-- =============================================================================

CREATE TABLE pre_admission_medications (
    med_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL UNIQUE,

    -- Anticoagulants
    warfarin TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    dabigatran TINYINT DEFAULT 0 COMMENT '0-No / 1-2x110 / 2-2x150',
    apixaban TINYINT DEFAULT 0 COMMENT '0-No / 1-2x5 / 2-2x2.5',
    rivaroxaban TINYINT DEFAULT 0 COMMENT '0-No / 1-20mg / 2-15mg / 3-2x2.5 / 4-2x15',
    edoxaban TINYINT DEFAULT 0 COMMENT '0-No / 1-60mg / 2-30mg / 3-15mg',

    -- Antiplatelets
    aspirin TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes (ASK)',
    clopidogrel TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    ticagrelor TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    prasugrel TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Heart Failure Medications (0-No / 1-<=25% / 2-<=50% / 3->50% dose)
    beta_blocker TINYINT DEFAULT 0,
    ace_inhibitor TINYINT DEFAULT 0,
    arb TINYINT DEFAULT 0,
    arni TINYINT DEFAULT 0 COMMENT '0-No / 1-25% / 2-50% / 3-100%',
    mra TINYINT DEFAULT 0,
    sglt2_inhibitor TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Diuretics
    furosemide TINYINT DEFAULT 0 COMMENT '0-No / 1-<=40mg / 2-<=125mg / 3->125mg / 4->250mg',

    -- Pulmonary Hypertension
    sildenafil TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Antiarrhythmics
    flecainide TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    propafenone TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    verapamil_diltiazem TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    amiodarone TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    mexiletine TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    sotalol TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    dronedarone TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    other_antiarrhythmic TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Lipid Lowering
    statin TINYINT DEFAULT 0 COMMENT '0-No / 1-<=25% / 2-<=50% / 3->50%',
    ezetimibe TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    pcsk9_inhibitor TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Diabetes
    metformin TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    insulin TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    dpp4_inhibitor TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    pioglitazone TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    sulfonylurea TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Other
    immunomodulator TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    corticosteroid_chronic TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    chemotherapy TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    inhaled_ics_lama_laba TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE
);

-- =============================================================================
-- 14. MECHANICAL CIRCULATORY SUPPORT (MCS)
-- =============================================================================

CREATE TABLE mechanical_circulatory_support (
    mcs_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,

    -- Device Selection (multiple can be active)
    iabp TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Intra-Aortic Balloon Pump',
    impella_25 TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Impella 2.5',
    impella_cp TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Impella CP',
    impella_50 TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Impella 5.0',
    impella_55 TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Impella 5.5',
    impella_rp TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Impella RP',
    va_ecmo TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Veno-Arterial ECMO',
    vv_ecmo TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Veno-Venous ECMO',
    ecpella TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: ECMO + Impella combination',
    tandemheart TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: TandemHeart',
    lvad TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Durable LVAD',
    rvad TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: RVAD',
    bivad TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: BiVAD',
    tah TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes: Total Artificial Heart',

    -- Insertion Details
    insertion_date DATE,
    insertion_location TINYINT COMMENT '1-Cath Lab / 2-OR / 3-ICU Bedside / 4-ED / 5-Other Hospital',
    access_site TINYINT COMMENT '1-Femoral / 2-Axillary / 3-Subclavian / 4-Central',

    -- Indication
    indication TINYINT COMMENT '1-CS Support / 2-Bridge to Decision / 3-Bridge to Recovery / 4-Bridge to Transplant / 5-Bridge to LVAD / 6-High-Risk PCI / 7-Post-Cardiotomy / 8-Respiratory / 9-ECPR',

    -- IABP Settings
    iabp_ratio VARCHAR(5) COMMENT '1:1, 1:2, 1:3',

    -- Impella Settings
    impella_p_level VARCHAR(3) COMMENT 'P1-P9',
    impella_flow DECIMAL(3,1) COMMENT 'L/min',

    -- ECMO Settings
    ecmo_flow DECIMAL(3,1) COMMENT 'L/min',
    ecmo_rpm INT COMMENT 'Revolutions per minute',
    ecmo_fio2 INT COMMENT 'Sweep gas FiO2 (%)',
    ecmo_sweep DECIMAL(3,1) COMMENT 'Sweep gas flow (L/min)',

    -- Complications
    complication_bleeding TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    complication_hemolysis TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    complication_limb_ischemia TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    complication_thrombosis TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    complication_stroke TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    complication_infection TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    complication_migration TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    complication_vascular TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Weaning/Removal
    removal_date DATE,
    removal_reason TINYINT COMMENT '1-Recovery / 2-Bridge to durable / 3-Transplant / 4-Death / 5-Complication / 6-Futility',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_mcs_admission (admission_id)
);

-- =============================================================================
-- 15. FOLLOW-UP (6h, 12h, 24h, daily)
-- =============================================================================

CREATE TABLE follow_up (
    followup_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT '6h / 12h / 24h / day2 / day3...',

    notes TEXT,
    new_shock_event TINYINT DEFAULT 0 COMMENT 'New shock = new event / point 0',

    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_followup_admission (admission_id)
);

-- =============================================================================
-- 16. OUTCOME
-- =============================================================================

CREATE TABLE outcome (
    outcome_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL UNIQUE,

    -- ICU Outcome
    died_in_icu TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    transfer_from_icu TINYINT COMMENT '0-Ward / 1-Other ICU / 2-Palliative / 3-Higher center / 4-Smaller center',
    icu_discharge_date DATE,

    -- Hospital Outcome
    died_in_hospital TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',
    inhospital_death_date DATE,

    -- Discharge
    discharge_destination TINYINT COMMENT '0-Home / 1-Palliative / 2-Other hospital',
    hospital_discharge_date DATE,

    -- Calculated
    length_of_stay_icu INT COMMENT 'Days in ICU',
    length_of_stay_hospital INT COMMENT 'Total hospital days',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE
);

-- =============================================================================
-- 17. AUDIT LOG
-- =============================================================================

CREATE TABLE audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    performed_by INT,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- VIEWS FOR REPORTING
-- =============================================================================

CREATE VIEW v_active_admissions AS
SELECT
    a.admission_id,
    a.case_number,
    p.patient_code,
    p.age,
    p.gender,
    a.date_of_admission,
    a.date_of_shock_onset,
    sc.shock_cardiogenic,
    sc.scai_classification,
    sc.shock_distributive,
    sc.shock_hypovolemic,
    sc.shock_obstructive,
    sc.shock_mixed,
    sc.sofa_score,
    a.status
FROM admission a
JOIN patient p ON a.patient_id = p.patient_id
LEFT JOIN shock_classification sc ON a.admission_id = sc.admission_id
WHERE a.status IN ('Admitted', 'Approved')
ORDER BY a.date_of_admission DESC;

CREATE VIEW v_outcome_summary AS
SELECT
    sc.shock_cardiogenic,
    sc.scai_classification,
    sc.shock_distributive,
    sc.shock_hypovolemic,
    COUNT(*) as total_cases,
    SUM(o.died_in_icu) as icu_deaths,
    SUM(o.died_in_hospital) as hospital_deaths,
    ROUND(AVG(o.length_of_stay_icu), 1) as avg_icu_los,
    ROUND(AVG(o.length_of_stay_hospital), 1) as avg_hospital_los,
    ROUND(SUM(o.died_in_hospital) / COUNT(*) * 100, 1) as mortality_rate
FROM admission a
JOIN shock_classification sc ON a.admission_id = sc.admission_id
JOIN outcome o ON a.admission_id = o.admission_id
GROUP BY sc.shock_cardiogenic, sc.scai_classification, sc.shock_distributive, sc.shock_hypovolemic;

CREATE VIEW v_latest_blood_gas AS
SELECT
    a.case_number,
    p.patient_code,
    bg.timepoint,
    bg.ph,
    bg.pco2,
    bg.po2,
    bg.lactate,
    bg.hco3_actual,
    bg.be_ecf,
    bg.thb,
    bg.so2_measured,
    bg.collected_at
FROM blood_gas bg
JOIN admission a ON bg.admission_id = a.admission_id
JOIN patient p ON a.patient_id = p.patient_id
WHERE bg.collected_at = (
    SELECT MAX(bg2.collected_at)
    FROM blood_gas bg2
    WHERE bg2.admission_id = bg.admission_id
);

CREATE VIEW v_latest_ventilator AS
SELECT
    a.case_number,
    p.patient_code,
    v.timepoint,
    v.vent_mode,
    v.fio2,
    v.peep,
    v.ppeak,
    v.vt_measured,
    v.rr_total,
    v.mv_total,
    v.compliance_static,
    v.recorded_at
FROM ventilator_settings v
JOIN admission a ON v.admission_id = a.admission_id
JOIN patient p ON a.patient_id = p.patient_id
WHERE v.recorded_at = (
    SELECT MAX(v2.recorded_at)
    FROM ventilator_settings v2
    WHERE v2.admission_id = v.admission_id
);

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
