'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Customer, Measurement, Order } from '@/lib/types';
import { Button, Select, SelectOption, DatePicker } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import formStyles from '@/styles/components/order-form.module.css';
import { Timestamp } from 'firebase/firestore';

interface OrderFormProps {
    onSave: (data: Partial<Order>) => void;
    onClose: () => void;
    isSaving: boolean;
    defaultValues?: Partial<Order>;
}

const OrderForm = ({ onSave, onClose, isSaving, defaultValues }: OrderFormProps) => {
    const { user } = useAuth();
    const [arrivalDate, setArrivalDate] = useState<Date | null>(
        defaultValues?.arrivalDate ? new Date(defaultValues.arrivalDate.toDate()) : null
    );

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<Partial<Order>>({ defaultValues });

    const selectedCustomerId = watch('customerId');

    const { data: customers } = useFirestoreQuery<Customer>({
        path: 'customers',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
    });

    const { data: measurements } = useFirestoreQuery<Measurement>({
        path: 'measurements',
        constraints: selectedCustomerId && user
            ? [
                { type: 'where', field: 'userId', operator: '==', value: user.uid },
                { type: 'where', field: 'customerId', operator: '==', value: selectedCustomerId }
            ]
            : [],
        listen: true,
    });

    const customerOptions = useMemo(() =>
        customers?.map((c) => ({ label: c.name, value: c.id })) || [],
        [customers]
    );

    const measurementOptions = useMemo(() =>
        measurements?.map((m) => ({ label: `${m.garmentType} (${m.gender})`, value: m.id })) || [],
        [measurements]
    );

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    // When customer changes, clear the measurement selection
    useEffect(() => {
        if (selectedCustomerId) {
            setValue('measurementId', '');
        }
    }, [selectedCustomerId, setValue]);

    const onSubmit: SubmitHandler<Partial<Order>> = (data) => {
        const formData = {
            ...data,
            arrivalDate: arrivalDate ? Timestamp.fromDate(arrivalDate) : undefined,
        };
        onSave(formData);
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
                            options={customerOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select a customer"
                            disabled={isSaving}
                            error={!!errors.customerId}
                        />
                    )}
                />
                {errors.customerId && <p className={styles.errorMessage}>{errors.customerId.message as string}</p>}
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Measurement</label>
                <Controller
                    name="measurementId"
                    control={control}
                    rules={{ required: 'Measurement is required' }}
                    render={({ field }) => (
                        <Select
                            options={measurementOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={selectedCustomerId ? "Select a measurement" : "Select a customer first"}
                            disabled={isSaving || !selectedCustomerId || !measurements || measurements.length === 0}
                            error={!!errors.measurementId}
                        />
                    )}
                />
                {errors.measurementId && <p className={styles.errorMessage}>{errors.measurementId.message as string}</p>}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="style" className={styles.label}>Style</label>
                <input
                    id="style"
                    type="text"
                    {...register('style', { required: 'Style is required' })}
                    className={`${styles.input} ${errors.style ? styles.inputError : ''}`}
                    placeholder="e.g., Wedding Gown, Senator style"
                    disabled={isSaving}
                />
                {errors.style && <p className={styles.errorMessage}>{errors.style.message as string}</p>}
            </div>

            <div className={formStyles.grid}>
                <div className={styles.formGroup}>
                    <label htmlFor="materialCost" className={styles.label}>Material Cost</label>
                    <input
                        id="materialCost"
                        type="number"
                        step="0.01"
                        {...register('materialCost', {
                            required: 'Material cost is required',
                            valueAsNumber: true,
                        })}
                        className={`${styles.input} ${errors.materialCost ? styles.inputError : ''}`}
                        placeholder="0.00"
                        disabled={isSaving}
                    />
                    {errors.materialCost && <p className={styles.errorMessage}>{errors.materialCost.message as string}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="totalCost" className={styles.label}>Total Cost</label>
                    <input
                        id="totalCost"
                        type="number"
                        step="0.01"
                        {...register('totalCost', {
                            required: 'Total cost is required',
                            valueAsNumber: true,
                        })}
                        className={`${styles.input} ${errors.totalCost ? styles.inputError : ''}`}
                        placeholder="0.00"
                        disabled={isSaving}
                    />
                    {errors.totalCost && <p className={styles.errorMessage}>{errors.totalCost.message as string}</p>}
                </div>
                <div className={styles.formGroup}>
                    <DatePicker
                        selected={arrivalDate}
                        onChange={setArrivalDate}
                        placeholder="Select arrival date"
                        disabled={isSaving}
                        label="Arrival Date"
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="initialPayment" className={styles.label}>Initial Payment (Deposit)</label>
                <input
                    id="initialPayment"
                    type="number"
                    step="0.01"
                    {...register('initialPayment', {
                        required: 'Initial payment is required',
                        valueAsNumber: true,
                    })}
                    className={`${styles.input} ${errors.initialPayment ? styles.inputError : ''}`}
                    placeholder="0.00"
                    disabled={isSaving}
                />
                {errors.initialPayment && <p className={styles.errorMessage}>{errors.initialPayment.message as string}</p>}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Order'}
                </Button>
            </div>
        </form>
    );
};

export default OrderForm; 