'use client';

import { Edit, Trash } from 'react-feather';
import styles from '@/styles/components/measurement-card.module.css';
import { ActionsMenu } from '@/components/ui';
import { Measurement } from '@/lib/types';

interface MeasurementCardProps {
    measurement: Measurement;
    onEdit: (measurement: Measurement) => void;
    onDelete: (id: string) => void;
}

const MeasurementCard = ({
    measurement,
    onEdit,
    onDelete,
}: MeasurementCardProps) => {
    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);

    // Function to format the measurement keys for display
    const formatLabel = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    const menuItems = [
        {
            label: 'Edit',
            icon: <Edit />,
            onClick: () => onEdit(measurement),
        },
        {
            label: 'Delete',
            icon: <Trash />,
            onClick: () => onDelete(measurement.id),
            isDanger: true,
        },
    ];

    return (
        <div className={styles.measurementCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerInfo}>
                    <h3 className={styles.garmentType}>{measurement.garmentType}</h3>
                    <p className={styles.customerName}>
                        for {measurement.customerName || 'N/A'}
                    </p>
                </div>
                <span className={styles.genderTag}>{measurement.gender}</span>
            </div>
            <div className={styles.valuesGrid}>
                {Object.entries(measurement.values).map(([key, value]) => (
                    <div key={key} className={styles.valueItem}>
                        <span className={styles.valueLabel}>{formatLabel(key)}</span>
                        <span className={styles.valueData}>{value}"</span>
                    </div>
                ))}
            </div>
            <div className={styles.cardFooter}>
                <span>
                    Created on{' '}
                    {measurement.createdAt
                        ? formatDate(measurement.createdAt.toDate())
                        : '...'}
                </span>
                <ActionsMenu items={menuItems} />
            </div>
        </div>
    );
};

export default MeasurementCard; 