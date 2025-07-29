'use client';

import { Usable, use, useState } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout';
import MeasurementCard from '@/components/measurements/MeasurementCard';
import { Measurement, Customer } from '@/lib/types';
import customerStyles from '@/styles/components/customer-detail.module.css';
import measurementStyles from '@/styles/components/measurement-card.module.css';
import { Modal, Button } from '@/components/ui';
import MeasurementForm from '@/components/measurements/MeasurementForm';
import { db } from '@/lib/firebase';
import {
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    collection,
    serverTimestamp,
} from 'firebase/firestore';

interface CustomerDetailPageProps {
    params: Usable<{ id: string }>;
}

const CustomerDetailPage = ({ params }: CustomerDetailPageProps) => {
    const { user } = useAuth();
    const { id } = use(params);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingMeasurement, setEditingMeasurement] =
        useState<Measurement | null>(null);
    const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(
        null
    );
    const [isSaving, setIsSaving] = useState(false);

    const { data: customerData, loading: customerLoading } =
        useFirestoreQuery<Customer>({
            path: 'customers',
            constraints: user
                ? [
                    {
                        type: 'where',
                        field: '__name__',
                        operator: '==',
                        value: id,
                    },
                    { type: 'where', field: 'userId', operator: '==', value: user.uid },
                ]
                : [],
            listen: true,
        });

    const { data: measurements, loading: measurementsLoading } =
        useFirestoreQuery<Measurement>({
            path: 'measurements',
            constraints: user
                ? [
                    {
                        type: 'where',
                        field: 'customerId',
                        operator: '==',
                        value: id,
                    },
                    { type: 'where', field: 'userId', operator: '==', value: user.uid },
                ]
                : [],
            listen: true,
        });

    const customer = customerData?.[0];

    const handleEdit = (measurement: Measurement) => {
        setEditingMeasurement(measurement);
        setIsEditModalOpen(true);
    };

    const handleCopy = (measurement: Measurement) => {
        const { id, createdAt, ...rest } = measurement;
        setEditingMeasurement({
            ...rest,
            id: '',
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setMeasurementToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!measurementToDelete) return;
        try {
            await deleteDoc(doc(db, 'measurements', measurementToDelete));
        } catch (error) {
            console.error('Error deleting measurement:', error);
        } finally {
            setIsDeleteModalOpen(false);
            setMeasurementToDelete(null);
        }
    };

    const handleSaveMeasurement = async (data: any) => {
        if (!user) return;
        setIsSaving(true);
        try {
            if (editingMeasurement?.id) {
                const measurementRef = doc(db, 'measurements', editingMeasurement.id);
                await updateDoc(measurementRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
            } else {
                await addDoc(collection(db, 'measurements'), {
                    ...data,
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
            setIsEditModalOpen(false);
            setEditingMeasurement(null);
        } catch (error) {
            console.error('Error saving measurement:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (customerLoading) {
        return (
            <DashboardLayout title="Customer Details">
                <div>Loading customer...</div>
            </DashboardLayout>
        );
    }

    if (!customer) {
        return (
            <DashboardLayout title="Customer Not Found">
                <div>The requested customer could not be found.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title={customer.name}
            breadcrumb={`Customers / ${customer.name}`}
        >
            {/* <div className={customerStyles.detailHeader}>
                <div>
                    <h1 className={customerStyles.customerName}>{customer.name}</h1>
                    <p className={customerStyles.customerContact}>{customer.contact}</p>
                </div>
            </div> */}

            <section className={customerStyles.section}>
                <h2 className={customerStyles.sectionTitle}>Measurement History</h2>
                {measurementsLoading && (
                    <div className={measurementStyles.measurementGrid}>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className={measurementStyles.skeletonCard} />
                        ))}
                    </div>
                )}
                {!measurementsLoading && measurements && measurements.length > 0 ? (
                    <div className={measurementStyles.measurementGrid}>
                        {measurements.map((measurement) => (
                            <MeasurementCard
                                key={measurement.id}
                                measurement={{
                                    ...measurement,
                                    customerName: customer.name,
                                }}
                                onEdit={handleEdit}
                                onCopy={handleCopy}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <p>No measurement history found for this customer.</p>
                )}
            </section>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={
                    editingMeasurement?.id ? 'Edit Measurement' : 'Add New Measurement'
                }
            >
                <MeasurementForm
                    customers={[{ label: customer.name, value: customer.id }]}
                    defaultValues={editingMeasurement || { customerId: customer.id }}
                    isSaving={isSaving}
                    onSave={handleSaveMeasurement}
                    onClose={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <p>
                    Are you sure you want to delete this measurement? This action
                    cannot be undone.
                </p>
                <div className={customerStyles.modalFooter}>
                    <Button
                        variant="secondary"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default CustomerDetailPage; 