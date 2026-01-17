/**
 * Pre-Admission Medications Page
 * Capture patient's home medications before ICU admission
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { FormSection, FormRow } from '../../components/ui/Form';

import {
  preAdmissionMedicationsSchema,
  DOSE_LEVEL_OPTIONS,
  DABIGATRAN_OPTIONS,
  APIXABAN_OPTIONS,
  RIVAROXABAN_OPTIONS,
  EDOXABAN_OPTIONS,
  FUROSEMIDE_OPTIONS,
  BETA_BLOCKER_OPTIONS,
  ACE_INHIBITOR_OPTIONS,
  ARB_OPTIONS,
  MRA_OPTIONS,
  SGLT2_INHIBITOR_OPTIONS,
  STATIN_OPTIONS,
  PCSK9_INHIBITOR_OPTIONS,
  GLP1_AGONIST_OPTIONS,
  RECONCILIATION_SOURCE_OPTIONS,
} from '../../lib/schemas';
import type { PreAdmissionMedicationsFormData } from '../../lib/schemas';
import { updateTracking } from '../../lib/supabase/rpc';
import { ROUTES } from '../../config/routes';

// Collapsible section component
function CollapsibleSection({
  title,
  description,
  isOpen,
  onToggle,
  children,
  hasSelections,
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hasSelections?: boolean;
}) {
  return (
    <Card className={hasSelections ? 'border-shock-blue' : ''}>
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
        {hasSelections && (
          <span className="px-2 py-1 bg-shock-blue-light text-shock-blue text-xs font-medium rounded">
            Has medications
          </span>
        )}
      </div>
      {isOpen && <CardContent className="pt-0 border-t">{children}</CardContent>}
    </Card>
  );
}

export function MedicationsPage() {
  const { tt } = useParams<{ tt: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Track which sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    anticoagulants: true,
    antiplatelets: false,
    heartFailure: false,
    diuretics: false,
    pulmonaryHTN: false,
    antiarrhythmics: false,
    lipidLowering: false,
    diabetes: false,
    other: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<PreAdmissionMedicationsFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(preAdmissionMedicationsSchema) as any,
    defaultValues: {
      medicationReconciliationDone: false,
      anticoagulants: {
        warfarin: '0',
        dabigatran: '0',
        apixaban: '0',
        rivaroxaban: '0',
        edoxaban: '0',
      },
      antiplatelets: {
        aspirin: '0',
        clopidogrel: '0',
        ticagrelor: '0',
        prasugrel: '0',
      },
      heartFailureMeds: {
        betaBlocker: '0',
        aceInhibitor: '0',
        arb: '0',
        arni: '0',
        mra: '0',
        sglt2Inhibitor: '0',
      },
      diuretics: {
        furosemide: '0',
        torasemide: '0',
        thiazide: '0',
      },
      antiarrhythmics: {
        flecainide: '0',
        propafenone: '0',
        verapamilDiltiazem: '0',
        amiodarone: '0',
        mexiletine: '0',
        sotalol: '0',
        dronedarone: '0',
        otherAntiarrhythmic: '0',
      },
      lipidLowering: {
        statin: '0',
        ezetimibe: '0',
        pcsk9Inhibitor: '0',
        fibrate: '0',
      },
      diabetesMeds: {
        metformin: '0',
        insulin: '0',
        dpp4Inhibitor: '0',
        glp1Agonist: '0',
        pioglitazone: '0',
        sulfonylurea: '0',
      },
      otherMeds: {
        immunomodulator: '0',
        corticosteroidChronic: '0',
        chemotherapy: '0',
        inhaledIcsLamaLaba: '0',
        protonPumpInhibitor: '0',
        thyroidMedication: '0',
        antidepressant: '0',
        antipsychotic: '0',
        anticonvulsant: '0',
        opioidChronic: '0',
      },
    },
  });

  // Watch for selections in each category
  const anticoagulants = watch('anticoagulants');
  const antiplatelets = watch('antiplatelets');
  const heartFailureMeds = watch('heartFailureMeds');
  const diuretics = watch('diuretics');
  const antiarrhythmics = watch('antiarrhythmics');
  const lipidLowering = watch('lipidLowering');
  const diabetesMeds = watch('diabetesMeds');
  const otherMeds = watch('otherMeds');

  // Check if any medications are selected in each category
  const hasAnticoagulants = anticoagulants && Object.values(anticoagulants).some((v) => v !== '0');
  const hasAntiplatelets = antiplatelets && Object.values(antiplatelets).some((v) => v !== '0');
  const hasHeartFailureMeds = heartFailureMeds && Object.entries(heartFailureMeds).some(([k, v]) => !k.includes('Name') && v !== '0');
  const hasDiuretics = diuretics && Object.entries(diuretics).some(([k, v]) => !k.includes('Dose') && v !== '0');
  const hasAntiarrhythmics = antiarrhythmics && Object.entries(antiarrhythmics).some(([k, v]) => !k.includes('Name') && v !== '0');
  const hasLipidLowering = lipidLowering && Object.entries(lipidLowering).some(([k, v]) => !k.includes('Name') && v !== '0');
  const hasDiabetesMeds = diabetesMeds && Object.entries(diabetesMeds).some(([k, v]) => !k.includes('Name') && !k.includes('Type') && !k.includes('Dose') && v !== '0');
  const hasOtherMeds = otherMeds && Object.entries(otherMeds).some(([k, v]) => !k.includes('Name') && !k.includes('Dose') && !k.includes('Regimen') && !k.includes('Details') && v !== '0');

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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Medications Saved</h2>
            <p className="text-gray-600 mb-6">
              Pre-admission medication list has been recorded.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(ROUTES.HOSPITAL.PATIENTS)}>Back to Patients</Button>
              <Button variant="secondary" onClick={() => navigate(ROUTES.HOSPITAL.ADMISSION.replace(':patientId', tt || ''))}>
                Continue to Admission
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
          <h2 className="text-2xl font-bold text-gray-800">Pre-Admission Medications</h2>
          <p className="text-gray-500 mt-1">
            {tt ? `TT: ${tt.substring(0, 8)}...` : 'Record patient home medications'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-shock-orange-light px-4 py-2 rounded-lg">
          <svg className="w-5 h-5 text-shock-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-sm font-medium text-shock-orange">Medication Reconciliation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Medication Reconciliation Status */}
        <Card className="bg-gray-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  label="Medication Reconciliation Completed"
                  description="Verified against reliable source"
                  {...register('medicationReconciliationDone')}
                />
              </div>
              <Select
                options={RECONCILIATION_SOURCE_OPTIONS}
                placeholder="Source"
                className="w-48"
                {...register('reconciliationSource')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Anticoagulants */}
        <CollapsibleSection
          title="Anticoagulants"
          description="Warfarin and DOACs"
          isOpen={openSections.anticoagulants}
          onToggle={() => toggleSection('anticoagulants')}
          hasSelections={hasAnticoagulants}
        >
          <div className="space-y-4">
            <FormRow>
              <div className="flex items-center gap-4">
                <Checkbox label="Warfarin" {...register('anticoagulants.warfarin')} />
              </div>
            </FormRow>
            <FormRow>
              <Select
                label="Dabigatran (Pradaxa)"
                options={DABIGATRAN_OPTIONS}
                {...register('anticoagulants.dabigatran')}
              />
              <Select
                label="Apixaban (Eliquis)"
                options={APIXABAN_OPTIONS}
                {...register('anticoagulants.apixaban')}
              />
            </FormRow>
            <FormRow>
              <Select
                label="Rivaroxaban (Xarelto)"
                options={RIVAROXABAN_OPTIONS}
                {...register('anticoagulants.rivaroxaban')}
              />
              <Select
                label="Edoxaban (Lixiana)"
                options={EDOXABAN_OPTIONS}
                {...register('anticoagulants.edoxaban')}
              />
            </FormRow>
          </div>
        </CollapsibleSection>

        {/* Antiplatelets */}
        <CollapsibleSection
          title="Antiplatelets"
          description="Aspirin and P2Y12 inhibitors"
          isOpen={openSections.antiplatelets}
          onToggle={() => toggleSection('antiplatelets')}
          hasSelections={hasAntiplatelets}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Checkbox label="Aspirin" {...register('antiplatelets.aspirin')} />
            <Checkbox label="Clopidogrel (Plavix)" {...register('antiplatelets.clopidogrel')} />
            <Checkbox label="Ticagrelor (Brilinta)" {...register('antiplatelets.ticagrelor')} />
            <Checkbox label="Prasugrel (Effient)" {...register('antiplatelets.prasugrel')} />
          </div>
        </CollapsibleSection>

        {/* Heart Failure Medications */}
        <CollapsibleSection
          title="Heart Failure Medications"
          description="GDMT: Beta-blockers, RAASi, SGLT2i"
          isOpen={openSections.heartFailure}
          onToggle={() => toggleSection('heartFailure')}
          hasSelections={hasHeartFailureMeds}
        >
          <div className="space-y-4">
            <FormRow>
              <Select
                label="Beta-Blocker"
                options={DOSE_LEVEL_OPTIONS}
                {...register('heartFailureMeds.betaBlocker')}
              />
              <Select
                label="Beta-Blocker Name"
                options={BETA_BLOCKER_OPTIONS}
                {...register('heartFailureMeds.betaBlockerName')}
              />
            </FormRow>
            <FormRow>
              <Select
                label="ACE Inhibitor"
                options={DOSE_LEVEL_OPTIONS}
                {...register('heartFailureMeds.aceInhibitor')}
              />
              <Select
                label="ACE Inhibitor Name"
                options={ACE_INHIBITOR_OPTIONS}
                {...register('heartFailureMeds.aceInhibitorName')}
              />
            </FormRow>
            <FormRow>
              <Select
                label="ARB"
                options={DOSE_LEVEL_OPTIONS}
                {...register('heartFailureMeds.arb')}
              />
              <Select
                label="ARB Name"
                options={ARB_OPTIONS}
                {...register('heartFailureMeds.arbName')}
              />
            </FormRow>
            <FormRow>
              <Select
                label="ARNI (Sacubitril/Valsartan)"
                options={DOSE_LEVEL_OPTIONS}
                {...register('heartFailureMeds.arni')}
              />
              <Select
                label="MRA"
                options={DOSE_LEVEL_OPTIONS}
                {...register('heartFailureMeds.mra')}
              />
              <Select
                label="MRA Name"
                options={MRA_OPTIONS}
                {...register('heartFailureMeds.mraName')}
              />
            </FormRow>
            <FormRow>
              <div className="flex items-center gap-4">
                <Checkbox label="SGLT2 Inhibitor" {...register('heartFailureMeds.sglt2Inhibitor')} />
              </div>
              <Select
                label="SGLT2i Name"
                options={SGLT2_INHIBITOR_OPTIONS}
                {...register('heartFailureMeds.sglt2InhibitorName')}
              />
            </FormRow>
          </div>
        </CollapsibleSection>

        {/* Diuretics */}
        <CollapsibleSection
          title="Diuretics"
          description="Loop diuretics and thiazides"
          isOpen={openSections.diuretics}
          onToggle={() => toggleSection('diuretics')}
          hasSelections={hasDiuretics}
        >
          <div className="space-y-4">
            <FormRow>
              <Select
                label="Furosemide (Lasix)"
                options={FUROSEMIDE_OPTIONS}
                {...register('diuretics.furosemide')}
              />
              <Input
                label="Actual Dose (mg/day)"
                type="number"
                placeholder="e.g., 80"
                {...register('diuretics.furosemideDose', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow>
              <div className="flex items-center gap-4">
                <Checkbox label="Torasemide" {...register('diuretics.torasemide')} />
              </div>
              <Input
                label="Torasemide Dose (mg)"
                type="number"
                {...register('diuretics.torasemideDose', { valueAsNumber: true })}
              />
              <div className="flex items-center gap-4">
                <Checkbox label="Thiazide Diuretic" {...register('diuretics.thiazide')} />
              </div>
            </FormRow>
          </div>
        </CollapsibleSection>

        {/* Pulmonary Hypertension */}
        <CollapsibleSection
          title="Pulmonary Hypertension Medications"
          description="PDE5i, ERAs, prostanoids"
          isOpen={openSections.pulmonaryHTN}
          onToggle={() => toggleSection('pulmonaryHTN')}
          hasSelections={false}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Checkbox label="Sildenafil" {...register('pulmonaryHTNMeds.sildenafil')} />
            <Checkbox label="Tadalafil" {...register('pulmonaryHTNMeds.tadalafil')} />
            <Checkbox label="Bosentan" {...register('pulmonaryHTNMeds.bosentan')} />
            <Checkbox label="Ambrisentan" {...register('pulmonaryHTNMeds.ambrisentan')} />
            <Checkbox label="Riociguat" {...register('pulmonaryHTNMeds.riociguat')} />
            <Checkbox label="Epoprostenol" {...register('pulmonaryHTNMeds.epoprostenol')} />
          </div>
        </CollapsibleSection>

        {/* Antiarrhythmics */}
        <CollapsibleSection
          title="Antiarrhythmics"
          description="Class I-IV antiarrhythmic agents"
          isOpen={openSections.antiarrhythmics}
          onToggle={() => toggleSection('antiarrhythmics')}
          hasSelections={hasAntiarrhythmics}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Checkbox label="Flecainide" {...register('antiarrhythmics.flecainide')} />
            <Checkbox label="Propafenone" {...register('antiarrhythmics.propafenone')} />
            <Checkbox label="Verapamil/Diltiazem" {...register('antiarrhythmics.verapamilDiltiazem')} />
            <Checkbox label="Amiodarone" {...register('antiarrhythmics.amiodarone')} />
            <Checkbox label="Mexiletine" {...register('antiarrhythmics.mexiletine')} />
            <Checkbox label="Sotalol" {...register('antiarrhythmics.sotalol')} />
            <Checkbox label="Dronedarone" {...register('antiarrhythmics.dronedarone')} />
            <Checkbox label="Other" {...register('antiarrhythmics.otherAntiarrhythmic')} />
          </div>
          <div className="mt-4">
            <Input
              label="Other Antiarrhythmic (specify)"
              placeholder="Drug name and dose"
              {...register('antiarrhythmics.otherAntiarrhythmicName')}
            />
          </div>
        </CollapsibleSection>

        {/* Lipid Lowering */}
        <CollapsibleSection
          title="Lipid Lowering"
          description="Statins, ezetimibe, PCSK9 inhibitors"
          isOpen={openSections.lipidLowering}
          onToggle={() => toggleSection('lipidLowering')}
          hasSelections={hasLipidLowering}
        >
          <div className="space-y-4">
            <FormRow>
              <Select
                label="Statin"
                options={DOSE_LEVEL_OPTIONS}
                {...register('lipidLowering.statin')}
              />
              <Select
                label="Statin Name"
                options={STATIN_OPTIONS}
                {...register('lipidLowering.statinName')}
              />
            </FormRow>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox label="Ezetimibe" {...register('lipidLowering.ezetimibe')} />
              <Checkbox label="Fibrate" {...register('lipidLowering.fibrate')} />
              <Checkbox label="PCSK9 Inhibitor" {...register('lipidLowering.pcsk9Inhibitor')} />
            </div>
            <Select
              label="PCSK9 Inhibitor Name"
              options={PCSK9_INHIBITOR_OPTIONS}
              {...register('lipidLowering.pcsk9InhibitorName')}
            />
          </div>
        </CollapsibleSection>

        {/* Diabetes */}
        <CollapsibleSection
          title="Diabetes Medications"
          description="Oral hypoglycemics and insulin"
          isOpen={openSections.diabetes}
          onToggle={() => toggleSection('diabetes')}
          hasSelections={hasDiabetesMeds}
        >
          <div className="space-y-4">
            <FormRow>
              <div className="flex items-center gap-4">
                <Checkbox label="Metformin" {...register('diabetesMeds.metformin')} />
              </div>
              <Input
                label="Metformin Dose (mg/day)"
                type="number"
                {...register('diabetesMeds.metforminDose', { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow>
              <div className="flex items-center gap-4">
                <Checkbox label="Insulin" {...register('diabetesMeds.insulin')} />
              </div>
              <Input
                label="Insulin Type"
                placeholder="e.g., Lantus + NovoRapid"
                {...register('diabetesMeds.insulinType')}
              />
              <Input
                label="Insulin Regimen"
                placeholder="e.g., 20U basal + TID"
                {...register('diabetesMeds.insulinDose')}
              />
            </FormRow>
            <FormRow>
              <div className="flex items-center gap-4">
                <Checkbox label="DPP-4 Inhibitor" {...register('diabetesMeds.dpp4Inhibitor')} />
              </div>
              <Input
                label="DPP-4i Name"
                placeholder="e.g., Sitagliptin"
                {...register('diabetesMeds.dpp4InhibitorName')}
              />
            </FormRow>
            <FormRow>
              <div className="flex items-center gap-4">
                <Checkbox label="GLP-1 Agonist" {...register('diabetesMeds.glp1Agonist')} />
              </div>
              <Select
                label="GLP-1 Agonist Name"
                options={GLP1_AGONIST_OPTIONS}
                {...register('diabetesMeds.glp1AgonistName')}
              />
            </FormRow>
            <div className="grid grid-cols-2 gap-4">
              <Checkbox label="Pioglitazone" {...register('diabetesMeds.pioglitazone')} />
              <Checkbox label="Sulfonylurea" {...register('diabetesMeds.sulfonylurea')} />
            </div>
          </div>
        </CollapsibleSection>

        {/* Other Medications */}
        <CollapsibleSection
          title="Other Medications"
          description="Immunomodulators, steroids, psychotropics, and more"
          isOpen={openSections.other}
          onToggle={() => toggleSection('other')}
          hasSelections={hasOtherMeds}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Checkbox label="Immunomodulator" {...register('otherMeds.immunomodulator')} />
              <Checkbox label="Chronic Corticosteroid" {...register('otherMeds.corticosteroidChronic')} />
              <Checkbox label="Chemotherapy" {...register('otherMeds.chemotherapy')} />
              <Checkbox label="Inhaled (ICS/LAMA/LABA)" {...register('otherMeds.inhaledIcsLamaLaba')} />
              <Checkbox label="PPI" {...register('otherMeds.protonPumpInhibitor')} />
              <Checkbox label="Thyroid Medication" {...register('otherMeds.thyroidMedication')} />
              <Checkbox label="Antidepressant" {...register('otherMeds.antidepressant')} />
              <Checkbox label="Antipsychotic" {...register('otherMeds.antipsychotic')} />
              <Checkbox label="Anticonvulsant" {...register('otherMeds.anticonvulsant')} />
              <Checkbox label="Chronic Opioid" {...register('otherMeds.opioidChronic')} />
            </div>
            <FormRow>
              <Input
                label="Immunomodulator Name"
                placeholder="e.g., Methotrexate"
                {...register('otherMeds.immunomodulatorName')}
              />
              <Input
                label="Steroid Details"
                placeholder="e.g., Prednisolone 10mg"
                {...register('otherMeds.corticosteroidDose')}
              />
            </FormRow>
            <Input
              label="Chemotherapy Regimen"
              placeholder="e.g., FOLFOX"
              fullWidth
              {...register('otherMeds.chemotherapyRegimen')}
            />
          </div>
        </CollapsibleSection>

        {/* Additional Medications */}
        <FormSection title="Additional Medications" description="Any other medications not listed above">
          <Textarea
            label="Other Medications"
            placeholder="List any additional medications with doses..."
            fullWidth
            {...register('otherMedicationsList')}
          />
        </FormSection>

        {/* Allergies & Adverse Reactions */}
        <FormSection title="Allergies & Adverse Reactions" description="Document known drug allergies">
          <FormRow>
            <Textarea
              label="Drug Allergies"
              placeholder="List known drug allergies..."
              fullWidth
              {...register('allergies')}
            />
            <Textarea
              label="Adverse Drug Reactions"
              placeholder="Previous adverse reactions (non-allergic)..."
              fullWidth
              {...register('adverseReactions')}
            />
          </FormRow>
        </FormSection>

        {/* Notes */}
        <FormSection title="Additional Notes" description="Any relevant medication notes">
          <Textarea
            label="Medication Notes"
            placeholder="Compliance issues, recent changes, holding instructions..."
            fullWidth
            {...register('medicationNotes')}
          />
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
            Save Medications
          </Button>
        </div>
      </form>
    </div>
  );
}

export default MedicationsPage;
