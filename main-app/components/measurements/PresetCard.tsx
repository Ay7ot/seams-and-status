'use client';

import { Edit, Trash, Copy } from 'react-feather';
import styles from '@/styles/components/measurement-card.module.css';
import { ActionsMenu } from '@/components/ui';
import { MeasurementPreset } from '@/lib/types';

interface PresetCardProps {
    preset: MeasurementPreset;
    onEdit: (preset: MeasurementPreset) => void;
    onDelete: (id: string) => void;
    onCopy: (preset: MeasurementPreset) => void;
}

const PresetCard = ({
    preset,
    onEdit,
    onDelete,
    onCopy,
}: PresetCardProps) => {
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

    const unit = preset.unit || 'in';

    const menuItems = [
        {
            label: 'Edit',
            icon: <Edit />,
            onClick: () => onEdit(preset),
        },
        {
            label: 'Copy',
            icon: <Copy />,
            onClick: () => onCopy(preset),
        },
        {
            label: 'Delete',
            icon: <Trash />,
            onClick: () => onDelete(preset.id),
            isDanger: true,
        },
    ];

    // Get a preview of measurements (first 3)
    const measurementPreview = Object.entries(preset.values).slice(0, 3);
    const totalMeasurements = Object.keys(preset.values).length;

    return (
        <div className={styles.measurementCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerInfo}>
                    <h3 className={styles.garmentType}>{preset.name}</h3>
                    <p className={styles.customerName}>
                        {preset.garmentType ? `for ${preset.garmentType}` : 'General preset'}
                    </p>
                </div>
                <span className={styles.genderTag} data-gender={preset.gender}>
                    {preset.gender === 'women' ? 'Female' : 'Male'}
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
                    {preset.createdAt
                        ? formatDate(preset.createdAt.toDate())
                        : '...'}
                </span>
                <div className={styles.footerActions}>
                    <ActionsMenu items={menuItems} />
                </div>
            </div>
        </div>
    );
};

export default PresetCard;
