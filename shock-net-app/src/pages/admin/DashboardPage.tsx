/**
 * Admin Dashboard Page
 * Network overview with statistics and recent activity
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TierBadge, ScaiBadge, AnonymizationBadge } from '../../components/ui/Badge';
import { getRegistryStatistics } from '../../lib/supabase/rpc';
import { ROUTES } from '../../config/routes';

// Mock data
const PENDING_CASES = [
  { id: '1', tt: 'TT-A7B3C9D2', hospital: 'City General Hospital', shockType: 'Cardiogenic', scaiStage: 'D' as const, submittedAt: '2 hours ago' },
  { id: '2', tt: 'TT-E5F1G8H4', hospital: 'Regional Medical Center', shockType: 'Septic', scaiStage: 'C' as const, submittedAt: '3 hours ago' },
  { id: '3', tt: 'TT-I2J6K0L9', hospital: 'University Hospital', shockType: 'Mixed', scaiStage: 'E' as const, submittedAt: '5 hours ago' },
];

const PENDING_SUBSCRIPTIONS = [
  { id: '1', hospital: 'Metro Health System', requestedTier: 'Premium' as const, currentTier: 'Standard' as const, requestedAt: '1 day ago' },
  { id: '2', hospital: 'Community Hospital', requestedTier: 'Standard' as const, currentTier: null, requestedAt: '2 days ago' },
];

const RECENT_ACTIVITY = [
  { action: 'Case approved', details: 'TT-X9Y8Z7W6 approved by Dr. Admin', time: '10 min ago', type: 'success' },
  { action: 'Subscription upgraded', details: 'City General upgraded to Premium', time: '1 hour ago', type: 'info' },
  { action: 'Case rejected', details: 'TT-M3N4O5P6 - criteria not met', time: '2 hours ago', type: 'error' },
  { action: 'New hospital registered', details: 'Valley Medical Center joined network', time: '3 hours ago', type: 'info' },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalActive: 0,
    totalArchived: 0,
    pendingCases: 7, // TODO: Add RPC for pending cases count
    pendingSubscriptions: 4, // TODO: Add RPC for pending subscriptions count
    hospitalsOnline: 23, // TODO: Add RPC for hospitals count
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const registryStats = await getRegistryStatistics();
        setStats((prev) => ({
          ...prev,
          totalActive: registryStats.total_active,
          totalArchived: registryStats.total_archived,
        }));
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(ROUTES.ADMIN.CASES)}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Cases</p>
                <p className="text-3xl font-bold text-shock-red">{stats.pendingCases}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
              </div>
              <div className="w-12 h-12 bg-shock-red-light rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-shock-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(ROUTES.ADMIN.SUBSCRIPTIONS)}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Subscriptions</p>
                <p className="text-3xl font-bold text-shock-orange">{stats.pendingSubscriptions}</p>
                <p className="text-xs text-gray-400 mt-1">Needs approval</p>
              </div>
              <div className="w-12 h-12 bg-shock-orange-light rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-shock-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Patients</p>
                <p className="text-3xl font-bold text-shock-teal">{stats.totalActive}</p>
                <p className="text-xs text-gray-400 mt-1">Across network</p>
              </div>
              <div className="w-12 h-12 bg-shock-teal-light rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-shock-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(ROUTES.ADMIN.HOSPITALS)}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Hospitals Online</p>
                <p className="text-3xl font-bold text-shock-green">{stats.hospitalsOnline}</p>
                <p className="text-xs text-gray-400 mt-1">Active in network</p>
              </div>
              <div className="w-12 h-12 bg-shock-green-light rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-shock-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Urgent Cases */}
        <Card>
          <CardTitle className="flex items-center justify-between">
            <span>Urgent Cases</span>
            <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.ADMIN.CASES)}>
              View All
            </Button>
          </CardTitle>
          <CardContent>
            <div className="space-y-3">
              {PENDING_CASES.map((caseItem) => (
                <div key={caseItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ScaiBadge stage={caseItem.scaiStage} />
                    <div>
                      <div className="flex items-center gap-2">
                        <AnonymizationBadge code={caseItem.tt} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500">{caseItem.hospital}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{caseItem.shockType}</p>
                    <p className="text-xs text-gray-400">{caseItem.submittedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Subscriptions */}
        <Card>
          <CardTitle className="flex items-center justify-between">
            <span>Subscription Requests</span>
            <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.ADMIN.SUBSCRIPTIONS)}>
              View All
            </Button>
          </CardTitle>
          <CardContent>
            <div className="space-y-3">
              {PENDING_SUBSCRIPTIONS.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{sub.hospital}</p>
                    <p className="text-sm text-gray-500">{sub.requestedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.currentTier && (
                      <>
                        <TierBadge tier={sub.currentTier} size="sm" />
                        <span className="text-gray-400">→</span>
                      </>
                    )}
                    <TierBadge tier={sub.requestedTier} size="sm" />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => navigate(ROUTES.ADMIN.SUBSCRIPTIONS)}
                >
                  Review All Subscriptions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Activity</span>
          <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.ADMIN.AUDIT)}>
            View Audit Log
          </Button>
        </CardTitle>
        <CardContent>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-shock-green' :
                  activity.type === 'error' ? 'bg-shock-red' :
                  'bg-shock-blue'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboardPage;
