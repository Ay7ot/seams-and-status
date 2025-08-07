'use client';

import { Edit, Trash, Copy, Eye } from 'react-feather';
import styles from '@/styles/components/measurement-card.module.css';
import { ActionsMenu } from '@/components/ui';
import { Measurement } from '@/lib/types';

interface MeasurementCardProps {
    measurement: Measurement;
    onEdit: (measurement: Measurement) => void;
    onDelete: (id: string) => void;
    onCopy: (measurement: Measurement) => void;
    onView: (measurement: Measurement) => void;
}

const MeasurementCard = ({
    measurement,
    onEdit,
    onDelete,
    onCopy,
    onView,
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
            label: 'View Details',
            icon: <Eye />,
            onClick: () => onView(measurement),
        },
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

    // Get a preview of measurements (first 3)
    const measurementPreview = Object.entries(measurement.values).slice(0, 3);
    const totalMeasurements = Object.keys(measurement.values).length;

    return (
        <div className={styles.measurementCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerInfo}>
                    <h3 className={styles.garmentType}>{measurement.garmentType}</h3>
                    <p className={styles.customerName}>
                        for {measurement.customerName || 'N/A'}
                    </p>
                </div>
                <span className={styles.genderTag} data-gender={measurement.gender}>
                    {measurement.gender === 'women' ? 'Female' : 'Male'}
                </span>
            </div>

            <div className={styles.previewSection}>
                <div className={styles.previewTitle}>
                    <span>Measurement Preview</span>
                    <span className={styles.measurementCount}>
                        {totalMeasurements} measurements
                    </span>
                </div>
                <div className={styles.previewGrid}>
                    {measurementPreview.map(([key, value]) => (
                        <div key={key} className={styles.previewItem}>
                            <span className={styles.previewLabel}>
                                {formatLabel(key)}
                            </span>
                            <span className={styles.previewValue}>
                                {value}
                                <span className={styles.unit}>{unit}</span>
                            </span>
                        </div>
                    ))}
                    {totalMeasurements > 3 && (
                        <div className={styles.moreIndicator}>
                            +{totalMeasurements - 3} more
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardFooter}>
                <span className={styles.dateSpan}>
                    Created on{' '}
                    {measurement.createdAt
                        ? formatDate(measurement.createdAt.toDate())
                        : '...'}
                </span>
                <div className={styles.footerActions}>
                    <button
                        className={styles.openButton}
                        onClick={() => onView(measurement)}
                        aria-label={`View details for ${measurement.garmentType}`}
                    >
                        <Eye size={16} />
                        <span>Open</span>
                    </button>
                    <ActionsMenu items={menuItems} />
                </div>
            </div>
        </div>
    );
};

export default MeasurementCard; 