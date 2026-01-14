-- National Shock Net ICU Patient Database Schema
-- With: ICU Subscriptions, Admission Criteria, Patient Anonymization
-- Generated from ER diagram

-- =============================================
-- HOSPITAL & ICU SUBSCRIPTION
-- =============================================

CREATE TABLE hospital (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(300),
    phone VARCHAR(20),
    type ENUM('University', 'General', 'Regional', 'Private') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    monthly_fee DECIMAL(10,2),
    contact_person VARCHAR(200),
    contact_email VARCHAR(150),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    activated_by INT,

    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id),

    INDEX idx_subscription_active (is_active),
    INDEX idx_subscription_dates (start_date, end_date)
);

CREATE TABLE icu_unit (
    icu_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('Medical', 'Surgical', 'Cardiac', 'Neuro', 'Trauma', 'Mixed') NOT NULL,
    total_beds INT NOT NULL,
    available_beds INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id),

    INDEX idx_icu_hospital (hospital_id)
);

-- =============================================
-- ADMISSION CRITERIA DEFINITIONS
-- =============================================

CREATE TABLE admission_criteria (
    criteria_id INT PRIMARY KEY AUTO_INCREMENT,
    category ENUM('Hemodynamic', 'Respiratory', 'Laboratory', 'Clinical', 'Shock-Specific') NOT NULL,
    criteria_code VARCHAR(20) NOT NULL UNIQUE,
    criteria_name VARCHAR(150) NOT NULL,
    description TEXT,
    value_type ENUM('Numeric', 'Boolean', 'Selection') NOT NULL,
    unit VARCHAR(30),
    threshold_min DECIMAL(10,4),
    threshold_max DECIMAL(10,4),
    selection_options JSON COMMENT 'For Selection type criteria',
    weight INT DEFAULT 1 COMMENT 'Score weight for criteria',
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pre-populate standard shock criteria
INSERT INTO admission_criteria (category, criteria_code, criteria_name, description, value_type, unit, threshold_min, threshold_max, is_mandatory) VALUES
('Hemodynamic', 'MAP_LOW', 'Mean Arterial Pressure < 65', 'MAP below 65 mmHg despite fluid resuscitation', 'Numeric', 'mmHg', NULL, 65, TRUE),
('Hemodynamic', 'SBP_LOW', 'Systolic BP < 90', 'Systolic blood pressure below 90 mmHg', 'Numeric', 'mmHg', NULL, 90, TRUE),
('Laboratory', 'LACTATE_HIGH', 'Lactate > 2.0', 'Serum lactate above 2.0 mmol/L', 'Numeric', 'mmol/L', 2.0, NULL, TRUE),
('Hemodynamic', 'VASO_REQ', 'Vasopressor Requirement', 'Requires vasopressors to maintain MAP >= 65', 'Boolean', NULL, NULL, NULL, FALSE),
('Clinical', 'ALTERED_MS', 'Altered Mental Status', 'Acute change in mental status', 'Boolean', NULL, NULL, NULL, FALSE),
('Respiratory', 'SPO2_LOW', 'SpO2 < 90%', 'Oxygen saturation below 90% on room air', 'Numeric', '%', NULL, 90, FALSE),
('Laboratory', 'CREAT_HIGH', 'Creatinine > 2.0', 'Acute kidney injury with creatinine > 2.0', 'Numeric', 'mg/dL', 2.0, NULL, FALSE),
('Shock-Specific', 'SCAI_STAGE', 'SCAI Shock Stage', 'Society for Cardiovascular Angiography staging', 'Selection', NULL, NULL, NULL, TRUE),
('Shock-Specific', 'SHOCK_TYPE', 'Type of Shock', 'Primary shock classification', 'Selection', NULL, NULL, NULL, TRUE),
('Hemodynamic', 'CI_LOW', 'Cardiac Index < 2.2', 'Cardiac index below 2.2 L/min/m2', 'Numeric', 'L/min/m2', NULL, 2.2, FALSE);

-- =============================================
-- ANONYMIZED PATIENT
-- =============================================

CREATE TABLE patient (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,

    -- Anonymization fields
    pseudonym VARCHAR(50) NOT NULL UNIQUE COMMENT 'Generated pseudonym e.g. ALPHA-7X9K',
    qr_code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique QR identifier',
    qr_code_image BLOB COMMENT 'Generated QR code image',

    -- Encrypted real identity (AES-256 encrypted)
    encrypted_identity VARBINARY(512) COMMENT 'Encrypted: first_name|last_name|national_id',
    identity_iv VARBINARY(16) COMMENT 'Initialization vector for decryption',
    national_id_hash VARCHAR(64) UNIQUE COMMENT 'SHA-256 hash for duplicate detection',

    -- Non-identifying demographics
    date_of_birth DATE NOT NULL,
    age_at_registration INT,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown') DEFAULT 'Unknown',

    -- Medical identifiers (anonymized)
    medical_record_hash VARCHAR(64) COMMENT 'Hashed MRN for cross-reference',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_patient_pseudonym (pseudonym),
    INDEX idx_patient_qr (qr_code),
    INDEX idx_patient_dob (date_of_birth)
);

-- =============================================
-- PSEUDONYM GENERATOR SEQUENCE
-- =============================================

CREATE TABLE pseudonym_sequence (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prefix VARCHAR(10) NOT NULL,
    last_number INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pseudonym_sequence (prefix, last_number) VALUES
('ALPHA', 0), ('BETA', 0), ('GAMMA', 0), ('DELTA', 0), ('SIGMA', 0);

-- =============================================
-- PHYSICIAN & ADMIN
-- =============================================

CREATE TABLE physician (
    physician_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    can_submit_patients BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id),

    INDEX idx_physician_hospital (hospital_id)
);

CREATE TABLE admin_user (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'SuperAdmin', 'Reviewer', 'DataManager') NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    can_view_identity BOOLEAN DEFAULT FALSE COMMENT 'Permission to decrypt patient identity',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE TABLE care_team_member (
    member_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('Attending', 'Resident', 'Nurse', 'Specialist', 'Pharmacist', 'Therapist') NOT NULL,
    department VARCHAR(100),
    license_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ADMISSION (Central Table)
-- =============================================

CREATE TABLE admission (
    admission_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    subscription_id INT NOT NULL,
    icu_id INT NOT NULL,
    physician_id INT NOT NULL,
    approved_by INT,
    case_number VARCHAR(20) NOT NULL UNIQUE,

    -- Dates
    submission_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_date DATETIME,
    admission_date DATETIME,
    discharge_date DATETIME,

    -- Status
    status ENUM('Pending', 'Under Review', 'Approved', 'Rejected', 'Admitted', 'Discharged', 'Archived') DEFAULT 'Pending',
    rejection_reason TEXT,
    bed_number VARCHAR(20),

    -- Criteria evaluation
    criteria_score INT DEFAULT 0,
    criteria_met BOOLEAN DEFAULT FALSE,
    mandatory_criteria_met BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (subscription_id) REFERENCES icu_subscription(subscription_id),
    FOREIGN KEY (icu_id) REFERENCES icu_unit(icu_id),
    FOREIGN KEY (physician_id) REFERENCES physician(physician_id),
    FOREIGN KEY (approved_by) REFERENCES admin_user(admin_id),

    INDEX idx_admission_status (status),
    INDEX idx_admission_date (admission_date),
    INDEX idx_admission_subscription (subscription_id)
);

-- =============================================
-- CRITERIA EVALUATION FOR ADMISSION
-- =============================================

CREATE TABLE criteria_checklist (
    checklist_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    criteria_id INT NOT NULL,
    measured_value DECIMAL(10,4),
    selected_option VARCHAR(100) COMMENT 'For Selection type criteria',
    is_met BOOLEAN NOT NULL,
    notes TEXT,
    evaluated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluated_by INT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES admission_criteria(criteria_id),
    FOREIGN KEY (evaluated_by) REFERENCES physician(physician_id),

    UNIQUE KEY unique_admission_criteria (admission_id, criteria_id),
    INDEX idx_criteria_admission (admission_id)
);

-- =============================================
-- SHOCK ASSESSMENT
-- =============================================

CREATE TABLE shock_assessment (
    assessment_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL UNIQUE,
    shock_type ENUM('Cardiogenic', 'Septic', 'Hypovolemic', 'Distributive', 'Obstructive', 'Mixed') NOT NULL,
    scai_stage ENUM('A', 'B', 'C', 'D', 'E') COMMENT 'SCAI Shock Classification',

    -- Hemodynamics
    lactate_level DECIMAL(5,2) COMMENT 'mmol/L',
    lactate_clearance DECIMAL(5,2) COMMENT 'Percentage',
    map DECIMAL(5,2) COMMENT 'Mean Arterial Pressure mmHg',
    cardiac_output DECIMAL(4,2) COMMENT 'L/min',
    cardiac_index DECIMAL(4,2) COMMENT 'L/min/m2',
    heart_rate INT,
    cvp DECIMAL(5,2),
    scvo2 DECIMAL(5,2),

    -- Support requirements
    vasopressor_required BOOLEAN DEFAULT FALSE,
    mechanical_support BOOLEAN DEFAULT FALSE,
    mechanical_support_type VARCHAR(100),

    meets_criteria BOOLEAN NOT NULL,
    notes TEXT,
    assessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assessed_by INT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (assessed_by) REFERENCES physician(physician_id),

    INDEX idx_shock_type (shock_type),
    INDEX idx_scai_stage (scai_stage)
);

-- =============================================
-- CLINICAL DATA TABLES
-- =============================================

CREATE TABLE vital_signs (
    vital_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    heart_rate INT,
    systolic_bp INT,
    diastolic_bp INT,
    map DECIMAL(5,2),
    respiratory_rate INT,
    temperature DECIMAL(4,2),
    spo2 INT,
    cvp DECIMAL(5,2),
    cardiac_output DECIMAL(4,2),
    urine_output INT,
    gcs_score INT,
    recorded_by INT,
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES care_team_member(member_id),

    INDEX idx_vital_admission (admission_id),
    INDEX idx_vital_recorded (recorded_at)
);

CREATE TABLE lab_result (
    lab_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    test_category ENUM('Hematology', 'Chemistry', 'Coagulation', 'Blood Gas', 'Microbiology', 'Cardiac', 'Other') NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    value DECIMAL(10,4),
    value_text VARCHAR(200),
    unit VARCHAR(30),
    reference_min DECIMAL(10,4),
    reference_max DECIMAL(10,4),
    is_abnormal BOOLEAN DEFAULT FALSE,
    is_critical BOOLEAN DEFAULT FALSE,
    collected_at DATETIME NOT NULL,
    resulted_at DATETIME,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,

    INDEX idx_lab_admission (admission_id),
    INDEX idx_lab_date (collected_at)
);

CREATE TABLE medication (
    medication_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    drug_name VARCHAR(150) NOT NULL,
    drug_class ENUM('Vasopressor', 'Inotrope', 'Antibiotic', 'Sedation', 'Analgesic', 'Anticoagulant', 'Diuretic', 'Insulin', 'PPI', 'Other') NOT NULL,
    dose DECIMAL(10,4) NOT NULL,
    dose_unit VARCHAR(30) NOT NULL,
    route ENUM('IV', 'PO', 'IM', 'SC', 'Inhaled', 'Topical', 'Other') NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    infusion_rate DECIMAL(10,4),
    infusion_unit VARCHAR(30),
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    status ENUM('Active', 'Completed', 'Discontinued', 'On Hold') DEFAULT 'Active',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,

    INDEX idx_med_admission (admission_id),
    INDEX idx_med_status (status)
);

CREATE TABLE intervention (
    intervention_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    type ENUM('Intubation', 'Central Line', 'Arterial Line', 'Dialysis', 'ECMO', 'IABP', 'Impella', 'Cardioversion', 'Bronchoscopy', 'Chest Tube', 'Other') NOT NULL,
    description TEXT,
    performed_at DATETIME NOT NULL,
    performed_by INT,
    outcome ENUM('Successful', 'Complicated', 'Failed', 'Ongoing') DEFAULT 'Successful',
    notes TEXT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES care_team_member(member_id),

    INDEX idx_intervention_admission (admission_id)
);

CREATE TABLE daily_checklist (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    checklist_date DATE NOT NULL,
    category ENUM('Hemodynamic', 'Respiratory', 'Medication', 'Laboratory', 'Nutrition', 'Mobility', 'Skin', 'Lines', 'Communication', 'Other') NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    is_applicable BOOLEAN DEFAULT TRUE,
    completed_at DATETIME,
    completed_by INT,
    notes TEXT,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES care_team_member(member_id),

    INDEX idx_checklist_admission (admission_id),
    INDEX idx_checklist_date (checklist_date)
);

CREATE TABLE admission_care_team (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    member_id INT NOT NULL,
    role_in_care VARCHAR(100),
    assigned_date DATE NOT NULL,
    end_date DATE,
    is_primary BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES care_team_member(member_id),

    UNIQUE KEY unique_assignment (admission_id, member_id, assigned_date)
);

-- =============================================
-- DISCHARGE
-- =============================================

CREATE TABLE discharge (
    discharge_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL UNIQUE,
    discharge_status ENUM('Alive', 'Deceased', 'Transferred', 'AMA', 'Hospice') NOT NULL,
    outcome ENUM('Recovered', 'Improved', 'Unchanged', 'Deteriorated', 'Deceased') NOT NULL,
    length_of_stay INT NOT NULL,
    icu_days INT,
    ventilator_days INT,
    discharge_summary TEXT,
    destination ENUM('Home', 'Rehab', 'Nursing Facility', 'Another Hospital', 'Morgue', 'Other') NOT NULL,
    discharge_date DATETIME NOT NULL,
    discharged_by INT,
    mortality BOOLEAN DEFAULT FALSE,
    mortality_cause VARCHAR(300),
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (discharged_by) REFERENCES physician(physician_id),

    INDEX idx_discharge_outcome (outcome)
);

-- =============================================
-- AUDIT & ACCESS LOGS
-- =============================================

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

CREATE TABLE identity_access_log (
    access_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    accessed_by INT NOT NULL,
    access_reason VARCHAR(300) NOT NULL,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),

    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (accessed_by) REFERENCES admin_user(admin_id),

    INDEX idx_access_patient (patient_id),
    INDEX idx_access_date (accessed_at)
);

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

-- Generate unique pseudonym for new patient
CREATE PROCEDURE generate_pseudonym(OUT new_pseudonym VARCHAR(50))
BEGIN
    DECLARE prefix VARCHAR(10);
    DECLARE num INT;
    DECLARE suffix VARCHAR(4);

    -- Get random prefix
    SELECT ps.prefix, ps.last_number + 1 INTO prefix, num
    FROM pseudonym_sequence ps
    ORDER BY RAND()
    LIMIT 1
    FOR UPDATE;

    -- Update sequence
    UPDATE pseudonym_sequence SET last_number = num WHERE prefix = prefix;

    -- Generate random suffix
    SET suffix = CONCAT(
        CHAR(65 + FLOOR(RAND() * 26)),
        FLOOR(RAND() * 10),
        CHAR(65 + FLOOR(RAND() * 26)),
        FLOOR(RAND() * 10)
    );

    SET new_pseudonym = CONCAT(prefix, '-', num, suffix);
END //

-- Generate QR code identifier
CREATE PROCEDURE generate_qr_code(OUT qr_code VARCHAR(100))
BEGIN
    SET qr_code = CONCAT(
        'NSN-',
        DATE_FORMAT(NOW(), '%Y%m'),
        '-',
        UUID_SHORT()
    );
END //

-- Check if hospital subscription is valid
CREATE FUNCTION is_subscription_valid(p_hospital_id INT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE is_valid BOOLEAN DEFAULT FALSE;

    SELECT
        (is_active = TRUE
         AND CURDATE() BETWEEN start_date AND end_date
         AND current_month_submissions < max_monthly_submissions)
    INTO is_valid
    FROM icu_subscription
    WHERE hospital_id = p_hospital_id
    AND is_active = TRUE
    LIMIT 1;

    RETURN COALESCE(is_valid, FALSE);
END //

-- Evaluate admission criteria and calculate score
CREATE PROCEDURE evaluate_admission_criteria(IN p_admission_id INT)
BEGIN
    DECLARE total_score INT DEFAULT 0;
    DECLARE mandatory_met BOOLEAN DEFAULT TRUE;
    DECLARE all_met BOOLEAN DEFAULT TRUE;

    -- Calculate total score
    SELECT
        SUM(CASE WHEN cc.is_met THEN ac.weight ELSE 0 END),
        MIN(CASE WHEN ac.is_mandatory AND NOT cc.is_met THEN FALSE ELSE TRUE END),
        MIN(cc.is_met)
    INTO total_score, mandatory_met, all_met
    FROM criteria_checklist cc
    JOIN admission_criteria ac ON cc.criteria_id = ac.criteria_id
    WHERE cc.admission_id = p_admission_id;

    -- Update admission
    UPDATE admission
    SET
        criteria_score = COALESCE(total_score, 0),
        mandatory_criteria_met = COALESCE(mandatory_met, FALSE),
        criteria_met = COALESCE(mandatory_met, FALSE)
    WHERE admission_id = p_admission_id;
END //

DELIMITER ;

-- =============================================
-- VIEWS
-- =============================================

CREATE VIEW v_active_subscriptions AS
SELECT
    h.hospital_id,
    h.name AS hospital_name,
    h.city,
    s.subscription_id,
    s.subscription_tier,
    s.start_date,
    s.end_date,
    s.max_monthly_submissions,
    s.current_month_submissions,
    (s.max_monthly_submissions - s.current_month_submissions) AS remaining_submissions
FROM hospital h
JOIN icu_subscription s ON h.hospital_id = s.hospital_id
WHERE s.is_active = TRUE
AND CURDATE() BETWEEN s.start_date AND s.end_date;

CREATE VIEW v_active_admissions AS
SELECT
    a.admission_id,
    a.case_number,
    p.pseudonym,
    p.qr_code,
    p.gender,
    p.date_of_birth,
    h.name AS hospital_name,
    iu.name AS icu_name,
    sa.shock_type,
    sa.scai_stage,
    a.bed_number,
    a.admission_date,
    a.status,
    a.criteria_score,
    a.criteria_met
FROM admission a
JOIN patient p ON a.patient_id = p.patient_id
JOIN icu_subscription s ON a.subscription_id = s.subscription_id
JOIN hospital h ON s.hospital_id = h.hospital_id
JOIN icu_unit iu ON a.icu_id = iu.icu_id
LEFT JOIN shock_assessment sa ON a.admission_id = sa.admission_id
WHERE a.status IN ('Admitted', 'Approved')
ORDER BY a.admission_date DESC;

CREATE VIEW v_pending_approvals AS
SELECT
    a.admission_id,
    a.case_number,
    p.pseudonym,
    h.name AS hospital_name,
    CONCAT(ph.first_name, ' ', ph.last_name) AS submitting_physician,
    a.submission_date,
    a.criteria_score,
    a.mandatory_criteria_met,
    sa.shock_type,
    sa.scai_stage
FROM admission a
JOIN patient p ON a.patient_id = p.patient_id
JOIN icu_subscription s ON a.subscription_id = s.subscription_id
JOIN hospital h ON s.hospital_id = h.hospital_id
JOIN physician ph ON a.physician_id = ph.physician_id
LEFT JOIN shock_assessment sa ON a.admission_id = sa.admission_id
WHERE a.status IN ('Pending', 'Under Review')
ORDER BY a.submission_date ASC;
