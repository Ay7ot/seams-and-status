'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import Select, { SelectOption } from '@/components/ui/Select'; // Import custom Select
import styles from '@/styles/components/auth.module.css'; // Reusing auth form styles
import { useAuth } from '@/hooks/useAuth';
import { Customer } from '@/lib/types';

export interface CustomerFormData {
    name: string;
    contact?: string;
    gender: 'female' | 'male' | 'other';
}

interface CustomerFormProps {
    onSave: (data: CustomerFormData) => Promise<void>;
    onClose: () => void;
    defaultValues?: Customer;
    isSaving: boolean;
}

const CustomerForm = ({
    onSave,
    onClose,
    defaultValues,
    isSaving,
}: CustomerFormProps) => {
    const { user } = useAuth(); // Get the authenticated user
    const {
        register,
        handleSubmit,
        reset,
        control, // Destructure control
        formState: { errors },
    } = useForm<CustomerFormData>({ defaultValues });

    const genderOptions: SelectOption[] = [
        { label: 'Female', value: 'female' },
        { label: 'Male', value: 'male' },
        { label: 'Other', value: 'other' },
    ];

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
        if (!user) {
            console.error('No user authenticated. Cannot save customer.');
            // Handle this error properly, e.g., show a toast message
            return;
        }
        const submissionData = {
            ...data,
            userId: user.uid, // Add the user's ID
        };
        await onSave(submissionData);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                    Full Name
                </label>
                <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="e.g., Ada Lovelace"
                    disabled={isSaving}
                />
                {errors.name && (
                    <p className={styles.errorMessage}>{errors.name.message}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="contact" className={styles.label}>
                    Contact Number
                </label>
                <input
                    id="contact"
                    type="tel"
                    {...register('contact')}
                    className={`${styles.input} ${errors.contact ? styles.inputError : ''}`}
                    placeholder="e.g., 08012345678"
                    disabled={isSaving}
                />
                {errors.contact && (
                    <p className={styles.errorMessage}>{errors.contact.message}</p>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="gender" className={styles.label}>
                    Gender
                </label>
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
                {errors.gender && (
                    <p className={styles.errorMessage}>{errors.gender.message}</p>
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Customer'}
                </Button>
            </div>
        </form>
    );
};

export default CustomerForm; 