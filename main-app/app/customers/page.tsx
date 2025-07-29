'use client';

import { DashboardLayout } from '@/components/layout';

const CustomersPage = () => {
    return (
        <DashboardLayout title="Customers" breadcrumb="Customer Management">
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <h1
                    style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    Customer Management
                </h1>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--neutral-600)' }}>
                    This page is under construction. Customer list and creation forms will
                    be available here soon.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default CustomersPage; 