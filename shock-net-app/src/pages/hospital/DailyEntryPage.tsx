/**
 * Daily Entry Page
 * Comprehensive ICU daily monitoring data entry
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { FormSection, FormRow } from '../../components/ui/Form';
import { AnonymizationBadge, StatusBadge, ScaiBadge } from '../../components/ui/Badge';

import {
  dailyEntrySchema,
  SCAI_STAGE_OPTIONS,
  BLOOD_GAS_TYPE_OPTIONS,
  RV_FUNCTION_OPTIONS,
  VENT_MODE_OPTIONS,
} from '../../lib/schemas';
import type { DailyEntryFormData } from '../../lib/schemas';
import { updateTracking } from '../../lib/supabase/rpc';
import { ROUTES } from '../../config/routes';
import { cn } from '../../lib/utils/cn';

// Mock patient data
const MOCK_PATIENT = {
  tt: 'TT-M5X7K9P2',
  status: 'admitted' as const,
  shockType: 'Cardiogenic',
  scaiStage: 'C' as const,
  dayNumber: 3,
  admittedAt: '2024-01-15',
};

// Tab definitions
const TABS = [
  { id: 'hemodynamics', label: 'Hemodynamics' },
  { id: 'bloodgas', label: 'Blood Gas' },
  { id: 'ventilator', label: 'Ventilator' },
  { id: 'labs', label: 'Labs' },
  { id: 'echo', label: 'Echo' },
  { id: 'notes', label: 'Notes' },
] as const;

type TabId = typeof TABS[number]['id'];

export function DailyEntryPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState<TabId>('hemodynamics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      dayNumber: MOCK_PATIENT.dayNumber,
      currentScaiStage: MOCK_PATIENT.scaiStage,
      entryDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: unknown) => {
    const formData = data as DailyEntryFormData;
    setIsSubmitting(true);

    // Use the patientId from URL as the TT (or fall back to mock for demo)
    const tt = patientId || MOCK_PATIENT.tt;

    try {
      // Build update payload with timestamp
      const timestamp = new Date().toISOString();
      const dayEntry = {
        dayNumber: formData.dayNumber,
        entryDate: formData.entryDate,
        timestamp,
      };

      // Call Supabase RPC to update tracking with daily data
      await updateTracking(tt, {
        scai_stage: formData.currentScaiStage,
        hemodynamics: formData.hemodynamics?.[0] ? {
          ...dayEntry,
          ...formData.hemodynamics[0],
        } : undefined,
        laboratory: formData.laboratory ? {
          ...dayEntry,
          ...formData.laboratory,
        } : undefined,
        ventilation: formData.ventilator ? {
          ...dayEntry,
          ...formData.ventilator,
        } : undefined,
        notes: {
          ...dayEntry,
          bloodGas: formData.bloodGas?.[0],
          echo: formData.echo,
          interventions: formData.interventions,
          assessment: formData.assessment,
          clinicalNotes: formData.clinicalNotes,
        },
      });

      console.log('Daily entry saved:', formData);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save daily entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state after saving
  if (isSaved) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-shock-green-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-shock-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Daily Entry Saved
            </h2>
            <p className="text-gray-600 mb-6">
              Day {MOCK_PATIENT.dayNumber} data has been recorded successfully.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setIsSaved(false)}>
                Add More Data
              </Button>
              <Button variant="secondary" onClick={() => navigate(ROUTES.HOSPITAL.PATIENTS)}>
                View Patients
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daily Data Entry</h2>
          <p className="text-gray-500 mt-1">
            Record daily ICU monitoring data
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">ICU Day</p>
          <p className="text-3xl font-bold text-shock-blue">{MOCK_PATIENT.dayNumber}</p>
        </div>
      </div>

      {/* Patient Summary Card */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AnonymizationBadge code={MOCK_PATIENT.tt} />
              <div>
                <p className="font-medium">{MOCK_PATIENT.shockType} Shock</p>
                <p className="text-sm text-gray-500">
                  Admitted: {MOCK_PATIENT.admittedAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ScaiBadge stage={MOCK_PATIENT.scaiStage} />
              <StatusBadge status={MOCK_PATIENT.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-shock-blue text-shock-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Current SCAI Stage */}
        <div className="mb-6">
          <Select
            label="Current SCAI Stage"
            options={SCAI_STAGE_OPTIONS}
            error={errors.currentScaiStage?.message}
            required
            {...register('currentScaiStage')}
          />
        </div>

        {/* Hemodynamics Tab */}
        {activeTab === 'hemodynamics' && (
          <FormSection
            title="Hemodynamic Parameters"
            description="Vital signs and cardiac output data"
          >
            <FormRow columns={4}>
              <Input
                label="Heart Rate"
                type="number"
                placeholder="bpm"
                {...register('hemodynamics.0.heartRate', { valueAsNumber: true })}
              />
              <Input
                label="SBP"
                type="number"
                placeholder="mmHg"
                {...register('hemodynamics.0.sbp', { valueAsNumber: true })}
              />
              <Input
                label="DBP"
                type="number"
                placeholder="mmHg"
                {...register('hemodynamics.0.dbp', { valueAsNumber: true })}
              />
              <Input
                label="MAP"
                type="number"
                placeholder="mmHg"
                {...register('hemodynamics.0.map', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow columns={4}>
              <Input
                label="CVP"
                type="number"
                placeholder="mmHg"
                {...register('hemodynamics.0.cvp', { valueAsNumber: true })}
              />
              <Input
                label="Cardiac Output"
                type="number"
                step="0.1"
                placeholder="L/min"
                {...register('hemodynamics.0.cardiacOutput', { valueAsNumber: true })}
              />
              <Input
                label="Cardiac Index"
                type="number"
                step="0.1"
                placeholder="L/min/m²"
                {...register('hemodynamics.0.cardiacIndex', { valueAsNumber: true })}
              />
              <Input
                label="SVR"
                type="number"
                placeholder="dynes·s/cm⁵"
                {...register('hemodynamics.0.svr', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow columns={2}>
              <Input
                label="ScvO2"
                type="number"
                placeholder="%"
                {...register('hemodynamics.0.scvo2', { valueAsNumber: true })}
              />
              <Input
                label="Time"
                type="time"
                {...register('hemodynamics.0.timestamp')}
              />
            </FormRow>
          </FormSection>
        )}

        {/* Blood Gas Tab */}
        {activeTab === 'bloodgas' && (
          <FormSection
            title="Blood Gas Analysis"
            description="Arterial or venous blood gas results"
          >
            <FormRow columns={3}>
              <Select
                label="Sample Type"
                options={BLOOD_GAS_TYPE_OPTIONS}
                {...register('bloodGas.0.type')}
              />
              <Input
                label="Time"
                type="time"
                {...register('bloodGas.0.timestamp')}
              />
              <div />
            </FormRow>
            <FormRow columns={4}>
              <Input
                label="pH"
                type="number"
                step="0.01"
                placeholder="7.35-7.45"
                {...register('bloodGas.0.ph', { valueAsNumber: true })}
              />
              <Input
                label="pCO2"
                type="number"
                placeholder="mmHg"
                {...register('bloodGas.0.pco2', { valueAsNumber: true })}
              />
              <Input
                label="pO2"
                type="number"
                placeholder="mmHg"
                {...register('bloodGas.0.po2', { valueAsNumber: true })}
              />
              <Input
                label="HCO3"
                type="number"
                step="0.1"
                placeholder="mEq/L"
                {...register('bloodGas.0.hco3', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow columns={3}>
              <Input
                label="Base Excess"
                type="number"
                step="0.1"
                placeholder="mEq/L"
                {...register('bloodGas.0.baseExcess', { valueAsNumber: true })}
              />
              <Input
                label="Lactate"
                type="number"
                step="0.1"
                placeholder="mmol/L"
                {...register('bloodGas.0.lactate', { valueAsNumber: true })}
              />
              <Input
                label="SaO2"
                type="number"
                placeholder="%"
                {...register('bloodGas.0.sao2', { valueAsNumber: true })}
              />
            </FormRow>
          </FormSection>
        )}

        {/* Ventilator Tab */}
        {activeTab === 'ventilator' && (
          <FormSection
            title="Ventilator Settings"
            description="Current mechanical ventilation parameters"
          >
            <FormRow columns={3}>
              <Select
                label="Mode"
                options={VENT_MODE_OPTIONS}
                placeholder="Select mode"
                {...register('ventilator.mode')}
              />
              <Input
                label="FiO2"
                type="number"
                placeholder="%"
                {...register('ventilator.fio2', { valueAsNumber: true })}
              />
              <Input
                label="PEEP"
                type="number"
                placeholder="cmH2O"
                {...register('ventilator.peep', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow columns={4}>
              <Input
                label="Tidal Volume"
                type="number"
                placeholder="mL"
                {...register('ventilator.tidalVolume', { valueAsNumber: true })}
              />
              <Input
                label="Respiratory Rate"
                type="number"
                placeholder="/min"
                {...register('ventilator.respiratoryRate', { valueAsNumber: true })}
              />
              <Input
                label="PIP"
                type="number"
                placeholder="cmH2O"
                {...register('ventilator.pip', { valueAsNumber: true })}
              />
              <Input
                label="Plateau"
                type="number"
                placeholder="cmH2O"
                {...register('ventilator.plateau', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow columns={2}>
              <Input
                label="Minute Ventilation"
                type="number"
                step="0.1"
                placeholder="L/min"
                {...register('ventilator.minuteVentilation', { valueAsNumber: true })}
              />
              <Input
                label="Time"
                type="time"
                {...register('ventilator.timestamp')}
              />
            </FormRow>
          </FormSection>
        )}

        {/* Labs Tab */}
        {activeTab === 'labs' && (
          <div className="space-y-6">
            <FormSection title="CBC">
              <FormRow columns={4}>
                <Input
                  label="Hemoglobin"
                  type="number"
                  step="0.1"
                  placeholder="g/dL"
                  {...register('laboratory.hemoglobin', { valueAsNumber: true })}
                />
                <Input
                  label="Hematocrit"
                  type="number"
                  step="0.1"
                  placeholder="%"
                  {...register('laboratory.hematocrit', { valueAsNumber: true })}
                />
                <Input
                  label="WBC"
                  type="number"
                  step="0.1"
                  placeholder="×10³/μL"
                  {...register('laboratory.wbc', { valueAsNumber: true })}
                />
                <Input
                  label="Platelets"
                  type="number"
                  placeholder="×10³/μL"
                  {...register('laboratory.platelets', { valueAsNumber: true })}
                />
              </FormRow>
            </FormSection>

            <FormSection title="Chemistry">
              <FormRow columns={4}>
                <Input
                  label="Sodium"
                  type="number"
                  placeholder="mEq/L"
                  {...register('laboratory.sodium', { valueAsNumber: true })}
                />
                <Input
                  label="Potassium"
                  type="number"
                  step="0.1"
                  placeholder="mEq/L"
                  {...register('laboratory.potassium', { valueAsNumber: true })}
                />
                <Input
                  label="Chloride"
                  type="number"
                  placeholder="mEq/L"
                  {...register('laboratory.chloride', { valueAsNumber: true })}
                />
                <Input
                  label="Bicarbonate"
                  type="number"
                  placeholder="mEq/L"
                  {...register('laboratory.bicarbonate', { valueAsNumber: true })}
                />
              </FormRow>
              <FormRow columns={3}>
                <Input
                  label="BUN"
                  type="number"
                  placeholder="mg/dL"
                  {...register('laboratory.bun', { valueAsNumber: true })}
                />
                <Input
                  label="Creatinine"
                  type="number"
                  step="0.01"
                  placeholder="mg/dL"
                  {...register('laboratory.creatinine', { valueAsNumber: true })}
                />
                <Input
                  label="Glucose"
                  type="number"
                  placeholder="mg/dL"
                  {...register('laboratory.glucose', { valueAsNumber: true })}
                />
              </FormRow>
            </FormSection>

            <FormSection title="Cardiac Markers">
              <FormRow columns={2}>
                <Input
                  label="Troponin"
                  type="number"
                  step="0.001"
                  placeholder="ng/mL"
                  {...register('laboratory.troponin', { valueAsNumber: true })}
                />
                <Input
                  label="BNP/NT-proBNP"
                  type="number"
                  placeholder="pg/mL"
                  {...register('laboratory.bnp', { valueAsNumber: true })}
                />
              </FormRow>
            </FormSection>

            <FormSection title="Coagulation">
              <FormRow columns={3}>
                <Input
                  label="PT"
                  type="number"
                  step="0.1"
                  placeholder="seconds"
                  {...register('laboratory.pt', { valueAsNumber: true })}
                />
                <Input
                  label="INR"
                  type="number"
                  step="0.1"
                  placeholder=""
                  {...register('laboratory.inr', { valueAsNumber: true })}
                />
                <Input
                  label="PTT"
                  type="number"
                  step="0.1"
                  placeholder="seconds"
                  {...register('laboratory.ptt', { valueAsNumber: true })}
                />
              </FormRow>
            </FormSection>
          </div>
        )}

        {/* Echo Tab */}
        {activeTab === 'echo' && (
          <FormSection
            title="Echocardiography"
            description="If echo performed today"
          >
            <FormRow columns={3}>
              <Input
                label="LVEF"
                type="number"
                placeholder="%"
                {...register('echo.lvef', { valueAsNumber: true })}
              />
              <Select
                label="RV Function"
                options={RV_FUNCTION_OPTIONS}
                placeholder="Select"
                {...register('echo.rvFunction')}
              />
              <Input
                label="IVC Collapsibility"
                type="number"
                placeholder="%"
                {...register('echo.ivcCollapsibility', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow columns={2}>
              <Input
                label="Wall Motion Abnormalities"
                placeholder="Describe any WMA"
                {...register('echo.wallMotion')}
              />
              <Input
                label="Valvular Findings"
                placeholder="Describe any valve issues"
                {...register('echo.valvular')}
              />
            </FormRow>
            <Checkbox
              label="Pericardial Effusion"
              description="Presence of pericardial fluid"
              {...register('echo.pericardialEffusion')}
            />
            <Textarea
              label="Echo Notes"
              placeholder="Additional echo findings..."
              fullWidth
              {...register('echo.notes')}
            />
          </FormSection>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <FormSection
              title="Interventions"
              description="Changes and procedures today"
            >
              <Textarea
                label="Vasopressor Changes"
                placeholder="Document any vasopressor adjustments..."
                fullWidth
                {...register('interventions.vasopressorChanges')}
              />
              <Textarea
                label="New Procedures"
                placeholder="Any new procedures or interventions..."
                fullWidth
                {...register('interventions.newProcedures')}
              />
              <Textarea
                label="Medication Changes"
                placeholder="Significant medication changes..."
                fullWidth
                {...register('interventions.medicationChanges')}
              />
            </FormSection>

            <FormSection
              title="Clinical Assessment"
              description="Overall patient status"
            >
              <div className="flex gap-6 mb-4">
                <Checkbox
                  label="Improving"
                  {...register('assessment.improving')}
                />
                <Checkbox
                  label="Stable"
                  {...register('assessment.stable')}
                />
                <Checkbox
                  label="Deteriorating"
                  {...register('assessment.deteriorating')}
                />
              </div>
              <Textarea
                label="Assessment Notes"
                placeholder="Brief assessment summary..."
                fullWidth
                {...register('assessment.comment')}
              />
            </FormSection>

            <FormSection title="Clinical Notes">
              <Textarea
                label="Daily Progress Notes"
                placeholder="Document the patient's progress, plan, and any concerns..."
                fullWidth
                rows={6}
                {...register('clinicalNotes')}
              />
            </FormSection>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(ROUTES.HOSPITAL.PATIENTS)}
          >
            Back to Patients
          </Button>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSubmitting}>
              Save Daily Entry
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default DailyEntryPage;
