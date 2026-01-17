/**
 * My Patients Page
 * Patient list with filtering and actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge, ScaiBadge, AnonymizationBadge } from '../../components/ui/Badge';
import { ROUTES } from '../../config/routes';
import { cn } from '../../lib/utils/cn';

// Mock patient data
const MOCK_PATIENTS = [
  {
    id: '1',
    tt: 'TT-M5X7K9P2',
    status: 'admitted' as const,
    shockType: 'Cardiogenic',
    scaiStage: 'C' as const,
    ageBracket: '60-69',
    sex: 'M',
    icuDay: 3,
    admittedAt: '2024-01-15',
  },
  {
    id: '2',
    tt: 'TT-R2D9F4J8',
    status: 'admitted' as const,
    shockType: 'Septic',
    scaiStage: 'D' as const,
    ageBracket: '70-79',
    sex: 'F',
    icuDay: 5,
    admittedAt: '2024-01-13',
  },
  {
    id: '3',
    tt: 'TT-K7L3N6Q1',
    status: 'pending' as const,
    shockType: 'Cardiogenic',
    scaiStage: 'B' as const,
    ageBracket: '50-59',
    sex: 'M',
    icuDay: 0,
    submittedAt: '2024-01-17',
  },
  {
    id: '4',
    tt: 'TT-P4S8W2Y5',
    status: 'approved' as const,
    shockType: 'Mixed',
    scaiStage: 'C' as const,
    ageBracket: '40-49',
    sex: 'F',
    icuDay: 0,
    approvedAt: '2024-01-16',
  },
  {
    id: '5',
    tt: 'TT-A1B3C5D7',
    status: 'discharged' as const,
    shockType: 'Hypovolemic',
    scaiStage: 'A' as const,
    ageBracket: '30-39',
    sex: 'M',
    icuDay: 0,
    dischargedAt: '2024-01-14',
  },
];

type StatusFilter = 'all' | 'pending' | 'approved' | 'admitted' | 'discharged';

const STATUS_FILTERS: { value: StatusFilter; label: string; count: number }[] = [
  { value: 'all', label: 'All', count: 5 },
  { value: 'pending', label: 'Pending', count: 1 },
  { value: 'approved', label: 'Approved', count: 1 },
  { value: 'admitted', label: 'Admitted', count: 2 },
  { value: 'discharged', label: 'Discharged', count: 1 },
];

export function PatientsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter((patient) => {
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      patient.tt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.shockType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getActionButton = (patient: typeof MOCK_PATIENTS[0]) => {
    switch (patient.status) {
      case 'pending':
        return (
          <span className="text-sm text-gray-500">Awaiting review</span>
        );
      case 'approved':
        return (
          <Button
            size="sm"
            onClick={() => navigate(`${ROUTES.HOSPITAL.ADMISSION}/${patient.id}`)}
          >
            Admit
          </Button>
        );
      case 'admitted':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate(`${ROUTES.HOSPITAL.DAILY_ENTRY}/${patient.id}`)}
            >
              Daily Entry
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`${ROUTES.HOSPITAL.DISCHARGE}/${patient.id}`)}
            >
              Discharge
            </Button>
          </div>
        );
      case 'discharged':
        return (
          <span className="text-sm text-gray-500">Archived</span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Patients</h2>
          <p className="text-gray-500 mt-1">
            Manage and track your shock patients
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.HOSPITAL.NEW_PATIENT)}>
          + New Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by TT or shock type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex gap-2">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    statusFilter === filter.value
                      ? 'bg-shock-blue text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {filter.label}
                  <span className={cn(
                    'ml-2 px-2 py-0.5 rounded-full text-xs',
                    statusFilter === filter.value
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No patients found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex items-center gap-4">
                    <AnonymizationBadge code={patient.tt} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{patient.shockType} Shock</span>
                        <ScaiBadge stage={patient.scaiStage} size="sm" />
                      </div>
                      <p className="text-sm text-gray-500">
                        {patient.ageBracket} y/o {patient.sex === 'M' ? 'Male' : 'Female'}
                        {patient.status === 'admitted' && ` • ICU Day ${patient.icuDay}`}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-4">
                    <StatusBadge status={patient.status} />
                    {getActionButton(patient)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {filteredPatients.length} of {MOCK_PATIENTS.length} patients
      </div>
    </div>
  );
}

export default PatientsPage;
