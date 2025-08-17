'use client';

import { use, useState, useMemo } from 'react';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout';
import MeasurementCard from '@/components/measurements/MeasurementCard';
import { Measurement, Customer, Order, Payment } from '@/lib/types';
import customerStyles from '@/styles/components/customer-detail.module.css';
import measurementStyles from '@/styles/components/measurement-card.module.css';
import stylesCardOverlay from '@/styles/components/customer-card.module.css';
import dashboardStyles from '@/styles/components/dashboard.module.css';
import { Modal, Button, ActionsMenu } from '@/components/ui';
import MeasurementForm from '@/components/measurements/MeasurementForm';
import OrderCard from '@/components/orders/OrderCard';
import OrderForm from '@/components/orders/OrderForm';
import PaymentForm from '@/components/orders/PaymentForm';
import StatusUpdateForm from '@/components/orders/StatusUpdateForm';
import DateUpdateForm from '@/components/orders/DateUpdateForm';
import { db } from '@/lib/firebase';
import {
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    collection,
    serverTimestamp,
    getDocs,
    query,
    where,
    Timestamp,
} from 'firebase/firestore';
import { Edit, Trash, DollarSign, Clock, Calendar, Scissors, Users, Copy } from 'react-feather';
import { formatDate, formatCurrency } from '@/lib/utils';

interface CustomerDetailPageProps {
    params: Promise<{ id: string }>;
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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingMeasurement, setViewingMeasurement] = useState<Measurement | null>(null);
    // Orders state
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [orderForPayment, setOrderForPayment] = useState<Order | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [orderForStatus, setOrderForStatus] = useState<Order | null>(null);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [orderForDate, setOrderForDate] = useState<Order | null>(null);
    const [dateModalType, setDateModalType] = useState<'fitting' | 'collection' | 'both'>('fitting');

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

    const { data: orders, loading: ordersLoading } = useFirestoreQuery<Order>({
        path: 'orders',
        constraints: user
            ? [
                { type: 'where', field: 'customerId', operator: '==', value: id },
                { type: 'where', field: 'userId', operator: '==', value: user.uid },
            ]
            : [],
        listen: true,
    });

    const { data: payments, loading: paymentsLoading } = useFirestoreQuery<Payment>({
        path: 'payments',
        constraints: user
            ? [
                { type: 'where', field: 'userId', operator: '==', value: user.uid },
            ]
            : [],
        listen: true,
    });

    // Calculate customer statistics
    const customerStats = useMemo(() => {
        if (!orders || !payments) return null;

        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'Completed').length;
        const activeOrders = totalOrders - completedOrders;

        // Calculate total revenue and payments for this customer
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalCost || order.materialCost || 0), 0);
        const customerPayments = payments.filter(p =>
            orders.some(o => o.id === p.orderId)
        );
        const totalPayments = customerPayments.reduce((acc, payment) => acc + payment.amount, 0);
        const outstandingAmount = Math.max(0, totalRevenue - totalPayments);

        return {
            totalOrders,
            completedOrders,
            activeOrders,
            totalRevenue,
            totalPayments,
            outstandingAmount,
        };
    }, [orders, payments]);

    const customer = customerData?.[0];

    const handleEdit = (measurement: Measurement) => {
        setEditingMeasurement(measurement);
        setIsEditModalOpen(true);
    };

    const handleCopy = (measurement: Measurement) => {
        const { ...rest } = measurement;
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

    const handleView = (measurement: Measurement) => {
        setViewingMeasurement(measurement);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingMeasurement(null);
    };
    const handleSaveMeasurement = async (data: Partial<Measurement>) => {
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

    // Orders handlers
    const handleAddOrder = () => {
        setEditingOrder(null);
        setIsOrderModalOpen(true);
    };

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setIsOrderModalOpen(true);
    };

    const handleCloseOrderModal = () => {
        setIsOrderModalOpen(false);
        setEditingOrder(null);
    };

    const handleSaveOrder = async (data: Partial<Order>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            if (editingOrder) {
                const orderRef = doc(db, 'orders', editingOrder.id);
                await updateDoc(orderRef, { ...data, updatedAt: serverTimestamp() });
            } else {
                const orderRef = await addDoc(collection(db, 'orders'), {
                    ...data,
                    userId: user.uid,
                    customerId: id,
                    status: 'New',
                    collected: false,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                if (data.initialPayment && data.initialPayment > 0) {
                    await addDoc(collection(db, 'payments'), {
                        userId: user.uid,
                        orderId: orderRef.id,
                        amount: data.initialPayment,
                        date: serverTimestamp(),
                        note: 'Initial payment (deposit)',
                        createdAt: serverTimestamp(),
                    });
                }
            }
            handleCloseOrderModal();
        } catch (error) {
            console.error('Error saving order:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOrder = async (idToDelete: string) => {
        setOrderToDelete(idToDelete);
        setIsDeleteOrderModalOpen(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete || !user) return;
        try {
            // delete payments for this order and user
            const paymentsQuery = collection(db, 'payments');
            const snapshot = await getDocs(query(paymentsQuery, where('orderId', '==', orderToDelete), where('userId', '==', user.uid)));
            await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
            await deleteDoc(doc(db, 'orders', orderToDelete));
        } catch (error) {
            console.error('Error deleting order:', error);
        } finally {
            setIsDeleteOrderModalOpen(false);
            setOrderToDelete(null);
        }
    };

    const handleViewOrder = (orderId: string) => {
        // Navigate to full order page for deep details
        if (typeof window !== 'undefined') {
            window.location.href = `/orders/${orderId}`;
        }
    };

    const openPaymentForOrder = (order: Order) => {
        setOrderForPayment(order);
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = async (data: Partial<Payment>) => {
        if (!user || !orderForPayment) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'payments'), {
                ...data,
                userId: user.uid,
                orderId: orderForPayment.id,
                createdAt: serverTimestamp(),
            });
            setIsPaymentModalOpen(false);
            setOrderForPayment(null);
        } catch (e) {
            console.error('Error saving payment', e);
        } finally {
            setIsSaving(false);
        }
    };

    const openStatusForOrder = (order: Order) => {
        setOrderForStatus(order);
        setIsStatusModalOpen(true);
    };

    const handleStatusUpdate = async (data: Partial<Order>) => {
        if (!user || !orderForStatus) return;
        setIsSaving(true);
        try {
            const orderRef = doc(db, 'orders', orderForStatus.id);
            await updateDoc(orderRef, { ...data, updatedAt: serverTimestamp() });
            setIsStatusModalOpen(false);
            setOrderForStatus(null);
        } catch (e) {
            console.error('Error updating status', e);
        } finally {
            setIsSaving(false);
        }
    };

    const openDateForOrder = (order: Order, type: 'fitting' | 'collection' | 'both') => {
        setOrderForDate(order);
        setDateModalType(type);
        setIsDateModalOpen(true);
    };

    const handleDateUpdate = async (data: { fittingDate?: Date | null; collectionDate?: Date | null }) => {
        if (!user || !orderForDate) return;
        setIsSaving(true);
        try {
            const orderRef = doc(db, 'orders', orderForDate.id);
            const updateData: Partial<Order> = { updatedAt: serverTimestamp() as Timestamp };
            if (data.fittingDate !== undefined) {
                updateData.fittingDate = data.fittingDate ? Timestamp.fromDate(data.fittingDate) : null as unknown as { toDate: () => Date };
            }
            if (data.collectionDate !== undefined) {
                updateData.collectionDate = data.collectionDate ? Timestamp.fromDate(data.collectionDate) : null as unknown as { toDate: () => Date };
            }
            await updateDoc(orderRef, updateData);
            setIsDateModalOpen(false);
            setOrderForDate(null);
        } catch (e) {
            console.error('Error updating dates', e);
        } finally {
            setIsSaving(false);
        }
    };

    if (customerLoading) {
        return (
            <DashboardLayout title="Customer Details">
                {/* Customer Header Skeleton */}
                <div className={customerStyles.detailHeader}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 'var(--space-4)'
                    }}>
                        <div style={{ flex: '1', minWidth: '250px' }}>
                            <div style={{
                                height: 'var(--text-4xl)',
                                width: '200px',
                                backgroundColor: 'var(--neutral-200)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-2)',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                            <div style={{
                                height: 'var(--text-lg)',
                                width: '150px',
                                backgroundColor: 'var(--neutral-200)',
                                borderRadius: 'var(--radius-md)',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
                            <div style={{
                                height: '40px',
                                width: '120px',
                                backgroundColor: 'var(--neutral-200)',
                                borderRadius: 'var(--radius-md)',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                            <div style={{
                                height: '40px',
                                width: '120px',
                                backgroundColor: 'var(--neutral-200)',
                                borderRadius: 'var(--radius-md)',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                        </div>
                    </div>
                </div>

                {/* Statistics Skeleton */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-8)'
                }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                            background: 'var(--neutral-0)',
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--neutral-200)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                height: 'var(--text-2xl)',
                                width: '60px',
                                backgroundColor: 'var(--neutral-200)',
                                borderRadius: 'var(--radius-md)',
                                margin: '0 auto var(--space-2)',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                            <div style={{
                                height: 'var(--text-sm)',
                                width: '80px',
                                backgroundColor: 'var(--neutral-200)',
                                borderRadius: 'var(--radius-md)',
                                margin: '0 auto',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                        </div>
                    ))}
                </div>

                {/* Sections Skeleton */}
                <section className={customerStyles.section}>
                    <div style={{
                        height: 'var(--text-2xl)',
                        width: '200px',
                        backgroundColor: 'var(--neutral-200)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-6)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                    <div className={measurementStyles.measurementGrid}>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className={measurementStyles.skeletonCard} />
                        ))}
                    </div>
                </section>

                <section className={customerStyles.section}>
                    <div style={{
                        height: 'var(--text-2xl)',
                        width: '150px',
                        backgroundColor: 'var(--neutral-200)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-6)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                    <div className={measurementStyles.measurementGrid}>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} style={{
                                backgroundColor: 'var(--neutral-0)',
                                borderRadius: 'var(--radius-xl)',
                                height: '240px',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                            }} />
                        ))}
                    </div>
                </section>
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
            breadcrumb={`${customer.name}`}
        >
            <div className={customerStyles.detailHeader}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 'var(--space-4)'
                }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <h1 className={customerStyles.customerName}>{customer.name}</h1>
                        <p className={customerStyles.customerContact}>{customer.contact}</p>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        flexWrap: 'wrap',
                        flexShrink: 0
                    }}>
                        <Button onClick={() => setIsEditModalOpen(true)}>Add Measurement</Button>
                        <Button variant="outline" onClick={handleAddOrder}>Create Order</Button>
                    </div>
                </div>
            </div>

            {/* Customer Statistics */}
            {customerStats && (
                <div className={dashboardStyles.overviewCards} style={{ marginBottom: 'var(--space-8)' }}>
                    <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.ordersCard}`}>
                        <div className={dashboardStyles.cardHeader}>
                            <div className={dashboardStyles.cardIcon}>
                                <Scissors size={18} />
                            </div>
                            <span className={dashboardStyles.cardTitle}>Measurements</span>
                        </div>
                        <div className={dashboardStyles.cardStats}>
                            <div className={dashboardStyles.statItem}>
                                <div className={dashboardStyles.statNumber}>{measurements?.length || 0}</div>
                                <div className={dashboardStyles.statText}>Total Measurements</div>
                            </div>
                        </div>
                    </div>

                    <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.customersCard}`}>
                        <div className={dashboardStyles.cardHeader}>
                            <div className={dashboardStyles.cardIcon}>
                                <Users size={18} />
                            </div>
                            <span className={dashboardStyles.cardTitle}>Orders</span>
                        </div>
                        <div className={dashboardStyles.cardStats}>
                            <div className={dashboardStyles.statItem}>
                                <div className={dashboardStyles.statNumber}>{customerStats.totalOrders}</div>
                                <div className={dashboardStyles.statText}>Total Orders</div>
                            </div>
                            <div className={dashboardStyles.statItem}>
                                <div className={dashboardStyles.statNumber}>{customerStats.completedOrders}</div>
                                <div className={dashboardStyles.statText}>Completed</div>
                            </div>
                        </div>
                    </div>

                    <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.revenueCard}`}>
                        <div className={dashboardStyles.cardHeader}>
                            <div className={dashboardStyles.cardIcon}>
                                <DollarSign size={18} />
                            </div>
                            <span className={dashboardStyles.cardTitle}>Payments</span>
                        </div>
                        <div className={dashboardStyles.cardStats}>
                            <div className={dashboardStyles.statItem}>
                                <div className={dashboardStyles.statNumber}>
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'NGN',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    }).format(customerStats.totalPayments)}
                                </div>
                                <div className={dashboardStyles.statText}>Total Paid</div>
                            </div>
                            <div className={dashboardStyles.statItem}>
                                <div className={dashboardStyles.statNumber} style={{
                                    color: customerStats.outstandingAmount > 0 ? 'var(--error-600)' : 'var(--success-600)'
                                }}>
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'NGN',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    }).format(customerStats.outstandingAmount)}
                                </div>
                                <div className={dashboardStyles.statText}>Outstanding</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section className={customerStyles.section}>
                <h2 className={customerStyles.sectionTitle}>Measurement History</h2>
                <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--neutral-600)',
                    marginBottom: 'var(--space-4)',
                    fontStyle: 'italic'
                }}>
                    Measurements are tied to this customer. Use presets from the Measurements tab to speed up data entry.
                </p>
                {measurementsLoading && (
                    <>
                        <div className={`desktop-only ${measurementStyles.measurementGrid}`}>
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className={measurementStyles.skeletonCard} />
                            ))}
                        </div>
                        <div className={`mobile-only ${customerStyles.mobileList}`}>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={customerStyles.mobileListItem} style={{ height: '88px' }} />
                            ))}
                        </div>
                    </>
                )}
                {!measurementsLoading && measurements && measurements.length > 0 ? (
                    <>
                        {/* Desktop cards */}
                        <div className={`desktop-only ${measurementStyles.measurementGrid}`}>
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
                                    onView={handleView}
                                />
                            ))}
                        </div>
                        {/* Mobile list */}
                        <div className={`mobile-only ${customerStyles.mobileList}`}>
                            {measurements.map((m) => (
                                <div key={m.id} className={customerStyles.mobileListItem}>
                                    <div className={customerStyles.mobileItemHeader}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 className={customerStyles.mobileItemTitle}>{m.garmentType}</h3>
                                            <div className={customerStyles.mobileItemSubtitle}>for {customer.name}</div>
                                        </div>
                                        <span style={{
                                            background: m.gender === 'women'
                                                ? 'linear-gradient(135deg, var(--accent-pink) 0%, rgba(236, 72, 153, 0.9) 100%)'
                                                : 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                                            color: 'var(--neutral-0)',
                                            padding: 'var(--space-1) var(--space-2)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--text-xs)',
                                            fontWeight: 'var(--font-bold)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>
                                            {m.gender === 'women' ? 'Female' : 'Male'}
                                        </span>
                                    </div>
                                    <div className={customerStyles.mobileItemMeta}>
                                        {Object.entries(m.values).slice(0, 4).map(([key, value]) => (
                                            <div key={key} style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                                <span className={customerStyles.mobileMetaKey}>
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                                </span>{' '}
                                                {value}{m.unit || 'in'}
                                            </div>
                                        ))}
                                        {Object.keys(m.values).length > 4 && (
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-500)', fontStyle: 'italic' }}>
                                                +{Object.keys(m.values).length - 4} more
                                            </div>
                                        )}
                                    </div>
                                    <div className={customerStyles.mobileItemFooter}>
                                        📅 Created on {m.createdAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(m.createdAt.toDate()) : '...'}
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
                                            <button
                                                style={{
                                                    background: 'var(--primary-500)',
                                                    color: 'var(--neutral-0)',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-md)',
                                                    padding: 'var(--space-2) var(--space-3)',
                                                    fontSize: 'var(--text-sm)',
                                                    fontWeight: 'var(--font-semibold)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleView(m)}
                                            >
                                                View
                                            </button>
                                            <ActionsMenu
                                                items={[
                                                    { label: 'Edit', icon: <Edit />, onClick: () => handleEdit(m) },
                                                    { label: 'Copy', icon: <Copy />, onClick: () => handleCopy(m) },
                                                    { label: 'Delete', icon: <Trash />, onClick: () => handleDelete(m.id), isDanger: true },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>No measurement history found for this customer.</p>
                )}
            </section>

            <section className={customerStyles.section}>
                <h2 className={customerStyles.sectionTitle}>Orders</h2>
                {ordersLoading && (
                    <>
                        <div className={`desktop-only ${measurementStyles.measurementGrid}`}>
                            {[...Array(2)].map((_, i) => (
                                <div key={i} style={{ backgroundColor: 'var(--neutral-0)', borderRadius: 'var(--radius-xl)', height: '240px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                            ))}
                        </div>
                        <div className={`mobile-only ${customerStyles.mobileList}`}>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={customerStyles.mobileListItem} style={{ height: '96px' }} />
                            ))}
                        </div>
                    </>
                )}
                {!ordersLoading && orders && orders.length > 0 ? (
                    <>
                        {/* Desktop cards */}
                        <div className={`desktop-only ${measurementStyles.measurementGrid}`}>
                            {orders.map((order) => (
                                <div key={order.id} className={stylesCardOverlay.cardWrapper}>
                                    <OrderCard
                                        order={{ ...order, customerName: customer.name }}
                                        onEdit={handleEditOrder}
                                        onDelete={handleDeleteOrder}
                                        onView={handleViewOrder}
                                    />
                                    <div className={stylesCardOverlay.cardActions}>
                                        <ActionsMenu
                                            items={[
                                                { label: 'Add Payment', icon: <DollarSign />, onClick: () => openPaymentForOrder(order) },
                                                { label: 'Update Status', icon: <Clock />, onClick: () => openStatusForOrder(order) },
                                                { label: 'Set Fitting Date', icon: <Calendar />, onClick: () => openDateForOrder(order, 'fitting') },
                                                { label: 'Set Collection Date', icon: <Calendar />, onClick: () => openDateForOrder(order, 'collection') },
                                                { label: 'Edit', icon: <Edit />, onClick: () => handleEditOrder(order) },
                                                { label: 'Delete', icon: <Trash />, onClick: () => handleDeleteOrder(order.id), isDanger: true },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Mobile list */}
                        <div className={`mobile-only ${customerStyles.mobileList}`}>
                            {orders.map((o) => (
                                <div key={o.id} className={customerStyles.mobileListItem}>
                                    <div className={customerStyles.mobileItemHeader}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 className={customerStyles.mobileItemTitle}>{o.style}</h3>
                                            <div className={customerStyles.mobileItemSubtitle}>{customer.name}</div>
                                        </div>
                                        <span style={{
                                            padding: 'var(--space-1-5) var(--space-3)',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 'var(--font-semibold)',
                                            textTransform: 'capitalize',
                                            backgroundColor: o.status === 'Completed' ? 'var(--success-100)' : o.status === 'New' ? 'var(--primary-100)' : 'var(--warning-100)',
                                            color: o.status === 'Completed' ? 'var(--success-800)' : o.status === 'New' ? 'var(--primary-800)' : 'var(--warning-800)'
                                        }}>
                                            {o.status}
                                        </span>
                                    </div>
                                    <div className={customerStyles.mobileItemMeta}>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                            <span className={customerStyles.mobileMetaKey}>Arrival:</span> {formatDate(o.arrivalDate as unknown as { toDate: () => Date })}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                            <span className={customerStyles.mobileMetaKey}>Total:</span> {formatCurrency((o.totalCost || o.materialCost || 0), 'NGN')}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                            <span className={customerStyles.mobileMetaKey}>Paid:</span> {formatCurrency((o.initialPayment || 0), 'NGN')}
                                        </div>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                            <span className={customerStyles.mobileMetaKey}>Balance:</span> {formatCurrency(((o.totalCost || o.materialCost || 0) - (o.initialPayment || 0)), 'NGN')}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <button
                                            style={{
                                                background: 'transparent',
                                                color: 'var(--neutral-700)',
                                                border: '1px solid var(--neutral-300)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: 'var(--space-2) var(--space-3)',
                                                fontSize: 'var(--text-sm)',
                                                fontWeight: 'var(--font-semibold)'
                                            }}
                                            onClick={() => handleViewOrder(o.id)}
                                        >
                                            View
                                        </button>
                                        <ActionsMenu
                                            items={[
                                                { label: 'Edit', icon: <Edit />, onClick: () => handleEditOrder(o) },
                                                { label: 'Delete', icon: <Trash />, onClick: () => handleDeleteOrder(o.id), isDanger: true },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>No orders found for this customer.</p>
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
            <Modal
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                title="View Measurement"
            >
                <MeasurementForm
                    customers={[{ label: customer.name, value: customer.id }]}
                    defaultValues={viewingMeasurement || { customerId: customer.id }}
                    isSaving={isSaving}
                    onSave={handleSaveMeasurement}
                    onClose={handleCloseViewModal}
                />
            </Modal>

            {/* Order create/edit modal */}
            <Modal
                isOpen={isOrderModalOpen}
                onClose={handleCloseOrderModal}
                title={editingOrder ? 'Edit Order' : 'Create Order'}
            >
                <OrderForm
                    onSave={handleSaveOrder}
                    onClose={handleCloseOrderModal}
                    isSaving={isSaving}
                    defaultValues={editingOrder || { customerId: customer.id }}
                />
            </Modal>

            {/* Order delete modal */}
            <Modal
                isOpen={isDeleteOrderModalOpen}
                onClose={() => setIsDeleteOrderModalOpen(false)}
                title="Confirm Delete Order"
            >
                <p>Are you sure you want to delete this order? This will also remove its payments.</p>
                <div className={customerStyles.modalFooter}>
                    <Button variant="secondary" onClick={() => setIsDeleteOrderModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDeleteOrder}>Delete</Button>
                </div>
            </Modal>

            {/* Payment modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title={orderForPayment ? `Add Payment for Order #${orderForPayment.id.substring(0, 6)}` : 'Add Payment'}
            >
                <PaymentForm
                    onSave={handleSavePayment}
                    onClose={() => setIsPaymentModalOpen(false)}
                    isSaving={isSaving}
                />
            </Modal>

            {/* Status modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                title="Update Order Status"
            >
                <StatusUpdateForm
                    onSave={handleStatusUpdate}
                    onClose={() => setIsStatusModalOpen(false)}
                    isSaving={isSaving}
                    currentStatus={orderForStatus?.status || 'New'}
                />
            </Modal>

            {/* Date modal */}
            <Modal
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                title={`Update ${dateModalType === 'fitting' ? 'Fitting' : dateModalType === 'collection' ? 'Collection' : 'Dates'}`}
            >
                {orderForDate && (
                    <DateUpdateForm
                        order={orderForDate}
                        onSave={handleDateUpdate}
                        onClose={() => setIsDateModalOpen(false)}
                        isSaving={isSaving}
                        type={dateModalType}
                    />
                )}
            </Modal>
        </DashboardLayout>
    );
};

export default CustomerDetailPage; 