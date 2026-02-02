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
    // Patient detail routes (patient-centric workflow)
    PATIENT_DETAIL: '/hospital/patient/:tt',
    PATIENT_HISTORY: '/hospital/patient/:tt/history',
    PATIENT_MEDICATIONS: '/hospital/patient/:tt/medications',
    PATIENT_ADMISSION: '/hospital/patient/:tt/admission',
    PATIENT_DAILY_ENTRY: '/hospital/patient/:tt/daily-entry',
    PATIENT_MCS: '/hospital/patient/:tt/mcs',
    PATIENT_DISCHARGE: '/hospital/patient/:tt/discharge',
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
// Note: History, Medications, Admission, Daily Entry, MCS, and Discharge
// are now accessed via patient detail view (/hospital/patient/:tt/*)
export const HOSPITAL_TABS = [
  { id: 'dashboard', label: 'Dashboard', path: ROUTES.HOSPITAL.DASHBOARD },
  { id: 'patients', label: 'My Patients', path: ROUTES.HOSPITAL.PATIENTS },
  { id: 'new-patient', label: 'New Patient', path: ROUTES.HOSPITAL.NEW_PATIENT },
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
