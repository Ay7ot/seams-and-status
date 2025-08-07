'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Scissors, Search, UserPlus } from 'react-feather';
import { Button, Modal, SelectOption } from '@/components/ui';
import MeasurementForm from '@/components/measurements/MeasurementForm';
import MeasurementCard from '@/components/measurements/MeasurementCard';
import styles from '@/styles/components/measurement-card.module.css';
import modalStyles from '@/styles/components/modal.module.css';
import formStyles from '@/styles/components/auth.module.css'; // For search input
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingMeasurement, setViewingMeasurement] = useState<Measurement | null>(null);

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

    const filteredMeasurements = useMemo(() => {
        if (!measurementsWithCustomerNames) return [];
        return measurementsWithCustomerNames.filter(
            (measurement) =>
                measurement.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                measurement.garmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                measurement.gender.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [measurementsWithCustomerNames, searchTerm]);



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

    const handleSaveMeasurement = async (data: Partial<Measurement>) => {
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
                    userId: user?.uid,
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
        setMeasurementToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!measurementToDelete) return;
        try {
            const measurementRef = doc(db, 'measurements', measurementToDelete);
            await deleteDoc(measurementRef);
        } catch (error) {
            console.error('Error deleting measurement: ', error);
        } finally {
            setIsDeleteModalOpen(false);
            setMeasurementToDelete(null);
        }
    };

    const handleCopy = (measurement: Measurement) => {
        setEditingMeasurement({
            ...measurement,
            id: '',
            createdAt: undefined,
        });
        setIsModalOpen(true);
    };

    const handleView = (measurement: Measurement) => {
        setViewingMeasurement(measurement);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingMeasurement(null);
    };

    return (
        <DashboardLayout title="Measurements" breadcrumb="Measurement Management">
            {/* Search and Add Section */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                    flexWrap: 'wrap',
                    gap: 'var(--space-4)',
                }}
            >
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: 'var(--space-4)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--neutral-400)',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by customer, garment type, or gender..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={formStyles.input}
                        style={{ paddingLeft: 'var(--space-10)', width: '100%' }}
                    />
                </div>
                {measurements && measurements.length > 0 && (
                    <Button onClick={handleAddNew} style={{ flexShrink: 0 }}>
                        <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                        Add Measurement
                    </Button>
                )}
            </div>



            {/* Measurements Grid */}
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

            {!loading && filteredMeasurements.length > 0 && (
                <div className={styles.measurementGrid}>
                    {filteredMeasurements.map((measurement) => (
                        <MeasurementCard
                            key={measurement.id}
                            measurement={measurement}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCopy={handleCopy}
                            onView={handleView}
                        />
                    ))}
                </div>
            )}

            {!loading && (!measurementsWithCustomerNames || measurementsWithCustomerNames.length === 0 || filteredMeasurements.length === 0) && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        padding: 'var(--space-8)',
                        backgroundColor: 'var(--neutral-0)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--neutral-200)',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    <Scissors
                        size={48}
                        style={{
                            color: 'var(--neutral-400)',
                            marginBottom: 'var(--space-4)',
                        }}
                    />
                    <h2
                        style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-semibold)',
                            marginBottom: 'var(--space-4)',
                            color: 'var(--neutral-900)',
                        }}
                    >
                        {searchTerm ? 'No Measurements Found' : 'No Measurements Yet'}
                    </h2>
                    <p
                        style={{
                            fontSize: 'var(--text-base)',
                            color: 'var(--neutral-600)',
                            marginBottom: 'var(--space-6)',
                            lineHeight: 'var(--leading-relaxed)',
                        }}
                    >
                        {searchTerm
                            ? 'Try adjusting your search terms.'
                            : 'Add your first measurement to get started.'
                        }
                    </p>
                    <Button onClick={handleAddNew}>
                        <Scissors size={20} style={{ marginRight: 'var(--space-2)' }} />
                        Add Measurement
                    </Button>
                </div>
            )}

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

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <p>
                    Are you sure you want to delete this measurement? This action
                    cannot be undone.
                </p>
                <div className={modalStyles.modalFooter}>
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

            {/* View Measurement Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                title="Measurement Details"
            >
                {viewingMeasurement && (
                    <div style={{ padding: 'var(--space-4)' }}>
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <h3 style={{
                                fontSize: 'var(--text-xl)',
                                fontWeight: 'var(--font-bold)',
                                marginBottom: 'var(--space-2)',
                                color: 'var(--neutral-900)'
                            }}>
                                {viewingMeasurement.garmentType}
                            </h3>
                            <p style={{
                                color: 'var(--neutral-600)',
                                marginBottom: 'var(--space-1)'
                            }}>
                                Customer: {viewingMeasurement.customerName || 'N/A'}
                            </p>
                            <span style={{
                                background: 'var(--primary-100)',
                                color: 'var(--primary-700)',
                                padding: 'var(--space-1) var(--space-3)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-semibold)',
                                textTransform: 'uppercase'
                            }}>
                                {viewingMeasurement.gender === 'women' ? 'Female' : 'Male'}
                            </span>
                        </div>

                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <h4 style={{
                                fontSize: 'var(--text-lg)',
                                fontWeight: 'var(--font-semibold)',
                                marginBottom: 'var(--space-4)',
                                color: 'var(--neutral-800)'
                            }}>
                                All Measurements
                            </h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 'var(--space-4)'
                            }}>
                                {Object.entries(viewingMeasurement.values).map(([key, value]) => (
                                    <div key={key} style={{
                                        background: 'var(--neutral-50)',
                                        padding: 'var(--space-4)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--neutral-200)'
                                    }}>
                                        <div style={{
                                            fontSize: 'var(--text-xs)',
                                            color: 'var(--neutral-500)',
                                            fontWeight: 'var(--font-semibold)',
                                            textTransform: 'uppercase',
                                            marginBottom: 'var(--space-1)'
                                        }}>
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--text-lg)',
                                            fontWeight: 'var(--font-bold)',
                                            color: 'var(--neutral-900)'
                                        }}>
                                            {value} {viewingMeasurement.unit || 'in'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            padding: 'var(--space-4)',
                            background: 'var(--neutral-50)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--neutral-200)'
                        }}>
                            <div style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--neutral-600)',
                                marginBottom: 'var(--space-1)'
                            }}>
                                Created on{' '}
                                {viewingMeasurement.createdAt
                                    ? new Intl.DateTimeFormat('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }).format(viewingMeasurement.createdAt.toDate())
                                    : '...'}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
};

export default MeasurementsPage; 