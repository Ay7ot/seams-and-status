'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Search, Edit, Trash, Users, UserPlus } from 'react-feather';
import { Button, Modal, ActionsMenu } from '@/components/ui';
import CustomerForm, {
    CustomerFormData,
} from '@/components/customers/CustomerForm';
import CustomerCard from '@/components/customers/CustomerCard';
import { Customer } from '@/lib/types';
import styles from '@/styles/components/customer-card.module.css';
import formStyles from '@/styles/components/auth.module.css';
import customerStyles from '@/styles/components/customer-detail.module.css';
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
    const router = useRouter();

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
            {/* Search and Add Section */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-6)',
                    gap: 'var(--space-4)',
                }}
            >
                <div style={{ position: 'relative', flex: '1' }}>
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
                {customers && customers.length > 0 && (
                    <Button onClick={handleAddNew} style={{ flexShrink: 0, minWidth: '48px', padding: 'var(--space-3)' }}>
                        <Plus size={20} />
                    </Button>
                )}
            </div>





            {/* Customer Grid */}
            {loading && (
                <>
                    <div className={`desktop-only ${styles.customerGrid}`}>
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
                    <div className={`mobile-only ${customerStyles.mobileList}`}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={customerStyles.mobileListItem} style={{ height: '88px' }} />
                        ))}
                    </div>
                </>
            )}

            {!loading && filteredCustomers.length > 0 && (
                <>
                    {/* Desktop cards */}
                    <div className={`desktop-only ${styles.customerGrid}`}>
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className={styles.cardWrapper}>
                                <CustomerCard
                                    customer={customer}
                                    onView={(customer) => router.push(`/customers/${customer.id}`)}
                                />
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
                    {/* Mobile list */}
                    <div className={`mobile-only ${customerStyles.mobileList}`}>
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className={customerStyles.mobileListItem}>
                                <div className={customerStyles.mobileItemHeader}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 className={customerStyles.mobileItemTitle}>{customer.name}</h3>
                                        <div className={customerStyles.mobileItemSubtitle}>{customer.contact}</div>
                                    </div>
                                    <span style={{
                                        background: customer.gender === 'female'
                                            ? 'linear-gradient(135deg, var(--accent-pink) 0%, rgba(236, 72, 153, 0.9) 100%)'
                                            : customer.gender === 'male'
                                                ? 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)'
                                                : 'linear-gradient(135deg, var(--accent-purple) 0%, rgba(139, 92, 246, 0.9) 100%)',
                                        color: 'var(--neutral-0)',
                                        padding: 'var(--space-1) var(--space-2)',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--text-xs)',
                                        fontWeight: 'var(--font-bold)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}>
                                        {customer.gender === 'female' ? 'Female' : customer.gender === 'male' ? 'Male' : 'Other'}
                                    </span>
                                </div>
                                <div className={customerStyles.mobileItemMeta}>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)' }}>
                                        <span className={customerStyles.mobileMetaKey}>Joined:</span> {customer.createdAt ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(customer.createdAt.toDate()) : 'N/A'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                        onClick={() => router.push(`/customers/${customer.id}`)}
                                    >
                                        Open
                                    </button>
                                    <ActionsMenu
                                        items={[
                                            { label: 'Edit', icon: <Edit />, onClick: () => handleEdit(customer) },
                                            { label: 'Delete', icon: <Trash />, onClick: () => handleDelete(customer.id), isDanger: true },
                                        ]}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!loading &&
                (!customers || customers.length === 0 || filteredCustomers.length === 0) && (
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
                        <Users
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
                            No Customers Found
                        </h2>
                        <p
                            style={{
                                fontSize: 'var(--text-base)',
                                color: 'var(--neutral-600)',
                                marginBottom: 'var(--space-6)',
                                lineHeight: 'var(--leading-relaxed)',
                            }}
                        >
                            Get started by adding your first customer to build your client base.
                        </p>
                        <Button onClick={handleAddNew}>
                            <UserPlus size={20} style={{ marginRight: 'var(--space-2)' }} />
                            Add First Customer
                        </Button>
                    </div>
                )}

            {error && (
                <div style={{ color: 'var(--error-500)', marginTop: 'var(--space-4)' }}>
                    <p>Error: {error.message}</p>
                    <p>
                        There was an issue fetching customer data. Please check your
                        Firestore rules and ensure the &apos;customers&apos; collection exists.
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