'use client';

import Link from 'next/link';
import { Customer } from '@/lib/types';
import styles from '@/styles/components/customer-card.module.css';

interface CustomerCardProps {
    customer: Customer;
}

const CustomerCard = ({ customer }: CustomerCardProps) => {
    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (
            names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
        );
    };

    const formatDate = (date: Date) =>
        new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);

    const getAvatarColor = (name: string) => {
        if (!name) return '#ccc';
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `hsl(${hash % 360}, 75%, 60%)`;
        return color;
    };

    return (
        <Link href={`/customers/${customer.id}`} className={styles.cardLink}>
            <div className={styles.customerCard}>
                <div className={styles.cardHeader}>
                    <div
                        className={styles.avatar}
                        style={{ backgroundColor: getAvatarColor(customer.name) }}
                    >
                        {getInitials(customer.name)}
                    </div>
                    <div className={styles.customerInfo}>
                        <h3 className={styles.customerName}>{customer.name}</h3>
                        <p className={styles.customerContact}>{customer.contact}</p>
                    </div>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Gender</span>
                        <span className={styles.infoValue}>{customer.gender}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Join Date</span>
                        <span className={styles.infoValue}>
                            {customer.createdAt ? formatDate(customer.createdAt.toDate()) : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CustomerCard; 