import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './useAuth.js';
import type { Database } from '../database.types.js';

type Subject = Database['public']['Tables']['subjects']['Row'];
type InsertSubject = Database['public']['Tables']['subjects']['Insert'];
type UpdateSubject = Database['public']['Tables']['subjects']['Update'];

export function useSubjects() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubjects = useCallback(async (showLoading = true) => {
        if (!user) return;
        if (showLoading) {
            setIsLoading(true);
        }
        setError(null);
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubjects(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    async function addSubject(name: string, code?: string, color?: string, grade?: string) {
        if (!user) return;
        setError(null);
        try {
            const newSubject: InsertSubject = {
                user_id: user.id,
                name,
                code: code || null,
                color: color || null,
                grade: grade || null,
            };

            const { data, error } = await supabase
                .from('subjects')
                .insert(newSubject)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setSubjects((prev) => [data, ...prev]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add subject');
            throw err;
        }
    }

    async function updateSubject(id: string, updates: Omit<UpdateSubject, 'id' | 'user_id' | 'created_at'>) {
        setError(null);
        try {
            const { data, error } = await supabase
                .from('subjects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setSubjects((prev) => prev.map((s) => (s.id === id ? data : s)));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update subject');
            throw err;
        }
    }

    async function deleteSubject(id: string) {
        setError(null);
        try {
            const { error } = await supabase
                .from('subjects')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSubjects((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete subject');
            throw err;
        }
    }

    useEffect(() => {
        let isMounted = true;
        if (!user) {
            Promise.resolve().then(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });
            return;
        }

        Promise.resolve().then(() => {
            if (isMounted) {
                setIsLoading(true);
            }
        });

        supabase
            .from('subjects')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (isMounted) {
                    if (error) {
                        setError(error.message);
                    } else {
                        setSubjects(data || []);
                    }
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [user]);

    return {
        subjects,
        isLoading,
        error,
        refetch: fetchSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
    };
}
