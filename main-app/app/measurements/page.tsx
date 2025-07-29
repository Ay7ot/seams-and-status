'use client';

import { DashboardLayout } from '@/components/layout';

const MeasurementsPage = () => {
    return (
        <DashboardLayout title="Measurements" breadcrumb="Measurement Management">
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <h1
                    style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    Measurement Management
                </h1>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--neutral-600)' }}>
                    This page is under construction. Measurement forms and history will
                    be available here soon.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default MeasurementsPage; 