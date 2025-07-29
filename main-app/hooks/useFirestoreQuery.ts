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
}

export const useFirestoreQuery = <T>({
    path,
    constraints = [],
    listen = false,
}: UseFirestoreQueryProps) => {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
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
            setLoading(true);
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
                    setError(err);
                    setLoading(false);
                    console.error(`Error listening to ${path}:`, err);
                }
            );
            return () => unsubscribe();
        } else {
            fetchData();
        }
    }, [path, JSON.stringify(constraints), listen]);

    return { data, loading, error };
}; 