'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Search } from 'react-feather';
import { Button, Modal } from '@/components/ui';
import OrderCard from '@/components/orders/OrderCard';
import OrderForm from '@/components/orders/OrderForm';
import { Order, Customer } from '@/lib/types';
import styles from '@/styles/components/measurement-card.module.css'; // Re-using for grid layout
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
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
                <Button onClick={handleAddNew} style={{ flexShrink: 0 }}>
                    <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                    Create Order
                </Button>
            </div>



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
                        {searchTerm ? 'No Orders Found' : 'No Orders Yet'}
                    </h2>
                    <p style={{ color: 'var(--neutral-600)' }}>
                        {searchTerm
                            ? 'Try adjusting your search terms.'
                            : 'Create your first order to get started.'
                        }
                    </p>
                </div>
            )}

            {/* Empty state to be added here */}

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