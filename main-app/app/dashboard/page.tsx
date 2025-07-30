'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import OrderCard from '@/components/orders/OrderCard';
import { Order, Customer, UserProfile, Payment } from '@/lib/types';
import gridStyles from '@/styles/components/measurement-card.module.css';
import dashboardStyles from '@/styles/components/dashboard.module.css';
import { Button } from '@/components/ui';
import { Plus, Users, Scissors, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, Zap } from 'react-feather';
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

    const userCurrency = userProfile?.defaultCurrency || 'NGN';

    const ordersWithCustomerNames = useMemo(() => {
        if (!orders || !customers) return [];
        const customerMap = new Map(customers.map((c) => [c.id, c.name]));
        return orders.map((order) => ({
            ...order,
            customerName: customerMap.get(order.customerId) || 'Unknown Customer',
        }));
    }, [orders, customers]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!orders || !payments) return null;

        const totalOrders = orders.length;
        const totalCustomers = customers?.length || 0;
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

    // Get recent orders for quick view
    const recentOrders = useMemo(() => {
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
    const isDataLoading = ordersLoading || customersLoading || paymentsLoading;

    // Additional check: if auth is complete but we have no data yet, still show loading
    const hasInitialData = orders !== null && customers !== null && payments !== null;
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
            {/* Welcome Section */}
            <div className={dashboardStyles.welcomeSection}>
                <div>
                    <h1 className={dashboardStyles.welcomeTitle}>
                        Welcome back, {userProfile?.name || 'Tailor'}
                    </h1>
                    <p className={dashboardStyles.welcomeSubtitle}>
                        Here's what's happening with your business today.
                    </p>
                </div>
                <Button onClick={() => router.push('/orders')} size="large" className={dashboardStyles.primaryAction}>
                    <Plus size={18} />
                    Create Order
                </Button>
            </div>

            {/* Statistics Cards */}
            {shouldShowLoading ? (
                <div className={dashboardStyles.statsGrid}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={dashboardStyles.statCard}>
                            <div className={dashboardStyles.statIcon} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                            <div className={dashboardStyles.statContent}>
                                <div style={{ height: 'var(--text-2xl)', width: '60px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                <div style={{ height: 'var(--text-sm)', width: '100px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : stats && (
                <div className={dashboardStyles.statsGrid}>
                    <div className={dashboardStyles.statCard}>
                        <div className={dashboardStyles.statIcon}>
                            <Scissors size={20} />
                        </div>
                        <div className={dashboardStyles.statContent}>
                            <h3 className={dashboardStyles.statValue}>{stats.totalOrders}</h3>
                            <p className={dashboardStyles.statLabel}>Total Orders</p>
                        </div>
                    </div>

                    <div className={dashboardStyles.statCard}>
                        <div className={dashboardStyles.statIcon}>
                            <Users size={20} />
                        </div>
                        <div className={dashboardStyles.statContent}>
                            <h3 className={dashboardStyles.statValue}>{stats.totalCustomers}</h3>
                            <p className={dashboardStyles.statLabel}>Total Customers</p>
                        </div>
                    </div>

                    <div className={dashboardStyles.statCard}>
                        <div className={dashboardStyles.statIcon}>
                            <DollarSign size={20} />
                        </div>
                        <div className={dashboardStyles.statContent}>
                            <h3 className={dashboardStyles.statValue}>
                                {formatCurrency(stats.totalRevenue, userCurrency)}
                            </h3>
                            <p className={dashboardStyles.statLabel}>Total Revenue</p>
                        </div>
                    </div>

                    <div className={dashboardStyles.statCard}>
                        <div className={dashboardStyles.statIcon}>
                            <TrendingUp size={20} />
                        </div>
                        <div className={dashboardStyles.statContent}>
                            <h3 className={dashboardStyles.statValue}>
                                {formatCurrency(stats.totalPayments, userCurrency)}
                            </h3>
                            <p className={dashboardStyles.statLabel}>Total Payments</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Outstanding Balance Card */}
            {stats && (
                <div className={dashboardStyles.outstandingCard}>
                    <div className={dashboardStyles.outstandingContent}>
                        <div className={dashboardStyles.outstandingIcon}>
                            <AlertCircle size={20} />
                        </div>
                        <div className={dashboardStyles.outstandingText}>
                            <h3 className={dashboardStyles.outstandingTitle}>Outstanding Balance</h3>
                            <p className={dashboardStyles.outstandingAmount}>
                                {formatCurrency(stats.outstandingBalance, userCurrency)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/orders')}
                        className={dashboardStyles.outstandingAction}
                    >
                        View Orders
                    </Button>
                </div>
            )}

            {/* Status Overview */}
            {shouldShowLoading ? (
                <div className={dashboardStyles.statusOverview}>
                    <h2 className={dashboardStyles.sectionTitle}>Order Status Overview</h2>
                    <div className={dashboardStyles.statusGrid}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={dashboardStyles.statusCard}>
                                <div className={dashboardStyles.statusIcon} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                <div className={dashboardStyles.statusContent}>
                                    <div style={{ height: 'var(--text-xl)', width: '40px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-1)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                    <div style={{ height: 'var(--text-sm)', width: '80px', backgroundColor: 'var(--neutral-200)', borderRadius: 'var(--radius-md)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : stats && (
                <div className={dashboardStyles.statusOverview}>
                    <h2 className={dashboardStyles.sectionTitle}>Order Status Overview</h2>
                    <div className={dashboardStyles.statusGrid}>
                        <div className={`${dashboardStyles.statusCard} ${dashboardStyles.new}`}>
                            <div className={dashboardStyles.statusIcon}>
                                <AlertCircle size={18} />
                            </div>
                            <div className={dashboardStyles.statusContent}>
                                <h3 className={dashboardStyles.statusValue}>{stats.statusCounts.New}</h3>
                                <p className={dashboardStyles.statusLabel}>New Orders</p>
                            </div>
                        </div>

                        <div className={`${dashboardStyles.statusCard} ${dashboardStyles.inProgress}`}>
                            <div className={dashboardStyles.statusIcon}>
                                <Clock size={18} />
                            </div>
                            <div className={dashboardStyles.statusContent}>
                                <h3 className={dashboardStyles.statusValue}>{stats.statusCounts['In Progress']}</h3>
                                <p className={dashboardStyles.statusLabel}>In Progress</p>
                            </div>
                        </div>

                        <div className={`${dashboardStyles.statusCard} ${dashboardStyles.readyForFitting}`}>
                            <div className={dashboardStyles.statusIcon}>
                                <Users size={18} />
                            </div>
                            <div className={dashboardStyles.statusContent}>
                                <h3 className={dashboardStyles.statusValue}>{stats.statusCounts['Ready for Fitting']}</h3>
                                <p className={dashboardStyles.statusLabel}>Ready for Fitting</p>
                            </div>
                        </div>

                        <div className={`${dashboardStyles.statusCard} ${dashboardStyles.completed}`}>
                            <div className={dashboardStyles.statusIcon}>
                                <CheckCircle size={18} />
                            </div>
                            <div className={dashboardStyles.statusContent}>
                                <h3 className={dashboardStyles.statusValue}>{stats.statusCounts.Completed}</h3>
                                <p className={dashboardStyles.statusLabel}>Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className={dashboardStyles.quickActions}>
                <h2 className={dashboardStyles.sectionTitle}>Quick Actions</h2>
                <div className={dashboardStyles.actionGrid}>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/customers')}
                        className={dashboardStyles.actionButton}
                    >
                        <Users size={18} />
                        Manage Customers
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/measurements')}
                        className={dashboardStyles.actionButton}
                    >
                        <Scissors size={18} />
                        View Measurements
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/orders')}
                        className={dashboardStyles.actionButton}
                    >
                        <TrendingUp size={18} />
                        All Orders
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/orders')}
                        className={dashboardStyles.actionButton}
                    >
                        <Calendar size={18} />
                        Schedule Fittings
                    </Button>
                </div>
            </div>

        </DashboardLayout>
    );
};

export default DashboardPage; 