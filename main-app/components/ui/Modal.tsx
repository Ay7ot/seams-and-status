'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'react-feather';
import styles from '@/styles/components/modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={`${styles.modalOverlay} ${isOpen ? styles.open : ''}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                <div className={styles.modalHeader}>
                    <h2 id="modal-title" className={styles.modalTitle}>
                        {title}
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal; 