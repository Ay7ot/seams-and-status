'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Search, Scissors, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'react-feather';
import { Button, Modal } from '@/components/ui';
import OrderCard from '@/components/orders/OrderCard';
import OrderForm from '@/components/orders/OrderForm';
import { Order, Customer, Payment } from '@/lib/types';
import styles from '@/styles/components/measurement-card.module.css';
import modalStyles from '@/styles/components/modal.module.css';
import formStyles from '@/styles/components/auth.module.css';
import dashboardStyles from '@/styles/components/dashboard.module.css';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';

const OrdersPage = () => {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: orders, loading } = useFirestoreQuery<Order>({
        path: 'orders',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const { data: customers } = useFirestoreQuery<Customer>({
        path: 'customers',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const { data: payments } = useFirestoreQuery<Payment>({
        path: 'payments',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const userCurrency = userProfile?.defaultCurrency || 'NGN';

    const ordersWithCustomerNames = useMemo(() => {
        if (!orders || !customers) return [];
        const customerMap = new Map(customers.map((c) => [c.id, c.name]));
        return orders.map((o) => ({
            ...o,
            customerName: customerMap.get(o.customerId) || 'Unknown Customer',
        }));
    }, [orders, customers]);

    const filteredOrders = useMemo(() => {
        if (!ordersWithCustomerNames) return [];
        return ordersWithCustomerNames.filter(
            (order) =>
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [ordersWithCustomerNames, searchTerm]);

    // Calculate order statistics
    const orderStats = useMemo(() => {
        if (!orders || !payments) return null;

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalCost || order.materialCost), 0);
        const totalPayments = payments.reduce((acc, payment) => acc + payment.amount, 0) +
            orders.reduce((acc, order) => acc + (order.initialPayment || 0), 0);

        const outstandingBalance = Math.max(0, orders.reduce((acc, order) => {
            const orderCost = order.totalCost || order.materialCost;
            const orderPayments = payments.filter(p => p.orderId === order.id).reduce((sum, p) => sum + p.amount, 0);
            const totalPaidIncludingInitial = orderPayments + (order.initialPayment || 0);
            const outstanding = orderCost - totalPaidIncludingInitial;
            return acc + Math.max(0, outstanding);
        }, 0));

        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const recentOrders = orders.filter(order => {
            if (!order.createdAt) return false;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return order.createdAt.toDate() > thirtyDaysAgo;
        }).length;

        return {
            totalOrders,
            totalRevenue,
            totalPayments,
            outstandingBalance,
            recentOrders,
            statusCounts: {
                New: statusCounts['New'] || 0,
                'In Progress': statusCounts['In Progress'] || 0,
                'Ready for Fitting': statusCounts['Ready for Fitting'] || 0,
                Completed: statusCounts['Completed'] || 0,
            },
        };
    }, [orders, payments]);

    const handleAddNew = () => {
        setEditingOrder(null);
        setIsModalOpen(true);
    };

    const handleEdit = (order: Order) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleView = (id: string) => {
        router.push(`/orders/${id}`);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
                // Create the order first
                const orderRef = await addDoc(collection(db, 'orders'), {
                    ...data,
                    userId: user.uid,
                    status: 'New',
                    collected: false,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });

                // If there's an initial payment, create a payment record
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
            handleCloseModal();
        } catch (error) {
            console.error('Error saving order:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setOrderToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete || !user) return;
        try {
            // First, get all payments associated with this order AND this user
            const paymentsQuery = collection(db, 'payments');
            const paymentsSnapshot = await getDocs(
                query(
                    paymentsQuery,
                    where('orderId', '==', orderToDelete),
                    where('userId', '==', user.uid) // Add user filter for security rules
                )
            );

            // Delete all associated payments
            const deletePaymentPromises = paymentsSnapshot.docs.map(doc =>
                deleteDoc(doc.ref)
            );
            await Promise.all(deletePaymentPromises);

            // Then delete the order
            await deleteDoc(doc(db, 'orders', orderToDelete));
        } catch (error) {
            console.error('Error deleting order: ', error);
            alert('Failed to delete order. Please try again.');
        } finally {
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
        }
    };

    return (
        <DashboardLayout title="Orders" breadcrumb="Order Management">
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
                        placeholder="Search by customer, style, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={formStyles.input}
                        style={{ paddingLeft: 'var(--space-10)', width: '100%' }}
                    />
                </div>
                {orders && orders.length > 0 && (
                    <Button onClick={handleAddNew} style={{ flexShrink: 0 }}>
                        <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                        Create Order
                    </Button>
                )}
            </div>



            {/* Outstanding Balance Alert */}
            {orderStats && orderStats.outstandingBalance > 0 && (
                <div className={dashboardStyles.alertCard}>
                    <div className={dashboardStyles.alertIcon}>
                        <AlertCircle size={16} />
                    </div>
                    <div className={dashboardStyles.alertContent}>
                        <span className={dashboardStyles.alertTitle}>Outstanding Balance</span>
                        <span className={dashboardStyles.alertAmount}>
                            {formatCurrency(orderStats.outstandingBalance, userCurrency)}
                        </span>
                    </div>
                    <button
                        className={dashboardStyles.alertAction}
                        onClick={() => router.push('/orders')}
                    >
                        View Orders
                    </button>
                </div>
            )}



            {/* Orders Grid */}
            {loading && (
                <div className={styles.measurementGrid}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: '240px', borderRadius: 'var(--radius-xl)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', backgroundColor: 'var(--neutral-100)' }} />
                    ))}
                </div>
            )}

            {!loading && filteredOrders.length > 0 && (
                <div className={styles.measurementGrid}>
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            currency={userCurrency}
                        />
                    ))}
                </div>
            )}

            {!loading && (!ordersWithCustomerNames || ordersWithCustomerNames.length === 0 || filteredOrders.length === 0) && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                        {searchTerm ? 'No Orders Found' : 'No Orders Yet'}
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
                            ? 'Try adjusting your search terms or clear the search to see all orders.'
                            : 'Create your first order to start managing your tailoring business.'
                        }
                    </p>
                    {!searchTerm && (
                        <Button onClick={handleAddNew}>
                            <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                            Create First Order
                        </Button>
                    )}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingOrder ? 'Edit Order' : 'Create New Order'}
            >
                <OrderForm
                    onSave={handleSaveOrder}
                    onClose={handleCloseModal}
                    isSaving={isSaving}
                    defaultValues={editingOrder || {}}
                />
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <p>Are you sure you want to delete this order? This action cannot be undone.</p>
                <div className={modalStyles.modalFooter}>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
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

export default OrdersPage; 