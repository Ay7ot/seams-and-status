'use client';

import { DashboardLayout } from '@/components/layout';

const OrdersPage = () => {
    return (
        <DashboardLayout title="Orders" breadcrumb="Order Management">
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <h1
                    style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    Order Management
                </h1>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--neutral-600)' }}>
                    This page is under construction. Order list and creation forms will be
                    available here soon.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default OrdersPage; 