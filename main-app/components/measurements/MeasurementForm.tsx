'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button, Select, SelectOption } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import measurementStyles from '@/styles/components/measurement.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { Measurement, MeasurementPreset, CustomMeasurement } from '@/lib/types';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';

interface MeasurementFormProps {
    onSave: (data: Partial<Measurement>) => void;
    onClose: () => void;
    customers: SelectOption[];
    isSaving: boolean;
    defaultValues?: Partial<Measurement>;
}

const measurementFields = {
    women: [
        { name: 'shoulder', label: 'Shoulder' },
        { name: 'bust', label: 'Bust' },
        { name: 'waist', label: 'Waist' },
        { name: 'hip', label: 'Hip' },
        { name: 'length', label: 'Length' },
        { name: 'underbustLength', label: 'Underbust Length' },
        { name: 'underbustWaist', label: 'Underbust Waist' },
        { name: 'bustSpan', label: 'Bust Span' },
        { name: 'sleeve', label: 'Sleeve' },
        { name: 'roundSleeve', label: 'Round Sleeve' },
    ],
    men: [
        { name: 'shoulder', label: 'Shoulder' },
        { name: 'bust', label: 'Bust/Chest' },
        { name: 'waist', label: 'Waist' },
        { name: 'hip', label: 'Hip' },
        { name: 'length', label: 'Length (Top)' },
        { name: 'trouserLength', label: 'Length (Trouser)' },
        { name: 'sleeve', label: 'Sleeve' },
        { name: 'crotchLength', label: 'Crotch Length' },
        { name: 'lap', label: 'Lap/Thigh' },
    ],
};

const unitOptions: SelectOption[] = [
    { label: 'Inches (in)', value: 'in' },
    { label: 'Centimeters (cm)', value: 'cm' },
];

const MeasurementForm = ({
    onSave,
    onClose,
    customers,
    isSaving,
    defaultValues,
}: MeasurementFormProps) => {
    const { userProfile } = useAuth();

    const defaultUnit = userProfile?.defaultUnit || 'in';

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<Partial<Measurement>>({
        defaultValues: {
            ...defaultValues,
            unit: defaultValues?.unit || defaultUnit,
        },
    });

    const selectedGender = watch('gender');

    // Load measurement presets for the user (optionally filter by gender when selected)
    const { data: allPresets } = useFirestoreQuery<MeasurementPreset>({
        path: 'measurementPresets',
        constraints: [{ type: 'where', field: 'userId', operator: '==', value: userProfile?.uid || '' }],
        listen: true,
    });

    // Load custom measurements for the user
    const { data: customMeasurements } = useFirestoreQuery<CustomMeasurement>({
        path: 'customMeasurements',
        constraints: [{ type: 'where', field: 'userId', operator: '==', value: userProfile?.uid || '' }],
        listen: true,
    });

    const presetOptions: SelectOption[] = useMemo(() => {
        const filtered = (allPresets || []).filter(p => !selectedGender || p.gender === selectedGender);
        return filtered.map(p => ({
            label: `${p.name} - ${p.garmentType || 'General'} (${p.fields?.length || 0} fields)`,
            value: p.id
        }));
    }, [allPresets, selectedGender]);

    // Track active preset locally so Select displays correctly and filtering is consistent
    const [activePresetId, setActivePresetId] = useState<string>('');
    const selectedPreset = useMemo(
        () => (allPresets || []).find(p => p.id === activePresetId),
        [allPresets, activePresetId]
    );

    // Combine standard and custom measurement fields
    const allFields = useMemo(() => {
        if (!selectedGender) return [];

        const standardFields = measurementFields[selectedGender] || [];
        const customFields = (customMeasurements || [])
            .filter(cm => cm.gender === selectedGender || cm.gender === 'both')
            .map(cm => ({ name: cm.shortForm, label: cm.name }));

        const allAvailableFields = [...standardFields, ...customFields];

        // If a preset is selected, filter fields to only include those in the preset
        if (activePresetId) {
            const allowed = new Set(selectedPreset?.fields || []);
            return allAvailableFields.filter(field => allowed.has(field.name));
        }

        return allAvailableFields;
    }, [selectedGender, customMeasurements, selectedPreset, activePresetId]);

    const applyPresetById = (presetId: string | undefined) => {
        // Do not reset the entire form; just set dependent fields so preset selection remains
        if (!presetId) {
            // No preset selected; show all fields for current gender
            setActivePresetId('');
            return;
        }

        const preset = allPresets?.find(p => p.id === presetId);
        if (!preset) return;

        // Align gender and unit to the preset without clearing the preset value
        if (preset.gender) setValue('gender', preset.gender as 'men' | 'women', { shouldValidate: true, shouldDirty: true });
        if (preset.unit) setValue('unit', preset.unit as 'in' | 'cm', { shouldValidate: true, shouldDirty: true });
        setActivePresetId(preset.id);
    };

    useEffect(() => {
        if (defaultValues) {
            reset({
                customerId: defaultValues.customerId,
                garmentType: defaultValues.garmentType,
                gender: defaultValues.gender,
                ...defaultValues.values,
                unit: defaultValues.unit || defaultUnit,
            });
        } else {
            reset({});
        }
    }, [defaultValues, reset, defaultUnit]);

    const onSubmit = (data: Partial<Measurement>) => {
        // Only include values that are actually filled
        const filledValues: Record<string, number> = {};
        for (const field of allFields) {
            const value = (watch(`values.${field.name}` as const) as unknown) as number | undefined;
            if (typeof value === 'number' && !Number.isNaN(value)) {
                filledValues[field.name] = value;
            }
        }

        onSave({
            ...data,
            values: filledValues,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Preset selector */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Apply Preset (Optional)</label>
                <Select
                    options={[
                        { label: 'No preset - Show all fields', value: '' },
                        ...presetOptions
                    ]}
                    value={activePresetId}
                    onChange={(val) => {
                        setActivePresetId(val as string);
                        applyPresetById(val as string);
                    }}
                    placeholder="Select a preset to apply"
                    disabled={isSaving}
                />
                {activePresetId && selectedPreset && (
                    <div style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-2)',
                        backgroundColor: 'var(--primary-50)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--primary-700)',
                        border: '1px solid var(--primary-200)'
                    }}>
                        <strong>Selected Preset:</strong> {selectedPreset.name}
                        {selectedPreset.garmentType && ` - ${selectedPreset.garmentType}`}
                        <br />
                        <span style={{ fontSize: 'var(--text-xs)' }}>
                            Will show {selectedPreset.fields?.length || 0} measurement fields
                        </span>
                    </div>
                )}
                <div style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                    Presets will show only the measurement fields you&apos;ve defined for that preset.
                </div>
            </div>

            {/* Field summary */}
            {selectedGender && (
                <div className={styles.formGroup}>
                    <div style={{
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--neutral-50)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--neutral-700)',
                        border: '1px solid var(--neutral-200)'
                    }}>
                        <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                            Available Measurement Fields
                        </div>
                        {selectedPreset ? (
                            <div>
                                <span style={{ color: 'var(--primary-600)' }}>
                                    {allFields.length} fields from preset &quot;{selectedPreset.name}&quot;
                                </span>
                                <div style={{
                                    marginTop: 'var(--space-2)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--neutral-600)'
                                }}>
                                    {allFields.map(field => field.label).join(', ')}
                                </div>
                            </div>
                        ) : (
                            <span style={{ color: 'var(--neutral-600)' }}>
                                {allFields.length} total fields available for {selectedGender === 'women' ? 'female' : 'male'} measurements
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Customer</label>
                <Controller
                    name="customerId"
                    control={control}
                    rules={{ required: 'Customer is required' }}
                    render={({ field }) => (
                        <Select
                            options={customers}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select a customer"
                            disabled={isSaving}
                            error={!!errors.customerId}
                        />
                    )}
                />
                {errors.customerId && (
                    <p className={styles.errorMessage}>{errors.customerId.message as string}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="garmentType" className={styles.label}>
                    Garment / Style Type
                </label>
                <input
                    id="garmentType"
                    type="text"
                    {...register('garmentType', {
                        required: 'Garment type is required',
                    })}
                    className={`${styles.input} ${errors.garmentType ? styles.inputError : ''
                        }`}
                    placeholder="e.g., Agbada, Wedding Dress"
                    disabled={isSaving}
                />
                {errors.garmentType && (
                    <p className={styles.errorMessage}>
                        {errors.garmentType.message as string}
                    </p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <Controller
                    name="gender"
                    control={control}
                    rules={{ required: 'Gender is required' }}
                    render={({ field }) => (
                        <Select
                            options={[
                                { label: 'Female', value: 'women' },
                                { label: 'Male', value: 'men' },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select gender"
                            disabled={isSaving}
                            error={!!errors.gender}
                        />
                    )}
                />
                {errors.gender && <p className={styles.errorMessage}>{errors.gender.message as string}</p>}
            </div>

            {selectedGender && allFields.length > 0 && (
                <div className={measurementStyles.grid}>
                    <div style={{
                        gridColumn: '1 / -1',
                        marginBottom: 'var(--space-4)',
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--neutral-50)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--neutral-600)'
                    }}>
                        💡 <strong>Tip:</strong> You only need to fill in the measurements you want to record. Leave others empty.
                    </div>
                    {allFields.map(({ name, label }) => (
                        <div className={styles.formGroup} key={name}>
                            <label htmlFor={name} className={styles.label}>
                                {label}
                            </label>
                            <input
                                id={name}
                                type="number"
                                step="0.01"
                                {...register(`values.${name}` as const, {
                                    valueAsNumber: true,
                                })}
                                className={styles.input}
                                placeholder="Optional"
                                disabled={isSaving}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="unit" className={styles.label}>
                        Measurement Unit
                    </label>
                    <Controller
                        name="unit"
                        control={control}
                        render={({ field }) => (
                            <Select
                                options={unitOptions}
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                            />
                        )}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Measurement'}
                </Button>
            </div>
        </form>
    );
};

export default MeasurementForm; 