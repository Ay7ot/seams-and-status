'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Search, Edit, Trash } from 'react-feather';
import { Button, Modal, ActionsMenu } from '@/components/ui';
import CustomerForm, {
    CustomerFormData,
} from '@/components/customers/CustomerForm';
import CustomerCard from '@/components/customers/CustomerCard';
import { Customer } from '@/lib/types';
import styles from '@/styles/components/customer-card.module.css';
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

const CustomersPage = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: customers,
        loading,
        error,
    } = useFirestoreQuery<Customer>({
        path: 'customers',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const filteredCustomers = useMemo(() => {
        if (!customers) return [];
        return customers.filter(
            (customer) =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.contact.includes(searchTerm)
        );
    }, [customers, searchTerm]);

    const handleAddNew = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSaveCustomer = async (data: CustomerFormData) => {
        setIsSaving(true);
        try {
            if (editingCustomer) {
                const customerRef = doc(db, 'customers', editingCustomer.id);
                await updateDoc(customerRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
            } else {
                await addDoc(collection(db, 'customers'), {
                    ...data,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving customer:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await deleteDoc(doc(db, 'customers', id));
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    return (
        <DashboardLayout title="Customers" breadcrumb="Customer Management">
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
                        placeholder="Search by name or contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={formStyles.input}
                        style={{ paddingLeft: 'var(--space-10)', width: '100%' }}
                    />
                </div>
                <Button onClick={handleAddNew} style={{ flexShrink: 0 }}>
                    <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                    Add Customer
                </Button>
            </div>

            {loading && (
                <div className={styles.customerGrid}>
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                backgroundColor: 'var(--neutral-0)',
                                borderRadius: 'var(--radius-xl)',
                                height: '180px',
                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }}
                        />
                    ))}
                </div>
            )}

            {!loading && filteredCustomers.length > 0 && (
                <div className={styles.customerGrid}>
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className={styles.cardWrapper}>
                            <CustomerCard customer={customer} />
                            <div className={styles.cardActions}>
                                <ActionsMenu
                                    items={[
                                        {
                                            label: 'Edit',
                                            icon: <Edit />,
                                            onClick: () => handleEdit(customer),
                                        },
                                        {
                                            label: 'Delete',
                                            icon: <Trash />,
                                            onClick: () => handleDelete(customer.id),
                                            isDanger: true,
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading &&
                (!customers || customers.length === 0 || filteredCustomers.length === 0) && (
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
                            No Customers Found
                        </h2>
                        <p
                            style={{
                                fontSize: 'var(--text-base)',
                                color: 'var(--neutral-600)',
                                marginBottom: 'var(--space-6)',
                            }}
                        >
                            Get started by adding your first customer.
                        </p>
                        <Button variant="outline">
                            <Plus size={20} style={{ marginRight: 'var(--space-2)' }} />
                            Add First Customer
                        </Button>
                    </div>
                )}

            {error && (
                <div style={{ color: 'var(--error-500)', marginTop: 'var(--space-4)' }}>
                    <p>Error: {error.message}</p>
                    <p>
                        There was an issue fetching customer data. Please check your
                        Firestore rules and ensure the "customers" collection exists.
                    </p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            >
                <CustomerForm
                    onSave={handleSaveCustomer}
                    onClose={handleCloseModal}
                    defaultValues={editingCustomer || undefined}
                    isSaving={isSaving}
                />
            </Modal>
        </DashboardLayout>
    );
};

export default CustomersPage; 