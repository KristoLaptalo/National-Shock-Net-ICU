/**
 * Case Review Page
 * Review and approve/reject patient cases
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { ScaiBadge, AnonymizationBadge } from '../../components/ui/Badge';
import { getPendingCases, approveCase, rejectCase, type PendingCase } from '../../lib/supabase/rpc';
import { cn } from '../../lib/utils/cn';

// Transform PendingCase from RPC to display format
interface DisplayCase {
  id: string;
  tt: string;
  hospital: string;
  hospitalId: string;
  shockType: string;
  scaiStage: 'A' | 'B' | 'C' | 'D' | 'E';
  ageBracket: string;
  sex: string;
  submittedAt: string;
  criteria: {
    mapBelow65: boolean;
    sbpBelow90: boolean;
    lactateAbove2: boolean;
    lactateValue?: number;
  };
  diagnosis: string;
  medicalHistory: string[];
}

// Transform RPC PendingCase to DisplayCase
function transformCase(rpcCase: PendingCase): DisplayCase {
  const admissionData = rpcCase.admission_data || {};
  const criteria = (admissionData.admission_criteria as Record<string, unknown>) || {};
  const diagnosis = (admissionData.working_diagnosis as Record<string, unknown>) || {};
  const history = (admissionData.medical_history as Record<string, unknown>) || {};

  // Build medical history array from boolean flags
  const medicalHistory: string[] = [];
  if (history.hasCAD) medicalHistory.push('CAD');
  if (history.hasHF) medicalHistory.push('HF');
  if (history.hasDM) medicalHistory.push('DM');
  if (history.hasHTN) medicalHistory.push('HTN');
  if (history.hasCKD) medicalHistory.push('CKD');
  if (history.hasCOPD) medicalHistory.push('COPD');
  if (history.hasStroke) medicalHistory.push('Stroke');

  return {
    id: rpcCase.tt,
    tt: `TT-${rpcCase.tt.substring(0, 8).toUpperCase()}`,
    hospital: rpcCase.hospital_name,
    hospitalId: rpcCase.hospital_id,
    shockType: rpcCase.shock_type.charAt(0).toUpperCase() + rpcCase.shock_type.slice(1),
    scaiStage: rpcCase.scai_stage,
    ageBracket: `${rpcCase.age_decade}-${rpcCase.age_decade + 9}`,
    sex: rpcCase.sex,
    submittedAt: new Date(rpcCase.created_at).toLocaleString(),
    criteria: {
      mapBelow65: Boolean(criteria.mapBelow65),
      sbpBelow90: Boolean(criteria.sbpBelow90),
      lactateAbove2: Boolean(criteria.lactateAbove2),
      lactateValue: criteria.lactateValue as number | undefined,
    },
    diagnosis: (diagnosis.primary as string) || 'Not specified',
    medicalHistory,
  };
}

export function CaseReviewPage() {
  const [cases, setCases] = useState<DisplayCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<DisplayCase | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch pending cases
  const fetchCases = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const pendingCases = await getPendingCases();
      setCases(pendingCases.map(transformCase));
    } catch (err) {
      console.error('Failed to fetch pending cases:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = filter === 'urgent'
    ? cases.filter(c => c.scaiStage === 'D' || c.scaiStage === 'E')
    : cases;

  const handleApprove = async () => {
    if (!selectedCase) return;
    setIsProcessing(true);
    try {
      // Extract the real TT UUID from the display format
      const realTt = selectedCase.id;
      await approveCase(realTt);
      setShowApproveModal(false);
      setSelectedCase(null);
      // Refresh the list
      await fetchCases();
    } catch (err) {
      console.error('Failed to approve case:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve case');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCase || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      const realTt = selectedCase.id;
      await rejectCase(realTt, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedCase(null);
      // Refresh the list
      await fetchCases();
    } catch (err) {
      console.error('Failed to reject case:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject case');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCriteriaScore = (criteria: DisplayCase['criteria']) => {
    let score = 0;
    if (criteria.mapBelow65) score++;
    if (criteria.sbpBelow90) score++;
    if (criteria.lactateAbove2) score++;
    return score;
  };

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Case Review</h2>
          <p className="text-gray-500 mt-1">
            Review and approve patient submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All Cases ({cases.length})
          </Button>
          <Button
            variant={filter === 'urgent' ? 'danger' : 'secondary'}
            onClick={() => setFilter('urgent')}
          >
            Urgent Only ({cases.filter(c => c.scaiStage === 'D' || c.scaiStage === 'E').length})
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-shock-red-light text-shock-red rounded-lg">
          {error}
          <Button variant="ghost" size="sm" onClick={fetchCases} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {cases.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-shock-green-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-shock-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">All Caught Up!</h3>
            <p className="text-gray-500">No pending cases require review at this time.</p>
          </CardContent>
        </Card>
      )}

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: Case Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <ScaiBadge stage={caseItem.scaiStage} />
                    <AnonymizationBadge code={caseItem.tt} />
                    <span className="text-sm text-gray-500">{caseItem.submittedAt}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Shock Type</p>
                      <p className="font-medium">{caseItem.shockType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Demographics</p>
                      <p className="font-medium">{caseItem.ageBracket} y/o {caseItem.sex}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hospital</p>
                      <p className="font-medium">{caseItem.hospital}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Criteria Score</p>
                      <p className="font-medium">{getCriteriaScore(caseItem.criteria)}/3</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Working Diagnosis</p>
                    <p className="text-sm">{caseItem.diagnosis}</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 lg:w-48">
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setShowApproveModal(true);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setShowRejectModal(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    View Details
                  </Button>
                </div>
              </div>

              {/* Admission Criteria */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Admission Criteria</p>
                <div className="flex flex-wrap gap-2">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    caseItem.criteria.mapBelow65 ? 'bg-shock-green-light text-shock-green' : 'bg-gray-100 text-gray-400'
                  )}>
                    MAP &lt; 65 {caseItem.criteria.mapBelow65 ? '✓' : '✗'}
                  </span>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    caseItem.criteria.sbpBelow90 ? 'bg-shock-green-light text-shock-green' : 'bg-gray-100 text-gray-400'
                  )}>
                    SBP &lt; 90 {caseItem.criteria.sbpBelow90 ? '✓' : '✗'}
                  </span>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    caseItem.criteria.lactateAbove2 ? 'bg-shock-green-light text-shock-green' : 'bg-gray-100 text-gray-400'
                  )}>
                    Lactate &gt; 2 {caseItem.criteria.lactateAbove2 ? `(${caseItem.criteria.lactateValue})` : '✗'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Case"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to approve this case for ICU admission?
          </p>
          {selectedCase && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <AnonymizationBadge code={selectedCase.tt} />
                <ScaiBadge stage={selectedCase.scaiStage} />
              </div>
              <p className="text-sm"><strong>Hospital:</strong> {selectedCase.hospital}</p>
              <p className="text-sm"><strong>Diagnosis:</strong> {selectedCase.diagnosis}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowApproveModal(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} isLoading={isProcessing}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Case"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejecting this case.
          </p>
          {selectedCase && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <AnonymizationBadge code={selectedCase.tt} />
                <ScaiBadge stage={selectedCase.scaiStage} />
              </div>
              <p className="text-sm"><strong>Hospital:</strong> {selectedCase.hospital}</p>
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
            <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()} isLoading={isProcessing}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Case Details Modal */}
      {selectedCase && !showApproveModal && !showRejectModal && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title="Case Details"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AnonymizationBadge code={selectedCase.tt} size="lg" />
              <ScaiBadge stage={selectedCase.scaiStage} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Shock Type</p>
                <p className="font-medium">{selectedCase.shockType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Demographics</p>
                <p className="font-medium">{selectedCase.ageBracket} y/o {selectedCase.sex === 'M' ? 'Male' : 'Female'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Hospital</p>
                <p className="font-medium">{selectedCase.hospital}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="font-medium">{selectedCase.submittedAt}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Working Diagnosis</p>
              <p className="bg-gray-50 p-3 rounded-lg">{selectedCase.diagnosis}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Admission Criteria</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>MAP &lt; 65 mmHg</span>
                  <span className={selectedCase.criteria.mapBelow65 ? 'text-shock-green font-medium' : 'text-gray-400'}>
                    {selectedCase.criteria.mapBelow65 ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>SBP &lt; 90 mmHg</span>
                  <span className={selectedCase.criteria.sbpBelow90 ? 'text-shock-green font-medium' : 'text-gray-400'}>
                    {selectedCase.criteria.sbpBelow90 ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>Lactate &gt; 2 mmol/L</span>
                  <span className={selectedCase.criteria.lactateAbove2 ? 'text-shock-green font-medium' : 'text-gray-400'}>
                    {selectedCase.criteria.lactateAbove2 ? `${selectedCase.criteria.lactateValue} mmol/L` : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Medical History</p>
              <div className="flex flex-wrap gap-2">
                {selectedCase.medicalHistory.map((item) => (
                  <span key={item} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="success"
                fullWidth
                onClick={() => {
                  setShowApproveModal(true);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  setShowRejectModal(true);
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CaseReviewPage;
