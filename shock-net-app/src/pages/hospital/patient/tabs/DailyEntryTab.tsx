/**
 * Daily Entry Tab
 * Daily ICU monitoring data entry within patient detail view
 * Includes MCS (Mechanical Circulatory Support) management
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Textarea } from '../../../../components/ui/Textarea';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { FormSection, FormRow } from '../../../../components/ui/Form';

import {
  dailyEntrySchema,
  SCAI_STAGE_OPTIONS,
  BLOOD_GAS_TYPE_OPTIONS,
  RV_FUNCTION_OPTIONS,
  VENT_MODE_OPTIONS,
  MCS_DEVICE_OPTIONS,
  INSERTION_LOCATION_OPTIONS,
  ACCESS_SITE_OPTIONS,
  MCS_INDICATION_OPTIONS,
  REMOVAL_REASON_OPTIONS,
  IMPELLA_P_LEVEL_OPTIONS,
  IABP_RATIO_OPTIONS,
} from '../../../../lib/schemas';
import type { DailyEntryFormData, MCSDeviceType } from '../../../../lib/schemas';
import { updateTracking } from '../../../../lib/supabase/rpc';
import { usePatient } from '../../../../features/patient';
import { cn } from '../../../../lib/utils/cn';

const TABS = [
  { id: 'hemodynamics', label: 'Hemodynamics' },
  { id: 'bloodgas', label: 'Blood Gas' },
  { id: 'ventilator', label: 'Ventilator' },
  { id: 'labs', label: 'Labs' },
  { id: 'echo', label: 'Echo' },
  { id: 'mcs', label: 'MCS' },
  { id: 'notes', label: 'Notes' },
] as const;

type TabId = typeof TABS[number]['id'];

export function DailyEntryTab() {
  const { tt, patient } = usePatient();
  const [activeTab, setActiveTab] = useState<TabId>('hemodynamics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [mcsSubTab, setMcsSubTab] = useState<'entry' | 'monitoring' | 'weaning'>('entry');

  const dayNumber = patient?.icuDay || 1;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      dayNumber,
      currentScaiStage: patient?.scaiStage || 'C',
      entryDate: new Date().toISOString().split('T')[0],
      bloodGas: [{ type: 'arterial' as const, timestamp: new Date().toTimeString().slice(0, 5) }],
      laboratory: [{ timestamp: new Date().toTimeString().slice(0, 5) }],
      mcs: {
        isActive: true,
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
    },
  });

  const { fields: bloodGasFields, append: appendBloodGas, remove: removeBloodGas } = useFieldArray({
    control,
    name: 'bloodGas',
  });

  const { fields: labFields, append: appendLab, remove: removeLab } = useFieldArray({
    control,
    name: 'laboratory',
  });

  const addBloodGasEntry = () => {
    appendBloodGas({ type: 'arterial' as const, timestamp: new Date().toTimeString().slice(0, 5) });
  };

  const copyLastBloodGas = () => {
    const currentEntries = getValues('bloodGas') || [];
    if (currentEntries.length > 0) {
      const last = currentEntries[currentEntries.length - 1];
      appendBloodGas({ ...last, timestamp: new Date().toTimeString().slice(0, 5) });
    } else {
      addBloodGasEntry();
    }
  };

  const addLabEntry = () => {
    appendLab({ timestamp: new Date().toTimeString().slice(0, 5) });
  };

  const copyLastLab = () => {
    const currentEntries = getValues('laboratory') || [];
    if (currentEntries.length > 0) {
      const last = currentEntries[currentEntries.length - 1];
      appendLab({ ...last, timestamp: new Date().toTimeString().slice(0, 5) });
    } else {
      addLabEntry();
    }
  };

  // MCS device type watchers
  const selectedDevice = watch('mcs.deviceType') as MCSDeviceType | undefined;
  const weaningStarted = watch('mcs.weaningStarted');
  const mcsComplications = watch('mcs.complications');

  const isIABP = selectedDevice === 'iabp';
  const isImpella = selectedDevice?.startsWith('impella');
  const isECMO = selectedDevice === 'va_ecmo' || selectedDevice === 'vv_ecmo' || selectedDevice === 'ecpella';

  const onSubmit = async (data: unknown) => {
    const formData = data as DailyEntryFormData & { mcs?: Record<string, unknown> };
    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const dayEntry = {
        dayNumber: formData.dayNumber,
        entryDate: formData.entryDate,
        timestamp,
      };

      await updateTracking(tt, {
        scai_stage: formData.currentScaiStage,
        hemodynamics: formData.hemodynamics?.[0] ? {
          ...dayEntry,
          ...formData.hemodynamics[0],
        } : undefined,
        laboratory: formData.laboratory?.length ? formData.laboratory.map(lab => ({
          ...dayEntry,
          ...lab,
        })) : undefined,
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
        mcs: formData.mcs ? {
          ...formData.mcs,
          recorded_at: timestamp,
        } : undefined,
      });

      console.log('Daily entry saved:', formData);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save daily entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSaved) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-shock-green-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-shock-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Entry Saved</h2>
            <p className="text-gray-600 mb-6">Day {dayNumber} data has been recorded successfully.</p>
            <Button onClick={() => setIsSaved(false)}>Add More Data</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daily Data Entry</h2>
          <p className="text-gray-500 mt-1">Record daily ICU monitoring data</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">ICU Day</p>
          <p className="text-3xl font-bold text-shock-blue">{dayNumber}</p>
        </div>
      </div>

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
        <div className="mb-6">
          <Select label="Current SCAI Stage" options={SCAI_STAGE_OPTIONS} error={errors.currentScaiStage?.message} required {...register('currentScaiStage')} />
        </div>

        {activeTab === 'hemodynamics' && (
          <FormSection title="Hemodynamic Parameters" description="Vital signs and cardiac output">
            <FormRow columns={4}>
              <Input label="Heart Rate" type="number" placeholder="bpm" {...register('hemodynamics.0.heartRate', { valueAsNumber: true })} />
              <Input label="SBP" type="number" placeholder="mmHg" {...register('hemodynamics.0.sbp', { valueAsNumber: true })} />
              <Input label="DBP" type="number" placeholder="mmHg" {...register('hemodynamics.0.dbp', { valueAsNumber: true })} />
              <Input label="MAP" type="number" placeholder="mmHg" {...register('hemodynamics.0.map', { valueAsNumber: true })} />
            </FormRow>
            <FormRow columns={4}>
              <Input label="CVP" type="number" placeholder="mmHg" {...register('hemodynamics.0.cvp', { valueAsNumber: true })} />
              <Input label="Cardiac Output" type="number" step="0.1" placeholder="L/min" {...register('hemodynamics.0.cardiacOutput', { valueAsNumber: true })} />
              <Input label="Cardiac Index" type="number" step="0.1" placeholder="L/min/m2" {...register('hemodynamics.0.cardiacIndex', { valueAsNumber: true })} />
              <Input label="SVR" type="number" placeholder="dynes" {...register('hemodynamics.0.svr', { valueAsNumber: true })} />
            </FormRow>
            <FormRow columns={2}>
              <Input label="ScvO2" type="number" placeholder="%" {...register('hemodynamics.0.scvo2', { valueAsNumber: true })} />
              <Input label="Time" type="time" {...register('hemodynamics.0.timestamp')} />
            </FormRow>
          </FormSection>
        )}

        {activeTab === 'bloodgas' && (
          <div className="space-y-4">
            {/* Entry count indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{bloodGasFields.length}/3</span>
                {bloodGasFields.length < 3 && (
                  <span className="text-xs text-shock-orange bg-shock-orange-light px-2 py-0.5 rounded-full">
                    {3 - bloodGasFields.length} more
                  </span>
                )}
                {bloodGasFields.length >= 3 && (
                  <span className="text-xs text-shock-green bg-shock-green-light px-2 py-0.5 rounded-full">
                    OK
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={copyLastBloodGas}>
                  Copy
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={addBloodGasEntry}>
                  + ABG
                </Button>
              </div>
            </div>

            {/* Blood gas entries */}
            {bloodGasFields.map((field, index) => (
              <Card key={field.id} padding="sm" className="relative">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-shock-blue">#{index + 1}</span>
                    <Select
                      options={BLOOD_GAS_TYPE_OPTIONS}
                      className="w-24 text-sm"
                      {...register(`bloodGas.${index}.type`)}
                    />
                    <Input
                      type="time"
                      size="sm"
                      className="w-[5.5rem]"
                      {...register(`bloodGas.${index}.timestamp`)}
                    />
                  </div>
                  {bloodGasFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBloodGas(index)}
                      className="text-gray-400 hover:text-shock-red px-2"
                    >
                      ✕
                    </Button>
                  )}
                </div>
                {/* Compact 2x3 grid on mobile, 3x2 on larger screens */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Input
                    label="pH"
                    type="number"
                    step="0.01"
                    placeholder="7.40"
                    {...register(`bloodGas.${index}.ph`, { valueAsNumber: true })}
                  />
                  <Input
                    label="pCO2"
                    type="number"
                    placeholder="40"
                    {...register(`bloodGas.${index}.pco2`, { valueAsNumber: true })}
                  />
                  <Input
                    label="Lactate"
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    className="bg-shock-orange-light border-shock-orange"
                    {...register(`bloodGas.${index}.lactate`, { valueAsNumber: true })}
                  />
                  <Input
                    label="HCO3"
                    type="number"
                    step="0.1"
                    placeholder="24"
                    {...register(`bloodGas.${index}.hco3`, { valueAsNumber: true })}
                  />
                  <Input
                    label="BE"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register(`bloodGas.${index}.baseExcess`, { valueAsNumber: true })}
                  />
                  <Input
                    label="pO2"
                    type="number"
                    placeholder="80"
                    {...register(`bloodGas.${index}.po2`, { valueAsNumber: true })}
                  />
                </div>
              </Card>
            ))}

            {/* Quick add buttons for common times */}
            {bloodGasFields.length < 6 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-gray-500">Quick add:</span>
                {['06:00', '12:00', '18:00', '22:00'].map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendBloodGas({ type: 'arterial' as const, timestamp: time })}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ventilator' && (
          <FormSection title="Ventilator Settings" description="Current mechanical ventilation">
            <FormRow columns={3}>
              <Select label="Mode" options={VENT_MODE_OPTIONS} placeholder="Select mode" {...register('ventilator.mode')} />
              <Input label="FiO2" type="number" placeholder="%" {...register('ventilator.fio2', { valueAsNumber: true })} />
              <Input label="PEEP" type="number" placeholder="cmH2O" {...register('ventilator.peep', { valueAsNumber: true })} />
            </FormRow>
            <FormRow columns={4}>
              <Input label="Tidal Volume" type="number" placeholder="mL" {...register('ventilator.tidalVolume', { valueAsNumber: true })} />
              <Input label="Respiratory Rate" type="number" placeholder="/min" {...register('ventilator.respiratoryRate', { valueAsNumber: true })} />
              <Input label="PIP" type="number" placeholder="cmH2O" {...register('ventilator.pip', { valueAsNumber: true })} />
              <Input label="Plateau" type="number" placeholder="cmH2O" {...register('ventilator.plateau', { valueAsNumber: true })} />
            </FormRow>
          </FormSection>
        )}

        {activeTab === 'labs' && (
          <div className="space-y-4">
            {/* Entry count indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{labFields.length}/2</span>
                {labFields.length < 2 && (
                  <span className="text-xs text-shock-orange bg-shock-orange-light px-2 py-0.5 rounded-full">
                    {2 - labFields.length} more
                  </span>
                )}
                {labFields.length >= 2 && (
                  <span className="text-xs text-shock-green bg-shock-green-light px-2 py-0.5 rounded-full">
                    OK
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={copyLastLab}>
                  Copy
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={addLabEntry}>
                  + Labs
                </Button>
              </div>
            </div>

            {/* Lab entries */}
            {labFields.map((field, index) => (
              <Card key={field.id} padding="sm" className="relative">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-shock-blue">#{index + 1}</span>
                    <Input
                      type="time"
                      size="sm"
                      className="w-[5.5rem]"
                      {...register(`laboratory.${index}.timestamp`)}
                    />
                  </div>
                  {labFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLab(index)}
                      className="text-gray-400 hover:text-shock-red px-2"
                    >
                      ✕
                    </Button>
                  )}
                </div>
                {/* CBC & Cardiac */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                  <Input label="Hgb" type="number" step="0.1" placeholder="g/dL" {...register(`laboratory.${index}.hemoglobin`, { valueAsNumber: true })} />
                  <Input label="Hct" type="number" step="0.1" placeholder="%" {...register(`laboratory.${index}.hematocrit`, { valueAsNumber: true })} />
                  <Input label="WBC" type="number" step="0.1" placeholder="K" {...register(`laboratory.${index}.wbc`, { valueAsNumber: true })} />
                  <Input label="Plt" type="number" placeholder="K" {...register(`laboratory.${index}.platelets`, { valueAsNumber: true })} />
                  <Input label="Trop" type="number" step="0.001" placeholder="ng/mL" className="bg-shock-orange-light border-shock-orange" {...register(`laboratory.${index}.troponin`, { valueAsNumber: true })} />
                  <Input label="BNP" type="number" placeholder="pg/mL" {...register(`laboratory.${index}.bnp`, { valueAsNumber: true })} />
                </div>
                {/* Renal & Electrolytes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
                  <Input label="Cr" type="number" step="0.01" placeholder="mg/dL" className="bg-shock-orange-light border-shock-orange" {...register(`laboratory.${index}.creatinine`, { valueAsNumber: true })} />
                  <Input label="BUN" type="number" placeholder="mg/dL" {...register(`laboratory.${index}.bun`, { valueAsNumber: true })} />
                  <Input label="Na+" type="number" placeholder="mEq/L" {...register(`laboratory.${index}.sodium`, { valueAsNumber: true })} />
                  <Input label="K+" type="number" step="0.1" placeholder="mEq/L" className="bg-shock-orange-light border-shock-orange" {...register(`laboratory.${index}.potassium`, { valueAsNumber: true })} />
                  <Input label="Glc" type="number" placeholder="mg/dL" {...register(`laboratory.${index}.glucose`, { valueAsNumber: true })} />
                  <Input label="Alb" type="number" step="0.1" placeholder="g/dL" {...register(`laboratory.${index}.albumin`, { valueAsNumber: true })} />
                </div>
                {/* Liver & Coagulation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <Input label="AST" type="number" placeholder="U/L" {...register(`laboratory.${index}.ast`, { valueAsNumber: true })} />
                  <Input label="ALT" type="number" placeholder="U/L" {...register(`laboratory.${index}.alt`, { valueAsNumber: true })} />
                  <Input label="Bili" type="number" step="0.1" placeholder="mg/dL" {...register(`laboratory.${index}.bilirubin`, { valueAsNumber: true })} />
                  <Input label="PT" type="number" step="0.1" placeholder="sec" {...register(`laboratory.${index}.pt`, { valueAsNumber: true })} />
                  <Input label="INR" type="number" step="0.1" placeholder="" {...register(`laboratory.${index}.inr`, { valueAsNumber: true })} />
                  <Input label="PTT" type="number" placeholder="sec" {...register(`laboratory.${index}.ptt`, { valueAsNumber: true })} />
                </div>
              </Card>
            ))}

            {/* Quick add buttons for common times */}
            {labFields.length < 4 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-gray-500">Quick add:</span>
                {['06:00', '18:00'].map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendLab({ timestamp: time })}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'echo' && (
          <FormSection title="Echocardiography" description="If echo performed today">
            <FormRow columns={3}>
              <Input label="LVEF" type="number" placeholder="%" {...register('echo.lvef', { valueAsNumber: true })} />
              <Select label="RV Function" options={RV_FUNCTION_OPTIONS} placeholder="Select" {...register('echo.rvFunction')} />
              <Input label="IVC Collapsibility" type="number" placeholder="%" {...register('echo.ivcCollapsibility', { valueAsNumber: true })} />
            </FormRow>
            <FormRow columns={2}>
              <Input label="Wall Motion Abnormalities" placeholder="Describe any WMA" {...register('echo.wallMotion')} />
              <Input label="Valvular Findings" placeholder="Describe any valve issues" {...register('echo.valvular')} />
            </FormRow>
            <Checkbox label="Pericardial Effusion" description="Presence of pericardial fluid" {...register('echo.pericardialEffusion')} />
            <Textarea label="Echo Notes" placeholder="Additional echo findings..." fullWidth {...register('echo.notes')} />
          </FormSection>
        )}

        {activeTab === 'mcs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['entry', 'monitoring', 'weaning'] as const).map((tab) => (
                  <Button
                    key={tab}
                    type="button"
                    variant={mcsSubTab === tab ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setMcsSubTab(tab)}
                  >
                    {tab === 'entry' ? 'Device Entry' : tab === 'monitoring' ? 'Monitoring' : 'Weaning/Removal'}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-shock-red-light px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 text-shock-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs font-medium text-shock-red">Critical Care</span>
              </div>
            </div>

            {mcsSubTab === 'entry' && (
              <>
                <FormSection title="Device Selection" description="Select the MCS device">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {MCS_DEVICE_OPTIONS.map((device) => (
                      <div
                        key={device.value}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-all',
                          selectedDevice === device.value
                            ? 'border-shock-blue bg-shock-blue-light'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                        onClick={() => setValue('mcs.deviceType', device.value as MCSDeviceType)}
                      >
                        <p className="font-medium text-sm">{device.label}</p>
                        <p className="text-xs text-gray-500">{device.description}</p>
                      </div>
                    ))}
                  </div>
                </FormSection>

                <FormSection title="Insertion Details" description="When and where the device was placed">
                  <FormRow>
                    <Input label="Insertion Date" type="date" required {...register('mcs.insertionDate')} />
                    <Input label="Insertion Time" type="time" {...register('mcs.insertionTime')} />
                  </FormRow>
                  <FormRow>
                    <Select label="Insertion Location" options={INSERTION_LOCATION_OPTIONS} required {...register('mcs.insertionLocation')} />
                    <Select label="Access Site" options={ACCESS_SITE_OPTIONS} required {...register('mcs.accessSite')} />
                    <Select label="Side" options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'bilateral', label: 'Bilateral' }]} {...register('mcs.accessSide')} />
                  </FormRow>
                </FormSection>

                <FormSection title="Indication" description="Reason for MCS placement">
                  <FormRow>
                    <Select label="Primary Indication" options={MCS_INDICATION_OPTIONS} required {...register('mcs.indication')} />
                  </FormRow>
                  <Textarea label="Additional Notes" placeholder="Clinical context, hemodynamic status prior to insertion..." {...register('mcs.indicationNotes')} />
                </FormSection>

                {isECMO && (
                  <FormSection title="Cannulation Details" description="ECMO cannula specifications">
                    <FormRow>
                      <Input label="Arterial Cannula Size (Fr)" type="number" placeholder="15-21" {...register('mcs.arterialCannulaSize', { valueAsNumber: true })} />
                      <Input label="Venous Cannula Size (Fr)" type="number" placeholder="21-29" {...register('mcs.venousCannulaSize', { valueAsNumber: true })} />
                    </FormRow>
                  </FormSection>
                )}
              </>
            )}

            {mcsSubTab === 'monitoring' && (
              <>
                {isIABP && (
                  <FormSection title="IABP Settings" description="Current IABP configuration">
                    <FormRow>
                      <Select label="Augmentation Ratio" options={IABP_RATIO_OPTIONS} {...register('mcs.iabpSettings.ratio')} />
                      <Input label="Augmentation (%)" type="number" placeholder="0-100" {...register('mcs.iabpSettings.augmentation', { valueAsNumber: true })} />
                    </FormRow>
                  </FormSection>
                )}

                {isImpella && (
                  <FormSection title="Impella Settings" description="Current Impella configuration">
                    <FormRow>
                      <Select label="P-Level" options={IMPELLA_P_LEVEL_OPTIONS} {...register('mcs.impellaSettings.pLevel')} />
                      <Input label="Flow (L/min)" type="number" step="0.1" placeholder="0-6" {...register('mcs.impellaSettings.flow', { valueAsNumber: true })} />
                    </FormRow>
                    <FormRow>
                      <Input label="Motor Current (A)" type="number" step="0.01" {...register('mcs.impellaSettings.motorCurrent', { valueAsNumber: true })} />
                      <Input label="Purge Flow (mL/hr)" type="number" {...register('mcs.impellaSettings.purgeFlow', { valueAsNumber: true })} />
                      <Input label="Purge Pressure (mmHg)" type="number" {...register('mcs.impellaSettings.purgePressure', { valueAsNumber: true })} />
                    </FormRow>
                  </FormSection>
                )}

                {isECMO && (
                  <FormSection title="ECMO Settings" description="Current ECMO configuration">
                    <FormRow>
                      <Input label="Blood Flow (L/min)" type="number" step="0.1" placeholder="3-6" {...register('mcs.ecmoSettings.flow', { valueAsNumber: true })} />
                      <Input label="RPM" type="number" placeholder="2000-4000" {...register('mcs.ecmoSettings.rpm', { valueAsNumber: true })} />
                      <Input label="FiO2 (%)" type="number" placeholder="21-100" {...register('mcs.ecmoSettings.fio2', { valueAsNumber: true })} />
                    </FormRow>
                    <FormRow>
                      <Input label="Sweep Gas (L/min)" type="number" step="0.5" {...register('mcs.ecmoSettings.sweepGas', { valueAsNumber: true })} />
                    </FormRow>
                    <Card className="bg-gray-50">
                      <CardTitle className="text-sm">Anticoagulation</CardTitle>
                      <CardContent>
                        <FormRow>
                          <Input label="Heparin Rate (units/hr)" type="number" {...register('mcs.ecmoSettings.heparinRate', { valueAsNumber: true })} />
                          <Input label="ACT (seconds)" type="number" placeholder="180-220" {...register('mcs.ecmoSettings.act', { valueAsNumber: true })} />
                          <Input label="Anti-Xa (IU/mL)" type="number" step="0.1" placeholder="0.3-0.7" {...register('mcs.ecmoSettings.antiXa', { valueAsNumber: true })} />
                        </FormRow>
                      </CardContent>
                    </Card>
                  </FormSection>
                )}

                {!isIABP && !isImpella && !isECMO && selectedDevice && (
                  <FormSection title="Device Monitoring">
                    <Textarea label="Device Status Notes" placeholder="Document device function and parameters..." fullWidth {...register('mcs.dailyAssessment')} />
                  </FormSection>
                )}

                <FormSection title="Complications" description="Track device-related complications">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Checkbox label="Bleeding" {...register('mcs.complications.bleeding')} />
                      {mcsComplications?.bleeding && <Input placeholder="Site/details" className="mt-2" {...register('mcs.complications.bleedingSite')} />}
                    </div>
                    <div>
                      <Checkbox label="Hemolysis" {...register('mcs.complications.hemolysis')} />
                      {mcsComplications?.hemolysis && <Input placeholder="LDH (U/L)" type="number" className="mt-2" {...register('mcs.complications.ldh', { valueAsNumber: true })} />}
                    </div>
                    <div>
                      <Checkbox label="Limb Ischemia" {...register('mcs.complications.limbIschemia')} />
                      {mcsComplications?.limbIschemia && <Input placeholder="Details" className="mt-2" {...register('mcs.complications.limbIschemiaDetails')} />}
                    </div>
                    <Checkbox label="Thrombosis" {...register('mcs.complications.thrombosis')} />
                    <Checkbox label="Stroke" {...register('mcs.complications.stroke')} />
                    <Checkbox label="Infection" {...register('mcs.complications.infection')} />
                    <Checkbox label="Device Migration" {...register('mcs.complications.migration')} />
                    <Checkbox label="Vascular Injury" {...register('mcs.complications.vascularInjury')} />
                    <Checkbox label="Air Embolism" {...register('mcs.complications.airEmbolism')} />
                    <Checkbox label="Pump Failure" {...register('mcs.complications.pumpFailure')} />
                  </div>
                </FormSection>

                <FormSection title="Daily Assessment" description="Clinical notes and observations">
                  <Textarea label="Assessment Notes" placeholder="Document hemodynamic response, device function, any concerns..." fullWidth {...register('mcs.dailyAssessment')} />
                </FormSection>
              </>
            )}

            {mcsSubTab === 'weaning' && (
              <>
                <FormSection title="Weaning Protocol" description="Track weaning progress">
                  <Checkbox label="Weaning Started" description="Check if weaning trials have begun" {...register('mcs.weaningStarted')} />
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
                        {...register('mcs.weaningProtocol')}
                      />
                      <Textarea label="Weaning Notes" placeholder="Document weaning trials, hemodynamic response, echo findings..." fullWidth {...register('mcs.weaningNotes')} />
                    </div>
                  )}
                </FormSection>

                <FormSection title="Device Removal" description="Record removal details when applicable">
                  <FormRow>
                    <Input label="Removal Date" type="date" {...register('mcs.removalDate')} />
                    <Input label="Removal Time" type="time" {...register('mcs.removalTime')} />
                  </FormRow>
                  <Select label="Removal Reason" options={REMOVAL_REASON_OPTIONS} {...register('mcs.removalReason')} />
                  <Textarea label="Removal Notes" placeholder="Procedure details, complications, hemodynamic status post-removal..." fullWidth {...register('mcs.removalNotes')} />
                </FormSection>

                <FormSection title="Device Status" description="Current device status">
                  <Checkbox label="Device Still Active" description="Uncheck if device has been removed" {...register('mcs.isActive')} />
                </FormSection>
              </>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <FormSection title="Interventions" description="Changes and procedures today">
              <Textarea label="Vasopressor Changes" placeholder="Document any vasopressor adjustments..." fullWidth {...register('interventions.vasopressorChanges')} />
              <Textarea label="New Procedures" placeholder="Any new procedures or interventions..." fullWidth {...register('interventions.newProcedures')} />
              <Textarea label="Medication Changes" placeholder="Significant medication changes..." fullWidth {...register('interventions.medicationChanges')} />
            </FormSection>
            <FormSection title="Clinical Assessment" description="Overall patient status">
              <div className="flex gap-6 mb-4">
                <Checkbox label="Improving" {...register('assessment.improving')} />
                <Checkbox label="Stable" {...register('assessment.stable')} />
                <Checkbox label="Deteriorating" {...register('assessment.deteriorating')} />
              </div>
              <Textarea label="Assessment Notes" placeholder="Brief assessment summary..." fullWidth {...register('assessment.comment')} />
            </FormSection>
            <FormSection title="Clinical Notes">
              <Textarea label="Daily Progress Notes" placeholder="Document patient's progress, plan, and concerns..." fullWidth rows={6} {...register('clinicalNotes')} />
            </FormSection>
          </div>
        )}

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          <Button type="submit" isLoading={isSubmitting}>
            Save Daily Entry
          </Button>
        </div>
      </form>
    </div>
  );
}

export default DailyEntryTab;
