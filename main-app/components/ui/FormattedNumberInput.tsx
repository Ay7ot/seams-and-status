'use client';

import { useState, useEffect } from 'react';

interface FormattedNumberInputProps {
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
}

const formatNumber = (numStr: string) => {
    if (!numStr) return '';
    const [integer, decimal] = numStr.split('.');
    const formattedInt = parseInt(integer, 10).toLocaleString();
    return decimal !== undefined ? `${formattedInt}.${decimal}` : formattedInt;
};

const stripFormatting = (value: string) => value.replace(/,/g, '');

const FormattedNumberInput = ({ value, onChange, placeholder = '0.00', disabled, className = '', id, name }: FormattedNumberInputProps) => {
    const [display, setDisplay] = useState<string>('');

    // Sync external value to display string
    useEffect(() => {
        if (value === undefined || Number.isNaN(value)) {
            setDisplay('');
        } else {
            setDisplay(formatNumber(value.toString()));
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = stripFormatting(e.target.value);
        // Allow empty input
        if (raw === '') {
            setDisplay('');
            onChange(undefined);
            return;
        }
        // Validate numeric pattern (allow decimals)
        const numericPattern = /^\d*(\.\d{0,2})?$/;
        if (!numericPattern.test(raw)) return;

        // Update display with formatted string
        const [intPart, decPart] = raw.split('.');
        const formattedInt = intPart ? parseInt(intPart, 10).toLocaleString() : '';
        const newDisplay = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
        setDisplay(newDisplay);

        // Emit numeric value
        const numericValue = parseFloat(raw);
        onChange(Number.isNaN(numericValue) ? undefined : numericValue);
    };

    return (
        <input
            type="text"
            inputMode="decimal"
            id={id}
            name={name}
            value={display}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
        />
    );
};

export default FormattedNumberInput;

