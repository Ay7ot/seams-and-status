'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { DashboardLayout } from '@/components/layout';
import { Order, Customer, Measurement, Payment } from '@/lib/types';
import styles from '@/styles/components/order-detail.module.css';
import dashboardStyles from '@/styles/components/dashboard.module.css';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button, Modal } from '@/components/ui';
import PaymentForm from '@/components/orders/PaymentForm';
import StatusUpdateForm from '@/components/orders/StatusUpdateForm';
import DateUpdateForm from '@/components/orders/DateUpdateForm';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, Timestamp, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { DollarSign, Calendar, User, Scissors, TrendingUp, AlertCircle, CheckCircle, Clock } from 'react-feather';

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

const OrderDetailPage = ({ params }: OrderDetailPageProps) => {
    const { id } = use(params);
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [dateModalType, setDateModalType] = useState<'fitting' | 'collection' | 'both'>('fitting');
    const [isCollectedModalOpen, setIsCollectedModalOpen] = useState(false);
    const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);

    const { data: orderData, loading: orderLoading } = useFirestoreQuery<Order>({
        path: 'orders',
        constraints: user ? [{ type: 'where', field: '__name__', operator: '==', value: id }] : [],
        listen: true,
    });

    const order = orderData?.[0];

    const { data: payments, loading: paymentsLoading } = useFirestoreQuery<Payment>({
        path: 'payments',
        constraints: order && user ? [
            { type: 'where', field: 'orderId', operator: '==', value: order.id },
            { type: 'where', field: 'userId', operator: '==', value: user.uid }
        ] : [],
        listen: true,
    });

    const { data: customerData, loading: customerLoading } = useFirestoreQuery<Customer>({
        path: 'customers',
        constraints: order ? [{ type: 'where', field: '__name__', operator: '==', value: order.customerId }] : [],
        listen: true,
    });
    const customer = customerData?.[0];

    const { data: measurementData, loading: measurementLoading } = useFirestoreQuery<Measurement>({
        path: 'measurements',
        constraints: order ? [{ type: 'where', field: '__name__', operator: '==', value: order.measurementId }] : [],
        listen: true,
    });
    const measurement = measurementData?.[0];

    const userCurrency = userProfile?.defaultCurrency || 'NGN';

    const totalPaid = useMemo(() => {
        return payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    }, [payments]);

    const balance = useMemo(() => {
        return (order?.totalCost || order?.materialCost || 0) - totalPaid;
    }, [order, totalPaid]);

    // Calculate order statistics for overview cards
    const orderStats = useMemo(() => {
        if (!order) return null;

        const materialCost = order.materialCost || 0;
        const totalCost = order.totalCost || materialCost;
        const paymentCount = payments?.length || 0;
        const daysSinceCreated = order.createdAt ?
            Math.floor((Date.now() - order.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)) : 0;

        return {
            totalCost,
            totalPaid,
            balance,
            paymentCount,
            daysSinceCreated,
            isOverdue: balance > 0 && daysSinceCreated > 30,
            profit: totalCost - materialCost,
        };
    }, [order, payments, totalPaid, balance]);

    const isLoading = orderLoading || (order && (customerLoading || measurementLoading || paymentsLoading));

    const handleSavePayment = async (data: Partial<Payment>) => {
        if (!user || !order) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'payments'), {
                ...data,
                userId: user.uid,
                orderId: order.id,
                createdAt: serverTimestamp(),
            });
            setIsPaymentModalOpen(false);
        } catch (error) {
            console.error('Error adding payment:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditPayment = async (data: Partial<Payment>) => {
        if (!user || !order || !editingPayment) return;
        setIsSaving(true);
        try {
            const paymentRef = doc(db, 'payments', editingPayment.id);
            await updateDoc(paymentRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
            setIsEditPaymentModalOpen(false);
            setEditingPayment(null);
        } catch (error) {
            console.error('Error updating payment:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        setPaymentToDelete(paymentId);
        setIsDeletePaymentModalOpen(true);
    };

    const confirmDeletePayment = async () => {
        if (!user || !order || !paymentToDelete) return;
        setIsSaving(true);
        try {
            const paymentRef = doc(db, 'payments', paymentToDelete);
            await deleteDoc(paymentRef);
            setIsDeletePaymentModalOpen(false);
            setPaymentToDelete(null);
        } catch (error) {
            console.error('Error deleting payment:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusUpdate = async (data: Partial<Order>) => {
        if (!user || !order) return;
        setIsSaving(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });
            setIsStatusModalOpen(false);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDateUpdate = async (data: { fittingDate?: Date | null; collectionDate?: Date | null }) => {
        if (!user || !order) return;

        setIsSaving(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            const updateData: Partial<Order> = { updatedAt: serverTimestamp() as Timestamp };

            if (data.fittingDate !== undefined) {
                updateData.fittingDate = data.fittingDate ? Timestamp.fromDate(data.fittingDate) : null;
            }

            if (data.collectionDate !== undefined) {
                updateData.collectionDate = data.collectionDate ? Timestamp.fromDate(data.collectionDate) : null;
            }

            await updateDoc(orderRef, updateData);
            setIsDateModalOpen(false);
        } catch (error) {
            console.error('Error updating date:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const openDateModal = (type: 'fitting' | 'collection' | 'both') => {
        setDateModalType(type);
        setIsDateModalOpen(true);
    };

    const handleMarkAsCollected = async () => {
        if (!user || !order) return;
        setIsSaving(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                status: 'Completed',
                collected: true,
                collectionDate: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            setIsCollectedModalOpen(false);
        } catch (error) {
            console.error('Error marking order as collected:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!user || !order) return;
        setIsSaving(true);
        try {
            // First, get all payments associated with this order AND this user
            const paymentsQuery = collection(db, 'payments');
            const paymentsSnapshot = await getDocs(
                query(
                    paymentsQuery,
                    where('orderId', '==', order.id),
                    where('userId', '==', user.uid)
                )
            );

            // Delete all associated payments
            const deletePaymentPromises = paymentsSnapshot.docs.map(doc =>
                deleteDoc(doc.ref)
            );
            await Promise.all(deletePaymentPromises);

            // Then delete the order
            await deleteDoc(doc(db, 'orders', order.id));

            // Redirect to orders list
            router.push('/orders');
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Loading Order...">
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Order Overview</div>
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
            </DashboardLayout>
        );
    }

    if (!order) {
        return (
            <DashboardLayout title="Order Not Found">
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <p>The requested order could not be found.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={`Order #${id.substring(0, 6)}`} breadcrumb={`Order #${id.substring(0, 6)}`}>
            {/* Order Overview Section */}
            {orderStats && (
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Order Overview</div>
                    <div className={dashboardStyles.overviewCards}>
                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.ordersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <DollarSign size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Finances</span>
                            </div>
                            <div className={dashboardStyles.cardStats} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {formatCurrency(orderStats.totalCost, userCurrency)}
                                    </div>
                                    <div className={dashboardStyles.statText}>Total Cost</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {formatCurrency(orderStats.totalPaid, userCurrency)}
                                    </div>
                                    <div className={dashboardStyles.statText}>Total Paid</div>
                                </div>

                            </div>
                        </div>

                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.revenueCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <TrendingUp size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Balance</span>
                            </div>
                            <div className={dashboardStyles.cardStats} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {formatCurrency(orderStats.balance, userCurrency)}
                                    </div>
                                    <div className={dashboardStyles.statText}>Outstanding</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{orderStats.paymentCount}</div>
                                    <div className={dashboardStyles.statText}>Payments Made</div>
                                </div>

                            </div>
                        </div>

                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.customersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <DollarSign size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Pricing</span>
                            </div>
                            <div className={dashboardStyles.cardStats} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {formatCurrency(order.materialCost || 0, userCurrency)}
                                    </div>
                                    <div className={dashboardStyles.statText}>Material Cost</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber} style={{ color: 'var(--success-700)' }}>
                                        {formatCurrency(orderStats.profit, userCurrency)}
                                    </div>
                                    <div className={dashboardStyles.statText}>Profit</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Outstanding Balance Alert */}
            {orderStats && orderStats.balance > 0 && (
                <div className={dashboardStyles.alertCard}>
                    <div className={dashboardStyles.alertIcon}>
                        <AlertCircle size={16} />
                    </div>
                    <div className={dashboardStyles.alertContent}>
                        <span className={dashboardStyles.alertTitle}>
                            {orderStats.isOverdue ? 'Overdue Payment' : 'Outstanding Balance'}
                        </span>
                        <span className={dashboardStyles.alertAmount}>
                            {formatCurrency(orderStats.balance, userCurrency)}
                        </span>
                    </div>
                    <button
                        className={dashboardStyles.alertAction}
                        onClick={() => setIsPaymentModalOpen(true)}
                    >
                        Add Payment
                    </button>
                </div>
            )}

            {/* Main Content Grid */}
            <div className={styles.grid}>
                <main className={styles.mainContent}>
                    {/* Customer & Order Details Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Order Details</h2>
                            <div className={`${styles.status} ${styles[order.status.replace(/\s+/g, '')]}`}>{order.status}</div>
                        </div>
                        <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Customer</span>
                                <span className={styles.detailValue}>{customer?.name || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Contact</span>
                                <span className={styles.detailValue}>{customer?.contact || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Style</span>
                                <span className={styles.detailValue}>{order.style}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Material Cost</span>
                                <span className={styles.detailValue}>{formatCurrency(order.materialCost, userCurrency)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Arrival Date</span>
                                <span className={styles.detailValue}>{formatDate(order.arrivalDate)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Fitting Date</span>
                                <span className={styles.detailValue}>
                                    {order.fittingDate ? formatDate(order.fittingDate) : 'Not set'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Collection Date</span>
                                <span className={styles.detailValue}>
                                    {order.collectionDate ? formatDate(order.collectionDate) : 'Not collected'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Measurement Details Card */}
                    {measurement && (
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.cardTitle}>Measurements</h2>
                                <span className={styles.detailValue}>{measurement.garmentType} ({measurement.unit || 'in'})</span>
                            </div>
                            <table className={styles.measurementTable}>
                                <tbody>
                                    {Object.entries(measurement.values).map(([key, value]) => (
                                        <tr key={key}>
                                            <td>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                                            <td><strong>{value}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>

                <aside className={styles.sidebar}>
                    {/* Payment Summary Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Payment History</h2>
                        </div>

                        <ul className={styles.paymentHistory}>
                            {payments?.map(p => (
                                <li key={p.id} className={styles.paymentItem}>
                                    <div>
                                        <span className={styles.paymentAmount}>{formatCurrency(p.amount, userCurrency)}</span>
                                        {p.note && <div className={styles.paymentDate}>{p.note}</div>}
                                    </div>
                                    <div className={styles.paymentDate}>{formatDate(p.date)}</div>
                                    <div className={styles.paymentActions}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingPayment(p);
                                                setIsEditPaymentModalOpen(true);
                                            }}
                                            className={styles.actionButton}
                                            title="Edit payment"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePayment(p.id)}
                                            className={styles.actionButton}
                                            title="Delete payment"
                                            disabled={isSaving}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Total Cost</span>
                                <span className={styles.summaryAmount}>{formatCurrency(order.totalCost || order.materialCost, userCurrency)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Total Paid</span>
                                <span className={styles.summaryAmount}>{formatCurrency(totalPaid, userCurrency)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.balance}`}>
                                <span className={styles.summaryLabel}>Balance</span>
                                <span className={styles.summaryAmount}>
                                    {balance >= 0 ? formatCurrency(balance, userCurrency) : `+${formatCurrency(Math.abs(balance), userCurrency)}`}
                                </span>
                            </div>
                        </div>
                        <Button fullWidth style={{ marginTop: 'var(--space-6)' }} onClick={() => setIsPaymentModalOpen(true)}>Add Payment</Button>
                    </div>

                    {/* Actions Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Quick Actions</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <Button variant="secondary" onClick={() => setIsStatusModalOpen(true)} disabled={order.collected}>
                                <Clock size={16} style={{ marginRight: 'var(--space-2)' }} />
                                Update Status
                            </Button>
                            <Button variant="outline" onClick={() => openDateModal('fitting')} disabled={order.collected}>
                                <Calendar size={16} style={{ marginRight: 'var(--space-2)' }} />
                                Set Fitting Date
                            </Button>
                            <Button variant="outline" onClick={() => openDateModal('collection')} disabled={order.collected}>
                                <Calendar size={16} style={{ marginRight: 'var(--space-2)' }} />
                                Set Collection Date
                            </Button>
                            <Button variant="success" onClick={() => setIsCollectedModalOpen(true)} disabled={order.collected}>
                                <CheckCircle size={16} style={{ marginRight: 'var(--space-2)' }} />
                                Mark as Collected
                            </Button>
                            <Button variant="danger" onClick={() => setIsDeleteOrderModalOpen(true)}>
                                <Scissors size={16} style={{ marginRight: 'var(--space-2)' }} />
                                Delete Order
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>

            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Add New Payment">
                <PaymentForm
                    onSave={handleSavePayment}
                    onClose={() => setIsPaymentModalOpen(false)}
                    isSaving={isSaving}
                />
            </Modal>

            <Modal isOpen={isEditPaymentModalOpen} onClose={() => setIsEditPaymentModalOpen(false)} title="Edit Payment">
                <PaymentForm
                    onSave={handleEditPayment}
                    onClose={() => setIsEditPaymentModalOpen(false)}
                    isSaving={isSaving}
                    defaultValues={editingPayment || undefined}
                />
            </Modal>

            <Modal isOpen={isDeletePaymentModalOpen} onClose={() => setIsDeletePaymentModalOpen(false)} title="Confirm Delete Payment">
                <p>Are you sure you want to delete this payment? This action cannot be undone.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                    <Button variant="secondary" onClick={() => setIsDeletePaymentModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDeletePayment} disabled={isSaving}>
                        {isSaving ? 'Deleting...' : 'Delete Payment'}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Update Order Status">
                <StatusUpdateForm
                    onSave={handleStatusUpdate}
                    onClose={() => setIsStatusModalOpen(false)}
                    isSaving={isSaving}
                    currentStatus={order.status}
                />
            </Modal>

            <Modal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} title={`Update ${dateModalType === 'fitting' ? 'Fitting' : dateModalType === 'collection' ? 'Collection' : 'Dates'}`}>
                <DateUpdateForm
                    order={order}
                    onSave={handleDateUpdate}
                    onClose={() => setIsDateModalOpen(false)}
                    isSaving={isSaving}
                    type={dateModalType}
                />
            </Modal>

            <Modal isOpen={isCollectedModalOpen} onClose={() => setIsCollectedModalOpen(false)} title="Confirm Collection">
                <p>Are you sure you want to mark this order as collected? This will complete the order and lock most actions.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                    <Button variant="secondary" onClick={() => setIsCollectedModalOpen(false)}>Cancel</Button>
                    <Button variant="success" onClick={handleMarkAsCollected} disabled={isSaving}>
                        {isSaving ? 'Completing...' : 'Yes, Complete Order'}
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isDeleteOrderModalOpen} onClose={() => setIsDeleteOrderModalOpen(false)} title="Confirm Order Deletion">
                <p>Are you sure you want to delete this order? This action cannot be undone and will remove all associated payments and measurements.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                    <Button variant="secondary" onClick={() => setIsDeleteOrderModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteOrder} disabled={isSaving}>
                        {isSaving ? 'Deleting...' : 'Delete Order'}
                    </Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default OrderDetailPage; 