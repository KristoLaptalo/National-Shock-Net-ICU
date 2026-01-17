/**
 * Hospitals Monitoring Page
 * View and manage network hospitals
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { TierBadge } from '../../components/ui/Badge';
import { getNetworkHospitals, type NetworkHospital } from '../../lib/supabase/rpc';
import { cn } from '../../lib/utils/cn';

// Display format for hospitals
interface DisplayHospital {
  id: string;
  name: string;
  tier: 'Basic' | 'Standard' | 'Premium' | 'Unlimited' | 'None';
  status: 'active' | 'inactive' | 'suspended' | 'expiring';
  monthlyUsage: number;
  monthlyLimit: number;
  expiresAt: string | null;
  lastActivity: string | null;
}

// Transform RPC hospital to display format
function transformHospital(h: NetworkHospital): DisplayHospital {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const tier = h.tier ? capitalize(h.tier) as DisplayHospital['tier'] : 'None';

  // Check if expiring (within 30 days)
  let status = h.status as DisplayHospital['status'];
  if (h.subscription_expires) {
    const expiresDate = new Date(h.subscription_expires);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      status = 'expiring';
    }
  }

  return {
    id: h.id,
    name: h.name,
    tier,
    status,
    monthlyUsage: h.current_usage,
    monthlyLimit: h.monthly_limit,
    expiresAt: h.subscription_expires ? new Date(h.subscription_expires).toLocaleDateString() : null,
    lastActivity: h.last_activity ? formatLastActivity(h.last_activity) : null,
  };
}

// Format last activity time
function formatLastActivity(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function HospitalsPage() {
  const [hospitals, setHospitals] = useState<DisplayHospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch hospitals
  const fetchHospitals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getNetworkHospitals();
      setHospitals(data.map(transformHospital));
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hospitals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUsagePercent = (usage: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(Math.round((usage / limit) * 100), 100);
  };

  // Calculate stats
  const activeCount = hospitals.filter(h => h.status === 'active').length;
  const expiringCount = hospitals.filter(h => h.status === 'expiring').length;
  const totalUsage = hospitals.reduce((sum, h) => sum + h.monthlyUsage, 0);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Network Hospitals</h2>
          <p className="text-gray-500 mt-1">{hospitals.length} hospitals in network</p>
        </div>
        <div className="w-64">
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-shock-red-light text-shock-red rounded-lg">
          {error}
          <Button variant="ghost" size="sm" onClick={fetchHospitals} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-green">{activeCount}</p>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-orange">{expiringCount}</p>
            <p className="text-sm text-gray-500">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-teal">{hospitals.length}</p>
            <p className="text-sm text-gray-500">Total Hospitals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-blue">{totalUsage}</p>
            <p className="text-sm text-gray-500">Monthly Cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {hospitals.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Hospitals</h3>
            <p className="text-gray-500">No hospitals have been registered yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Hospital List */}
      <div className="space-y-4">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id}>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{hospital.name}</h3>
                    {hospital.tier !== 'None' && <TierBadge tier={hospital.tier} />}
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      hospital.status === 'active' ? 'bg-shock-green-light text-shock-green' :
                      hospital.status === 'expiring' ? 'bg-shock-orange-light text-shock-orange' :
                      hospital.status === 'suspended' ? 'bg-shock-red-light text-shock-red' :
                      'bg-gray-100 text-gray-500'
                    )}>
                      {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {hospital.id.substring(0, 8)}...
                    {hospital.lastActivity && ` • Last active: ${hospital.lastActivity}`}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Tier</p>
                      <p className="text-xl font-bold text-shock-teal">{hospital.tier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Monthly Usage</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">
                          {hospital.monthlyUsage}
                          {hospital.monthlyLimit > 0 && hospital.monthlyLimit < 999999 && (
                            <span className="text-sm text-gray-400">/{hospital.monthlyLimit}</span>
                          )}
                        </p>
                      </div>
                      {hospital.monthlyLimit > 0 && hospital.monthlyLimit < 999999 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              getUsagePercent(hospital.monthlyUsage, hospital.monthlyLimit) > 80 ? 'bg-shock-orange' : 'bg-shock-blue'
                            )}
                            style={{ width: `${getUsagePercent(hospital.monthlyUsage, hospital.monthlyLimit)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expires</p>
                      <p className={cn(
                        'text-sm font-medium',
                        hospital.status === 'expiring' ? 'text-shock-orange' : 'text-gray-600'
                      )}>
                        {hospital.expiresAt || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-32">
                  <Button variant="secondary" size="sm" fullWidth>View Details</Button>
                  <Button variant="ghost" size="sm" fullWidth>Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HospitalsPage;
