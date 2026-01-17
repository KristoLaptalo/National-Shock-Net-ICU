/**
 * Mechanical Circulatory Support (MCS) Entry Page
 * Manage MCS devices for shock patients
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Checkbox } from '../../components/ui/Checkbox';
import { FormSection, FormRow } from '../../components/ui/Form';

import {
  mcsEntrySchema,
  MCS_DEVICE_OPTIONS,
  INSERTION_LOCATION_OPTIONS,
  ACCESS_SITE_OPTIONS,
  MCS_INDICATION_OPTIONS,
  REMOVAL_REASON_OPTIONS,
  IMPELLA_P_LEVEL_OPTIONS,
  IABP_RATIO_OPTIONS,
} from '../../lib/schemas';
import type { MCSEntryFormData, MCSDeviceType } from '../../lib/schemas';
import { updateTracking } from '../../lib/supabase/rpc';
import { ROUTES } from '../../config/routes';

export function MCSPage() {
  const { tt } = useParams<{ tt: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'entry' | 'monitoring' | 'weaning'>('entry');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MCSEntryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(mcsEntrySchema) as any,
    defaultValues: {
      isActive: true,
      deviceType: undefined,
      insertionDate: new Date().toISOString().split('T')[0],
      weaningStarted: false,
      complications: {
        bleeding: false,
        hemolysis: false,
        limbIschemia: false,
        thrombosis: false,
        stroke: false,
        infection: false,
        migration: false,
        vascularInjury: false,
        airEmbolism: false,
        pumpFailure: false,
      },
    },
  });

  const selectedDevice = watch('deviceType');
  const weaningStarted = watch('weaningStarted');
  const complications = watch('complications');

  // Determine which settings panel to show based on device type
  const isIABP = selectedDevice === 'iabp';
  const isImpella = selectedDevice?.startsWith('impella');
  const isECMO = selectedDevice === 'va_ecmo' || selectedDevice === 'vv_ecmo' || selectedDevice === 'ecpella';

  const onSubmit = async (data: MCSEntryFormData) => {
    if (!tt) {
      console.error('No tracking token provided');
      return;
    }

    setIsSubmitting(true);
    try {
      // Bundle MCS data for storage
      const mcsData = {
        mcs: {
          ...data,
          recorded_at: new Date().toISOString(),
        },
      };

      await updateTracking(tt, mcsData);
      setSubmitSuccess(true);
      console.log('MCS data saved successfully');
    } catch (error) {
      console.error('Failed to save MCS data:', error);
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">MCS Data Saved</h2>
            <p className="text-gray-600 mb-6">
              Mechanical circulatory support information has been recorded.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(ROUTES.HOSPITAL.PATIENTS)}>Back to Patients</Button>
              <Button variant="secondary" onClick={() => setSubmitSuccess(false)}>
                Add Another Device
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
          <h2 className="text-2xl font-bold text-gray-800">Mechanical Circulatory Support</h2>
          <p className="text-gray-500 mt-1">
            {tt ? `TT: ${tt.substring(0, 8)}...` : 'Manage MCS devices'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-shock-red-light px-4 py-2 rounded-lg">
          <svg className="w-5 h-5 text-shock-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm font-medium text-shock-red">Critical Care</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {(['entry', 'monitoring', 'weaning'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'entry' ? 'Device Entry' : tab === 'monitoring' ? 'Monitoring' : 'Weaning/Removal'}
          </Button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Device Entry Tab */}
        {activeTab === 'entry' && (
          <>
            {/* Device Selection */}
            <FormSection title="Device Selection" description="Select the MCS device being used">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {MCS_DEVICE_OPTIONS.map((device) => (
                  <div
                    key={device.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedDevice === device.value
                        ? 'border-shock-blue bg-shock-blue-light'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setValue('deviceType', device.value as MCSDeviceType)}
                  >
                    <p className="font-medium text-sm">{device.label}</p>
                    <p className="text-xs text-gray-500">{device.description}</p>
                  </div>
                ))}
              </div>
              {errors.deviceType && (
                <p className="text-sm text-shock-red mt-2">{errors.deviceType.message}</p>
              )}
            </FormSection>

            {/* Insertion Details */}
            <FormSection title="Insertion Details" description="When and where the device was placed">
              <FormRow>
                <Input
                  label="Insertion Date"
                  type="date"
                  error={errors.insertionDate?.message}
                  required
                  {...register('insertionDate')}
                />
                <Input
                  label="Insertion Time"
                  type="time"
                  {...register('insertionTime')}
                />
              </FormRow>
              <FormRow>
                <Select
                  label="Insertion Location"
                  options={INSERTION_LOCATION_OPTIONS}
                  error={errors.insertionLocation?.message}
                  required
                  {...register('insertionLocation')}
                />
                <Select
                  label="Access Site"
                  options={ACCESS_SITE_OPTIONS}
                  error={errors.accessSite?.message}
                  required
                  {...register('accessSite')}
                />
                <Select
                  label="Side"
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'right', label: 'Right' },
                    { value: 'bilateral', label: 'Bilateral' },
                  ]}
                  {...register('accessSide')}
                />
              </FormRow>
            </FormSection>

            {/* Indication */}
            <FormSection title="Indication" description="Reason for MCS placement">
              <FormRow>
                <Select
                  label="Primary Indication"
                  options={MCS_INDICATION_OPTIONS}
                  error={errors.indication?.message}
                  required
                  {...register('indication')}
                />
              </FormRow>
              <Textarea
                label="Additional Notes"
                placeholder="Clinical context, hemodynamic status prior to insertion..."
                {...register('indicationNotes')}
              />
            </FormSection>

            {/* ECMO Cannulation Details */}
            {isECMO && (
              <FormSection title="Cannulation Details" description="ECMO cannula specifications">
                <FormRow>
                  <Input
                    label="Arterial Cannula Size (Fr)"
                    type="number"
                    placeholder="15-21"
                    {...register('arterialCannulaSize', { valueAsNumber: true })}
                  />
                  <Input
                    label="Venous Cannula Size (Fr)"
                    type="number"
                    placeholder="21-29"
                    {...register('venousCannulaSize', { valueAsNumber: true })}
                  />
                </FormRow>
                <FormRow>
                  <Input
                    label="Drainage Cannula Location"
                    placeholder="e.g., Right femoral vein"
                    {...register('drainageCannulaLocation')}
                  />
                  <Input
                    label="Return Cannula Location"
                    placeholder="e.g., Right femoral artery"
                    {...register('returnCannulaLocation')}
                  />
                </FormRow>
              </FormSection>
            )}
          </>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <>
            {/* IABP Settings */}
            {isIABP && (
              <FormSection title="IABP Settings" description="Current IABP configuration">
                <FormRow>
                  <Select
                    label="Augmentation Ratio"
                    options={IABP_RATIO_OPTIONS}
                    {...register('iabpSettings.ratio')}
                  />
                  <Input
                    label="Augmentation (%)"
                    type="number"
                    placeholder="0-100"
                    {...register('iabpSettings.augmentation', { valueAsNumber: true })}
                  />
                </FormRow>
              </FormSection>
            )}

            {/* Impella Settings */}
            {isImpella && (
              <FormSection title="Impella Settings" description="Current Impella configuration">
                <FormRow>
                  <Select
                    label="P-Level"
                    options={IMPELLA_P_LEVEL_OPTIONS}
                    {...register('impellaSettings.pLevel')}
                  />
                  <Input
                    label="Flow (L/min)"
                    type="number"
                    step="0.1"
                    placeholder="0-6"
                    {...register('impellaSettings.flow', { valueAsNumber: true })}
                  />
                </FormRow>
                <FormRow>
                  <Input
                    label="Motor Current (A)"
                    type="number"
                    step="0.01"
                    {...register('impellaSettings.motorCurrent', { valueAsNumber: true })}
                  />
                  <Input
                    label="Purge Flow (mL/hr)"
                    type="number"
                    {...register('impellaSettings.purgeFlow', { valueAsNumber: true })}
                  />
                  <Input
                    label="Purge Pressure (mmHg)"
                    type="number"
                    {...register('impellaSettings.purgePressure', { valueAsNumber: true })}
                  />
                </FormRow>
                <Select
                  label="Placement Signal"
                  options={[
                    { value: 'optimal', label: 'Optimal' },
                    { value: 'suboptimal', label: 'Suboptimal' },
                    { value: 'repositioning_needed', label: 'Repositioning Needed' },
                  ]}
                  {...register('impellaSettings.placementSignal')}
                />
              </FormSection>
            )}

            {/* ECMO Settings */}
            {isECMO && (
              <FormSection title="ECMO Settings" description="Current ECMO configuration">
                <FormRow>
                  <Input
                    label="Blood Flow (L/min)"
                    type="number"
                    step="0.1"
                    placeholder="3-6"
                    {...register('ecmoSettings.flow', { valueAsNumber: true })}
                  />
                  <Input
                    label="RPM"
                    type="number"
                    placeholder="2000-4000"
                    {...register('ecmoSettings.rpm', { valueAsNumber: true })}
                  />
                  <Input
                    label="FiO2 (%)"
                    type="number"
                    placeholder="21-100"
                    {...register('ecmoSettings.fio2', { valueAsNumber: true })}
                  />
                </FormRow>
                <FormRow>
                  <Input
                    label="Sweep Gas (L/min)"
                    type="number"
                    step="0.5"
                    {...register('ecmoSettings.sweepGas', { valueAsNumber: true })}
                  />
                  <Input
                    label="Pre-Membrane Pressure (mmHg)"
                    type="number"
                    {...register('ecmoSettings.preMembranePressure', { valueAsNumber: true })}
                  />
                  <Input
                    label="Post-Membrane Pressure (mmHg)"
                    type="number"
                    {...register('ecmoSettings.postMembranePressure', { valueAsNumber: true })}
                  />
                </FormRow>
                <Card className="bg-gray-50">
                  <CardTitle className="text-sm">Anticoagulation</CardTitle>
                  <CardContent>
                    <FormRow>
                      <Input
                        label="Heparin Rate (units/hr)"
                        type="number"
                        {...register('ecmoSettings.heparinRate', { valueAsNumber: true })}
                      />
                      <Input
                        label="ACT (seconds)"
                        type="number"
                        placeholder="180-220"
                        {...register('ecmoSettings.act', { valueAsNumber: true })}
                      />
                      <Input
                        label="Anti-Xa (IU/mL)"
                        type="number"
                        step="0.1"
                        placeholder="0.3-0.7"
                        {...register('ecmoSettings.antiXa', { valueAsNumber: true })}
                      />
                    </FormRow>
                  </CardContent>
                </Card>
              </FormSection>
            )}

            {/* Complications */}
            <FormSection title="Complications" description="Track any device-related complications">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Checkbox
                    label="Bleeding"
                    {...register('complications.bleeding')}
                  />
                  {complications?.bleeding && (
                    <Input
                      placeholder="Site/details"
                      className="mt-2"
                      {...register('complications.bleedingSite')}
                    />
                  )}
                </div>
                <div>
                  <Checkbox
                    label="Hemolysis"
                    {...register('complications.hemolysis')}
                  />
                  {complications?.hemolysis && (
                    <div className="mt-2 space-y-2">
                      <Input
                        placeholder="LDH (U/L)"
                        type="number"
                        {...register('complications.ldh', { valueAsNumber: true })}
                      />
                      <Input
                        placeholder="Plasma-free Hgb (mg/dL)"
                        type="number"
                        {...register('complications.plasmaFreeHgb', { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Checkbox
                    label="Limb Ischemia"
                    {...register('complications.limbIschemia')}
                  />
                  {complications?.limbIschemia && (
                    <Input
                      placeholder="Details"
                      className="mt-2"
                      {...register('complications.limbIschemiaDetails')}
                    />
                  )}
                </div>
                <div>
                  <Checkbox
                    label="Thrombosis"
                    {...register('complications.thrombosis')}
                  />
                  {complications?.thrombosis && (
                    <Input
                      placeholder="Location"
                      className="mt-2"
                      {...register('complications.thrombosisLocation')}
                    />
                  )}
                </div>
                <div>
                  <Checkbox
                    label="Stroke"
                    {...register('complications.stroke')}
                  />
                  {complications?.stroke && (
                    <Select
                      className="mt-2"
                      options={[
                        { value: 'ischemic', label: 'Ischemic' },
                        { value: 'hemorrhagic', label: 'Hemorrhagic' },
                      ]}
                      {...register('complications.strokeType')}
                    />
                  )}
                </div>
                <div>
                  <Checkbox
                    label="Infection"
                    {...register('complications.infection')}
                  />
                  {complications?.infection && (
                    <Input
                      placeholder="Site"
                      className="mt-2"
                      {...register('complications.infectionSite')}
                    />
                  )}
                </div>
                <Checkbox
                  label="Device Migration"
                  {...register('complications.migration')}
                />
                <div>
                  <Checkbox
                    label="Vascular Injury"
                    {...register('complications.vascularInjury')}
                  />
                  {complications?.vascularInjury && (
                    <Input
                      placeholder="Details"
                      className="mt-2"
                      {...register('complications.vascularDetails')}
                    />
                  )}
                </div>
                <Checkbox
                  label="Air Embolism"
                  {...register('complications.airEmbolism')}
                />
                <Checkbox
                  label="Pump Failure"
                  {...register('complications.pumpFailure')}
                />
              </div>
            </FormSection>

            {/* Daily Assessment */}
            <FormSection title="Daily Assessment" description="Clinical notes and observations">
              <Textarea
                label="Assessment Notes"
                placeholder="Document hemodynamic response, device function, any concerns..."
                fullWidth
                {...register('dailyAssessment')}
              />
            </FormSection>
          </>
        )}

        {/* Weaning/Removal Tab */}
        {activeTab === 'weaning' && (
          <>
            {/* Weaning Status */}
            <FormSection title="Weaning Protocol" description="Track weaning progress">
              <Checkbox
                label="Weaning Started"
                description="Check if weaning trials have begun"
                {...register('weaningStarted')}
              />
              {weaningStarted && (
                <div className="mt-4 space-y-4">
                  <Select
                    label="Weaning Protocol"
                    options={[
                      { value: 'ecmo_flow_reduction', label: 'ECMO Flow Reduction' },
                      { value: 'impella_p_level_reduction', label: 'Impella P-Level Reduction' },
                      { value: 'iabp_ratio_reduction', label: 'IABP Ratio Reduction' },
                      { value: 'inotrope_challenge', label: 'Inotrope Challenge' },
                      { value: 'custom', label: 'Custom Protocol' },
                    ]}
                    {...register('weaningProtocol')}
                  />
                  <Textarea
                    label="Weaning Notes"
                    placeholder="Document weaning trials, hemodynamic response, echo findings..."
                    fullWidth
                    {...register('weaningNotes')}
                  />
                </div>
              )}
            </FormSection>

            {/* Removal Details */}
            <FormSection title="Device Removal" description="Record removal details when applicable">
              <FormRow>
                <Input
                  label="Removal Date"
                  type="date"
                  {...register('removalDate')}
                />
                <Input
                  label="Removal Time"
                  type="time"
                  {...register('removalTime')}
                />
              </FormRow>
              <Select
                label="Removal Reason"
                options={REMOVAL_REASON_OPTIONS}
                {...register('removalReason')}
              />
              <Textarea
                label="Removal Notes"
                placeholder="Procedure details, complications, hemodynamic status post-removal..."
                fullWidth
                {...register('removalNotes')}
              />
            </FormSection>

            {/* Device Status */}
            <FormSection title="Device Status" description="Current device status">
              <div className="flex items-center gap-4">
                <Checkbox
                  label="Device Still Active"
                  description="Uncheck if device has been removed"
                  {...register('isActive')}
                />
              </div>
            </FormSection>
          </>
        )}

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
            Save MCS Data
          </Button>
        </div>
      </form>
    </div>
  );
}

export default MCSPage;
