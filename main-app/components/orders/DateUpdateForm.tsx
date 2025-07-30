'use client';

import { useState } from 'react';
import { Button, DatePicker } from '@/components/ui';
import styles from '@/styles/components/auth.module.css';
import { Order } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface DateUpdateFormProps {
    order: Order;
    onSave: (data: { fittingDate?: Date | null; collectionDate?: Date | null }) => void;
    onClose: () => void;
    isSaving: boolean;
    type: 'fitting' | 'collection' | 'both';
}

const DateUpdateForm = ({ order, onSave, onClose, isSaving, type }: DateUpdateFormProps) => {
    const [fittingDate, setFittingDate] = useState<Date | null>(
        order.fittingDate ? order.fittingDate.toDate() : null
    );
    const [collectionDate, setCollectionDate] = useState<Date | null>(
        order.collectionDate ? order.collectionDate.toDate() : null
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updateData: { fittingDate?: Date | null; collectionDate?: Date | null } = {};

        if (type === 'fitting' || type === 'both') {
            updateData.fittingDate = fittingDate;
        }

        if (type === 'collection' || type === 'both') {
            updateData.collectionDate = collectionDate;
        }

        onSave(updateData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {(type === 'fitting' || type === 'both') && (
                <div className={styles.formGroup}>
                    <DatePicker
                        selected={fittingDate}
                        onChange={setFittingDate}
                        placeholder="Select fitting date"
                        disabled={isSaving}
                        minDate={new Date()}
                        label="Fitting Date"
                    />
                </div>
            )}

            {(type === 'collection' || type === 'both') && (
                <div className={styles.formGroup}>
                    <DatePicker
                        selected={collectionDate}
                        onChange={setCollectionDate}
                        placeholder="Select collection date"
                        disabled={isSaving}
                        minDate={new Date()}
                        label="Collection Date"
                    />
                </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" fullWidth disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};

export default DateUpdateForm; 