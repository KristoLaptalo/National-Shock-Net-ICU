/**
 * Subscriptions Management Page
 * Approve/reject hospital subscription requests
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { TierBadge } from '../../components/ui/Badge';
import {
  getPendingSubscriptions,
  approveSubscription,
  rejectSubscription,
  type Subscription,
} from '../../lib/supabase/rpc';
import { cn } from '../../lib/utils/cn';

// Display format for subscriptions
interface DisplaySubscription {
  id: string;
  hospital: string;
  hospitalId: string;
  currentTier: 'Basic' | 'Standard' | 'Premium' | 'Unlimited' | null;
  requestedTier: 'Basic' | 'Standard' | 'Premium' | 'Unlimited';
  requestType: 'new' | 'upgrade';
  requestedAt: string;
  currentUsage: number;
  monthlyLimit: number;
}

const TIER_OPTIONS = [
  { value: 'basic', label: 'Basic (10/month)' },
  { value: 'standard', label: 'Standard (25/month)' },
  { value: 'premium', label: 'Premium (50/month)' },
  { value: 'unlimited', label: 'Unlimited' },
];

// Transform RPC subscription to display format
function transformSubscription(sub: Subscription): DisplaySubscription {
  const capitalize = (s: string | null) => s ? s.charAt(0).toUpperCase() + s.slice(1) : null;
  return {
    id: sub.id,
    hospital: sub.hospital_name,
    hospitalId: sub.hospital_id,
    currentTier: capitalize(sub.current_tier) as DisplaySubscription['currentTier'],
    requestedTier: capitalize(sub.requested_tier) as DisplaySubscription['requestedTier'],
    requestType: sub.current_tier ? 'upgrade' : 'new',
    requestedAt: new Date(sub.requested_at).toLocaleDateString(),
    currentUsage: sub.current_usage,
    monthlyLimit: sub.monthly_limit,
  };
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<DisplaySubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<DisplaySubscription | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvedTier, setApprovedTier] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'upgrade'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch pending subscriptions
  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPendingSubscriptions();
      setSubscriptions(data.map(transformSubscription));
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredSubs = filter === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.requestType === filter);

  const handleApprove = async () => {
    if (!selectedSub || !approvedTier) return;
    setIsProcessing(true);
    try {
      await approveSubscription(
        selectedSub.hospitalId,
        approvedTier.toLowerCase() as 'basic' | 'standard' | 'premium' | 'unlimited'
      );
      setShowApproveModal(false);
      setSelectedSub(null);
      setApprovedTier('');
      await fetchSubscriptions();
    } catch (err) {
      console.error('Failed to approve subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSub || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectSubscription(selectedSub.hospitalId, rejectReason);
      setShowRejectModal(false);
      setSelectedSub(null);
      setRejectReason('');
      await fetchSubscriptions();
    } catch (err) {
      console.error('Failed to reject subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Subscription Management</h2>
          <p className="text-gray-500 mt-1">Review and approve hospital subscriptions</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'new', 'upgrade'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${subscriptions.length})` : f === 'new' ? `New (${subscriptions.filter(s => s.requestType === 'new').length})` : `Upgrades (${subscriptions.filter(s => s.requestType === 'upgrade').length})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-shock-red-light text-shock-red rounded-lg">
          {error}
          <Button variant="ghost" size="sm" onClick={fetchSubscriptions} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {subscriptions.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-shock-green-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-shock-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Requests</h3>
            <p className="text-gray-500">All subscription requests have been processed.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredSubs.map((sub) => (
          <Card key={sub.id}>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      sub.requestType === 'new' ? 'bg-shock-blue-light text-shock-blue' : 'bg-shock-orange-light text-shock-orange'
                    )}>
                      {sub.requestType === 'new' ? 'New' : 'Upgrade'}
                    </span>
                    <span className="text-sm text-gray-500">{sub.requestedAt}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{sub.hospital}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {sub.currentTier && (
                      <>
                        <TierBadge tier={sub.currentTier} size="sm" />
                        <span className="text-gray-400">→</span>
                      </>
                    )}
                    <TierBadge tier={sub.requestedTier} />
                  </div>
                  {sub.currentTier && (
                    <p className="text-sm text-gray-500 mt-2">
                      Current usage: {sub.currentUsage}/{sub.monthlyLimit} this month
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    onClick={() => {
                      setSelectedSub(sub);
                      setApprovedTier(sub.requestedTier.toLowerCase());
                      setShowApproveModal(true);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setSelectedSub(sub);
                      setShowRejectModal(true);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approve Modal */}
      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Subscription">
        <div className="space-y-4">
          {selectedSub && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold">{selectedSub.hospital}</h4>
              <p className="text-sm text-gray-500">Requested: {selectedSub.requestedTier}</p>
            </div>
          )}
          <Select
            label="Approved Tier"
            options={TIER_OPTIONS}
            value={approvedTier}
            onChange={(e) => setApprovedTier(e.target.value)}
            fullWidth
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowApproveModal(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} isLoading={isProcessing} disabled={!approvedTier}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Subscription">
        <div className="space-y-4">
          {selectedSub && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold">{selectedSub.hospital}</h4>
              <p className="text-sm text-gray-500">Requested: {selectedSub.requestedTier}</p>
            </div>
          )}
          <Textarea
            label="Rejection Reason"
            placeholder="Enter the reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            required
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={isProcessing} disabled={!rejectReason.trim()}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SubscriptionsPage;
