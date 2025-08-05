'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Search, Users, Scissors, Calendar } from 'react-feather';
import { Button, Modal, SelectOption } from '@/components/ui';
import MeasurementForm from '@/components/measurements/MeasurementForm';
import MeasurementCard from '@/components/measurements/MeasurementCard';
import styles from '@/styles/components/measurement-card.module.css';
import dashboardStyles from '@/styles/components/dashboard.module.css';
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

    // Calculate measurement statistics
    const measurementStats = useMemo(() => {
        if (!measurementsWithCustomerNames) return null;

        const total = measurementsWithCustomerNames.length;
        const recent = measurementsWithCustomerNames.filter(m => {
            const createdAt = m.createdAt?.toDate();
            if (!createdAt) return false;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt > thirtyDaysAgo;
        }).length;

        const genderDistribution = measurementsWithCustomerNames.reduce((acc, m) => {
            acc[m.gender] = (acc[m.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const uniqueCustomers = new Set(measurementsWithCustomerNames.map(m => m.customerId)).size;

        return {
            total,
            recent,
            genderDistribution,
            uniqueCustomers,
        };
    }, [measurementsWithCustomerNames]);

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
                <Button onClick={handleAddNew} style={{ flexShrink: 0 }}>
                    <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                    Add Measurement
                </Button>
            </div>

            {/* Business Overview Section */}
            {loading ? (
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Measurement Overview</div>
                    <div className={dashboardStyles.overviewCards}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={dashboardStyles.overviewCard}>
                                <div className={dashboardStyles.cardHeader}>
                                    <div
                                        className={dashboardStyles.cardIcon}
                                        style={{
                                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                            backgroundColor: 'var(--neutral-100)'
                                        }}
                                    />
                                    <div
                                        style={{
                                            height: '16px',
                                            width: '80px',
                                            backgroundColor: 'var(--neutral-100)',
                                            borderRadius: 'var(--radius-md)',
                                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                        }}
                                    />
                                </div>
                                <div className={dashboardStyles.cardStats}>
                                    {[...Array(2)].map((_, j) => (
                                        <div key={j} className={dashboardStyles.statItem}>
                                            <div
                                                style={{
                                                    height: '24px',
                                                    width: '60px',
                                                    backgroundColor: 'var(--neutral-100)',
                                                    borderRadius: 'var(--radius-md)',
                                                    marginBottom: '4px',
                                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                }}
                                            />
                                            <div
                                                style={{
                                                    height: '12px',
                                                    width: '80px',
                                                    backgroundColor: 'var(--neutral-100)',
                                                    borderRadius: 'var(--radius-md)',
                                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : measurementStats && (
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Measurement Overview</div>
                    <div className={dashboardStyles.overviewCards}>
                        {/* Total Measurements Card */}
                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.ordersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <Scissors size={18} />
                                </div>
                                <div className={dashboardStyles.cardTitle}>Total Measurements</div>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{measurementStats.total}</div>
                                    <div className={dashboardStyles.statText}>All Time</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{measurementStats.recent}</div>
                                    <div className={dashboardStyles.statText}>Last 30 Days</div>
                                </div>
                            </div>
                        </div>

                        {/* Gender Distribution Card */}
                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.revenueCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <Users size={18} />
                                </div>
                                <div className={dashboardStyles.cardTitle}>Gender Distribution</div>
                            </div>
                            <div className={dashboardStyles.cardStats} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {measurementStats.genderDistribution.women || 0}
                                    </div>
                                    <div className={dashboardStyles.statText}>Women</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {measurementStats.genderDistribution.men || 0}
                                    </div>
                                    <div className={dashboardStyles.statText}>Men</div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Card */}
                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.customersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <Calendar size={18} />
                                </div>
                                <div className={dashboardStyles.cardTitle}>Activity</div>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {measurementStats.uniqueCustomers}
                                    </div>
                                    <div className={dashboardStyles.statText}>Customers</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {measurementStats.recent}
                                    </div>
                                    <div className={dashboardStyles.statText}>Recent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        textAlign: 'center',
                        padding: 'var(--space-8)',
                        backgroundColor: 'var(--neutral-0)',
                        borderRadius: 'var(--radius-xl)',
                    }}
                >
                    <h2
                        style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-semibold)',
                            marginBottom: 'var(--space-4)',
                        }}
                    >
                        {searchTerm ? 'No Measurements Found' : 'No Measurements Yet'}
                    </h2>
                    <p style={{ color: 'var(--neutral-600)' }}>
                        {searchTerm
                            ? 'Try adjusting your search terms.'
                            : 'Add your first measurement to get started.'
                        }
                    </p>
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