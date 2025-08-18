'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button, Select, SelectOption } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import measurementStyles from '@/styles/components/measurement.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { MeasurementPreset, CustomMeasurement } from '@/lib/types';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';

interface PresetFormProps {
    onSave: (data: Partial<MeasurementPreset>) => void;
    onClose: () => void;
    isSaving: boolean;
    defaultValues?: Partial<MeasurementPreset>;
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

const PresetForm = ({
    onSave,
    onClose,
    isSaving,
    defaultValues,
}: PresetFormProps) => {
    const { userProfile } = useAuth();

    const defaultUnit = userProfile?.defaultUnit || 'in';

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm<Partial<MeasurementPreset>>({
        defaultValues: {
            ...defaultValues,
            unit: defaultValues?.unit || defaultUnit,
        },
    });

    const selectedGender = watch('gender');

    // Local selection state for fields
    const [selectedFields, setSelectedFields] = useState<string[]>(defaultValues?.fields || []);

    // Load custom measurements for the user
    const { data: customMeasurements } = useFirestoreQuery<CustomMeasurement>({
        path: 'customMeasurements',
        constraints: [{ type: 'where', field: 'userId', operator: '==', value: userProfile?.uid || '' }],
        listen: true,
    });

    // Combine standard and custom measurement fields
    const allFields = useMemo(() => {
        if (!selectedGender) return [];

        const standardFields = measurementFields[selectedGender] || [];
        const customFields = (customMeasurements || [])
            .filter(cm => cm.gender === selectedGender || cm.gender === 'both')
            .map(cm => ({ name: cm.shortForm, label: cm.name }));

        return [...standardFields, ...customFields];
    }, [selectedGender, customMeasurements]);

    useEffect(() => {
        if (defaultValues) {
            reset({
                name: defaultValues.name,
                gender: defaultValues.gender,
                unit: defaultValues.unit || defaultUnit,
                garmentType: defaultValues.garmentType,
            });
            setSelectedFields(defaultValues.fields || []);
        } else {
            reset({});
            setSelectedFields([]);
        }
    }, [defaultValues, reset, defaultUnit]);

    const onSubmit = (data: Partial<MeasurementPreset>) => {
        // Persist only fields that are in the current available list
        const allowed = new Set(allFields.map(f => f.name));
        const fields = selectedFields.filter(name => allowed.has(name));

        onSave({
            ...data,
            fields,
        });
    };

    const toggleField = (name: string) => {
        if (isSaving) return;
        setSelectedFields(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                    Preset Name
                </label>
                <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Preset name is required' })}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="e.g., Standard Female Gown, Male Agbada"
                    disabled={isSaving}
                />
                {errors.name && (
                    <p className={styles.errorMessage}>{errors.name.message as string}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="garmentType" className={styles.label}>
                    Garment Type (Optional)
                </label>
                <input
                    id="garmentType"
                    type="text"
                    {...register('garmentType')}
                    className={styles.input}
                    placeholder="e.g., Wedding Gown, Agbada, Kaftan"
                    disabled={isSaving}
                />
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
                        💡 <strong>Tip:</strong> Tap the cards to select which fields belong to this preset.
                    </div>
                    {allFields.map(({ name, label }) => {
                        const isSelected = selectedFields.includes(name);
                        return (
                            <button
                                type="button"
                                key={name}
                                onClick={() => toggleField(name)}
                                disabled={isSaving}
                                style={{
                                    textAlign: 'left',
                                    backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--neutral-0)',
                                    border: `1px solid ${isSelected ? 'var(--primary-500)' : 'var(--neutral-200)'}`,
                                    color: 'var(--neutral-900)',
                                    borderRadius: 'var(--radius-lg)',
                                    padding: 'var(--space-3)',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 'var(--space-3)'
                                }}
                            >
                                <span style={{ fontWeight: 'var(--font-medium)' }}>{label}</span>
                                {isSelected && (
                                    <span style={{
                                        backgroundColor: 'var(--primary-600)',
                                        color: 'var(--neutral-0)',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--text-xs)',
                                        padding: '0.125rem 0.5rem'
                                    }}>
                                        Selected
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

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

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSaving}>
                    {isSaving ? 'Saving...' : (defaultValues?.id ? 'Update Preset' : 'Create Preset')}
                </Button>
            </div>
        </form>
    );
};

export default PresetForm;
