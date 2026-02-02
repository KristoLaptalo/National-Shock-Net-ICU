/**
 * Hospital Portal Layout
 * Wraps all hospital portal pages with header and tab navigation
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { HospitalHeader } from '../../components/layout/Header';
import { TabNavigation } from '../../components/layout/Navigation';
import { useAuth } from '../../features/auth/AuthContext';
import { ROUTES } from '../../config/routes';

export function HospitalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Check if we're on a patient detail page
  const isPatientDetail = location.pathname.startsWith('/hospital/patient/');

  // Get user info from auth context with fallbacks
  const hospitalName = user?.hospitalId || 'Hospital';
  const tier = 'Premium' as const; // TODO: Get from hospital data
  const userName = user?.name || 'User';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOSPITAL_LOGIN);
  };

  return (
    <AppShell
      portal="hospital"
      header={
        <HospitalHeader
          hospitalName={hospitalName}
          tier={tier}
          userName={userName}
          onLogout={handleLogout}
        />
      }
      navigation={!isPatientDetail ? <TabNavigation /> : undefined}
    >
      <Outlet />
    </AppShell>
  );
}

export default HospitalLayout;
