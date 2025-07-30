'use client';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Button, Select, SelectOption } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import { Order } from '@/lib/types';

interface StatusUpdateFormProps {
    onSave: (data: Partial<Order>) => void;
    onClose: () => void;
    isSaving: boolean;
    currentStatus: Order['status'];
}

const statusOptions: SelectOption[] = [
    { label: 'New', value: 'New' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Ready for Fitting', value: 'Ready for Fitting' },
    { label: 'Completed', value: 'Completed' },
];

const StatusUpdateForm = ({ onSave, onClose, isSaving, currentStatus }: StatusUpdateFormProps) => {
    const {
        handleSubmit,
        control,
    } = useForm<Partial<Order>>({
        defaultValues: { status: currentStatus },
    });

    const onSubmit: SubmitHandler<Partial<Order>> = (data) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Update Order Status</label>
                <Controller
                    name="status"
                    control={control}
                    rules={{ required: 'Status is required' }}
                    render={({ field }) => (
                        <Select
                            options={statusOptions}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSaving}
                        />
                    )}
                />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Update Status'}
                </Button>
            </div>
        </form>
    );
};

export default StatusUpdateForm; 