/**
 * Application route definitions
 */
export const ROUTES = {
  // Auth routes
  ROOT: '/',
  HOSPITAL_LOGIN: '/hospital/login',
  ADMIN_LOGIN: '/admin/login',

  // Hospital Portal routes
  HOSPITAL: {
    ROOT: '/hospital',
    DASHBOARD: '/hospital/dashboard',
    PATIENTS: '/hospital/patients',
    NEW_PATIENT: '/hospital/patients/new',
    MEDICAL_HISTORY: '/hospital/medical-history',
    MEDICAL_HISTORY_BY_TT: '/hospital/medical-history/:tt',
    MEDICATIONS: '/hospital/medications',
    MEDICATIONS_BY_TT: '/hospital/medications/:tt',
    ADMISSION: '/hospital/admission',
    ADMISSION_BY_ID: '/hospital/admission/:patientId',
    DAILY_ENTRY: '/hospital/daily-entry',
    DAILY_ENTRY_BY_ID: '/hospital/daily-entry/:patientId',
    MCS: '/hospital/mcs',
    MCS_BY_TT: '/hospital/mcs/:tt',
    DISCHARGE: '/hospital/discharge',
    DISCHARGE_BY_ID: '/hospital/discharge/:patientId',
    SUBSCRIPTION: '/hospital/subscription',
  },

  // Admin Portal routes
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    SUBSCRIPTIONS: '/admin/subscriptions',
    SUBSCRIPTION_DETAIL: '/admin/subscriptions/:subscriptionId',
    CASES: '/admin/cases',
    CASE_DETAIL: '/admin/cases/:caseId',
    HOSPITALS: '/admin/hospitals',
    HOSPITAL_DETAIL: '/admin/hospitals/:hospitalId',
    REPORTS: '/admin/reports',
    AUDIT: '/admin/audit',
    ARCHIVE: '/admin/archive',
  },
} as const;

// Hospital portal tab configuration
export const HOSPITAL_TABS = [
  { id: 'dashboard', label: 'Dashboard', path: ROUTES.HOSPITAL.DASHBOARD },
  { id: 'patients', label: 'My Patients', path: ROUTES.HOSPITAL.PATIENTS },
  { id: 'new-patient', label: 'New Patient', path: ROUTES.HOSPITAL.NEW_PATIENT },
  { id: 'medical-history', label: 'History', path: ROUTES.HOSPITAL.MEDICAL_HISTORY },
  { id: 'medications', label: 'Medications', path: ROUTES.HOSPITAL.MEDICATIONS },
  { id: 'admission', label: 'ICU Admission', path: ROUTES.HOSPITAL.ADMISSION },
  { id: 'daily-entry', label: 'Daily Entry', path: ROUTES.HOSPITAL.DAILY_ENTRY },
  { id: 'mcs', label: 'MCS', path: ROUTES.HOSPITAL.MCS },
  { id: 'discharge', label: 'Discharge', path: ROUTES.HOSPITAL.DISCHARGE },
  { id: 'subscription', label: 'Subscription', path: ROUTES.HOSPITAL.SUBSCRIPTION },
] as const;

// Admin portal sidebar navigation
export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD, icon: 'home' },
  { id: 'subscriptions', label: 'Subscriptions', path: ROUTES.ADMIN.SUBSCRIPTIONS, icon: 'document', badge: true },
  { id: 'cases', label: 'Case Review', path: ROUTES.ADMIN.CASES, icon: 'clipboard', badge: true },
  { id: 'hospitals', label: 'Hospitals', path: ROUTES.ADMIN.HOSPITALS, icon: 'building' },
  { id: 'reports', label: 'Reports', path: ROUTES.ADMIN.REPORTS, icon: 'chart' },
  { id: 'audit', label: 'Audit Log', path: ROUTES.ADMIN.AUDIT, icon: 'clock' },
  { id: 'archive', label: 'Archive Lookup', path: ROUTES.ADMIN.ARCHIVE, icon: 'archive' },
] as const;
