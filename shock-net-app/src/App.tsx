/**
 * Main Application Component with Routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './config/routes';
import { AuthProvider } from './features/auth';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { HospitalLoginPage } from './pages/auth/HospitalLoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';

// Hospital Portal
import { HospitalLayout } from './pages/hospital/HospitalLayout';
import { DashboardPage as HospitalDashboard } from './pages/hospital/DashboardPage';
import { PatientsPage } from './pages/hospital/PatientsPage';
import { NewPatientPage } from './pages/hospital/NewPatientPage';
import { MedicalHistoryPage } from './pages/hospital/MedicalHistoryPage';
import { MedicationsPage } from './pages/hospital/MedicationsPage';
import { AdmissionPage } from './pages/hospital/AdmissionPage';
import { DailyEntryPage } from './pages/hospital/DailyEntryPage';
import { MCSPage } from './pages/hospital/MCSPage';
import { DischargePage } from './pages/hospital/DischargePage';
import { SubscriptionPage } from './pages/hospital/SubscriptionPage';

// Admin Portal
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { SubscriptionsPage } from './pages/admin/SubscriptionsPage';
import { CaseReviewPage } from './pages/admin/CaseReviewPage';
import { HospitalsPage } from './pages/admin/HospitalsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { ArchiveLookupPage } from './pages/admin/ArchiveLookupPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path={ROUTES.ROOT} element={<LoginPage />} />
          <Route path={ROUTES.HOSPITAL_LOGIN} element={<HospitalLoginPage />} />
          <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />

          {/* Hospital Portal Routes */}
          <Route path={ROUTES.HOSPITAL.ROOT} element={<HospitalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HospitalDashboard />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/new" element={<NewPatientPage />} />
            <Route path="medical-history" element={<MedicalHistoryPage />} />
            <Route path="medical-history/:tt" element={<MedicalHistoryPage />} />
            <Route path="medications" element={<MedicationsPage />} />
            <Route path="medications/:tt" element={<MedicationsPage />} />
            <Route path="admission" element={<AdmissionPage />} />
            <Route path="admission/:patientId" element={<AdmissionPage />} />
            <Route path="daily-entry" element={<DailyEntryPage />} />
            <Route path="daily-entry/:patientId" element={<DailyEntryPage />} />
            <Route path="mcs" element={<MCSPage />} />
            <Route path="mcs/:tt" element={<MCSPage />} />
            <Route path="discharge" element={<DischargePage />} />
            <Route path="discharge/:patientId" element={<DischargePage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route path={ROUTES.ADMIN.ROOT} element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="cases" element={<CaseReviewPage />} />
            <Route path="hospitals" element={<HospitalsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="archive" element={<ArchiveLookupPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
