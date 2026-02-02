/**
 * History Tab
 * Medical history form within patient detail view
 * Reuses MedicalHistoryPage form logic with context-based TT
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
  medicalHistorySchema,
  HEART_FAILURE_TYPE_OPTIONS,
  AF_TYPE_OPTIONS,
  DEVICE_TYPE_OPTIONS,
  PSYCHIATRIC_STATUS_OPTIONS,
  DIABETES_STATUS_OPTIONS,
  HYPERTENSION_STATUS_OPTIONS,
  ADIPOSITY_OPTIONS,
  SEVERITY_4_OPTIONS,
  CKD_STAGE_OPTIONS,
  PH_STATUS_OPTIONS,
  GI_DISORDER_OPTIONS,
  CANCER_STATUS_OPTIONS,
  SOLID_TUMOR_OPTIONS,
  SMOKING_STATUS_OPTIONS,
  ALCOHOL_USE_OPTIONS,
  NYHA_CLASS_OPTIONS,
  LIVER_ETIOLOGY_OPTIONS,
  PULMONARY_TYPE_OPTIONS,
} from '../../../../lib/schemas';
import type { MedicalHistoryFormData } from '../../../../lib/schemas';
import { updateTracking } from '../../../../lib/supabase/rpc';
import { usePatient } from '../../../../features/patient';

// Collapsible section component
function CollapsibleSection({
  title,
  description,
  isOpen,
  onToggle,
  children,
  fieldCount,
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  fieldCount?: number;
}) {
  return (
    <Card>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        {fieldCount !== undefined && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
            {fieldCount} fields
          </span>
        )}
      </div>
      {isOpen && <CardContent className="pt-0 border-t">{children}</CardContent>}
    </Card>
  );
}

export function HistoryTab() {
  const { tt } = usePatient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Track which sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    cardiovascular: true,
    neurological: false,
    metabolic: false,
    organSystems: false,
    autoimmune: false,
    oncology: false,
    infectious: false,
    other: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<MedicalHistoryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(medicalHistorySchema) as any,
    defaultValues: {
      cardiovascular: {
        cad: '0',
        priorRevascularization: '0',
        historyMI: '0',
        chronicHeartFailure: '0',
        severeValvularDisease: '0',
        atrialFibFlutter: '0',
        implantedPacemaker: '0',
      },
      neurological: {
        cerebrovascularDisease: '0',
        priorTIAInsult: '0',
        hemiplegiaMotorDeficit: '0',
        dementia: '0',
        psychiatricDisease: '0',
      },
      metabolic: {
        diabetes: '0',
        hypertension: '0',
        dyslipidemia: '0',
        adiposity: '0',
      },
      organSystems: {
        liverDisease: '0',
        peripheralArteryDisease: '0',
        chronicKidneyDisease: '0',
        chronicPulmonaryDisease: '0',
        pulmonaryHypertension: '0',
        chronicGastricDisorder: '0',
      },
      autoimmune: {
        connectiveTissueDisorder: '0',
        autoimmuneDisorder: '0',
      },
      oncology: {
        leukemia: '0',
        lymphoma: '0',
        solidOrganTumor: '0',
      },
      infectious: {
        hivAids: '0',
        chronicHepB: '0',
        chronicHepC: '0',
        latentTB: '0',
      },
    },
  });

  // Watch key fields for conditional rendering
  const cardiovascular = watch('cardiovascular');
  const neurological = watch('neurological');
  const metabolic = watch('metabolic');
  const organSystems = watch('organSystems');
  const oncology = watch('oncology');
  const infectious = watch('infectious');

  const onSubmit = async (data: MedicalHistoryFormData) => {
    if (!tt) {
      console.error('No tracking token provided');
      return;
    }

    setIsSubmitting(true);
    try {
      const historyData = {
        medical_history: {
          ...data,
          recorded_at: new Date().toISOString(),
        },
      };

      await updateTracking(tt, historyData);
      setSubmitSuccess(true);
      console.log('Medical history saved successfully');
    } catch (error) {
      console.error('Failed to save medical history:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Medical History Saved</h2>
            <p className="text-gray-600 mb-6">
              Comprehensive medical history has been recorded.
            </p>
            <Button onClick={() => setSubmitSuccess(false)}>
              Edit History
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
          <h2 className="text-2xl font-bold text-gray-800">Medical History</h2>
          <p className="text-gray-500 mt-1">
            Comprehensive comorbidity assessment (28 fields)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-shock-teal-light px-4 py-2 rounded-lg">
          <svg className="w-5 h-5 text-shock-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium text-shock-teal">Charlson Index</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Cardiovascular History */}
        <CollapsibleSection
          title="Cardiovascular"
          description="CAD, Heart Failure, Arrhythmias, Devices"
          isOpen={openSections.cardiovascular}
          onToggle={() => toggleSection('cardiovascular')}
          fieldCount={7}
        >
          <div className="space-y-6">
            {/* CAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Checkbox label="Coronary Artery Disease (CAD)" {...register('cardiovascular.cad')} />
                {cardiovascular?.cad === '1' && (
                  <Input
                    className="mt-2"
                    placeholder="Details (e.g., 3-vessel disease)"
                    {...register('cardiovascular.cadDetails')}
                  />
                )}
              </div>
              <div>
                <Checkbox label="Prior Revascularization" {...register('cardiovascular.priorRevascularization')} />
                {cardiovascular?.priorRevascularization === '1' && (
                  <FormRow className="mt-2">
                    <Select
                      options={[
                        { value: 'cabg', label: 'CABG' },
                        { value: 'pci', label: 'PCI' },
                        { value: 'both', label: 'Both' },
                      ]}
                      placeholder="Type"
                      {...register('cardiovascular.revascularizationType')}
                    />
                    <Input
                      type="number"
                      placeholder="Year"
                      {...register('cardiovascular.revascularizationYear', { valueAsNumber: true })}
                    />
                  </FormRow>
                )}
              </div>
            </div>

            {/* MI History */}
            <div>
              <Checkbox label="History of Myocardial Infarction" {...register('cardiovascular.historyMI')} />
              {cardiovascular?.historyMI === '1' && (
                <FormRow className="mt-2">
                  <Select
                    options={[
                      { value: 'stemi', label: 'STEMI' },
                      { value: 'nstemi', label: 'NSTEMI' },
                      { value: 'unknown', label: 'Unknown' },
                    ]}
                    placeholder="Type"
                    {...register('cardiovascular.miType')}
                  />
                  <Input
                    type="number"
                    placeholder="Year"
                    {...register('cardiovascular.miYear', { valueAsNumber: true })}
                  />
                </FormRow>
              )}
            </div>

            {/* Heart Failure */}
            <div>
              <Select
                label="Chronic Heart Failure"
                options={HEART_FAILURE_TYPE_OPTIONS}
                {...register('cardiovascular.chronicHeartFailure')}
              />
              {cardiovascular?.chronicHeartFailure !== '0' && (
                <FormRow className="mt-2">
                  <Input
                    label="Last Known LVEF (%)"
                    type="number"
                    placeholder="e.g., 35"
                    {...register('cardiovascular.heartFailureEF', { valueAsNumber: true })}
                  />
                  <Select
                    label="NYHA Class"
                    options={NYHA_CLASS_OPTIONS}
                    {...register('cardiovascular.heartFailureNYHA')}
                  />
                </FormRow>
              )}
            </div>

            {/* Valvular Disease */}
            <div>
              <Checkbox label="Severe Valvular Disease" {...register('cardiovascular.severeValvularDisease')} />
              {cardiovascular?.severeValvularDisease === '1' && (
                <Input
                  className="mt-2"
                  placeholder="e.g., Severe AS, Moderate MR"
                  {...register('cardiovascular.valvularDiseaseType')}
                />
              )}
            </div>

            {/* AF/Flutter */}
            <div>
              <Select
                label="Atrial Fibrillation / Flutter"
                options={AF_TYPE_OPTIONS}
                {...register('cardiovascular.atrialFibFlutter')}
              />
              {cardiovascular?.atrialFibFlutter !== '0' && (
                <FormRow className="mt-2">
                  <Checkbox label="On Anticoagulation" {...register('cardiovascular.afAnticoagulated')} />
                  <Input
                    label="CHA2DS2-VASc Score"
                    type="number"
                    min={0}
                    max={9}
                    {...register('cardiovascular.chadsVascScore', { valueAsNumber: true })}
                  />
                </FormRow>
              )}
            </div>

            {/* Devices */}
            <div>
              <Select
                label="Implanted Cardiac Device"
                options={DEVICE_TYPE_OPTIONS}
                {...register('cardiovascular.implantedPacemaker')}
              />
              {cardiovascular?.implantedPacemaker !== '0' && (
                <FormRow className="mt-2">
                  <Input
                    label="Implant Year"
                    type="number"
                    {...register('cardiovascular.deviceImplantYear', { valueAsNumber: true })}
                  />
                  <Input
                    label="Indication"
                    placeholder="e.g., Complete heart block"
                    {...register('cardiovascular.deviceIndication')}
                  />
                </FormRow>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Neurological History */}
        <CollapsibleSection
          title="Neurological"
          description="CVD, Stroke, Dementia, Psychiatric"
          isOpen={openSections.neurological}
          onToggle={() => toggleSection('neurological')}
          fieldCount={5}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Checkbox label="Cerebrovascular Disease" {...register('neurological.cerebrovascularDisease')} />
                {neurological?.cerebrovascularDisease === '1' && (
                  <Input
                    className="mt-2"
                    placeholder="Details"
                    {...register('neurological.cvdType')}
                  />
                )}
              </div>
              <div>
                <Checkbox label="Prior TIA / Stroke" {...register('neurological.priorTIAInsult')} />
                {neurological?.priorTIAInsult === '1' && (
                  <FormRow className="mt-2">
                    <Select
                      options={[
                        { value: 'ischemic', label: 'Ischemic' },
                        { value: 'hemorrhagic', label: 'Hemorrhagic' },
                        { value: 'tia', label: 'TIA' },
                      ]}
                      {...register('neurological.strokeType')}
                    />
                    <Input
                      type="number"
                      placeholder="Year"
                      {...register('neurological.strokeYear', { valueAsNumber: true })}
                    />
                  </FormRow>
                )}
              </div>
            </div>

            <div>
              <Checkbox label="Hemiplegia / Motor Deficit" {...register('neurological.hemiplegiaMotorDeficit')} />
              {neurological?.hemiplegiaMotorDeficit === '1' && (
                <FormRow className="mt-2">
                  <Select
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                      { value: 'bilateral', label: 'Bilateral' },
                    ]}
                    placeholder="Side"
                    {...register('neurological.motorDeficitSide')}
                  />
                  <Select
                    options={[
                      { value: 'mild', label: 'Mild' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'severe', label: 'Severe' },
                    ]}
                    placeholder="Severity"
                    {...register('neurological.motorDeficitSeverity')}
                  />
                </FormRow>
              )}
            </div>

            <div>
              <Checkbox label="Dementia" {...register('neurological.dementia')} />
              {neurological?.dementia === '1' && (
                <FormRow className="mt-2">
                  <Select
                    options={[
                      { value: 'alzheimers', label: "Alzheimer's" },
                      { value: 'vascular', label: 'Vascular' },
                      { value: 'mixed', label: 'Mixed' },
                      { value: 'other', label: 'Other' },
                    ]}
                    placeholder="Type"
                    {...register('neurological.dementiaType')}
                  />
                  <Select
                    options={[
                      { value: 'mild', label: 'Mild' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'severe', label: 'Severe' },
                    ]}
                    placeholder="Severity"
                    {...register('neurological.dementiaSeverity')}
                  />
                </FormRow>
              )}
            </div>

            <div>
              <Select
                label="Psychiatric Disease"
                options={PSYCHIATRIC_STATUS_OPTIONS}
                {...register('neurological.psychiatricDisease')}
              />
              {neurological?.psychiatricDisease !== '0' && (
                <Input
                  className="mt-2"
                  placeholder="Diagnosis (e.g., Bipolar, Depression)"
                  {...register('neurological.psychiatricDiagnosis')}
                />
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Metabolic History */}
        <CollapsibleSection
          title="Metabolic"
          description="Diabetes, Hypertension, Dyslipidemia, Obesity"
          isOpen={openSections.metabolic}
          onToggle={() => toggleSection('metabolic')}
          fieldCount={4}
        >
          <div className="space-y-4">
            <div>
              <Select
                label="Diabetes Mellitus"
                options={DIABETES_STATUS_OPTIONS}
                {...register('metabolic.diabetes')}
              />
              {metabolic?.diabetes !== '0' && (
                <div className="mt-2 space-y-2">
                  <FormRow>
                    <Select
                      label="Type"
                      options={[
                        { value: 'type1', label: 'Type 1' },
                        { value: 'type2', label: 'Type 2' },
                      ]}
                      {...register('metabolic.diabetesType')}
                    />
                    <Input
                      label="Last HbA1c (%)"
                      type="number"
                      step="0.1"
                      {...register('metabolic.lastHbA1c', { valueAsNumber: true })}
                    />
                  </FormRow>
                  {metabolic?.diabetes === '2' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded">
                      <Checkbox label="Retinopathy" {...register('metabolic.diabeticComplications.retinopathy')} />
                      <Checkbox label="Nephropathy" {...register('metabolic.diabeticComplications.nephropathy')} />
                      <Checkbox label="Neuropathy" {...register('metabolic.diabeticComplications.neuropathy')} />
                      <Checkbox label="Foot Ulcers" {...register('metabolic.diabeticComplications.footUlcers')} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Select
                label="Hypertension"
                options={HYPERTENSION_STATUS_OPTIONS}
                {...register('metabolic.hypertension')}
              />
              {metabolic?.hypertension !== '0' && (
                <FormRow className="mt-2">
                  <Input
                    label="Duration (years)"
                    type="number"
                    {...register('metabolic.hypertensionYears', { valueAsNumber: true })}
                  />
                  <Checkbox label="Known Secondary HTN" {...register('metabolic.knownSecondaryHTN')} />
                </FormRow>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Checkbox label="Dyslipidemia" {...register('metabolic.dyslipidemia')} />
                {metabolic?.dyslipidemia === '1' && (
                  <FormRow className="mt-2">
                    <Checkbox label="On Statin" {...register('metabolic.dyslipidemiaOnStatin')} />
                    <Input
                      label="Last LDL"
                      type="number"
                      placeholder="mmol/L or mg/dL"
                      {...register('metabolic.lastLDL', { valueAsNumber: true })}
                    />
                  </FormRow>
                )}
              </div>
              <div>
                <Select
                  label="Adiposity"
                  options={ADIPOSITY_OPTIONS}
                  {...register('metabolic.adiposity')}
                />
                {metabolic?.adiposity !== '0' && (
                  <Input
                    className="mt-2"
                    label="Current BMI"
                    type="number"
                    step="0.1"
                    {...register('metabolic.currentBMI', { valueAsNumber: true })}
                  />
                )}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Organ Systems */}
        <CollapsibleSection
          title="Organ Systems"
          description="Liver, PAD, CKD, Lung, PH, GI"
          isOpen={openSections.organSystems}
          onToggle={() => toggleSection('organSystems')}
          fieldCount={6}
        >
          <div className="space-y-4">
            {/* Liver Disease */}
            <div>
              <Select
                label="Liver Disease"
                options={SEVERITY_4_OPTIONS}
                {...register('organSystems.liverDisease')}
              />
              {organSystems?.liverDisease !== '0' && (
                <FormRow className="mt-2">
                  <Select
                    label="Etiology"
                    options={LIVER_ETIOLOGY_OPTIONS}
                    {...register('organSystems.liverDiseaseEtiology')}
                  />
                  {organSystems?.liverDisease === '3' && (
                    <>
                      <Select
                        label="Child-Pugh"
                        options={[
                          { value: 'A', label: 'A (5-6)' },
                          { value: 'B', label: 'B (7-9)' },
                          { value: 'C', label: 'C (10-15)' },
                        ]}
                        {...register('organSystems.childPughScore')}
                      />
                      <Input
                        label="MELD Score"
                        type="number"
                        {...register('organSystems.meldScore', { valueAsNumber: true })}
                      />
                    </>
                  )}
                </FormRow>
              )}
            </div>

            {/* PAD */}
            <div>
              <Checkbox label="Peripheral Artery Disease" {...register('organSystems.peripheralArteryDisease')} />
              {organSystems?.peripheralArteryDisease === '1' && (
                <FormRow className="mt-2">
                  <Select
                    label="Fontaine Class"
                    options={[
                      { value: 'I', label: 'I - Asymptomatic' },
                      { value: 'IIa', label: 'IIa - Claudication >200m' },
                      { value: 'IIb', label: 'IIb - Claudication <200m' },
                      { value: 'III', label: 'III - Rest pain' },
                      { value: 'IV', label: 'IV - Ulcers/gangrene' },
                    ]}
                    {...register('organSystems.padFontaineClass')}
                  />
                  <Checkbox label="Prior PAD Intervention" {...register('organSystems.priorPADIntervention')} />
                </FormRow>
              )}
            </div>

            {/* CKD */}
            <div>
              <Select
                label="Chronic Kidney Disease"
                options={CKD_STAGE_OPTIONS}
                {...register('organSystems.chronicKidneyDisease')}
              />
              {organSystems?.chronicKidneyDisease !== '0' && (
                <FormRow className="mt-2">
                  <Input
                    label="Baseline Creatinine (umol/L)"
                    type="number"
                    {...register('organSystems.baselineCreatinine', { valueAsNumber: true })}
                  />
                  <Input
                    label="Baseline eGFR"
                    type="number"
                    {...register('organSystems.baselineEGFR', { valueAsNumber: true })}
                  />
                  {organSystems?.chronicKidneyDisease === '3' && (
                    <>
                      <Checkbox label="On Dialysis" {...register('organSystems.onDialysis')} />
                      <Select
                        label="Dialysis Type"
                        options={[
                          { value: 'hemodialysis', label: 'Hemodialysis' },
                          { value: 'peritoneal', label: 'Peritoneal' },
                        ]}
                        {...register('organSystems.dialysisType')}
                      />
                    </>
                  )}
                </FormRow>
              )}
            </div>

            {/* Pulmonary Disease */}
            <div>
              <Select
                label="Chronic Pulmonary Disease"
                options={SEVERITY_4_OPTIONS}
                {...register('organSystems.chronicPulmonaryDisease')}
              />
              {organSystems?.chronicPulmonaryDisease !== '0' && (
                <FormRow className="mt-2">
                  <Select
                    label="Type"
                    options={PULMONARY_TYPE_OPTIONS}
                    {...register('organSystems.pulmonaryDiseaseType')}
                  />
                  <Select
                    label="GOLD Stage (COPD)"
                    options={[
                      { value: '1', label: 'GOLD 1 (Mild)' },
                      { value: '2', label: 'GOLD 2 (Moderate)' },
                      { value: '3', label: 'GOLD 3 (Severe)' },
                      { value: '4', label: 'GOLD 4 (Very Severe)' },
                    ]}
                    {...register('organSystems.goldStage')}
                  />
                  <Checkbox label="On Home O2" {...register('organSystems.onHomeO2')} />
                </FormRow>
              )}
            </div>

            {/* Pulmonary Hypertension */}
            <div>
              <Select
                label="Pulmonary Hypertension"
                options={PH_STATUS_OPTIONS}
                {...register('organSystems.pulmonaryHypertension')}
              />
              {organSystems?.pulmonaryHypertension !== '0' && organSystems?.pulmonaryHypertension !== '3' && (
                <FormRow className="mt-2">
                  <Select
                    label="WHO Group"
                    options={[
                      { value: '1', label: 'Group 1 - PAH' },
                      { value: '2', label: 'Group 2 - Left Heart' },
                      { value: '3', label: 'Group 3 - Lung Disease' },
                      { value: '4', label: 'Group 4 - CTEPH' },
                      { value: '5', label: 'Group 5 - Multifactorial' },
                    ]}
                    {...register('organSystems.phGroup')}
                  />
                  <Input
                    label="Last RVSP (mmHg)"
                    type="number"
                    {...register('organSystems.lastRVSP', { valueAsNumber: true })}
                  />
                </FormRow>
              )}
            </div>

            {/* GI Disorder */}
            <div>
              <Select
                label="Chronic Gastric Disorder"
                options={GI_DISORDER_OPTIONS}
                {...register('organSystems.chronicGastricDisorder')}
              />
              {organSystems?.chronicGastricDisorder !== '0' && (
                <FormRow className="mt-2">
                  <Checkbox label="History of GI Bleeding" {...register('organSystems.giBleedingHistory')} />
                  <Checkbox label="On PPI" {...register('organSystems.onPPI')} />
                </FormRow>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Autoimmune */}
        <CollapsibleSection
          title="Autoimmune / Connective Tissue"
          description="CTD, Autoimmune disorders"
          isOpen={openSections.autoimmune}
          onToggle={() => toggleSection('autoimmune')}
          fieldCount={2}
        >
          <div className="space-y-4">
            <div>
              <Checkbox label="Connective Tissue Disorder" {...register('autoimmune.connectiveTissueDisorder')} />
              <Input
                className="mt-2"
                placeholder="e.g., Rheumatoid Arthritis, SLE, Scleroderma"
                {...register('autoimmune.ctdType')}
              />
            </div>
            <div>
              <Checkbox label="Autoimmune Disorder" {...register('autoimmune.autoimmuneDisorder')} />
              <Input
                className="mt-2"
                placeholder="e.g., Hashimoto's, Crohn's, Ulcerative Colitis"
                {...register('autoimmune.autoimmuneType')}
              />
            </div>
            <FormRow>
              <Checkbox label="On Immunosuppression" {...register('autoimmune.onImmunosuppression')} />
              <Input
                placeholder="Drugs (e.g., Methotrexate, Azathioprine)"
                {...register('autoimmune.immunosuppressionDrugs')}
              />
            </FormRow>
          </div>
        </CollapsibleSection>

        {/* Oncology */}
        <CollapsibleSection
          title="Oncology"
          description="Leukemia, Lymphoma, Solid Tumors"
          isOpen={openSections.oncology}
          onToggle={() => toggleSection('oncology')}
          fieldCount={3}
        >
          <div className="space-y-4">
            <div>
              <Select
                label="Leukemia"
                options={CANCER_STATUS_OPTIONS}
                {...register('oncology.leukemia')}
              />
              {oncology?.leukemia !== '0' && (
                <FormRow className="mt-2">
                  <Input
                    placeholder="Type (e.g., AML, CLL)"
                    {...register('oncology.leukemiaType')}
                  />
                  <Input
                    type="number"
                    placeholder="Year diagnosed"
                    {...register('oncology.leukemiaYearDiagnosed', { valueAsNumber: true })}
                  />
                </FormRow>
              )}
            </div>

            <div>
              <Select
                label="Lymphoma"
                options={CANCER_STATUS_OPTIONS}
                {...register('oncology.lymphoma')}
              />
              {oncology?.lymphoma !== '0' && (
                <FormRow className="mt-2">
                  <Input
                    placeholder="Type (e.g., Hodgkin's, DLBCL)"
                    {...register('oncology.lymphomaType')}
                  />
                  <Input
                    type="number"
                    placeholder="Year diagnosed"
                    {...register('oncology.lymphomaYearDiagnosed', { valueAsNumber: true })}
                  />
                </FormRow>
              )}
            </div>

            <div>
              <Select
                label="Solid Organ Tumor"
                options={SOLID_TUMOR_OPTIONS}
                {...register('oncology.solidOrganTumor')}
              />
              {oncology?.solidOrganTumor !== '0' && (
                <div className="mt-2 space-y-2">
                  <FormRow>
                    <Input
                      placeholder="Tumor type (e.g., Lung adenocarcinoma)"
                      {...register('oncology.tumorType')}
                    />
                    <Input
                      placeholder="Primary site"
                      {...register('oncology.tumorSite')}
                    />
                    <Input
                      type="number"
                      placeholder="Year diagnosed"
                      {...register('oncology.tumorYearDiagnosed', { valueAsNumber: true })}
                    />
                  </FormRow>
                  <FormRow>
                    <Checkbox label="On Active Chemotherapy" {...register('oncology.onActiveChemo')} />
                    <Checkbox label="On Active Radiation" {...register('oncology.onActiveRadiation')} />
                  </FormRow>
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Infectious */}
        <CollapsibleSection
          title="Infectious Disease"
          description="HIV, Hepatitis, TB"
          isOpen={openSections.infectious}
          onToggle={() => toggleSection('infectious')}
          fieldCount={4}
        >
          <div className="space-y-4">
            <div>
              <Checkbox label="HIV / AIDS" {...register('infectious.hivAids')} />
              {infectious?.hivAids === '1' && (
                <FormRow className="mt-2">
                  <Checkbox label="On ART" {...register('infectious.hivOnART')} />
                  <Input
                    label="Last CD4 Count"
                    type="number"
                    {...register('infectious.lastCD4Count', { valueAsNumber: true })}
                  />
                  <Input
                    label="Last Viral Load"
                    placeholder="Undetectable or copies/mL"
                    {...register('infectious.lastViralLoad')}
                  />
                </FormRow>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Checkbox label="Chronic Hepatitis B" {...register('infectious.chronicHepB')} />
              <Checkbox label="Chronic Hepatitis C" {...register('infectious.chronicHepC')} />
              <Checkbox label="Latent TB" {...register('infectious.latentTB')} />
            </div>
          </div>
        </CollapsibleSection>

        {/* Other History */}
        <CollapsibleSection
          title="Additional History"
          description="Surgical, Family, Social History"
          isOpen={openSections.other}
          onToggle={() => toggleSection('other')}
        >
          <div className="space-y-4">
            <FormSection title="Surgical History">
              <Textarea
                placeholder="List prior surgeries with approximate years..."
                fullWidth
                {...register('priorSurgeries')}
              />
              <Input
                label="Prior Anesthesia Complications"
                placeholder="e.g., Difficult airway, MH risk"
                fullWidth
                {...register('priorAnesthesiaComplications')}
              />
            </FormSection>

            <FormSection title="Family History">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Checkbox label="Family Hx of CAD" {...register('familyHistoryCAD')} />
                <Checkbox label="Family Hx of Sudden Death" {...register('familyHistorySuddenDeath')} />
                <Checkbox label="Family Hx of Cardiomyopathy" {...register('familyHistoryCardiomyopathy')} />
              </div>
              <Input
                className="mt-2"
                placeholder="Other relevant family history"
                fullWidth
                {...register('familyHistoryOther')}
              />
            </FormSection>

            <FormSection title="Social History">
              <FormRow>
                <Select
                  label="Smoking Status"
                  options={SMOKING_STATUS_OPTIONS}
                  {...register('smokingStatus')}
                />
                <Input
                  label="Pack-Years"
                  type="number"
                  {...register('packYears', { valueAsNumber: true })}
                />
                <Select
                  label="Alcohol Use"
                  options={ALCOHOL_USE_OPTIONS}
                  {...register('alcoholUse')}
                />
              </FormRow>
            </FormSection>

            <FormSection title="Charlson Comorbidity Index">
              <FormRow>
                <Input
                  label="Calculated CCI"
                  type="number"
                  placeholder="0-37"
                  {...register('charlsonComorbidityIndex', { valueAsNumber: true })}
                />
                <Input
                  label="Age-Adjusted CCI"
                  type="number"
                  {...register('ageAdjustedCCI', { valueAsNumber: true })}
                />
              </FormRow>
            </FormSection>

            <Textarea
              label="Additional Notes"
              placeholder="Any other relevant medical history..."
              fullWidth
              {...register('additionalHistory')}
            />
          </div>
        </CollapsibleSection>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" isLoading={isSubmitting}>
            Save Medical History
          </Button>
        </div>
      </form>
    </div>
  );
}

export default HistoryTab;
