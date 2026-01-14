-- =============================================================================
-- NATIONAL SHOCK NET ICU - SCHEMA ADDITIONS
-- Based on OCR data from: Blood Gas Analyzers, ICU Monitors, Ventilators, Lab Reports
-- =============================================================================

-- =============================================================================
-- 1. VENTILATOR SETTINGS (NEW TABLE)
-- Source: Dräger Evita XL, Servo-i, Hamilton, etc.
-- =============================================================================

CREATE TABLE ventilator_settings (
    vent_id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    timepoint VARCHAR(20) NOT NULL COMMENT 'admission / 6h / 12h / 24h / dayX',

    -- Device Info
    device_manufacturer VARCHAR(50) COMMENT 'Dräger, Servo, Hamilton, etc.',
    device_model VARCHAR(50) COMMENT 'Evita XL, Servo-i, etc.',

    -- Ventilation Mode
    vent_mode VARCHAR(30) COMMENT 'CPAP, ASB, SIMV, PCV, VCV, BIPAP, APRV, etc.',
    patient_type VARCHAR(20) DEFAULT 'Adult' COMMENT 'Adult / Pediatric / Neonatal',

    -- Oxygenation Settings
    fio2 INT COMMENT 'Fraction of Inspired O2 (%)',

    -- Pressure Settings (cmH2O or mbar)
    peep DECIMAL(4,1) COMMENT 'Positive End-Expiratory Pressure',
    ps_above_peep DECIMAL(4,1) COMMENT 'Pressure Support / ΔPASB above PEEP',
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
-- 2. ENHANCED BLOOD GAS TABLE (ALTER EXISTING OR CREATE NEW)
-- Source: GEM Premier 4000, Radiometer ABL, Siemens RAPIDPoint
-- =============================================================================

-- Drop and recreate with all fields from OCR
DROP TABLE IF EXISTS blood_gas;

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
-- 3. COMPREHENSIVE LABORATORY RESULTS (NEW TABLE)
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
    bilirubin_total DECIMAL(5,1) COMMENT 'Total Bilirubin (µmol/L)',
    bilirubin_direct DECIMAL(5,1) COMMENT 'Direct Bilirubin (µmol/L)',
    ast DECIMAL(5,0) COMMENT 'AST/GOT (U/L)',
    alt DECIMAL(5,0) COMMENT 'ALT/GPT (U/L)',
    alp DECIMAL(5,0) COMMENT 'Alkaline Phosphatase (U/L)',
    ggt DECIMAL(5,0) COMMENT 'Gamma-GT (U/L)',
    ldh DECIMAL(5,0) COMMENT 'Lactate Dehydrogenase (U/L)',

    -- RENAL FUNCTION
    urea DECIMAL(5,1) COMMENT 'Urea/BUN (mmol/L)',
    creatinine DECIMAL(5,0) COMMENT 'Creatinine (µmol/L)',
    egfr DECIMAL(5,1) COMMENT 'eGFR (mL/min/1.73m²)',
    egfr_category VARCHAR(10) COMMENT 'KDIGO Category (G1-G5)',
    uric_acid DECIMAL(5,0) COMMENT 'Uric Acid (µmol/L)',

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
    ferritin DECIMAL(6,0) COMMENT 'Ferritin (µg/L)',

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

    -- BLOOD GAS (redundant but may come from different source)
    ph_lab DECIMAL(4,3),
    pco2_lab DECIMAL(5,1) COMMENT 'mmHg',
    po2_lab DECIMAL(5,1) COMMENT 'mmHg',
    lactate_lab DECIMAL(4,2) COMMENT 'mmol/L',

    FOREIGN KEY (admission_id) REFERENCES admission(admission_id) ON DELETE CASCADE,
    INDEX idx_lab_admission (admission_id),
    INDEX idx_lab_timepoint (timepoint)
);

-- =============================================================================
-- 4. ENHANCED HEMODYNAMIC DATA TABLE
-- Source: ICU Monitors (Dräger Infinity, Philips, GE)
-- =============================================================================

-- Add columns to existing hemodynamic_data if needed
ALTER TABLE hemodynamic_data
    ADD COLUMN IF NOT EXISTS etco2 INT COMMENT 'End-tidal CO2 (mmHg)' AFTER spo2,
    ADD COLUMN IF NOT EXISTS cvp DECIMAL(4,1) COMMENT 'Central Venous Pressure (mmHg)' AFTER etco2,
    ADD COLUMN IF NOT EXISTS nibp_systolic INT COMMENT 'Non-invasive BP Systolic (mmHg)' AFTER body_temperature,
    ADD COLUMN IF NOT EXISTS nibp_diastolic INT COMMENT 'Non-invasive BP Diastolic (mmHg)' AFTER nibp_systolic,
    ADD COLUMN IF NOT EXISTS nibp_map INT COMMENT 'Non-invasive MAP (mmHg)' AFTER nibp_diastolic,
    ADD COLUMN IF NOT EXISTS art_systolic INT COMMENT 'Arterial Line Systolic (mmHg)' AFTER nibp_map,
    ADD COLUMN IF NOT EXISTS art_diastolic INT COMMENT 'Arterial Line Diastolic (mmHg)' AFTER art_systolic,
    ADD COLUMN IF NOT EXISTS art_map INT COMMENT 'Arterial Line MAP (mmHg)' AFTER art_diastolic,
    ADD COLUMN IF NOT EXISTS monitor_device VARCHAR(50) COMMENT 'Monitor model' AFTER recorded_at;

-- =============================================================================
-- 5. VIEWS FOR DATA VALIDATION
-- =============================================================================

CREATE OR REPLACE VIEW v_latest_blood_gas AS
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

CREATE OR REPLACE VIEW v_latest_ventilator AS
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
-- 6. SAMPLE DATA FOR NEW TABLES (Based on OCR from photos)
-- =============================================================================

-- Sample Ventilator Data (from Dräger Evita XL photo)
INSERT INTO ventilator_settings (admission_id, timepoint, device_manufacturer, device_model, vent_mode, fio2, peep, ps_above_peep, ppeak, pmean, vt_measured, vte, rr_total, rr_spontaneous, mv_total, mv_spontaneous, compliance_dynamic, resistance) VALUES
(1, 'admission', 'Dräger', 'Evita XL', 'CPAP/ASB', 40, 8, 10, 22, 11, 0.417, 0.437, 18, 19, 7.73, 7.70, 44.7, 8.3);

-- Sample Blood Gas Data (from GEM Premier 4000 photo)
INSERT INTO blood_gas (admission_id, timepoint, sample_type, analyzer_model, ph, pco2, pco2_unit, po2, po2_unit, sodium, potassium, chloride, calcium_ionized, glucose, lactate, thb, o2hb, cohb, methb, hhb, so2_measured, tco2, hco3_actual, hco3_standard, be_ecf, be_blood, anion_gap, ca_corrected, so2_calculated, hct_calculated) VALUES
(1, 'admission', 'Arterial', 'GEM Premier 4000', 7.36, 5.8, 'kPa', 12.1, 'kPa', 142, 4.1, 112, 1.15, 7.6, 1.2, 142, 95.0, 3.5, 1.5, 0.0, 100.0, 26.3, 24.9, 24.2, -0.5, -0.8, 9, 1.13, 96.7, 43);

-- Sample Laboratory Results (from lab report photo)
INSERT INTO laboratory_results (admission_id, timepoint, rbc, hemoglobin, hematocrit, mcv, mch, mchc, rdw, wbc, neutrophils_pct, lymphocytes_pct, monocytes_pct, eosinophils_pct, basophils_pct, neutrophils_abs, lymphocytes_abs, monocytes_abs, eosinophils_abs, basophils_abs, platelets, mpv, aptt, fibrinogen, d_dimer, bilirubin_total, urea, creatinine, egfr, egfr_category, alp, alt, ggt, calcium_total, phosphate, magnesium, total_protein, albumin, crp) VALUES
(1, 'admission', 2.97, 86, 0.268, 90.2, 29.0, 321, 15.1, 3.4, 72.9, 17.1, 5.6, 4.1, 0.3, 2.48, 0.58, 0.19, 0.14, 0.01, 256, 9.7, 30.3, 4.1, 5.16, 11, 7.6, 77, 83, 'G2', 407, 57, 56, 1.87, 0.63, 0.81, 48, 23.0, 86.8);
