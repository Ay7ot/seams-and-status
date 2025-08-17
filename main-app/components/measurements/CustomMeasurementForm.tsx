'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button, Select, SelectOption } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { CustomMeasurement } from '@/lib/types';

interface CustomMeasurementFormProps {
    onSave: (data: Partial<CustomMeasurement>) => void;
    onClose: () => void;
    isSaving: boolean;
    defaultValues?: Partial<CustomMeasurement>;
}

const unitOptions: SelectOption[] = [
    { label: 'Inches (in)', value: 'in' },
    { label: 'Centimeters (cm)', value: 'cm' },
];

const genderOptions: SelectOption[] = [
    { label: 'Female Only', value: 'women' },
    { label: 'Male Only', value: 'men' },
    { label: 'Both Genders', value: 'both' },
];

const CustomMeasurementForm = ({
    onSave,
    onClose,
    isSaving,
    defaultValues,
}: CustomMeasurementFormProps) => {
    const { userProfile } = useAuth();

    const defaultUnit = userProfile?.defaultUnit || 'in';

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<Partial<CustomMeasurement>>({
        defaultValues: {
            ...defaultValues,
            unit: defaultValues?.unit || defaultUnit,
        },
    });

    useEffect(() => {
        if (defaultValues) {
            reset({
                name: defaultValues.name,
                shortForm: defaultValues.shortForm,
                gender: defaultValues.gender,
                unit: defaultValues.unit || defaultUnit,
            });
        } else {
            reset({});
        }
    }, [defaultValues, reset, defaultUnit]);

    const onSubmit = (data: Partial<CustomMeasurement>) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                    Measurement Name
                </label>
                <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Measurement name is required' })}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="e.g., Arm Length, Neck Circumference"
                    disabled={isSaving}
                />
                {errors.name && (
                    <p className={styles.errorMessage}>{errors.name.message as string}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="shortForm" className={styles.label}>
                    Short Form (Abbreviation)
                </label>
                <input
                    id="shortForm"
                    type="text"
                    {...register('shortForm', {
                        required: 'Short form is required',
                        maxLength: { value: 10, message: 'Short form must be 10 characters or less' }
                    })}
                    className={`${styles.input} ${errors.shortForm ? styles.inputError : ''}`}
                    placeholder="e.g., armLen, neckCirc"
                    disabled={isSaving}
                />
                {errors.shortForm && (
                    <p className={styles.errorMessage}>{errors.shortForm.message as string}</p>
                )}
                <div style={{ marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                    This will be used as the field name in measurement forms.
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <Controller
                    name="gender"
                    control={control}
                    rules={{ required: 'Gender is required' }}
                    render={({ field }) => (
                        <Select
                            options={genderOptions}
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

            <div className={styles.formGroup}>
                <label htmlFor="unit" className={styles.label}>
                    Default Unit
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
                    {isSaving ? 'Saving...' : (defaultValues?.id ? 'Update Measurement' : 'Create Measurement')}
                </Button>
            </div>
        </form>
    );
};

export default CustomMeasurementForm;
