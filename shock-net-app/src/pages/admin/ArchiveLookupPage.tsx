/**
 * Archive Lookup Page
 * Search for archived patient records using Registry ID
 */

import { useState } from 'react';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { lookupArchive, type ArchiveRecord } from '../../lib/supabase/rpc';
import { cn } from '../../lib/utils/cn';

export function ArchiveLookupPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<ArchiveRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setSearchResult(null);
    setError(null);

    try {
      // Call Supabase RPC to lookup archive
      const result = await lookupArchive(searchQuery.trim().toUpperCase());

      if (result) {
        setSearchResult(result);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Archive lookup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search archive');
    } finally {
      setIsSearching(false);
    }
  };

  const getOutcomeColor = (status: string) => {
    if (status.includes('survived') || status.includes('Survived')) {
      return 'text-shock-green';
    }
    if (status.includes('died') || status.includes('Died')) {
      return 'text-shock-red';
    }
    return 'text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Archive Lookup</h2>
          <p className="text-gray-500 mt-1">Search for archived patient records</p>
        </div>
      </div>

      {/* Search Card */}
      <Card className="mb-6">
        <CardTitle>Search Archive</CardTitle>
        <CardContent>
          <div className="max-w-xl">
            <p className="text-sm text-gray-600 mb-4">
              Enter the Registry ID (NSN-XXXX-XXXX-XXXX) to look up an archived case.
              This ID can be found in the patient's medical records (Decursus Morbi).
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="NSN-XXXX-XXXX-XXXX"
                className="font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                fullWidth
              />
              <Button onClick={handleSearch} isLoading={isSearching}>
                Search
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Note: Archived records contain aggregated, anonymized data only.
              Re-identification requires access to hospital medical records.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-shock-red">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-shock-red-light rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-shock-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Search Error</h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Found Message */}
      {notFound && (
        <Card className="border-shock-orange">
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-shock-orange-light rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-shock-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">No Record Found</h3>
                <p className="text-sm text-gray-600">
                  No archived case was found with the Registry ID "{searchQuery}".
                  Please verify the ID format (NSN-XXXX-XXXX-XXXX) and try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Result */}
      {searchResult && (
        <div className="space-y-6">
          {/* Registry Info Header */}
          <Card className="border-shock-purple">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-shock-purple-light rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-shock-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registry ID</p>
                    <code className="text-xl font-mono font-bold text-shock-purple">
                      {searchResult.registry_id}
                    </code>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Archived</p>
                  <p className="font-medium">{new Date(searchResult.archived_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demographics & Classification */}
            <Card>
              <CardTitle>Patient Summary</CardTitle>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Age Decade</p>
                      <p className="font-medium">{searchResult.age_decade}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sex</p>
                      <p className="font-medium">
                        {searchResult.sex === 'M' ? 'Male' : 'Female'}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-2">Shock Classification</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Type</p>
                        <p className="font-medium capitalize">{searchResult.shock_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Admission SCAI</p>
                        <span className={cn(
                          'inline-flex px-2 py-1 rounded text-sm font-bold',
                          searchResult.scai_stage_admission === 'E' ? 'bg-red-100 text-red-700' :
                          searchResult.scai_stage_admission === 'D' ? 'bg-orange-100 text-orange-700' :
                          searchResult.scai_stage_admission === 'C' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        )}>
                          Stage {searchResult.scai_stage_admission}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Worst SCAI</p>
                        <span className={cn(
                          'inline-flex px-2 py-1 rounded text-sm font-bold',
                          searchResult.scai_stage_worst === 'E' ? 'bg-red-100 text-red-700' :
                          searchResult.scai_stage_worst === 'D' ? 'bg-orange-100 text-orange-700' :
                          searchResult.scai_stage_worst === 'C' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        )}>
                          Stage {searchResult.scai_stage_worst}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ICU Stay Summary */}
            <Card>
              <CardTitle>ICU Stay Summary</CardTitle>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-shock-blue">
                      {searchResult.length_of_stay_days}
                    </p>
                    <p className="text-sm text-gray-500">Total LOS</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-shock-teal">
                      {searchResult.icu_days}
                    </p>
                    <p className="text-sm text-gray-500">ICU Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aggregated Data */}
            {searchResult.aggregated_data && Object.keys(searchResult.aggregated_data).length > 0 && (
              <Card className="lg:col-span-2">
                <CardTitle>Aggregated Data</CardTitle>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                    {JSON.stringify(searchResult.aggregated_data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Outcome */}
          <Card>
            <CardTitle>Outcome</CardTitle>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={cn('text-xl font-bold', getOutcomeColor(searchResult.outcome_status))}>
                    {searchResult.outcome_status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="bg-gray-50">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-shock-purple-light rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-shock-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Privacy Protected Record</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    This archived record contains only aggregated, anonymized data. The original Tracking Token (TT)
                    was permanently destroyed at archive time. Re-identification of this patient requires access to
                    the originating hospital's medical records using the Registry ID above.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ArchiveLookupPage;
