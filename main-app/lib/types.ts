import { QueryConstraint } from "firebase/firestore";

export interface Customer {
    id: string;
    userId: string;
    name: string;
    contact: string;
    gender: 'female' | 'male' | 'other';
    createdAt?: { toDate: () => Date };
}

export interface Measurement {
    id: string;
    userId: string;
    customerId: string;
    customerName?: string;
    garmentType: string;
    gender: 'men' | 'women';
    unit: 'in' | 'cm';
    values: { [key: string]: number };
    createdAt?: { toDate: () => Date };
    updatedAt?: { toDate: () => Date };
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    defaultUnit: 'in' | 'cm';
    defaultCurrency: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    createdAt: { toDate: () => Date };
    updatedAt: { toDate: () => Date };
}

export interface Order {
    id: string;
    userId: string;
    customerId: string;
    customerName?: string;
    measurementId: string;
    measurementGarmentType?: string; // For display
    style: string;
    arrivalDate: { toDate: () => Date };
    fittingDate: { toDate: () => Date } | null;
    collectionDate: { toDate: () => Date } | null;
    materialCost: number;
    totalCost: number;
    initialPayment: number;
    status: 'New' | 'In Progress' | 'Ready for Fitting' | 'Completed';
    collected: boolean;
    createdAt: { toDate: () => Date };
    updatedAt: { toDate: () => Date };
}

export interface Payment {
    id: string;
    userId: string;
    orderId: string;
    amount: number;
    date: { toDate: () => Date };
    note?: string | null;
    createdAt: { toDate: () => Date };
}

export interface MeasurementPreset {
    id: string;
    userId: string;
    name: string;
    gender: 'men' | 'women';
    unit: 'in' | 'cm';
    garmentType: string;
    values: { [key: string]: number };
    createdAt?: { toDate: () => Date };
    updatedAt?: { toDate: () => Date };
}

export interface CustomMeasurement {
    id: string;
    userId: string;
    name: string;
    shortForm: string;
    gender: 'men' | 'women' | 'both';
    unit: 'in' | 'cm';
    createdAt?: { toDate: () => Date };
    updatedAt?: { toDate: () => Date };
}

export interface FirestoreQuery {
    path: string;
    constraints?: QueryConstraint[];
    listen?: boolean;
    enabled?: boolean;
    documentId?: string;
}