'use client';

import { DashboardLayout } from '@/components/layout';

const SettingsPage = () => {
    return (
        <DashboardLayout title="Settings" breadcrumb="Application Settings">
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <h1
                    style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-bold)',
                        marginBottom: 'var(--space-4)',
                    }}
                >
                    Application Settings
                </h1>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--neutral-600)' }}>
                    This page is under construction. Profile and application settings
                    will be available here soon.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage; 