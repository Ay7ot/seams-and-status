'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { Order, Customer, Payment, Measurement } from '@/lib/types';
import dashboardStyles from '@/styles/components/dashboard.module.css';
import { Button } from '@/components/ui';
import { Plus, Users, Scissors, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, Settings } from 'react-feather';
import { formatCurrency } from '@/lib/utils';

const DashboardPage = () => {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();

    const { data: orders, loading: ordersLoading } = useFirestoreQuery<Order>({
        path: 'orders',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const { data: customers, loading: customersLoading } = useFirestoreQuery<Customer>({
        path: 'customers',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const { data: payments, loading: paymentsLoading } = useFirestoreQuery<Payment>({
        path: 'payments',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const { data: measurements, loading: measurementsLoading } = useFirestoreQuery<Measurement>({
        path: 'measurements',
        constraints: user ? [{ type: 'where', field: 'userId', operator: '==', value: user.uid }] : [],
        listen: true,
    });

    const userCurrency = userProfile?.defaultCurrency || 'NGN';

    const ordersWithCustomerNames = useMemo(() => {
        if (!orders || !customers) return [];
        const customerMap = new Map(customers.map((c) => [c.id, c.name]));
        return orders.map((order) => ({
            ...order,
            customerName: customerMap.get(order.customerId) || 'Unknown Customer',
        }));
    }, [orders, customers]);

    const measurementsWithCustomerNames = useMemo(() => {
        if (!measurements || !customers) return [];
        const customerMap = new Map(customers.map((c) => [c.id, c.name]));
        return measurements.map((m) => ({
            ...m,
            customerName: customerMap.get(m.customerId) || 'Unknown Customer',
        }));
    }, [measurements, customers]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!orders || !payments || !customers) return null;

        const totalOrders = orders.length;
        const totalCustomers = customers.length;
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

        return {
            totalOrders,
            totalCustomers,
            totalRevenue,
            totalPayments,
            outstandingBalance,
            statusCounts: {
                New: statusCounts['New'] || 0,
                'In Progress': statusCounts['In Progress'] || 0,
                'Ready for Fitting': statusCounts['Ready for Fitting'] || 0,
                Completed: statusCounts['Completed'] || 0,
            },
        };
    }, [orders, payments, customers]);

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

    // Get recent orders for quick view
    useMemo(() => {
        if (!ordersWithCustomerNames) return [];
        return ordersWithCustomerNames
            .filter((order) => order.createdAt)
            .sort((a, b) => {
                const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
                const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            })
            .slice(0, 6);
    }, [ordersWithCustomerNames]);

    // Improved loading state logic - only consider data loading states since auth is handled above
    const isDataLoading = ordersLoading || customersLoading || paymentsLoading || measurementsLoading;

    // Additional check: if auth is complete but we have no data yet, still show loading
    const hasInitialData = orders !== null && customers !== null && payments !== null && measurements !== null;
    const shouldShowLoading = isDataLoading || (!isDataLoading && userProfile && !hasInitialData);

    // Loading state for auth - show loading while auth is loading OR while user exists but profile is not loaded yet
    if (authLoading || (user && !userProfile)) {
        return (
            <DashboardLayout title="Dashboard" breadcrumb="Overview">
                <div className={dashboardStyles.welcomeSection}>
                    <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                        <div style={{ height: 'var(--text-2xl)', width: '200px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }} />
                        <div style={{ height: 'var(--text-base)', width: '300px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)' }} />
                    </div>
                </div>

                {/* Loading Statistics Cards */}
                <div className={dashboardStyles.statsGrid}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={dashboardStyles.statCard}>
                            <div className={dashboardStyles.statIcon} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                            <div className={dashboardStyles.statContent}>
                                <div style={{ height: 'var(--text-2xl)', width: '60px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                <div style={{ height: 'var(--text-sm)', width: '80px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    // If not authenticated after loading (no user at all)
    if (!authLoading && !user) {
        return (
            <DashboardLayout title="Dashboard" breadcrumb="Overview">
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <p>Please log in to view your dashboard.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard" breadcrumb="Overview">


            {/* Business Overview Cards */}
            {shouldShowLoading ? (
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Business Overview</div>
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
            ) : stats && (
                <div className={dashboardStyles.overviewSection}>
                    <div className={dashboardStyles.sectionTitle}>Business Overview</div>
                    <div className={dashboardStyles.overviewCards}>
                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.ordersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <Scissors size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Orders</span>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{stats.totalOrders}</div>
                                    <div className={dashboardStyles.statText}>Total Orders</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{stats.statusCounts.New}</div>
                                    <div className={dashboardStyles.statText}>New Orders</div>
                                </div>
                            </div>
                        </div>

                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.revenueCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <DollarSign size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Revenue</span>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {formatCurrency(stats.totalRevenue, userCurrency)}
                                    </div>
                                    <div className={dashboardStyles.statText}>Total Revenue</div>
                                </div>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>
                                        {formatCurrency(stats.totalPayments, userCurrency)}
                                    </div>
                                    <div className={dashboardStyles.statText}>Total Payments</div>
                                </div>
                            </div>
                        </div>

                        <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.customersCard}`}>
                            <div className={dashboardStyles.cardHeader}>
                                <div className={dashboardStyles.cardIcon}>
                                    <Users size={18} />
                                </div>
                                <span className={dashboardStyles.cardTitle}>Customers</span>
                            </div>
                            <div className={dashboardStyles.cardStats}>
                                <div className={dashboardStyles.statItem}>
                                    <div className={dashboardStyles.statNumber}>{stats.totalCustomers}</div>
                                    <div className={dashboardStyles.statText}>Total Customers</div>
                                </div>
                            </div>
                        </div>

                        {/* Measurements Overview */}
                        {measurementStats && (
                            <>
                                <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.ordersCard}`}>
                                    <div className={dashboardStyles.cardHeader}>
                                        <div className={dashboardStyles.cardIcon}>
                                            <Scissors size={18} />
                                        </div>
                                        <span className={dashboardStyles.cardTitle}>Measurements</span>
                                    </div>
                                    <div className={dashboardStyles.cardStats}>
                                        <div className={dashboardStyles.statItem}>
                                            <div className={dashboardStyles.statNumber}>{measurementStats.total}</div>
                                            <div className={dashboardStyles.statText}>Total</div>
                                        </div>
                                        <div className={dashboardStyles.statItem}>
                                            <div className={dashboardStyles.statNumber}>{measurementStats.recent}</div>
                                            <div className={dashboardStyles.statText}>Last 30 Days</div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${dashboardStyles.overviewCard} ${dashboardStyles.revenueCard}`}>
                                    <div className={dashboardStyles.cardHeader}>
                                        <div className={dashboardStyles.cardIcon}>
                                            <Users size={18} />
                                        </div>
                                        <span className={dashboardStyles.cardTitle}>Gender Distribution</span>
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
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Outstanding Balance Alert */}
            {stats && stats.outstandingBalance > 0 && (
                <div className={dashboardStyles.alertCard}>
                    <div className={dashboardStyles.alertIcon}>
                        <AlertCircle size={16} />
                    </div>
                    <div className={dashboardStyles.alertContent}>
                        <span className={dashboardStyles.alertTitle}>Outstanding Balance</span>
                        <span className={dashboardStyles.alertAmount}>
                            {formatCurrency(stats.outstandingBalance, userCurrency)}
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

            {/* Desktop Two-Column Layout */}
            <div className={dashboardStyles.desktopGrid}>
                <div className={dashboardStyles.leftColumn}>
                    {/* Order Status Pills */}
                    {shouldShowLoading ? (
                        <div className={dashboardStyles.statusSection}>
                            <div className={dashboardStyles.sectionTitle}>Order Status</div>
                            <div className={dashboardStyles.statusPills}>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={dashboardStyles.statusPill}>
                                        <div
                                            className={dashboardStyles.pillIcon}
                                            style={{
                                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                backgroundColor: 'var(--neutral-200)'
                                            }}
                                        />
                                        <div className={dashboardStyles.pillContent}>
                                            <div
                                                style={{
                                                    height: '20px',
                                                    width: '30px',
                                                    backgroundColor: 'var(--neutral-200)',
                                                    borderRadius: 'var(--radius-md)',
                                                    marginBottom: '4px',
                                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                }}
                                            />
                                            <div
                                                style={{
                                                    height: '12px',
                                                    width: '50px',
                                                    backgroundColor: 'var(--neutral-200)',
                                                    borderRadius: 'var(--radius-md)',
                                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : stats && (
                        <div className={dashboardStyles.statusSection}>
                            <div className={dashboardStyles.sectionTitle}>Order Status</div>
                            <div className={dashboardStyles.statusPills}>
                                <div className={`${dashboardStyles.statusPill} ${dashboardStyles.newStatus}`} onClick={() => router.push('/orders?status=new')}>
                                    <div className={dashboardStyles.pillIcon}>
                                        <AlertCircle size={14} />
                                    </div>
                                    <div className={dashboardStyles.pillContent}>
                                        <span className={dashboardStyles.pillNumber}>{stats.statusCounts.New}</span>
                                        <span className={dashboardStyles.pillLabel}>New</span>
                                    </div>
                                </div>

                                <div className={`${dashboardStyles.statusPill} ${dashboardStyles.progressStatus}`} onClick={() => router.push('/orders?status=in-progress')}>
                                    <div className={dashboardStyles.pillIcon}>
                                        <Clock size={14} />
                                    </div>
                                    <div className={dashboardStyles.pillContent}>
                                        <span className={dashboardStyles.pillNumber}>{stats.statusCounts['In Progress']}</span>
                                        <span className={dashboardStyles.pillLabel}>In Progress</span>
                                    </div>
                                </div>

                                <div className={`${dashboardStyles.statusPill} ${dashboardStyles.fittingStatus}`} onClick={() => router.push('/orders?status=fitting')}>
                                    <div className={dashboardStyles.pillIcon}>
                                        <Users size={14} />
                                    </div>
                                    <div className={dashboardStyles.pillContent}>
                                        <span className={dashboardStyles.pillNumber}>{stats.statusCounts['Ready for Fitting']}</span>
                                        <span className={dashboardStyles.pillLabel}>Fitting</span>
                                    </div>
                                </div>

                                <div className={`${dashboardStyles.statusPill} ${dashboardStyles.completedStatus}`} onClick={() => router.push('/orders?status=completed')}>
                                    <div className={dashboardStyles.pillIcon}>
                                        <CheckCircle size={14} />
                                    </div>
                                    <div className={dashboardStyles.pillContent}>
                                        <span className={dashboardStyles.pillNumber}>{stats.statusCounts.Completed}</span>
                                        <span className={dashboardStyles.pillLabel}>Done</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={dashboardStyles.rightColumn}>
                    {/* Quick Actions */}
                    {shouldShowLoading ? (
                        <div className={dashboardStyles.quickActionsSection}>
                            <div className={dashboardStyles.sectionTitle}>Quick Actions</div>
                            <div className={dashboardStyles.actionButtons}>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={dashboardStyles.actionButton}>
                                        <div
                                            className={dashboardStyles.actionIcon}
                                            style={{
                                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                backgroundColor: 'var(--neutral-200)'
                                            }}
                                        />
                                        <div
                                            style={{
                                                height: '16px',
                                                width: '80px',
                                                backgroundColor: 'var(--neutral-200)',
                                                borderRadius: 'var(--radius-md)',
                                                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={dashboardStyles.quickActionsSection}>
                            <div className={dashboardStyles.sectionTitle}>Quick Actions</div>
                            <div className={dashboardStyles.actionButtons}>
                                <button
                                    className={dashboardStyles.actionButton}
                                    onClick={() => router.push('/customers')}
                                >
                                    <div className={dashboardStyles.actionIcon}>
                                        <Users size={20} />
                                    </div>
                                    <span className={dashboardStyles.actionLabel}>Customers</span>
                                </button>

                                <button
                                    className={dashboardStyles.actionButton}
                                    onClick={() => router.push('/measurements')}
                                >
                                    <div className={dashboardStyles.actionIcon}>
                                        <Scissors size={20} />
                                    </div>
                                    <span className={dashboardStyles.actionLabel}>Measurements</span>
                                </button>

                                <button
                                    className={dashboardStyles.actionButton}
                                    onClick={() => router.push('/orders')}
                                >
                                    <div className={dashboardStyles.actionIcon}>
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className={dashboardStyles.actionLabel}>All Orders</span>
                                </button>

                                <button
                                    className={dashboardStyles.actionButton}
                                    onClick={() => router.push('/settings')}
                                >
                                    <div className={dashboardStyles.actionIcon}>
                                        <Settings size={20} />
                                    </div>
                                    <span className={dashboardStyles.actionLabel}>Settings</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </DashboardLayout>
    );
};

export default DashboardPage; 