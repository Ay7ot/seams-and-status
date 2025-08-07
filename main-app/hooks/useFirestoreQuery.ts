'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    DocumentData,
    Query,
    QueryConstraint,
    WhereFilterOp,
    OrderByDirection,
} from 'firebase/firestore';
import { useAuth } from './useAuth';

interface UseFirestoreQueryProps {
    path: string;
    constraints?: Array<{
        type: 'where' | 'orderBy' | 'limit' | 'startAfter';
        field?: string;
        operator?: WhereFilterOp;
        value?: any;
        direction?: OrderByDirection;
    }>;
    listen?: boolean;
    requireAuth?: boolean; // New prop to control auth requirement
}

export const useFirestoreQuery = <T>({
    path,
    constraints = [],
    listen = false,
    requireAuth = true, // Default to requiring auth
}: UseFirestoreQueryProps) => {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user, loading: authLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        // Don't run query if auth is still loading
        if (authLoading) {
            setLoading(true); // Ensure loading state is true while auth is loading
            return;
        }

        // Don't run query if auth is required but user is not authenticated
        if (requireAuth && !isAuthenticated) {
            setLoading(false);
            setData(null);
            setError(null);
            return;
        }

        // Don't run query if user is not available yet
        if (requireAuth && !user) {
            setLoading(false);
            setData(null);
            setError(null);
            return;
        }

        // Don't run query if user ID is not available yet
        if (requireAuth && !user?.uid) {
            setLoading(false);
            setData(null);
            setError(null);
            return;
        }

        // Set loading to true when starting queries
        setLoading(true);

        let q: Query<DocumentData> = collection(db, path);

        const queryConstraints: QueryConstraint[] = constraints.map((c) => {
            switch (c.type) {
                case 'where':
                    return where(c.field!, c.operator!, c.value);
                case 'orderBy':
                    return orderBy(c.field!, c.direction);
                case 'limit':
                    return limit(c.value);
                case 'startAfter':
                    return startAfter(c.value);
                default:
                    throw new Error(`Unsupported constraint type: ${c.type}`);
            }
        });

        if (queryConstraints.length > 0) {
            q = query(q, ...queryConstraints);
        }

        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(
                    (doc) => ({ id: doc.id, ...doc.data() } as T)
                );
                setData(docs);
                setError(null);
            } catch (err: any) {
                setError(err);
                console.error(`Error fetching from ${path}:`, err);
            } finally {
                setLoading(false);
            }
        };

        if (listen) {
            try {
                const unsubscribe = onSnapshot(
                    q,
                    (querySnapshot) => {
                        const docs = querySnapshot.docs.map(
                            (doc) => ({ id: doc.id, ...doc.data() } as T)
                        );
                        setData(docs);
                        setLoading(false);
                        setError(null);
                    },
                    (err) => {
                        // Handle specific Firestore errors more gracefully
                        if (err.code === 'permission-denied' || err.code === 'unavailable' || err.message?.includes('INTERNAL ASSERTION')) {
                            console.warn(`Firestore listener error for ${path}:`, err.message);
                            setData([]);
                            setLoading(false);
                            setError(null);
                        } else {
                            setError(err);
                            setLoading(false);
                            console.error(`Error listening to ${path}:`, err);
                        }
                    }
                );
                return () => {
                    try {
                        unsubscribe();
                    } catch (unsubError) {
                        console.warn(`Error unsubscribing from ${path}:`, unsubError);
                    }
                };
            } catch (setupError) {
                console.warn(`Error setting up listener for ${path}:`, setupError);
                setData([]);
                setLoading(false);
                setError(null);
            }
        } else {
            fetchData();
        }
    }, [path, JSON.stringify(constraints), listen, requireAuth, authLoading, isAuthenticated, user?.uid]);

    return { data, loading, error };
}; 