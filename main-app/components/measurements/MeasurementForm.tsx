'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import Select, { SelectOption } from '@/components/ui/Select';
import styles from '@/styles/components/auth.module.css';
import measurementStyles from '@/styles/components/measurement.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface MeasurementFormProps {
    onSave: (data: any) => Promise<void>;
    onClose: () => void;
    customers: SelectOption[];
    isSaving: boolean;
    defaultValues?: any;
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

const MeasurementForm = ({
    onSave,
    onClose,
    customers,
    isSaving,
    defaultValues,
}: MeasurementFormProps) => {
    const { user } = useAuth();
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: defaultValues
            ? {
                customerId: defaultValues.customerId,
                garmentType: defaultValues.garmentType,
                gender: defaultValues.gender,
                ...defaultValues.values,
            }
            : {},
    });
    const selectedGender = watch('gender');

    useEffect(() => {
        if (defaultValues) {
            reset({
                customerId: defaultValues.customerId,
                garmentType: defaultValues.garmentType,
                gender: defaultValues.gender,
                ...defaultValues.values,
            });
        } else {
            reset({});
        }
    }, [defaultValues, reset]);

    const onSubmit: SubmitHandler<any> = async (data) => {
        if (!user) {
            console.error('No user authenticated. Cannot save measurement.');
            return;
        }
        // Structure the data as per our Firestore schema
        const { customerId, gender, garmentType, ...values } = data;
        const submissionData = {
            customerId,
            gender,
            garmentType,
            values,
            userId: user.uid,
        };
        await onSave(submissionData);
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
                <label className={styles.label}>Garment Type</label>
                <input
                    {...register('garmentType', { required: 'Garment type is required' })}
                    className={`${styles.input} ${errors.garmentType ? styles.inputError : ''}`}
                    placeholder="e.g., Agbada, Kaftan"
                    disabled={isSaving}
                />
                {errors.garmentType && (
                    <p className={styles.errorMessage}>{errors.garmentType.message as string}</p>
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
                    {measurementFields[selectedGender as 'men' | 'women'].map((field) => (
                        <div className={styles.formGroup} key={field.name}>
                            <label className={styles.label}>{field.label}</label>
                            <input
                                type="number"
                                step="0.1"
                                {...register(field.name, {
                                    valueAsNumber: true,
                                    required: `${field.label} is required`,
                                })}
                                className={`${styles.input} ${errors[field.name] ? styles.inputError : ''}`}
                                placeholder="Inches"
                                disabled={isSaving}
                            />
                            {errors[field.name] && (
                                <p className={styles.errorMessage}>
                                    {errors[field.name]?.message as string}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

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