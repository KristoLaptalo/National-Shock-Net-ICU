/**
 * Reports & Analytics Page
 * Generate and export network reports
 */

import { useState } from 'react';
import { Card, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/utils/cn';

const REPORT_TYPES = [
  { value: 'network_overview', label: 'Network Overview' },
  { value: 'patient_outcomes', label: 'Patient Outcomes' },
  { value: 'shock_distribution', label: 'Shock Type Distribution' },
  { value: 'hospital_performance', label: 'Hospital Performance' },
  { value: 'mortality_analysis', label: 'Mortality Analysis' },
  { value: 'los_analysis', label: 'Length of Stay Analysis' },
];

// Mock statistics
const MOCK_STATS = {
  totalPatients: 1247,
  monthlyAdmissions: 156,
  avgLOS: 5.3,
  mortalityRate: 18.2,
  survivalRate: 81.8,
  shockDistribution: [
    { type: 'Cardiogenic', count: 512, percent: 41 },
    { type: 'Septic', count: 398, percent: 32 },
    { type: 'Mixed', count: 187, percent: 15 },
    { type: 'Hypovolemic', count: 100, percent: 8 },
    { type: 'Other', count: 50, percent: 4 },
  ],
  scaiDistribution: [
    { stage: 'A', count: 125, percent: 10 },
    { stage: 'B', count: 312, percent: 25 },
    { stage: 'C', count: 436, percent: 35 },
    { stage: 'D', count: 262, percent: 21 },
    { stage: 'E', count: 112, percent: 9 },
  ],
};

export function ReportsPage() {
  const [reportType, setReportType] = useState('network_overview');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-17');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-500 mt-1">Network-wide statistics and reports</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Report Type"
              options={REPORT_TYPES}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            />
            <Input
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <div className="flex items-end">
              <Button>Generate Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-blue">{MOCK_STATS.totalPatients}</p>
            <p className="text-sm text-gray-500">Total Patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-teal">{MOCK_STATS.monthlyAdmissions}</p>
            <p className="text-sm text-gray-500">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-orange">{MOCK_STATS.avgLOS}</p>
            <p className="text-sm text-gray-500">Avg LOS (days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-green">{MOCK_STATS.survivalRate}%</p>
            <p className="text-sm text-gray-500">Survival Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-shock-red">{MOCK_STATS.mortalityRate}%</p>
            <p className="text-sm text-gray-500">Mortality Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shock Distribution */}
        <Card>
          <CardTitle>Shock Type Distribution</CardTitle>
          <CardContent>
            <div className="space-y-3">
              {MOCK_STATS.shockDistribution.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.type}</span>
                    <span className="text-gray-500">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-shock-blue h-3 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SCAI Distribution */}
        <Card>
          <CardTitle>SCAI Stage Distribution</CardTitle>
          <CardContent>
            <div className="space-y-3">
              {MOCK_STATS.scaiDistribution.map((item) => (
                <div key={item.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stage {item.stage}</span>
                    <span className="text-gray-500">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={cn(
                        'h-3 rounded-full',
                        item.stage === 'A' ? 'bg-green-500' :
                        item.stage === 'B' ? 'bg-yellow-500' :
                        item.stage === 'C' ? 'bg-orange-500' :
                        item.stage === 'D' ? 'bg-red-500' : 'bg-red-700'
                      )}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="mt-6">
        <CardTitle>Export Report</CardTitle>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="secondary">Export as PDF</Button>
            <Button variant="secondary">Export as CSV</Button>
            <Button variant="secondary">Export as Excel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;
