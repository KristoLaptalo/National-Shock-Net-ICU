/**
 * Admin Portal Layout
 * Wraps all admin portal pages with sidebar and header
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { AdminHeader } from '../../components/layout/Header';
import { AdminSidebar } from '../../components/layout/Sidebar';
import { useAuth } from '../../features/auth/AuthContext';
import { ADMIN_NAV_ITEMS, ROUTES } from '../../config/routes';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get user info from auth context with fallbacks
  const userName = user?.name || 'Admin User';
  const userRole = user?.role === 'hospital_admin' ? 'Network Admin' : 'Staff';

  // Get page title based on current route
  const getPageTitle = (): { title: string; subtitle?: string } => {
    const currentItem = ADMIN_NAV_ITEMS.find(
      (item) => location.pathname === item.path
    );

    if (currentItem) {
      const subtitles: Record<string, string> = {
        dashboard: 'Network overview and statistics',
        subscriptions: 'Manage hospital subscriptions',
        cases: 'Review pending patient cases',
        hospitals: 'Monitor hospital activity',
        reports: 'Generate and export reports',
        audit: 'System activity history',
        archive: 'Search archived patient records',
      };

      return {
        title: currentItem.label,
        subtitle: subtitles[currentItem.id],
      };
    }

    return { title: 'Admin Portal' };
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const { title, subtitle } = getPageTitle();

  return (
    <AppShell
      portal="admin"
      sidebar={
        <AdminSidebar
          pendingSubscriptions={4}
          pendingCases={7}
          userName={userName}
          userRole={userRole}
          onLogout={handleLogout}
        />
      }
      header={
        <AdminHeader
          title={title}
          subtitle={subtitle}
          notificationCount={3}
        />
      }
    >
      <Outlet />
    </AppShell>
  );
}

export default AdminLayout;
