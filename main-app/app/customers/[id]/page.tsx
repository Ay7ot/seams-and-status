'use client';

import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout';
import { Customer, Measurement } from '@/lib/types';
import MeasurementCard from '@/components/measurements/MeasurementCard';
import styles from '@/styles/components/measurement-card.module.css';
import customerStyles from '@/styles/components/customer-detail.module.css';

const CustomerDetailPage = ({ params }: { params: { id: string } }) => {
    const { user } = useAuth();
    const { data: customerData, loading: customerLoading } =
        useFirestoreQuery<Customer>({
            path: `customers`,
            constraints: [{ type: 'where', field: '__name__', operator: '==', value: params.id }],
        });

    const { data: measurements, loading: measurementsLoading } =
        useFirestoreQuery<Measurement>({
            path: 'measurements',
            constraints: user
                ? [
                    { type: 'where', field: 'customerId', operator: '==', value: params.id },
                    { type: 'where', field: 'userId', operator: '==', value: user.uid },
                ]
                : [],
            listen: true,
        });

    const customer = customerData?.[0];

    return (
        <DashboardLayout
            title={customer?.name || 'Customer Details'}
            breadcrumb={`Customers / ${customer?.name || '...'}`}
        >
            {customerLoading && <p>Loading customer...</p>}
            {customer && (
                <div className={customerStyles.detailHeader}>
                    <h1 className={customerStyles.customerName}>{customer.name}</h1>
                    <p className={customerStyles.customerContact}>{customer.contact}</p>
                </div>
            )}

            <div className={customerStyles.section}>
                <h2 className={customerStyles.sectionTitle}>Measurement History</h2>
                {measurementsLoading && (
                    <div className={styles.measurementGrid}>
                        {[...Array(2)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    backgroundColor: 'var(--neutral-0)',
                                    borderRadius: 'var(--radius-xl)',
                                    height: '280px',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                }}
                            />
                        ))}
                    </div>
                )}
                {measurements && measurements.length > 0 ? (
                    <div className={styles.measurementGrid}>
                        {measurements.map((measurement) => (
                            <MeasurementCard
                                key={measurement.id}
                                measurement={measurement}
                                onEdit={() => {
                                    /* Implement edit from this view if needed */
                                }}
                                onDelete={() => {
                                    /* Implement delete from this view if needed */
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    !measurementsLoading && <p>No measurements found for this customer.</p>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CustomerDetailPage; 