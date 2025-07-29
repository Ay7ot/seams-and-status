'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'react-feather';
import styles from '@/styles/components/select.module.css';

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
}

const Select = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    error = false,
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        },
        []
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                if (!isOpen) {
                    event.preventDefault();
                    setIsOpen(true);
                } else if (focusedIndex >= 0) {
                    event.preventDefault();
                    handleSelect(options[focusedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                buttonRef.current?.focus();
                break;
            case 'ArrowDown':
                event.preventDefault();
                setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'Home':
                event.preventDefault();
                setFocusedIndex(0);
                break;
            case 'End':
                event.preventDefault();
                setFocusedIndex(options.length - 1);
                break;
        }
    };

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

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div
            ref={wrapperRef}
            className={styles.selectWrapper}
            onKeyDown={handleKeyDown}
        >
            <button
                ref={buttonRef}
                type="button"
                className={`${styles.selectButton} ${error ? styles.error : ''}`}
                onClick={handleToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                {selectedOption ? (
                    <span>{selectedOption.label}</span>
                ) : (
                    <span className={styles.placeholder}>{placeholder}</span>
                )}
                <ChevronDown
                    size={20}
                    className={`${styles.arrowIcon} ${isOpen ? styles.open : ''}`}
                />
            </button>
            <div
                className={`${styles.optionsPanel} ${isOpen ? styles.open : ''}`}
                role="listbox"
            >
                {options.map((option, index) => (
                    <div
                        key={option.value}
                        className={`${styles.option} ${value === option.value ? styles.selected : ''
                            } ${focusedIndex === index ? styles.focused : ''}`}
                        onClick={() => handleSelect(option.value)}
                        onMouseEnter={() => setFocusedIndex(index)}
                        role="option"
                        aria-selected={value === option.value}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Select; 