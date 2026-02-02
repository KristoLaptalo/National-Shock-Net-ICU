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
import { SubscriptionPage } from './pages/hospital/SubscriptionPage';

// Patient Detail Pages
import {
  PatientLayout,
  PatientDetailPage,
  HistoryTab,
  MedicationsTab,
  AdmissionTab,
  DailyEntryTab,
  DischargeTab,
} from './pages/hospital/patient';

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
            {/* Patient Detail Routes (nested with patient-specific layout) */}
            <Route path="patient/:tt" element={<PatientLayout />}>
              <Route index element={<PatientDetailPage />} />
              <Route path="history" element={<HistoryTab />} />
              <Route path="medications" element={<MedicationsTab />} />
              <Route path="admission" element={<AdmissionTab />} />
              <Route path="daily-entry" element={<DailyEntryTab />} />
              <Route path="discharge" element={<DischargeTab />} />
            </Route>
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
