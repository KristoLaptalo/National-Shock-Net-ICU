-- =============================================================================
-- NATIONAL SHOCK NET ICU - SAMPLE TEST DATA
-- =============================================================================

-- =============================================================================
-- HOSPITALS
-- =============================================================================

INSERT INTO hospital (name, city, address, phone, type) VALUES
('University Hospital Centre Zagreb', 'Zagreb', 'Kišpatićeva 12', '+385-1-2388-888', 'University'),
('Clinical Hospital Centre Rijeka', 'Rijeka', 'Krešimirova 42', '+385-51-658-111', 'University'),
('Clinical Hospital Centre Split', 'Split', 'Spinčićeva 1', '+385-21-556-111', 'University'),
('General Hospital Zadar', 'Zadar', 'Bože Peričića 5', '+385-23-505-505', 'General'),
('Clinical Hospital Dubrava', 'Zagreb', 'Avenija Gojka Šuška 6', '+385-1-290-2444', 'General'),
('Clinical Hospital Merkur', 'Zagreb', 'Zajčeva 19', '+385-1-2431-390', 'General'),
('General Hospital Pula', 'Pula', 'Santoriova 24a', '+385-52-376-600', 'Regional'),
('Private Hospital Medico', 'Zagreb', 'Vukovarska 123', '+385-1-555-1234', 'Private');

-- =============================================================================
-- ICU SUBSCRIPTIONS
-- =============================================================================

INSERT INTO icu_subscription (hospital_id, subscription_tier, contract_number, start_date, end_date, is_active, max_beds, max_monthly_submissions) VALUES
(1, 'Unlimited', 'NSN-2026-001', '2026-01-01', '2026-12-31', TRUE, 50, 999),
(2, 'Premium', 'NSN-2026-002', '2026-01-01', '2026-12-31', TRUE, 30, 100),
(3, 'Premium', 'NSN-2026-003', '2026-01-01', '2026-12-31', TRUE, 30, 100),
(4, 'Standard', 'NSN-2026-004', '2026-01-01', '2026-12-31', TRUE, 15, 50),
(5, 'Standard', 'NSN-2026-005', '2026-01-01', '2026-12-31', TRUE, 20, 50),
(6, 'Basic', 'NSN-2026-006', '2026-01-01', '2026-12-31', TRUE, 10, 25),
(7, 'Basic', 'NSN-2026-007', '2026-01-01', '2026-06-30', FALSE, 10, 25), -- Expired
(8, 'Standard', 'NSN-2026-008', '2026-01-01', '2026-12-31', TRUE, 12, 40);

-- =============================================================================
-- ICU UNITS
-- =============================================================================

INSERT INTO icu_unit (hospital_id, name, type, total_beds, is_active) VALUES
(1, 'Cardiac ICU', 'Cardiac', 16, TRUE),
(1, 'Medical ICU', 'Medical', 20, TRUE),
(1, 'Coronary Care Unit', 'Coronary', 12, TRUE),
(2, 'Mixed ICU', 'Mixed', 18, TRUE),
(2, 'Cardiac ICU', 'Cardiac', 10, TRUE),
(3, 'Central ICU', 'Mixed', 22, TRUE),
(4, 'General ICU', 'Mixed', 12, TRUE),
(5, 'Surgical ICU', 'Surgical', 14, TRUE),
(5, 'Medical ICU', 'Medical', 10, TRUE),
(6, 'ICU', 'Mixed', 8, TRUE),
(8, 'Private ICU', 'Mixed', 10, TRUE);

-- =============================================================================
-- PHYSICIANS
-- =============================================================================

INSERT INTO physician (hospital_id, first_name, last_name, specialty, license_number, email, phone) VALUES
(1, 'Ivan', 'Horvat', 'Cardiology', 'HR-MED-10001', 'ivan.horvat@kbc-zagreb.hr', '+385-91-1234-001'),
(1, 'Ana', 'Kovačević', 'Intensive Care', 'HR-MED-10002', 'ana.kovacevic@kbc-zagreb.hr', '+385-91-1234-002'),
(1, 'Marko', 'Novak', 'Cardiology', 'HR-MED-10003', 'marko.novak@kbc-zagreb.hr', '+385-91-1234-003'),
(2, 'Petra', 'Jurić', 'Intensive Care', 'HR-MED-20001', 'petra.juric@kbc-rijeka.hr', '+385-91-2234-001'),
(2, 'Luka', 'Babić', 'Cardiology', 'HR-MED-20002', 'luka.babic@kbc-rijeka.hr', '+385-91-2234-002'),
(3, 'Marina', 'Perić', 'Intensive Care', 'HR-MED-30001', 'marina.peric@kbc-split.hr', '+385-91-3234-001'),
(4, 'Tomislav', 'Knežević', 'Internal Medicine', 'HR-MED-40001', 'tomislav.knezevic@ob-zadar.hr', '+385-91-4234-001'),
(5, 'Ivana', 'Šimić', 'Cardiology', 'HR-MED-50001', 'ivana.simic@kb-dubrava.hr', '+385-91-5234-001'),
(6, 'Ante', 'Matić', 'Internal Medicine', 'HR-MED-60001', 'ante.matic@kb-merkur.hr', '+385-91-6234-001'),
(8, 'Josip', 'Vuković', 'Cardiology', 'HR-MED-80001', 'josip.vukovic@medico.hr', '+385-91-8234-001');

-- =============================================================================
-- ADMIN USERS
-- =============================================================================

INSERT INTO admin_user (username, password_hash, first_name, last_name, role, email, can_view_identity) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4S', 'System', 'Administrator', 'SuperAdmin', 'admin@shocknet.hr', TRUE),
('reviewer1', '$2b$12$ABC123...', 'Maja', 'Tomić', 'Reviewer', 'maja.tomic@shocknet.hr', FALSE),
('reviewer2', '$2b$12$DEF456...', 'Filip', 'Grgić', 'Reviewer', 'filip.grgic@shocknet.hr', FALSE),
('datamanager', '$2b$12$GHI789...', 'Karla', 'Božić', 'DataManager', 'karla.bozic@shocknet.hr', TRUE);

-- =============================================================================
-- PATIENTS (ANONYMIZED)
-- =============================================================================

INSERT INTO patient (patient_code, qr_code, encrypted_identity, national_id_hash, date_of_birth, age, gender, weight_kg, height_cm, bsa, bmi) VALUES
('ALPHA-001A7X', 'NSN-202601-000001', NULL, 'a1b2c3d4e5f6...hash1', '1955-03-15', 71, 'M', 85.5, 178, 2.03, 27.0),
('BETA-002B8Y', 'NSN-202601-000002', NULL, 'b2c3d4e5f6g7...hash2', '1948-07-22', 78, 'F', 62.0, 158, 1.63, 24.8),
('GAMMA-003C9Z', 'NSN-202601-000003', NULL, 'c3d4e5f6g7h8...hash3', '1962-11-08', 64, 'M', 92.0, 175, 2.08, 30.0),
('DELTA-004D1A', 'NSN-202601-000004', NULL, 'd4e5f6g7h8i9...hash4', '1970-05-30', 56, 'F', 71.0, 165, 1.78, 26.1),
('SIGMA-005E2B', 'NSN-202601-000005', NULL, 'e5f6g7h8i9j0...hash5', '1958-09-12', 68, 'M', 78.0, 172, 1.91, 26.4),
('ALPHA-006F3C', 'NSN-202601-000006', NULL, 'f6g7h8i9j0k1...hash6', '1945-01-25', 81, 'M', 68.0, 168, 1.77, 24.1),
('BETA-007G4D', 'NSN-202601-000007', NULL, 'g7h8i9j0k1l2...hash7', '1972-12-03', 54, 'F', 58.0, 162, 1.61, 22.1),
('GAMMA-008H5E', 'NSN-202601-000008', NULL, 'h8i9j0k1l2m3...hash8', '1965-06-18', 61, 'M', 105.0, 182, 2.26, 31.7),
('DELTA-009I6F', 'NSN-202601-000009', NULL, 'i9j0k1l2m3n4...hash9', '1980-04-07', 46, 'F', 65.0, 170, 1.75, 22.5),
('SIGMA-010J7G', 'NSN-202601-000010', NULL, 'j0k1l2m3n4o5...hash10', '1952-08-29', 74, 'M', 82.0, 176, 1.98, 26.5);

-- =============================================================================
-- ADMISSIONS
-- =============================================================================

INSERT INTO admission (patient_id, subscription_id, icu_id, physician_id, approved_by, case_number, date_of_admission, date_of_shock_onset, point_of_referral, referral_hospital, status, bed_number, admission_date) VALUES
(1, 1, 1, 1, 1, 'NSN-2026-0001', '2026-01-02', '2026-01-02', 0, NULL, 'Admitted', 'CICU-01', '2026-01-02 08:30:00'),
(2, 1, 2, 2, 1, 'NSN-2026-0002', '2026-01-03', '2026-01-02', 3, 'General Hospital Sisak', 'Admitted', 'MICU-05', '2026-01-03 14:15:00'),
(3, 2, 4, 4, 2, 'NSN-2026-0003', '2026-01-05', '2026-01-05', 1, NULL, 'Admitted', 'ICU-03', '2026-01-05 22:45:00'),
(4, 3, 6, 6, 2, 'NSN-2026-0004', '2026-01-06', '2026-01-06', 0, NULL, 'Admitted', 'ICU-08', '2026-01-06 11:20:00'),
(5, 1, 3, 3, 1, 'NSN-2026-0005', '2026-01-07', '2026-01-07', 2, NULL, 'Discharged', 'CCU-02', '2026-01-07 06:00:00'),
(6, 4, 7, 7, 3, 'NSN-2026-0006', '2026-01-08', '2026-01-08', 0, NULL, 'Admitted', 'ICU-01', '2026-01-08 19:30:00'),
(7, 5, 8, 8, 1, 'NSN-2026-0007', '2026-01-09', '2026-01-09', 1, NULL, 'Discharged', 'SICU-04', '2026-01-09 03:45:00'),
(8, 1, 1, 1, 1, 'NSN-2026-0008', '2026-01-10', '2026-01-10', 0, NULL, 'Admitted', 'CICU-03', '2026-01-10 16:00:00'),
(9, 8, 11, 10, 2, 'NSN-2026-0009', '2026-01-11', '2026-01-11', 3, 'Private Clinic Sunce', 'Under Review', NULL, NULL),
(10, 2, 5, 5, NULL, 'NSN-2026-0010', '2026-01-12', '2026-01-12', 0, NULL, 'Pending', NULL, NULL);

-- =============================================================================
-- MEDICAL HISTORY
-- =============================================================================

INSERT INTO medical_history (admission_id, cad, prior_revascularization, history_mi, chronic_heart_failure, severe_valvular_disease, atrial_fib_flutter, implanted_pacemaker, cerebrovascular_disease, prior_tia_insult, hemiplegia_motor_deficit, dementia, psychiatric_disease, diabetes, hypertension, dyslipidemia, adiposity, liver_disease, peripheral_artery_disease, chronic_kidney_disease, chronic_pulmonary_disease, pulmonary_hypertension, chronic_gastric_disorder, connective_tissue_disorder, autoimmune_disorder, leukemia, lymphoma, solid_organ_tumor, hiv_aids, charlson_comorbidity_index) VALUES
-- Patient 1: 71M with extensive cardiac history (STEMI case)
(1, 1, 1, 1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6),
-- Patient 2: 78F with septic shock, multiple comorbidities
(2, 0, 0, 0, 0, 0, 3, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 7),
-- Patient 3: 64M with cardiogenic shock, obesity
(3, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 4),
-- Patient 4: 56F with PE causing obstructive shock
(4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2),
-- Patient 5: 68M with NSTEMI (discharged)
(5, 1, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 5),
-- Patient 6: 81M with severe CHF exacerbation
(6, 1, 1, 1, 4, 1, 2, 3, 1, 0, 0, 0, 0, 2, 2, 1, 0, 0, 1, 3, 2, 2, 0, 0, 0, 0, 0, 0, 0, 9),
-- Patient 7: 54F with postpartum cardiomyopathy (discharged)
(7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 8: 61M with massive MI, cardiogenic shock
(8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 2, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 4);

-- =============================================================================
-- WORKING DIAGNOSES
-- =============================================================================

INSERT INTO working_diagnosis (admission_id, acute_coronary_syndrome, acute_myocarditis, heart_failure, takotsubo_syndrome, peripartum_cardiomyopathy, acute_aortic_syndrome, electrical_storm, sepsis, pneumonia, ards, pulmonary_embolism, multi_organ_failure, trauma_cns, polytrauma, penetrating_injury, trauma_other, postpartum_hemorrhage, heat_shock, dehydration, drowning, intracerebral_hemorrhage, out_of_hospital_cardiac_arrest, in_hospital_cardiac_arrest) VALUES
-- Patient 1: STEMI with cardiogenic shock
(1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 2: Sepsis with pneumonia, ARDS
(2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 3: NSTEMI with acute HF
(3, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 4: Massive PE
(4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 5: NSTEMI (discharged, recovered)
(5, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 6: Acute on chronic HF, electrical storm
(6, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
-- Patient 7: Peripartum cardiomyopathy
(7, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 8: STEMI with OHCA
(8, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0);

-- =============================================================================
-- SHOCK CLASSIFICATION
-- =============================================================================

INSERT INTO shock_classification (admission_id, shock_cardiogenic, scai_classification, shock_distributive, distributive_type, shock_obstructive, obstructive_type, shock_hypovolemic, atls_classification, shock_mixed, congestion, perfusion, sofa_score) VALUES
-- Patient 1: Cardiogenic shock SCAI D
(1, 1, 'D', 0, NULL, 0, NULL, 0, NULL, 0, 2, 2, 8),
-- Patient 2: Septic shock (distributive)
(2, 0, NULL, 1, 1, 0, NULL, 0, NULL, 0, 1, 2, 12),
-- Patient 3: Cardiogenic shock SCAI C
(3, 1, 'C', 0, NULL, 0, NULL, 0, NULL, 0, 2, 2, 6),
-- Patient 4: Obstructive shock (PE)
(4, 0, NULL, 0, NULL, 1, 2, 0, NULL, 0, 1, 2, 7),
-- Patient 5: Cardiogenic shock SCAI B (recovered)
(5, 1, 'B', 0, NULL, 0, NULL, 0, NULL, 0, 2, 1, 4),
-- Patient 6: Cardiogenic shock SCAI E (critical)
(6, 1, 'E', 0, NULL, 0, NULL, 0, NULL, 0, 2, 2, 14),
-- Patient 7: Cardiogenic shock SCAI C (recovered)
(7, 1, 'C', 0, NULL, 0, NULL, 0, NULL, 0, 2, 2, 5),
-- Patient 8: Mixed cardiogenic + distributive
(8, 1, 'D', 1, 1, 0, NULL, 0, NULL, 1, 2, 2, 11);

-- =============================================================================
-- HEMODYNAMIC DATA (Admission values)
-- =============================================================================

INSERT INTO hemodynamic_data (admission_id, timepoint, sap_invasive, dap_invasive, map_invasive, pulse, rhythm, respiratory_rate, spo2, body_temperature, recorded_at) VALUES
-- Patient 1
(1, 'admission', 78, 45, 56, 112, 'Sinus tachycardia', 24, 89, 36.8, '2026-01-02 08:30:00'),
(1, '6h', 85, 52, 63, 98, 'Sinus tachycardia', 20, 94, 37.0, '2026-01-02 14:30:00'),
(1, '12h', 92, 58, 69, 88, 'Sinus rhythm', 18, 96, 36.9, '2026-01-02 20:30:00'),
(1, '24h', 105, 65, 78, 82, 'Sinus rhythm', 16, 97, 36.7, '2026-01-03 08:30:00'),
-- Patient 2
(2, 'admission', 65, 38, 47, 125, 'Sinus tachycardia', 28, 85, 39.2, '2026-01-03 14:15:00'),
(2, '6h', 72, 42, 52, 118, 'Sinus tachycardia', 26, 88, 38.8, '2026-01-03 20:15:00'),
(2, '12h', 78, 48, 58, 110, 'Sinus tachycardia', 24, 91, 38.2, '2026-01-04 02:15:00'),
-- Patient 3
(3, 'admission', 82, 50, 61, 95, 'Atrial fibrillation', 22, 92, 36.5, '2026-01-05 22:45:00'),
(3, '6h', 88, 55, 66, 88, 'Atrial fibrillation', 20, 95, 36.6, '2026-01-06 04:45:00'),
-- Patient 4
(4, 'admission', 70, 42, 51, 130, 'Sinus tachycardia', 32, 82, 37.1, '2026-01-06 11:20:00'),
(4, '6h', 95, 60, 72, 105, 'Sinus tachycardia', 24, 94, 37.0, '2026-01-06 17:20:00'),
-- Patient 6 (critical)
(6, 'admission', 58, 35, 43, 140, 'Ventricular tachycardia', 30, 78, 35.8, '2026-01-08 19:30:00'),
(6, '6h', 65, 40, 48, 125, 'Atrial fibrillation', 28, 84, 36.2, '2026-01-09 01:30:00'),
-- Patient 8
(8, 'admission', 55, 32, 40, 45, 'Bradycardia', 8, 70, 34.5, '2026-01-10 16:00:00'),
(8, '6h', 72, 45, 54, 88, 'Sinus rhythm', 18, 92, 36.0, '2026-01-10 22:00:00');

-- =============================================================================
-- ECHOCARDIOGRAPHY
-- =============================================================================

INSERT INTO echocardiography (admission_id, timepoint, echo_performed, lv_function_visual, rv_function_visual, lvef, lvef_assessment, gls, mitral_regurgitation, mitral_stenosis, aortic_regurgitation, aortic_stenosis, tricuspid_regurgitation, pulmonary_stenosis, pulmonary_regurgitation, lvot_vti, lvot_diameter, e_wave_velocity, deceleration_time_e, a_wave_velocity, ivc_status, performed_at) VALUES
-- Patient 1: Severely reduced LVEF
(1, 'admission', 1, 0, 1, 25, 1, -8, 2, 0, 0, 0, 2, 0, 0, 12.5, 2.1, 95, 140, 45, 3, '2026-01-02 09:00:00'),
-- Patient 2: Preserved EF, septic
(2, 'admission', 1, 1, 1, 55, 0, -18, 0, 0, 0, 0, 1, 0, 0, 22.0, 2.0, 80, 180, 70, 2, '2026-01-03 15:00:00'),
-- Patient 3: Moderately reduced
(3, 'admission', 1, 0, 1, 35, 1, -12, 1, 0, 0, 0, 1, 0, 0, 15.8, 2.2, 110, 120, 35, 2, '2026-01-05 23:30:00'),
-- Patient 4: RV dysfunction from PE
(4, 'admission', 1, 1, 0, 58, 0, -19, 0, 0, 0, 0, 2, 0, 0, 20.5, 1.9, 75, 200, 65, 3, '2026-01-06 12:00:00'),
-- Patient 6: Severely reduced, dilated
(6, 'admission', 1, 0, 0, 15, 1, -5, 1, 0, 1, 0, 2, 0, 1, 8.2, 2.4, 120, 100, NULL, 3, '2026-01-08 20:00:00'),
-- Patient 8: Severely reduced post-MI
(8, 'admission', 1, 0, 1, 20, 1, -6, 2, 0, 0, 0, 1, 0, 0, 10.1, 2.0, 100, 130, 40, 3, '2026-01-10 17:00:00');

-- =============================================================================
-- SWAN-GANZ DATA
-- =============================================================================

INSERT INTO swan_ganz (admission_id, timepoint, sg_performed, pcwp, spap, mpap, dpap, srvp, drvp, rap, co_thermodilution, co_fick, cardiac_index, papi, performed_at) VALUES
-- Patient 1: High filling pressures, low CO
(1, 'admission', 1, 28, 55, 38, 28, 55, 12, 18, 3.2, 3.0, 1.58, 1.5, '2026-01-02 10:00:00'),
(1, '24h', 1, 22, 48, 32, 22, 48, 10, 14, 4.1, 3.9, 2.02, 2.1, '2026-01-03 10:00:00'),
-- Patient 3: Elevated PCWP
(3, 'admission', 1, 24, 50, 35, 24, 50, 10, 12, 3.8, 3.6, 1.83, 1.8, '2026-01-06 00:30:00'),
-- Patient 6: Very high pressures, very low CO
(6, 'admission', 1, 35, 72, 52, 38, 72, 18, 22, 2.4, 2.2, 1.36, 1.1, '2026-01-08 21:00:00'),
-- Patient 8: Post-arrest hemodynamics
(8, 'admission', 1, 30, 58, 42, 30, 58, 14, 20, 2.8, 2.6, 1.24, 1.3, '2026-01-10 18:00:00');

-- =============================================================================
-- BLOOD GAS DATA
-- =============================================================================

INSERT INTO blood_gas (admission_id, timepoint, ph, po2, pco2, sodium, potassium, calcium, lactate, hco3, base_excess, sao2, scvo2, svo2, hemoglobin, hematocrit, collected_at) VALUES
-- Patient 1
(1, 'admission', 7.28, 65, 38, 138, 4.8, 1.12, 4.8, 18.2, -7.5, 88, 52, 48, 12.5, 38, '2026-01-02 08:35:00'),
(1, '6h', 7.32, 82, 36, 140, 4.2, 1.15, 3.2, 19.8, -5.2, 94, 58, 54, 11.8, 36, '2026-01-02 14:35:00'),
(1, '12h', 7.36, 95, 38, 139, 4.0, 1.18, 2.1, 21.5, -3.0, 96, 62, 58, 11.2, 34, '2026-01-02 20:35:00'),
(1, '24h', 7.40, 105, 40, 141, 3.9, 1.20, 1.4, 24.0, -1.0, 98, 68, 64, 10.8, 33, '2026-01-03 08:35:00'),
-- Patient 2: Septic, high lactate
(2, 'admission', 7.22, 58, 32, 134, 5.5, 1.05, 8.5, 13.5, -12.0, 82, 45, NULL, 9.8, 30, '2026-01-03 14:20:00'),
(2, '6h', 7.26, 72, 34, 136, 5.0, 1.08, 6.2, 15.5, -9.5, 88, 50, NULL, 9.2, 28, '2026-01-03 20:20:00'),
(2, '12h', 7.30, 85, 36, 138, 4.5, 1.10, 4.5, 17.8, -7.0, 92, 55, NULL, 8.8, 27, '2026-01-04 02:20:00'),
-- Patient 3
(3, 'admission', 7.30, 70, 42, 140, 4.6, 1.14, 3.8, 20.5, -5.0, 91, 55, 52, 13.2, 40, '2026-01-05 22:50:00'),
-- Patient 4: PE, hypoxic
(4, 'admission', 7.35, 52, 28, 142, 4.2, 1.16, 3.2, 16.0, -8.0, 78, 48, NULL, 14.5, 44, '2026-01-06 11:25:00'),
(4, '6h', 7.38, 88, 35, 141, 4.0, 1.18, 1.8, 20.5, -4.0, 95, 60, NULL, 13.8, 42, '2026-01-06 17:25:00'),
-- Patient 6: Critical acidosis
(6, 'admission', 7.15, 55, 25, 130, 6.2, 0.98, 12.5, 9.0, -18.0, 75, 38, 35, 10.2, 31, '2026-01-08 19:35:00'),
(6, '6h', 7.20, 68, 30, 132, 5.8, 1.02, 9.8, 11.5, -14.5, 82, 42, 40, 9.5, 29, '2026-01-09 01:35:00'),
-- Patient 8: Post-arrest
(8, 'admission', 7.08, 45, 22, 128, 6.8, 0.92, 15.0, 7.5, -22.0, 65, 32, 30, 11.0, 33, '2026-01-10 16:05:00'),
(8, '6h', 7.25, 90, 38, 135, 5.2, 1.08, 6.5, 16.5, -9.0, 94, 52, 48, 10.2, 31, '2026-01-10 22:05:00');

-- =============================================================================
-- PRE-ADMISSION MEDICATIONS
-- =============================================================================

INSERT INTO pre_admission_medications (admission_id, warfarin, dabigatran, apixaban, rivaroxaban, edoxaban, aspirin, clopidogrel, ticagrelor, prasugrel, beta_blocker, ace_inhibitor, arb, arni, mra, sglt2_inhibitor, furosemide, sildenafil, flecainide, propafenone, verapamil_diltiazem, amiodarone, mexiletine, sotalol, dronedarone, other_antiarrhythmic, statin, ezetimibe, pcsk9_inhibitor, metformin, insulin, dpp4_inhibitor, pioglitazone, sulfonylurea, immunomodulator, corticosteroid_chronic, chemotherapy, inhaled_ics_lama_laba) VALUES
-- Patient 1: Cardiac meds
(1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 2: Elderly on anticoagulation
(2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
-- Patient 3: CHF meds
(3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 2, 0, 2, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 4: Minimal meds (cancer patient)
(4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0),
-- Patient 5: Full cardiac regimen
(5, 0, 0, 1, 0, 0, 1, 0, 1, 0, 3, 3, 0, 0, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 6: Advanced HF meds
(6, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 3, 3, 1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1),
-- Patient 7: No chronic meds (young)
(7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
-- Patient 8: Diabetic cardiac
(8, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0);

-- =============================================================================
-- FOLLOW-UP RECORDS
-- =============================================================================

INSERT INTO follow_up (admission_id, timepoint, notes, new_shock_event, recorded_at) VALUES
(1, '6h', 'Hemodynamically improving on norepinephrine 0.1 mcg/kg/min', 0, '2026-01-02 14:30:00'),
(1, '12h', 'Weaning vasopressors, MAP stable >65', 0, '2026-01-02 20:30:00'),
(1, '24h', 'Off vasopressors, stable', 0, '2026-01-03 08:30:00'),
(2, '6h', 'Started norepinephrine, antibiotics adjusted per cultures', 0, '2026-01-03 20:15:00'),
(2, '12h', 'Lactate trending down, still febrile', 0, '2026-01-04 02:15:00'),
(3, '6h', 'Diuresis initiated, NIPPV started', 0, '2026-01-06 04:45:00'),
(4, '6h', 'Post-thrombolysis, improving oxygenation', 0, '2026-01-06 17:20:00'),
(6, '6h', 'Required cardioversion x2, on amiodarone infusion', 1, '2026-01-09 01:30:00'),
(8, '6h', 'Post-PCI, IABP in place, improving hemodynamics', 0, '2026-01-10 22:00:00');

-- =============================================================================
-- OUTCOMES (for discharged patients)
-- =============================================================================

INSERT INTO outcome (admission_id, died_in_icu, transfer_from_icu, icu_discharge_date, died_in_hospital, inhospital_death_date, discharge_destination, hospital_discharge_date, length_of_stay_icu, length_of_stay_hospital) VALUES
-- Patient 5: Good outcome, discharged home
(5, 0, 0, '2026-01-11', 0, NULL, 0, '2026-01-14', 4, 7),
-- Patient 7: Good outcome, young patient
(7, 0, 0, '2026-01-12', 0, NULL, 0, '2026-01-16', 3, 7);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check data counts
SELECT 'hospital' as table_name, COUNT(*) as count FROM hospital
UNION ALL SELECT 'icu_subscription', COUNT(*) FROM icu_subscription
UNION ALL SELECT 'icu_unit', COUNT(*) FROM icu_unit
UNION ALL SELECT 'physician', COUNT(*) FROM physician
UNION ALL SELECT 'admin_user', COUNT(*) FROM admin_user
UNION ALL SELECT 'patient', COUNT(*) FROM patient
UNION ALL SELECT 'admission', COUNT(*) FROM admission
UNION ALL SELECT 'medical_history', COUNT(*) FROM medical_history
UNION ALL SELECT 'working_diagnosis', COUNT(*) FROM working_diagnosis
UNION ALL SELECT 'shock_classification', COUNT(*) FROM shock_classification
UNION ALL SELECT 'hemodynamic_data', COUNT(*) FROM hemodynamic_data
UNION ALL SELECT 'echocardiography', COUNT(*) FROM echocardiography
UNION ALL SELECT 'swan_ganz', COUNT(*) FROM swan_ganz
UNION ALL SELECT 'blood_gas', COUNT(*) FROM blood_gas
UNION ALL SELECT 'pre_admission_medications', COUNT(*) FROM pre_admission_medications
UNION ALL SELECT 'follow_up', COUNT(*) FROM follow_up
UNION ALL SELECT 'outcome', COUNT(*) FROM outcome;
