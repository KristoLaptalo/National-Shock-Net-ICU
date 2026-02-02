/**
 * Medications Tab
 * Pre-admission medications form within patient detail view
 * Simplified version - references original MedicationsPage patterns
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

import {
  preAdmissionMedicationsSchema,
  DOSE_LEVEL_OPTIONS,
  DABIGATRAN_OPTIONS,
  APIXABAN_OPTIONS,
  RIVAROXABAN_OPTIONS,
  EDOXABAN_OPTIONS,
  FUROSEMIDE_OPTIONS,
  RECONCILIATION_SOURCE_OPTIONS,
} from '../../../../lib/schemas';
import type { PreAdmissionMedicationsFormData } from '../../../../lib/schemas';
import { updateTracking } from '../../../../lib/supabase/rpc';
import { usePatient } from '../../../../features/patient';

export function MedicationsTab() {
  const { tt } = usePatient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
  } = useForm<PreAdmissionMedicationsFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(preAdmissionMedicationsSchema) as any,
    defaultValues: {
      medicationReconciliationDone: false,
    },
  });

  const onSubmit = async (data: PreAdmissionMedicationsFormData) => {
    if (!tt) {
      console.error('No tracking token provided');
      return;
    }

    setIsSubmitting(true);
    try {
      const medicationsData = {
        pre_admission_medications: {
          ...data,
          recorded_at: new Date().toISOString(),
        },
      };

      await updateTracking(tt, medicationsData);
      setSubmitSuccess(true);
      console.log('Medications data saved successfully');
    } catch (error) {
      console.error('Failed to save medications data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-shock-green-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-shock-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Medications Saved</h2>
            <p className="text-gray-600 mb-6">
              Pre-admission medication list has been recorded.
            </p>
            <Button onClick={() => setSubmitSuccess(false)}>
              Edit Medications
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pre-Admission Medications</h2>
          <p className="text-gray-500 mt-1">Record patient home medications</p>
        </div>
        <div className="flex items-center gap-2 bg-shock-orange-light px-4 py-2 rounded-lg">
          <svg className="w-5 h-5 text-shock-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-sm font-medium text-shock-orange">Medication Reconciliation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-gray-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <Checkbox
                label="Medication Reconciliation Completed"
                description="Verified against reliable source"
                {...register('medicationReconciliationDone')}
              />
              <Select
                options={RECONCILIATION_SOURCE_OPTIONS}
                placeholder="Source"
                className="w-48"
                {...register('reconciliationSource')}
              />
            </div>
          </CardContent>
        </Card>

        <FormSection title="Anticoagulants" description="Warfarin and DOACs">
          <FormRow>
            <Checkbox label="Warfarin" {...register('anticoagulants.warfarin')} />
          </FormRow>
          <FormRow>
            <Select label="Dabigatran" options={DABIGATRAN_OPTIONS} {...register('anticoagulants.dabigatran')} />
            <Select label="Apixaban" options={APIXABAN_OPTIONS} {...register('anticoagulants.apixaban')} />
          </FormRow>
          <FormRow>
            <Select label="Rivaroxaban" options={RIVAROXABAN_OPTIONS} {...register('anticoagulants.rivaroxaban')} />
            <Select label="Edoxaban" options={EDOXABAN_OPTIONS} {...register('anticoagulants.edoxaban')} />
          </FormRow>
        </FormSection>

        <FormSection title="Antiplatelets" description="Aspirin and P2Y12 inhibitors">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Checkbox label="Aspirin" {...register('antiplatelets.aspirin')} />
            <Checkbox label="Clopidogrel" {...register('antiplatelets.clopidogrel')} />
            <Checkbox label="Ticagrelor" {...register('antiplatelets.ticagrelor')} />
            <Checkbox label="Prasugrel" {...register('antiplatelets.prasugrel')} />
          </div>
        </FormSection>

        <FormSection title="Heart Failure Medications" description="GDMT: Beta-blockers, RAASi, SGLT2i">
          <FormRow>
            <Select label="Beta-Blocker" options={DOSE_LEVEL_OPTIONS} {...register('heartFailureMeds.betaBlocker')} />
            <Select label="ACE Inhibitor" options={DOSE_LEVEL_OPTIONS} {...register('heartFailureMeds.aceInhibitor')} />
            <Select label="ARB" options={DOSE_LEVEL_OPTIONS} {...register('heartFailureMeds.arb')} />
          </FormRow>
          <FormRow>
            <Select label="ARNI" options={DOSE_LEVEL_OPTIONS} {...register('heartFailureMeds.arni')} />
            <Select label="MRA" options={DOSE_LEVEL_OPTIONS} {...register('heartFailureMeds.mra')} />
            <Checkbox label="SGLT2 Inhibitor" {...register('heartFailureMeds.sglt2Inhibitor')} />
          </FormRow>
        </FormSection>

        <FormSection title="Diuretics" description="Loop diuretics and thiazides">
          <FormRow>
            <Select label="Furosemide" options={FUROSEMIDE_OPTIONS} {...register('diuretics.furosemide')} />
            <Input label="Dose (mg/day)" type="number" {...register('diuretics.furosemideDose', { valueAsNumber: true })} />
          </FormRow>
          <FormRow>
            <Checkbox label="Torasemide" {...register('diuretics.torasemide')} />
            <Checkbox label="Thiazide" {...register('diuretics.thiazide')} />
          </FormRow>
        </FormSection>

        <FormSection title="Allergies & Adverse Reactions">
          <FormRow>
            <Textarea label="Drug Allergies" placeholder="List known drug allergies..." fullWidth {...register('allergies')} />
            <Textarea label="Adverse Drug Reactions" placeholder="Previous adverse reactions..." fullWidth {...register('adverseReactions')} />
          </FormRow>
        </FormSection>

        <FormSection title="Additional Notes">
          <Textarea label="Medication Notes" placeholder="Compliance issues, recent changes..." fullWidth {...register('medicationNotes')} />
        </FormSection>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" isLoading={isSubmitting}>
            Save Medications
          </Button>
        </div>
      </form>
    </div>
  );
}

export default MedicationsTab;
