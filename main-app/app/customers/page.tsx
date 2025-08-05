'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Plus, Search, Edit, Trash, Users, UserPlus, UserCheck, Calendar } from 'react-feather';
import { Button, Modal, ActionsMenu } from '@/components/ui';
import CustomerForm, {
    CustomerFormData,
} from '@/components/customers/CustomerForm';
import CustomerCard from '@/components/customers/CustomerCard';
import { Customer } from '@/lib/types';
import styles from '@/styles/components/customer-card.module.css';
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

    // Calculate customer statistics
    const customerStats = useMemo(() => {
        if (!customers) return null;

        const totalCustomers = customers.length;
        const recentCustomers = customers.filter(customer => {
            if (!customer.createdAt) return false;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return customer.createdAt.toDate() > thirtyDaysAgo;
        }).length;

        const genderStats = customers.reduce((acc, customer) => {
            acc[customer.gender] = (acc[customer.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalCustomers,
            recentCustomers,
            genderStats,
        };
    }, [customers]);

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
            {/* Business Overview Section */}
            {loading ? (
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Customer Overview</div>
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
            ) : customerStats && (
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Customer Overview</div>
                    <div className={dashboardStyles.overviewCards}>
                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.customersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <Users size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Total Customers</span>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{customerStats.totalCustomers}</div>
                                    <div className={dashboardStyles.statText}>All Customers</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{customerStats.recentCustomers}</div>
                                    <div className={dashboardStyles.statText}>New This Month</div>
                                </div>
                            </div>
                        </div>

                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.ordersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <UserPlus size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Gender Distribution</span>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{customerStats.genderStats.female || 0}</div>
                                    <div className={dashboardStyles.statText}>Female</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{customerStats.genderStats.male || 0}</div>
                                    <div className={dashboardStyles.statText}>Male</div>
                                </div>
                            </div>
                        </div>

                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.revenueCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <UserCheck size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Activity</span>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{customerStats.totalCustomers}</div>
                                    <div className={dashboardStyles.statText}>Active Customers</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}




            {/* Customer Grid */}
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