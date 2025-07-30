'use client';

import { Order } from '@/lib/types';
import styles from '@/styles/components/order-card.module.css';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button, ActionsMenu } from '@/components/ui';
import { Edit, Trash } from 'react-feather';

interface OrderCardProps {
    order: Order;
    onEdit: (order: Order) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    currency?: string;
}

const OrderCard = ({ order, onEdit, onDelete, onView, currency = 'NGN' }: OrderCardProps) => {
    const actions = [
        { label: 'Edit Order', icon: <Edit />, onClick: () => onEdit(order) },
        { label: 'Delete Order', icon: <Trash />, onClick: () => onDelete(order.id), variant: 'danger' },
    ];

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.customerName}>{order.customerName}</h3>
                    <p className={styles.style}>{order.style}</p>
                </div>
                <div className={`${styles.status} ${styles[order.status.replace(/\s+/g, '')]}`}>
                    {order.status}
                </div>
            </div>
            <div className={styles.details}>
                <div>
                    <span className={styles.label}>Arrival Date</span>
                    <span className={styles.value}>{formatDate(order.arrivalDate)}</span>
                </div>
                <div>
                    <span className={styles.label}>Total Cost</span>
                    <span className={styles.value}>{formatCurrency(order.totalCost || order.materialCost, currency)}</span>
                </div>
                <div>
                    <span className={styles.label}>Paid</span>
                    <span className={styles.value}>{formatCurrency(order.initialPayment, currency)}</span>
                </div>
                <div>
                    <span className={styles.label}>Balance</span>
                    <span className={styles.value}>{formatCurrency((order.totalCost || order.materialCost) - order.initialPayment, currency)}</span>
                </div>
            </div>
            <div className={styles.footer}>
                <Button variant="outline" onClick={() => onView(order.id)}>View Details</Button>
                <ActionsMenu items={actions} />
            </div>
        </div>
    );
};

export default OrderCard; 