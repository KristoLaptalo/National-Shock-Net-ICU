/**
 * Audit Log Page
 * View system activity history
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Spinner, FullPageSpinner } from '../../components/ui/Spinner';
import { getAuditLog, type AuditLogEntry } from '../../lib/supabase/rpc';
import { cn } from '../../lib/utils/cn';

// Display format for audit log entries
interface DisplayLogEntry {
  id: string;
  action: string;
  actor: string;
  target: string | null;
  timestamp: string;
  details: string;
}

// Transform RPC audit log entry to display format
function transformLogEntry(entry: AuditLogEntry): DisplayLogEntry {
  const metadata = entry.metadata || {};

  // Extract actor from metadata or use actor_id
  const actor = (metadata.actor as string) ||
                (entry.actor_id ? `USER-${entry.actor_id.substring(0, 8)}` : entry.actor_role || 'system');

  // Extract target (AID or other identifier)
  const target = entry.aid ? `AID-${entry.aid.substring(0, 8)}` :
                 entry.registry_id || (metadata.target as string) || null;

  // Extract details from metadata
  const details = (metadata.details as string) ||
                  (metadata.reason as string) ||
                  (metadata.notes as string) ||
                  formatEventType(entry.event_type);

  return {
    id: String(entry.id),
    action: entry.event_type.toUpperCase(),
    actor,
    target,
    timestamp: new Date(entry.event_time).toLocaleString(),
    details,
  };
}

// Format event type to human-readable text
function formatEventType(eventType: string): string {
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const PAGE_SIZE = 20;

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'CASE_APPROVED', label: 'Case Approved' },
  { value: 'CASE_REJECTED', label: 'Case Rejected' },
  { value: 'CASE_SUBMITTED', label: 'Case Submitted' },
  { value: 'SUBSCRIPTION_UPGRADED', label: 'Subscription Upgraded' },
  { value: 'HOSPITAL_REGISTERED', label: 'Hospital Registered' },
  { value: 'PATIENT_ARCHIVED', label: 'Patient Archived' },
  { value: 'PATIENT_DISCHARGED', label: 'Patient Discharged' },
  { value: 'LOGIN', label: 'Login' },
];

const getActionColor = (action: string) => {
  switch (action) {
    case 'CASE_APPROVED':
    case 'HOSPITAL_REGISTERED':
      return 'bg-shock-green-light text-shock-green';
    case 'CASE_REJECTED':
    case 'SUBSCRIPTION_EXPIRED':
      return 'bg-shock-red-light text-shock-red';
    case 'SUBSCRIPTION_UPGRADED':
    case 'CASE_SUBMITTED':
      return 'bg-shock-blue-light text-shock-blue';
    case 'PATIENT_ARCHIVED':
    case 'PATIENT_DISCHARGED':
      return 'bg-shock-purple-light text-shock-purple';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export function AuditLogPage() {
  const [logs, setLogs] = useState<DisplayLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch audit log entries
  const fetchLogs = useCallback(async (page: number, eventType?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAuditLog({
        event_type: eventType || undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      setLogs(data.map(transformLogEntry));
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage, actionFilter || undefined);
  }, [fetchLogs, currentPage, actionFilter]);

  // Client-side filtering for search (server already filtered by action type)
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return log.actor.toLowerCase().includes(query) ||
      (log.target && log.target.toLowerCase().includes(query)) ||
      log.details.toLowerCase().includes(query);
  });

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFilterChange = (value: string) => {
    setActionFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  if (isLoading && logs.length === 0) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Audit Log</h2>
          <p className="text-gray-500 mt-1">System activity history</p>
        </div>
        <Button variant="secondary">Export Log</Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by actor, target, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
              />
            </div>
            <Select
              options={ACTION_TYPES}
              value={actionFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              placeholder="Filter by action"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-shock-red-light text-shock-red rounded-lg">
          {error}
          <Button variant="ghost" size="sm" onClick={() => fetchLogs(currentPage, actionFilter || undefined)} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {isLoading && logs.length > 0 && (
        <div className="mb-4 flex justify-center">
          <Spinner />
        </div>
      )}

      {/* Empty State */}
      {logs.length === 0 && !error && !isLoading && (
        <Card className="mb-6">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Audit Entries</h3>
            <p className="text-gray-500">No system activity has been recorded yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Log Entries */}
      {filteredLogs.length > 0 && (
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        getActionColor(log.action)
                      )}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      {log.target && (
                        <span className="text-sm font-mono text-gray-600">{log.target}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      By: {log.actor}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {currentPage}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default AuditLogPage;
