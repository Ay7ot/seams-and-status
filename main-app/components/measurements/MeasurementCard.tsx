'use client';

import { Edit, Trash, Copy } from 'react-feather';
import styles from '@/styles/components/measurement-card.module.css';
import { ActionsMenu } from '@/components/ui';
import { Measurement } from '@/lib/types';

interface MeasurementCardProps {
    measurement: Measurement;
    onEdit: (measurement: Measurement) => void;
    onDelete: (id: string) => void;
    onCopy: (measurement: Measurement) => void;
}

const MeasurementCard = ({
    measurement,
    onEdit,
    onDelete,
    onCopy,
}: MeasurementCardProps) => {
    const formatDate = (date: Date | undefined) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    // Function to format the measurement keys for display
    const formatLabel = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    const unit = measurement.unit || 'in';

    const menuItems = [
        {
            label: 'Edit',
            icon: <Edit />,
            onClick: () => onEdit(measurement),
        },
        {
            label: 'Copy',
            icon: <Copy />,
            onClick: () => onCopy(measurement),
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
                    <div key={key} className={styles.measurementItem}>
                        <span className={styles.measurementLabel}>
                            {formatLabel(key)}
                        </span>
                        <span className={styles.measurementValue}>
                            {value}
                            <span className={styles.unit}>{unit}</span>
                        </span>
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