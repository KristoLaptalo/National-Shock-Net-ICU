/**
 * Admission Tab
 * ICU admission form within patient detail view
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Textarea } from '../../../../components/ui/Textarea';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { FormSection, FormRow } from '../../../../components/ui/Form';
import { AnonymizationBadge, StatusBadge } from '../../../../components/ui/Badge';

import {
  admissionSchema,
  ADMISSION_SOURCE_OPTIONS,
  VENT_MODE_OPTIONS,
} from '../../../../lib/schemas';
import type { AdmissionFormData } from '../../../../lib/schemas';
import { updateTracking } from '../../../../lib/supabase/rpc';
import { usePatient } from '../../../../features/patient';

export function AdmissionTab() {
  const { tt, patient, status } = usePatient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmitted, setIsAdmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      icuUnit: '',
      bedNumber: '',
      attendingPhysician: '',
      admissionDateTime: '',
      admissionSource: '',
      hasArterialLine: false,
      hasCentralLine: false,
      hasPAC: false,
      onVasopressors: false,
      onMechanicalVent: false,
    },
  });

  const onVasopressors = watch('onVasopressors');
  const onMechanicalVent = watch('onMechanicalVent');

  const onSubmit = async (data: unknown) => {
    const formData = data as AdmissionFormData;
    setIsSubmitting(true);

    try {
      const admissionNote = {
        type: 'admission',
        timestamp: formData.admissionDateTime || new Date().toISOString(),
        data: {
          icuUnit: formData.icuUnit,
          bedNumber: formData.bedNumber,
          attendingPhysician: formData.attendingPhysician,
          primaryNurse: formData.primaryNurse,
          admissionSource: formData.admissionSource,
          initialGCS: formData.initialGCS,
          initialSOFA: formData.initialSOFA,
          monitoring: {
            hasArterialLine: formData.hasArterialLine,
            hasCentralLine: formData.hasCentralLine,
            hasPAC: formData.hasPAC,
          },
          vasopressors: {
            active: formData.onVasopressors,
            details: formData.vasopressorDetails,
          },
          ventilation: {
            active: formData.onMechanicalVent,
            mode: formData.ventMode,
          },
          notes: formData.admissionNotes,
        },
      };

      await updateTracking(tt, {
        notes: admissionNote,
      });

      console.log('Patient admitted:', formData);
      setIsAdmitted(true);
    } catch (error) {
      console.error('Failed to admit patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-shock-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-shock-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Admitted to ICU</h2>
            <p className="text-gray-600 mb-4">
              The patient has been successfully admitted. You can now start daily entries.
            </p>
            <div className="mb-6">
              <AnonymizationBadge code={tt} size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ICU Admission</h2>
          <p className="text-gray-500 mt-1">Complete the admission form for approved patients</p>
        </div>
      </div>

      {patient && (
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AnonymizationBadge code={tt} />
                <div>
                  <p className="text-sm text-gray-500">
                    {patient.ageBracket} y/o {patient.sex === 'M' ? 'Male' : 'Female'}
                  </p>
                  <p className="font-medium capitalize">{patient.shockType} Shock - SCAI {patient.scaiStage}</p>
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Bed Assignment" description="ICU unit and bed allocation">
          <FormRow>
            <Select
              label="ICU Unit"
              options={[
                { value: 'cicu', label: 'CICU - Cardiac ICU' },
                { value: 'micu', label: 'MICU - Medical ICU' },
                { value: 'sicu', label: 'SICU - Surgical ICU' },
                { value: 'cvicu', label: 'CVICU - Cardiovascular ICU' },
              ]}
              placeholder="Select ICU unit"
              error={errors.icuUnit?.message}
              required
              {...register('icuUnit')}
            />
            <Input label="Bed Number" placeholder="e.g., 12A" error={errors.bedNumber?.message} required {...register('bedNumber')} />
          </FormRow>
        </FormSection>

        <FormSection title="Care Team" description="Assigned physicians and nurses">
          <FormRow>
            <Input label="Attending Physician" placeholder="Dr. ..." error={errors.attendingPhysician?.message} required {...register('attendingPhysician')} />
            <Input label="Primary Nurse" placeholder="Nurse name" {...register('primaryNurse')} />
          </FormRow>
        </FormSection>

        <FormSection title="Admission Details" description="Date, time, and source">
          <FormRow>
            <Input label="Admission Date/Time" type="datetime-local" error={errors.admissionDateTime?.message} required {...register('admissionDateTime')} />
            <Select label="Admission Source" options={ADMISSION_SOURCE_OPTIONS} placeholder="Select source" error={errors.admissionSource?.message} required {...register('admissionSource')} />
          </FormRow>
        </FormSection>

        <FormSection title="Initial Assessment" description="Admission severity scores">
          <FormRow>
            <Input label="GCS Score" type="number" min={3} max={15} placeholder="3-15" {...register('initialGCS', { valueAsNumber: true })} />
            <Input label="SOFA Score" type="number" min={0} max={24} placeholder="0-24" {...register('initialSOFA', { valueAsNumber: true })} />
          </FormRow>
        </FormSection>

        <FormSection title="Invasive Monitoring" description="Lines and catheters">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Checkbox label="Arterial Line" description="For continuous BP monitoring" {...register('hasArterialLine')} />
            <Checkbox label="Central Line" description="Central venous catheter" {...register('hasCentralLine')} />
            <Checkbox label="PA Catheter" description="Swan-Ganz catheter" {...register('hasPAC')} />
          </div>
        </FormSection>

        <FormSection title="Vasopressor Support" description="Current vasopressor therapy">
          <Checkbox label="On Vasopressors" description="Patient is receiving vasopressor support" {...register('onVasopressors')} />
          {onVasopressors && (
            <div className="mt-4">
              <Textarea label="Vasopressor Details" placeholder="e.g., Norepinephrine 0.1 mcg/kg/min" fullWidth {...register('vasopressorDetails')} />
            </div>
          )}
        </FormSection>

        <FormSection title="Mechanical Ventilation" description="Current ventilatory support">
          <Checkbox label="On Mechanical Ventilation" description="Patient is intubated and ventilated" {...register('onMechanicalVent')} />
          {onMechanicalVent && (
            <div className="mt-4">
              <Select label="Ventilator Mode" options={VENT_MODE_OPTIONS} placeholder="Select mode" {...register('ventMode')} />
            </div>
          )}
        </FormSection>

        <FormSection title="Admission Notes">
          <Textarea label="Additional Notes" placeholder="Any additional information relevant to admission..." fullWidth rows={4} {...register('admissionNotes')} />
        </FormSection>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" isLoading={isSubmitting}>
            Admit Patient
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdmissionTab;
