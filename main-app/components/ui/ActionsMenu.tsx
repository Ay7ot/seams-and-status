'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical } from 'react-feather';
import styles from '@/styles/components/actions-menu.module.css';

interface ActionItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isDanger?: boolean;
}

interface ActionsMenuProps {
    items: ActionItem[];
}

const ActionsMenu = ({ items }: ActionsMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        },
        [setIsOpen]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    const handleItemClick = (onClick: () => void) => {
        onClick();
        setIsOpen(false);
    };

    return (
        <div className={styles.actionsWrapper} ref={wrapperRef}>
            <button
                className={styles.menuButton}
                onClick={handleToggle}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Actions"
            >
                <MoreVertical size={20} />
            </button>
            <div className={`${styles.menuPanel} ${isOpen ? styles.open : ''}`}>
                {items.map((item, index) => (
                    <button
                        key={index}
                        className={`${styles.menuItem} ${item.isDanger ? styles.danger : ''}`}
                        onClick={() => handleItemClick(item.onClick)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ActionsMenu; 