'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Button, Select, SelectOption } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import measurementStyles from '@/styles/components/measurement.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Customer, Measurement, UserProfile } from '@/lib/types';
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
    const { user } = useAuth();
    const { data: userData } = useFirestoreQuery<UserProfile>({
        path: 'users',
        constraints: user
            ? [{ type: 'where', field: '__name__', operator: '==', value: user.uid }]
            : [],
        listen: false,
    });

    const defaultUnit = userData?.[0]?.defaultUnit || 'in';

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isDirty },
    } = useForm<Partial<Measurement>>({
        defaultValues: {
            ...defaultValues,
            unit: defaultValues?.unit || defaultUnit,
        },
    });

    const selectedGender = watch('gender');

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

    const fields = selectedGender ? measurementFields[selectedGender] : [];

    const onSubmit = (data: Partial<Measurement>) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
                            placeholder="Select gender for measurements"
                            disabled={isSaving}
                            error={!!errors.gender}
                        />
                    )}
                />
                {errors.gender && <p className={styles.errorMessage}>{errors.gender.message as string}</p>}
            </div>

            {selectedGender && (
                <div className={measurementStyles.grid}>
                    {fields.map(({ name, label }) => (
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
                                    required: `${label} is required`,
                                })}
                                className={`${styles.input} ${errors.values?.[name as keyof NonNullable<Measurement['values']>]
                                        ? styles.inputError
                                        : ''
                                    }`}
                                placeholder="0.00"
                                disabled={isSaving}
                            />
                            {errors.values?.[name as keyof NonNullable<Measurement['values']>] && (
                                <p className={styles.errorMessage}>
                                    {
                                        errors.values[
                                            name as keyof NonNullable<Measurement['values']>
                                        ]?.message
                                    }
                                </p>
                            )}
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