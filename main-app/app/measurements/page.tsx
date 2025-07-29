'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus } from 'react-feather';
import { Button, Modal, SelectOption } from '@/components/ui';
import MeasurementForm from '@/components/measurements/MeasurementForm';
import MeasurementCard from '@/components/measurements/MeasurementCard';
import styles from '@/styles/components/measurement-card.module.css';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from 'firebase/firestore';
import { Customer, Measurement } from '@/lib/types';

const MeasurementsPage = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingMeasurement, setEditingMeasurement] =
        useState<Measurement | null>(null);

    const { data: customers } = useFirestoreQuery<Customer>({
        path: 'customers',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const { data: measurements, loading } = useFirestoreQuery<Measurement>({
        path: 'measurements',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const measurementsWithCustomerNames = useMemo(() => {
        if (!measurements || !customers) return [];
        const customerMap = new Map(customers.map((c) => [c.id, c.name]));
        return measurements.map((m) => ({
            ...m,
            customerName: customerMap.get(m.customerId) || 'Unknown Customer',
        }));
    }, [measurements, customers]);

    const customerOptions: SelectOption[] = useMemo(() => {
        if (!customers) return [];
        return customers.map((c) => ({ label: c.name, value: c.id }));
    }, [customers]);

    const handleAddNew = () => {
        setEditingMeasurement(null);
        setIsModalOpen(true);
    };

    const handleEdit = (measurement: Measurement) => {
        setEditingMeasurement(measurement);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMeasurement(null);
    };

    const handleSaveMeasurement = async (data: any) => {
        setIsSaving(true);
        try {
            if (editingMeasurement) {
                // Update existing measurement
                const measurementRef = doc(db, 'measurements', editingMeasurement.id);
                await updateDoc(measurementRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Add new measurement
                await addDoc(collection(db, 'measurements'), {
                    ...data,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving measurement:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this measurement?')) {
            try {
                const measurementRef = doc(db, 'measurements', id);
                await deleteDoc(measurementRef);
            } catch (error) {
                console.error('Error deleting measurement: ', error);
            }
        }
    };

    return (
        <DashboardLayout title="Measurements" breadcrumb="Measurement Management">
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                }}
            >
                <h1
                    style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                    }}
                >
                    All Measurements
                </h1>
                <Button onClick={handleAddNew}>
                    <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                    Add Measurement
                </Button>
            </div>

            {loading && (
                <div className={styles.measurementGrid}>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: 'var(--neutral-0)',
                                borderRadius: 'var(--radius-xl)',
                                height: '280px',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }}
                        />
                    ))}
                </div>
            )}

            {!loading && measurementsWithCustomerNames.length > 0 && (
                <div className={styles.measurementGrid}>
                    {measurementsWithCustomerNames.map((measurement) => (
                        <MeasurementCard
                            key={measurement.id}
                            measurement={measurement}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* ... Empty and error states ... */}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={
                    editingMeasurement ? 'Edit Measurement' : 'Add New Measurement'
                }
            >
                <MeasurementForm
                    onSave={handleSaveMeasurement}
                    onClose={handleCloseModal}
                    customers={customerOptions}
                    isSaving={isSaving}
                    defaultValues={editingMeasurement || undefined}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default MeasurementsPage; 