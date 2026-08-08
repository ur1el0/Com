import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.js";
import type { Database } from "../database.types.js";

type Assignment = Database['public']['Tables']['assignments']['Row']
type InsertAssignment = Database['public']['Tables']['assignments']['Insert']
type UpdateAssignment = Database['public']['Tables']['assignments']['Update']

export function useAssignments() {
    const { user }  =useAuth()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAssignments = useCallback(async (showLoading = true) => {
        if (!user) return
        if (showLoading) {
            setIsLoading(true)
        }
        setError(null)
        try {
            const { data, error } = await supabase
                .from('assignments')
                .select("*")
                .order('due_date', { ascending: true })

            if (error) throw error
            setAssignments(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch assignments')
        } finally {
            setIsLoading(false)
        }
    }, [user])

    async function addAssignment(title: string, subjectId?: string | null, dueDate?: string | null, description?: string | null) {
        if (!user) return 
        setError(null) 
        try {
            const newAssignment: InsertAssignment = {
                user_id: user.id,
                title,
                subject_id: subjectId || null,
                due_date: dueDate || null,
                description: description || null,
                status: 'pending',
            }

            const { data, error } = await supabase
                .from('assignments')
                .insert(newAssignment)
                .select()
                .single()
            
            if (error) throw error
            if (data) {
                setAssignments((prev) => [...prev, data].sort((a, b) => {
                    if (!a.due_date) return 1
                    if(!b.due_date) return -1
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                }))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add assignment')
            throw err
        }
    }

    async function updateAssignment(id: string, updates: Omit<UpdateAssignment, 'id' | 'user_id' | 'created_at'>) {
        setError(null)
        try {
            const { data, error } = await supabase
                .from('assignments')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            if (data) {
                setAssignments((prev) => prev.map((a) => (a.id === id ? data : a)))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update assignment')
            throw err
        }
    }

    async function deleteAssignment(id: string) {
        setError(null)
        try {
            const { error } = await supabase
                .from('assignments')
                .delete()
                .eq('id', id)
            
            if (error) throw error
            setAssignments((prev) => prev.filter((a) => a.id !== id))
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to delete assignment')
            throw err
        }
    }

    useEffect(() => {
        let isMounted = true
        if(!user) {
            Promise.resolve().then(() => {
                if(isMounted) setIsLoading(false)
            })
            return
        }
        Promise.resolve().then(() => {
            if(isMounted) setIsLoading(true)
        })
        supabase
            .from('assignments')
            .select('*')
            .order('due_date', { ascending: true })
            .then(({ data, error}) => {
                if (isMounted) {
                    if (error) {
                        setError(error.message)
                    } else {
                        setAssignments(data || [])
                    }
                    setIsLoading(false)
                }
            })
        return () => {
            isMounted = false
        }
    }, [user])

    return {
        assignments,
        isLoading,
        error,
        refetch: fetchAssignments,
        addAssignment,
        updateAssignment,
        deleteAssignment,
    };
}