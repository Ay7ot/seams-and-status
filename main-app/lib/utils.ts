// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//     return twMerge(clsx(inputs))
// } 

export function formatDate(date: { toDate: () => Date } | Date) {
    const dateObj = 'toDate' in date ? date.toDate() : date;
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObj);
}

export function formatCurrency(amount: number, currency: string = 'NGN') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}