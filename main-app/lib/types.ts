export interface Customer {
    id: string;
    userId: string;
    name: string;
    contact: string;
    gender: 'female' | 'male' | 'other';
    createdAt?: {
        toDate: () => Date;
    };
}

export interface Measurement {
    id: string;
    userId: string;
    customerId: string;
    customerName?: string;
    garmentType: string;
    gender: 'men' | 'women';
    values: { [key: string]: number };
    createdAt: {
        toDate: () => Date;
    };
    updatedAt?: {
        toDate: () => Date;
    };
} 