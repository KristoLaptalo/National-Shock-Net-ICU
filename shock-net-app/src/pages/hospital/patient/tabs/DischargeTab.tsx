/**
 * Discharge Tab
 * Outcome recording and case archival within patient detail view
 * Read-only for discharged patients
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Textarea } from '../../../../components/ui/Textarea';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { FormSection, FormRow } from '../../../../components/ui/Form';
import { AnonymizationBadge, StatusBadge, ScaiBadge } from '../../../../components/ui/Badge';

import {
  dischargeSchema,
  DISCHARGE_DESTINATION_OPTIONS,
  OUTCOME_STATUS_OPTIONS,
  SCAI_STAGE_OPTIONS,
} from '../../../../lib/schemas';
import type { DischargeFormData } from '../../../../lib/schemas';
import { setTrackingOutcome, closeAndArchiveTracking } from '../../../../lib/supabase/rpc';
import { ROUTES } from '../../../../config/routes';
import { usePatient } from '../../../../features/patient';

export function DischargeTab() {
  const navigate = useNavigate();
  const { tt, patient, status } = usePatient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registryId, setRegistryId] = useState<string | null>(null);

  const isReadOnly = status === 'discharged' || status === 'archived';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dischargeSchema),
    defaultValues: {
      dischargeDateTime: '',
      destination: '' as DischargeFormData['destination'],
      outcomeStatus: '' as DischargeFormData['outcomeStatus'],
      icuLengthOfStays: patient?.icuDay || 0,
      peakScaiStage: patient?.scaiStage || 'C',
      hadAKI: false,
      hadARDS: false,
      hadInfection: false,
      hadBleeding: false,
      hadStroke: false,
      hadArrhythmia: false,
      hadPCI: false,
      hadCABG: false,
      hadIABP: false,
      hadImpella: false,
      hadECMO: false,
      hadRRT: false,
      consentToArchive: true,
    },
  });

  const outcomeStatus = watch('outcomeStatus');
  const consentToArchive = watch('consentToArchive');

  const onSubmit = async (data: unknown) => {
    const formData = data as DischargeFormData;
    setIsSubmitting(true);

    try {
      const outcomeData = {
        dischargeDateTime: formData.dischargeDateTime,
        destination: formData.destination,
        icuLengthOfStays: formData.icuLengthOfStays,
        totalVentDays: formData.totalVentDays,
        totalVasopressorDays: formData.totalVasopressorDays,
        peakScaiStage: formData.peakScaiStage,
        finalScaiStage: formData.finalScaiStage,
        complications: {
          hadAKI: formData.hadAKI,
          hadARDS: formData.hadARDS,
          hadInfection: formData.hadInfection,
          hadBleeding: formData.hadBleeding,
          hadStroke: formData.hadStroke,
          hadArrhythmia: formData.hadArrhythmia,
          other: formData.otherComplications,
        },
        interventions: {
          hadPCI: formData.hadPCI,
          hadCABG: formData.hadCABG,
          hadIABP: formData.hadIABP,
          hadImpella: formData.hadImpella,
          hadECMO: formData.hadECMO,
          hadRRT: formData.hadRRT,
          other: formData.otherInterventions,
        },
        dischargeCondition: {
          gcs: formData.dischargeGCS,
          sofa: formData.dischargeSOFA,
          ambulatoryStatus: formData.ambulatoryStatus,
        },
        dischargeSummary: formData.dischargeSummary,
        followUpPlan: formData.followUpPlan,
        consentToArchive: formData.consentToArchive,
      };

      await setTrackingOutcome(tt, {
        outcome_status: formData.outcomeStatus,
        outcome_data: outcomeData,
      });

      if (formData.consentToArchive) {
        const result = await closeAndArchiveTracking(tt);
        setRegistryId(result.registry_id);
      } else {
        setRegistryId('NOT-ARCHIVED');
      }

      console.log('Patient discharged and archived:', formData);
    } catch (error) {
      console.error('Failed to discharge patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registryId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-shock-purple-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-shock-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Case Archived Successfully</h2>
            <p className="text-gray-600 mb-4">The patient has been discharged and the case has been permanently archived.</p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-500 mb-2">Registry ID (for Decursus Morbi)</p>
              <div className="bg-white border-2 border-shock-purple rounded-lg p-4">
                <code className="text-xl font-mono text-shock-purple font-bold">{registryId}</code>
              </div>
              <p className="text-xs text-gray-400 mt-2">Copy this ID to the patient's medical records</p>
            </div>

            <div className="bg-shock-orange-light rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-shock-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-shock-orange">Important</p>
                  <p className="text-sm text-gray-700">
                    The Tracking Token (TT) has been permanently destroyed.
                    Re-identification is only possible via hospital medical records using the Registry ID above.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(ROUTES.HOSPITAL.DASHBOARD)}>Return to Dashboard</Button>
              <Button variant="secondary" onClick={() => navigate(ROUTES.HOSPITAL.PATIENTS)}>View Patients</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Read-only view for discharged patients
  if (isReadOnly) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Discharge Summary</h2>
            <p className="text-gray-500 mt-1">This case has been discharged and archived</p>
          </div>
        </div>

        <Card className="mb-6 bg-shock-purple-light border-shock-purple">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AnonymizationBadge code={tt} />
                <div>
                  <p className="font-medium capitalize">{patient?.shockType} Shock</p>
                  <p className="text-sm text-gray-600">Case archived</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {patient && <ScaiBadge stage={patient.scaiStage} />}
                <StatusBadge status={status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-600">
              This patient has been discharged. The case data is read-only and permanently archived in the registry.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Discharge & Archive</h2>
          <p className="text-gray-500 mt-1">Record outcome and archive the case</p>
        </div>
      </div>

      {patient && (
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AnonymizationBadge code={tt} />
                <div>
                  <p className="font-medium capitalize">{patient.shockType} Shock</p>
                  <p className="text-sm text-gray-500">
                    ICU Days: {patient.icuDay} | Admitted: {patient.admittedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScaiBadge stage={patient.scaiStage} />
                <StatusBadge status={status} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Discharge Details" description="Date, time, and destination">
          <FormRow>
            <Input label="Discharge Date/Time" type="datetime-local" error={errors.dischargeDateTime?.message} required {...register('dischargeDateTime')} />
            <Select label="Discharge Destination" options={DISCHARGE_DESTINATION_OPTIONS} placeholder="Select destination" error={errors.destination?.message} required {...register('destination')} />
          </FormRow>
        </FormSection>

        <FormSection title="Outcome" description="Patient outcome status">
          <Select label="Outcome Status" options={OUTCOME_STATUS_OPTIONS} placeholder="Select outcome" error={errors.outcomeStatus?.message} required fullWidth {...register('outcomeStatus')} />
          {(outcomeStatus === 'died_icu' || outcomeStatus === 'died_hospital') && (
            <div className="mt-4 p-4 bg-shock-red-light rounded-lg">
              <p className="text-sm text-shock-red">Our condolences. The case will be archived with mortality data for quality improvement purposes.</p>
            </div>
          )}
        </FormSection>

        <FormSection title="ICU Stay Summary" description="Duration and severity metrics">
          <FormRow columns={3}>
            <Input label="ICU Length of Stay (days)" type="number" min={0} {...register('icuLengthOfStays', { valueAsNumber: true })} />
            <Input label="Total Ventilator Days" type="number" min={0} {...register('totalVentDays', { valueAsNumber: true })} />
            <Input label="Total Vasopressor Days" type="number" min={0} {...register('totalVasopressorDays', { valueAsNumber: true })} />
          </FormRow>
          <FormRow>
            <Select label="Peak SCAI Stage" options={SCAI_STAGE_OPTIONS} {...register('peakScaiStage')} />
            <Select label="Final SCAI Stage" options={SCAI_STAGE_OPTIONS} {...register('finalScaiStage')} />
          </FormRow>
        </FormSection>

        <FormSection title="Complications" description="Complications during ICU stay">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Checkbox label="Acute Kidney Injury (AKI)" {...register('hadAKI')} />
            <Checkbox label="ARDS" {...register('hadARDS')} />
            <Checkbox label="Infection/Sepsis" {...register('hadInfection')} />
            <Checkbox label="Bleeding" {...register('hadBleeding')} />
            <Checkbox label="Stroke" {...register('hadStroke')} />
            <Checkbox label="Arrhythmia" {...register('hadArrhythmia')} />
          </div>
          <Textarea label="Other Complications" placeholder="List any other complications..." fullWidth {...register('otherComplications')} />
        </FormSection>

        <FormSection title="Interventions" description="Procedures performed during stay">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Checkbox label="PCI" description="Percutaneous Coronary Intervention" {...register('hadPCI')} />
            <Checkbox label="CABG" description="Coronary Artery Bypass" {...register('hadCABG')} />
            <Checkbox label="IABP" description="Intra-Aortic Balloon Pump" {...register('hadIABP')} />
            <Checkbox label="Impella" {...register('hadImpella')} />
            <Checkbox label="ECMO" {...register('hadECMO')} />
            <Checkbox label="RRT" description="Renal Replacement Therapy" {...register('hadRRT')} />
          </div>
          <Textarea label="Other Interventions" placeholder="List any other significant interventions..." fullWidth {...register('otherInterventions')} />
        </FormSection>

        <FormSection title="Discharge Condition" description="Patient status at discharge">
          <FormRow columns={3}>
            <Input label="Discharge GCS" type="number" min={3} max={15} placeholder="3-15" {...register('dischargeGCS', { valueAsNumber: true })} />
            <Input label="Discharge SOFA" type="number" min={0} max={24} placeholder="0-24" {...register('dischargeSOFA', { valueAsNumber: true })} />
            <Input label="Ambulatory Status" placeholder="e.g., Bed-bound, Chair, Walking" {...register('ambulatoryStatus')} />
          </FormRow>
        </FormSection>

        <FormSection title="Discharge Documentation">
          <Textarea label="Discharge Summary" placeholder="Brief summary of ICU course and discharge plan..." fullWidth rows={4} {...register('dischargeSummary')} />
          <Textarea label="Follow-up Plan" placeholder="Recommended follow-up and outpatient care..." fullWidth rows={3} {...register('followUpPlan')} />
        </FormSection>

        <FormSection title="Archive Consent" description="Consent to archive case data">
          <div className="bg-shock-purple-light rounded-lg p-4">
            <Checkbox
              label="Consent to Archive"
              description="I confirm that this case should be permanently archived in the National Shock Net registry. The Tracking Token (TT) will be destroyed and replaced with a Registry ID."
              {...register('consentToArchive')}
            />
          </div>
          {!consentToArchive && (
            <p className="text-sm text-shock-orange mt-2">
              Note: Without archive consent, the case data will not be included in the national registry.
            </p>
          )}
        </FormSection>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button type="submit" isLoading={isSubmitting} className="bg-shock-purple hover:bg-shock-purple/90">
            Discharge & Archive Case
          </Button>
        </div>
      </form>
    </div>
  );
}

export default DischargeTab;
