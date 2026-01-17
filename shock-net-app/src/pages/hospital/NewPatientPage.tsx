/**
 * New Patient Page
 * Form for submitting new shock patients to the registry
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { FormSection, FormRow } from '../../components/ui/Form';
import { AnonymizationBadge } from '../../components/ui/Badge';

import {
  newPatientSchema,
  AGE_BRACKETS,
  SHOCK_TYPE_OPTIONS,
  SCAI_STAGE_OPTIONS,
} from '../../lib/schemas';
import type { NewPatientFormData } from '../../lib/schemas';
import { createTracking } from '../../lib/supabase/rpc';
import { ROUTES } from '../../config/routes';

export function NewPatientPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTT, setGeneratedTT] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newPatientSchema),
    defaultValues: {
      ageBracket: '',
      sex: '' as 'M' | 'F',
      shockType: '' as NewPatientFormData['shockType'],
      scaiStage: '' as NewPatientFormData['scaiStage'],
      mapBelow65: false,
      sbpBelow90: false,
      lactateAbove2: false,
      primaryDiagnosis: '',
      hasCAD: false,
      hasHF: false,
      hasDM: false,
      hasHTN: false,
      hasCKD: false,
      hasCOPD: false,
      hasStroke: false,
    },
  });

  const lactateAbove2 = watch('lactateAbove2');

  const onSubmit = async (data: unknown) => {
    const formData = data as NewPatientFormData;
    setIsSubmitting(true);

    try {
      // Parse age bracket to get decade (e.g., "60-69" -> 60)
      const ageDecade = parseInt(formData.ageBracket.split('-')[0], 10);

      // Bundle admission criteria and medical history as admission_data
      const admissionData = {
        admission_criteria: {
          mapBelow65: formData.mapBelow65,
          sbpBelow90: formData.sbpBelow90,
          lactateAbove2: formData.lactateAbove2,
          lactateValue: formData.lactateValue,
        },
        working_diagnosis: {
          primary: formData.primaryDiagnosis,
          secondary: formData.secondaryDiagnoses,
        },
        medical_history: {
          hasCAD: formData.hasCAD,
          hasHF: formData.hasHF,
          hasDM: formData.hasDM,
          hasHTN: formData.hasHTN,
          hasCKD: formData.hasCKD,
          hasCOPD: formData.hasCOPD,
          hasStroke: formData.hasStroke,
          other: formData.otherHistory,
        },
      };

      // Call Supabase RPC to create tracking
      const tt = await createTracking({
        shock_type: formData.shockType,
        scai_stage: formData.scaiStage,
        age_decade: ageDecade,
        sex: formData.sex,
        admission_data: admissionData,
      });

      setGeneratedTT(tt);
      console.log('Patient submitted with TT:', tt);
    } catch (error) {
      console.error('Failed to submit patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state after submission
  if (generatedTT) {
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
              Patient Submitted Successfully
            </h2>
            <p className="text-gray-600 mb-4">
              The patient has been anonymized and submitted for review.
            </p>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Tracking Token (TT)</p>
              <AnonymizationBadge code={generatedTT} size="lg" />
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Save this token to track the patient's status. It will be used until the case is archived.
            </p>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Recommended Next Steps:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`${ROUTES.HOSPITAL.MEDICAL_HISTORY}/${generatedTT}`)}
                >
                  Complete Medical History
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`${ROUTES.HOSPITAL.MEDICATIONS}/${generatedTT}`)}
                >
                  Add Pre-admission Medications
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`${ROUTES.HOSPITAL.ADMISSION}/${generatedTT}`)}
                >
                  ICU Admission
                </Button>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(ROUTES.HOSPITAL.PATIENTS)}>
                View Patients
              </Button>
              <Button variant="secondary" onClick={() => setGeneratedTT(null)}>
                Submit Another
              </Button>
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
          <h2 className="text-2xl font-bold text-gray-800">Submit New Patient</h2>
          <p className="text-gray-500 mt-1">
            Patient data will be anonymized before submission
          </p>
        </div>
        <div className="flex items-center gap-2 bg-shock-purple-light px-4 py-2 rounded-lg">
          <svg
            className="w-5 h-5 text-shock-purple"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-sm font-medium text-shock-purple">
            Privacy Protected
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Demographics Section */}
        <FormSection
          title="Demographics"
          description="Basic anonymized patient information"
        >
          <FormRow>
            <Select
              label="Age Bracket"
              options={AGE_BRACKETS}
              placeholder="Select age range"
              error={errors.ageBracket?.message}
              required
              {...register('ageBracket')}
            />
            <Select
              label="Sex"
              options={[
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
              ]}
              placeholder="Select sex"
              error={errors.sex?.message}
              required
              {...register('sex')}
            />
          </FormRow>
        </FormSection>

        {/* Shock Classification Section */}
        <FormSection
          title="Shock Classification"
          description="Primary shock type and SCAI stage"
        >
          <FormRow>
            <Select
              label="Shock Type"
              options={SHOCK_TYPE_OPTIONS}
              placeholder="Select shock type"
              error={errors.shockType?.message}
              required
              {...register('shockType')}
            />
            <Select
              label="SCAI Stage"
              options={SCAI_STAGE_OPTIONS}
              placeholder="Select SCAI stage"
              error={errors.scaiStage?.message}
              required
              {...register('scaiStage')}
            />
          </FormRow>
        </FormSection>

        {/* Admission Criteria Section */}
        <FormSection
          title="Admission Criteria"
          description="Mandatory criteria for shock admission"
        >
          <div className="space-y-3">
            <Checkbox
              label="MAP < 65 mmHg"
              description="Mean Arterial Pressure below 65 mmHg"
              {...register('mapBelow65')}
            />
            <Checkbox
              label="SBP < 90 mmHg"
              description="Systolic Blood Pressure below 90 mmHg"
              {...register('sbpBelow90')}
            />
            <Checkbox
              label="Lactate > 2 mmol/L"
              description="Elevated lactate indicating tissue hypoperfusion"
              {...register('lactateAbove2')}
            />
          </div>
          {lactateAbove2 && (
            <div className="mt-4">
              <Input
                label="Lactate Value (mmol/L)"
                type="number"
                step="0.1"
                placeholder="Enter lactate value"
                error={errors.lactateValue?.message}
                {...register('lactateValue', { valueAsNumber: true })}
              />
            </div>
          )}
        </FormSection>

        {/* Working Diagnosis Section */}
        <FormSection
          title="Working Diagnosis"
          description="Primary and secondary diagnoses"
        >
          <Input
            label="Primary Diagnosis"
            placeholder="e.g., Acute MI with cardiogenic shock"
            error={errors.primaryDiagnosis?.message}
            fullWidth
            required
            {...register('primaryDiagnosis')}
          />
          <Textarea
            label="Secondary Diagnoses"
            placeholder="List any secondary diagnoses (one per line)"
            fullWidth
            {...register('secondaryDiagnoses')}
          />
        </FormSection>

        {/* Medical History Section */}
        <FormSection
          title="Medical History"
          description="Quick entry - complete detailed 28-field history after submission"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Checkbox label="CAD" description="Coronary Artery Disease" {...register('hasCAD')} />
            <Checkbox label="Heart Failure" {...register('hasHF')} />
            <Checkbox label="Diabetes" {...register('hasDM')} />
            <Checkbox label="Hypertension" {...register('hasHTN')} />
            <Checkbox label="CKD" description="Chronic Kidney Disease" {...register('hasCKD')} />
            <Checkbox label="COPD" {...register('hasCOPD')} />
            <Checkbox label="Stroke/TIA" {...register('hasStroke')} />
          </div>
          <Textarea
            label="Other Relevant History"
            placeholder="Any other relevant medical history"
            fullWidth
            {...register('otherHistory')}
          />
          <p className="text-sm text-gray-500 mt-3">
            After submission, use the detailed Medical History form for comprehensive 28-field comorbidity assessment.
          </p>
        </FormSection>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(ROUTES.HOSPITAL.PATIENTS)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Submit Patient
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewPatientPage;
