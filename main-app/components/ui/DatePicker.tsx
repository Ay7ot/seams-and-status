'use client';

import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, X } from 'react-feather';
import { createPortal } from 'react-dom';
import styles from '@/styles/components/datepicker.module.css';

interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
    label?: string;
}

const DatePicker = ({
    selected,
    onChange,
    placeholder = "Select date",
    disabled = false,
    error = false,
    className = '',
    minDate,
    maxDate,
    label
}: DatePickerProps) => {
    const [currentMonth, setCurrentMonth] = useState(selected ? startOfMonth(selected) : startOfMonth(new Date()));
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const formatInputValue = (date: Date | null): string => {
        if (!date) return '';
        return format(date, 'MM/dd/yyyy');
    };

    const handleDateSelect = (date: Date) => {
        onChange(date);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(null);
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const isDateDisabled = (date: Date): boolean => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const getCalendarDays = () => {
        const start = startOfWeek(currentMonth);
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    };

    const days = getCalendarDays();

    // Calculate position when opening
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                panelRef.current &&
                !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    return (
        <div className={`${styles.container} ${className}`}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}

            <div
                ref={triggerRef}
                className={`${styles.trigger} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <input
                    type="text"
                    value={formatInputValue(selected)}
                    placeholder={placeholder}
                    readOnly
                    className={styles.input}
                />
                <div className={styles.triggerIcon}>
                    <Calendar size={20} />
                </div>
            </div>

            {isOpen && createPortal(
                <div
                    ref={panelRef}
                    className={styles.panel}
                    style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        zIndex: 9999
                    }}
                >
                    <div className={styles.header}>
                        <h3 className={styles.title}>Select Date</h3>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={styles.closeButton}
                            aria-label="Close calendar"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className={styles.calendar}>
                        <div className={styles.navigation}>
                            <button
                                type="button"
                                onClick={goToPreviousMonth}
                                className={styles.navButton}
                                aria-label="Previous month"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <h4 className={styles.monthTitle}>
                                {format(currentMonth, 'MMMM yyyy')}
                            </h4>

                            <button
                                type="button"
                                onClick={goToNextMonth}
                                className={styles.navButton}
                                aria-label="Next month"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className={styles.weekdays}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className={styles.weekday}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className={styles.days}>
                            {days.map((day) => {
                                const isSelected = selected && isSameDay(day, selected);
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isCurrentDay = isToday(day);
                                const isDisabled = isDateDisabled(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        type="button"
                                        onClick={() => !isDisabled && handleDateSelect(day)}
                                        disabled={isDisabled}
                                        className={`
                                            ${styles.day}
                                            ${isSelected ? styles.selected : ''}
                                            ${isCurrentDay ? styles.today : ''}
                                            ${!isCurrentMonth ? styles.outside : ''}
                                            ${isDisabled ? styles.disabled : ''}
                                        `}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>

                        {selected && (
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className={styles.clearButton}
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DatePicker; 