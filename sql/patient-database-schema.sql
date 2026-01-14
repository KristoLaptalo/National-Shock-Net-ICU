-- =============================================================================
-- NATIONAL SHOCK NET ICU - DATABASE SCHEMA
-- Based on Clinical Registry: Shock.xlsx - PATIENT GENERAL DATA
-- =============================================================================

-- =============================================================================
-- INFRASTRUCTURE TABLES
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
-- PATIENT (ANONYMIZED)
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
-- ADMISSION (CENTRAL TABLE)
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
-- MEDICAL HISTORY (COMORBIDITIES)
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
-- WORKING DIAGNOSES AT ADMISSION
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
-- SHOCK CLASSIFICATION
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
-- HEMODYNAMIC DATA (Multiple timepoints: Admission, 6h, 12h, 24h, daily)
-- =============================================================================

CREATE TABLE hemodynamic_data (
    hemo_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT 'admission / 6h / 12h / 24h / day2 / day3...',

    sap_invasive INT COMMENT 'Systolic Arterial Pressure (mmHg)',
    dap_invasive INT COMMENT 'Diastolic Arterial Pressure (mmHg)',
    map_invasive INT COMMENT 'Mean Arterial Pressure (mmHg)',
    pulse INT COMMENT 'Heart rate (bpm)',
    rhythm VARCHAR(50) COMMENT 'Cardiac rhythm',
    respiratory_rate INT COMMENT 'Breaths per minute',
    spo2 INT COMMENT 'Oxygen saturation (%)',
    body_temperature DECIMAL(3,1) COMMENT 'Temperature (°C)',

    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_hemo_admission (admission_id),
    INDEX idx_hemo_timepoint (timepoint)
);

-- =============================================================================
-- ECHOCARDIOGRAPHY
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
-- SWAN-GANZ CATHETER HEMODYNAMICS
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
    cardiac_index DECIMAL(3,2) COMMENT 'Calculated (L/min/m²)',
    papi DECIMAL(4,2) COMMENT 'Pulmonary Artery Pulsatility Index - Calculated',

    performed_at DATETIME,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_sg_admission (admission_id)
);

-- =============================================================================
-- BLOOD GAS / POINT-OF-CARE LABS
-- =============================================================================

CREATE TABLE blood_gas (
    gas_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT 'admission / 6h / 12h / 24h...',

    -- Blood Gas
    ph DECIMAL(4,3),
    po2 DECIMAL(5,1) COMMENT 'mmHg',
    pco2 DECIMAL(5,1) COMMENT 'mmHg',

    -- Electrolytes
    sodium DECIMAL(5,1) COMMENT 'mmol/L',
    potassium DECIMAL(3,1) COMMENT 'mmol/L',
    calcium DECIMAL(3,2) COMMENT 'mmol/L',

    -- Metabolic
    lactate DECIMAL(4,2) COMMENT 'mmol/L',
    hco3 DECIMAL(4,1) COMMENT 'mmol/L',
    base_excess DECIMAL(4,1) COMMENT 'mEq/L',

    -- Oxygen Saturations
    sao2 DECIMAL(4,1) COMMENT 'Arterial saturation (%)',
    scvo2 DECIMAL(4,1) COMMENT 'Central venous saturation (%) - from CVC',
    svo2 DECIMAL(4,1) COMMENT 'Mixed venous saturation (%) - from S-G',

    -- Hematology
    hemoglobin DECIMAL(4,1) COMMENT 'g/dL',
    hematocrit DECIMAL(4,1) COMMENT '%',

    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_gas_admission (admission_id),
    INDEX idx_gas_timepoint (timepoint)
);

-- =============================================================================
-- PRE-ADMISSION MEDICATIONS
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

    -- Heart Failure Medications (0-No / 1-≤25% / 2-≤50% / 3->50% dose)
    beta_blocker TINYINT DEFAULT 0,
    ace_inhibitor TINYINT DEFAULT 0,
    arb TINYINT DEFAULT 0,
    arni TINYINT DEFAULT 0 COMMENT '0-No / 1-25% / 2-50% / 3-100%',
    mra TINYINT DEFAULT 0,
    sglt2_inhibitor TINYINT DEFAULT 0 COMMENT '0-No / 1-Yes',

    -- Diuretics
    furosemide TINYINT DEFAULT 0 COMMENT '0-No / 1-≤40mg / 2-≤125mg / 3->125mg / 4->250mg',

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
    statin TINYINT DEFAULT 0 COMMENT '0-No / 1-≤25% / 2-≤50% / 3->50%',
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
-- FOLLOW-UP (6h, 12h, 24h, daily for a week)
-- =============================================================================

CREATE TABLE follow_up (
    followup_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT '6h / 12h / 24h / day2 / day3...',

    -- Reference to other data tables by timepoint
    notes TEXT,
    new_shock_event TINYINT DEFAULT 0 COMMENT 'New shock = new event / point 0',

    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_followup_admission (admission_id)
);

-- =============================================================================
-- OUTCOME
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
-- AUDIT LOG
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
