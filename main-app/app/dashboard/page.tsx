'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

const DashboardPage = () => {
    return (
        <DashboardLayout title="Dashboard" breadcrumb="Dashboard Overview">

            {/* Example Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-6)',
                marginBottom: 'var(--space-8)'
            }}>
                {/* Quick Stats Cards */}
                <div style={{
                    backgroundColor: 'var(--neutral-0)',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--neutral-200)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--neutral-900)',
                        marginBottom: 'var(--space-3)'
                    }}>
                        Total Customers
                    </h3>
                    <p style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--primary-600)',
                        marginBottom: 'var(--space-2)'
                    }}>
                        24
                    </p>
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--success-600)',
                        fontWeight: 'var(--font-medium)'
                    }}>
                        +2 this week
                    </p>
                </div>

                <div style={{
                    backgroundColor: 'var(--neutral-0)',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--neutral-200)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--neutral-900)',
                        marginBottom: 'var(--space-3)'
                    }}>
                        Active Orders
                    </h3>
                    <p style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--warning-600)',
                        marginBottom: 'var(--space-2)'
                    }}>
                        8
                    </p>
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--neutral-600)',
                        fontWeight: 'var(--font-medium)'
                    }}>
                        3 ready for fitting
                    </p>
                </div>

                <div style={{
                    backgroundColor: 'var(--neutral-0)',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--neutral-200)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--neutral-900)',
                        marginBottom: 'var(--space-3)'
                    }}>
                        This Month Revenue
                    </h3>
                    <p style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--success-600)',
                        marginBottom: 'var(--space-2)'
                    }}>
                        ₦125,000
                    </p>
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--success-600)',
                        fontWeight: 'var(--font-medium)'
                    }}>
                        +15% from last month
                    </p>
                </div>
            </div>

            {/* Example Content Section */}
            <div style={{
                backgroundColor: 'var(--neutral-0)',
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--neutral-200)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h3 style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--neutral-900)',
                    marginBottom: 'var(--space-4)'
                }}>
                    Recent Activity
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* Activity Items */}
                    {[
                        { action: 'New customer added', customer: 'Sarah Johnson', time: '2 hours ago', type: 'customer' },
                        { action: 'Order completed', customer: 'Michael Brown', time: '4 hours ago', type: 'order' },
                        { action: 'Payment received', customer: 'Emma Davis', time: '6 hours ago', type: 'payment' },
                        { action: 'Fitting scheduled', customer: 'James Wilson', time: '1 day ago', type: 'fitting' }
                    ].map((activity, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--neutral-50)',
                            border: '1px solid var(--neutral-200)'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: activity.type === 'customer' ? 'var(--primary-100)' :
                                    activity.type === 'order' ? 'var(--success-100)' :
                                        activity.type === 'payment' ? 'var(--warning-100)' : 'var(--accent-purple)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: activity.type === 'customer' ? 'var(--primary-600)' :
                                    activity.type === 'order' ? 'var(--success-600)' :
                                        activity.type === 'payment' ? 'var(--warning-600)' : 'var(--neutral-0)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-semibold)'
                            }}>
                                {activity.type === 'customer' ? 'C' :
                                    activity.type === 'order' ? 'O' :
                                        activity.type === 'payment' ? '₦' : 'F'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-medium)',
                                    color: 'var(--neutral-900)',
                                    marginBottom: 'var(--space-1)'
                                }}>
                                    {activity.action}
                                </p>
                                <p style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--neutral-600)'
                                }}>
                                    {activity.customer} • {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage; 