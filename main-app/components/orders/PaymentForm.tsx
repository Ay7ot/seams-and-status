'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, DatePicker } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import { Payment } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface PaymentFormProps {
    onSave: (data: Partial<Payment>) => void;
    onClose: () => void;
    isSaving: boolean;
    defaultValues?: Partial<Payment>;
}

const PaymentForm = ({ onSave, onClose, isSaving, defaultValues }: PaymentFormProps) => {
    const [paymentDate, setPaymentDate] = useState<Date | null>(
        defaultValues?.date ? new Date(defaultValues.date.toDate()) : new Date()
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Partial<Payment>>({
        defaultValues: {
            amount: defaultValues?.amount,
            note: defaultValues?.note,
        },
    });

    const onSubmit: SubmitHandler<Partial<Payment>> = (data) => {
        const formData = {
            ...data,
            date: paymentDate ? Timestamp.fromDate(paymentDate) : undefined,
        };
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="amount" className={styles.label}>Payment Amount</label>
                <input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...register('amount', {
                        required: 'Amount is required',
                        valueAsNumber: true,
                        min: { value: 0.01, message: 'Amount must be positive' },
                    })}
                    className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
                    placeholder="0.00"
                    disabled={isSaving}
                />
                {errors.amount && <p className={styles.errorMessage}>{errors.amount.message as string}</p>}
            </div>

            <div className={styles.formGroup}>
                <DatePicker
                    selected={paymentDate}
                    onChange={setPaymentDate}
                    placeholder="Select payment date"
                    disabled={isSaving}
                    label="Payment Date"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="note" className={styles.label}>Note (Optional)</label>
                <textarea
                    id="note"
                    {...register('note')}
                    className={styles.input}
                    rows={3}
                    placeholder="e.g., Bank transfer, cash payment"
                    disabled={isSaving}
                />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSaving}>
                    {isSaving ? 'Saving...' : (defaultValues ? 'Update Payment' : 'Add Payment')}
                </Button>
            </div>
        </form>
    );
};

export default PaymentForm; 