import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.js";
import type { Database } from "../database.types.js";

type Note = Database['public']['Tables']['notes']['Row']
type InsertNote = Database['public']['Tables']['notes']['Insert']
type UpdateNote = Database['public']['Tables']['notes']['Update']

export function useNotes() {
    const { user } = useAuth()
    const [notes, setNotes] = useState<Note[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchNotes = useCallback(async (showLoading = true) => {
        if (!user) return
        if (showLoading) {
            setIsLoading(true)
        }
        setError(null)
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('updated_at', { ascending: false })
            
            if (error) throw error
            setNotes(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch notes')
        } finally {
            setIsLoading(false)
        }
    }, [user])

    async function addNote(title: string, content = '', subjectId: string | null = null) {
        if (!user) return
        setError(null)
        try {
            const newNote: InsertNote = {
                user_id: user.id,
                title,
                content,
                subject_id: subjectId,
            }
            const { data, error } = await supabase
                .from('notes')
                .insert(newNote)
                .select()
                .single()
            if (error) throw error
            if (data) {
                setNotes((prev) => [data, ...prev]) 
            }
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to add note')
            throw err
        }
    }

    async function updateNote(id: string, updates: Omit<UpdateNote, 'id' | 'user_id' | 'created_at'>) {
        setError(null)
        try {
            const { data, error } = await supabase
                .from('notes')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single()
            if (error) throw error
            if (data) {
                setNotes((prev) => prev.map((n) => n.id === id ? data : n));
            }        
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update note');
            throw err;
        }
    }
    
    async function deleteNote(id: string) {
        setError(null)
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id)
            if (error) throw error
            setNotes((prev) => prev.filter((n) => n.id !== id))
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to delete note')
            throw err
        }
    }

    useEffect(() => {
        let isMounted = true
        if(!user) {
            Promise.resolve().then(() => {
                if (isMounted) setIsLoading(false)
            })
            return
        }

        Promise.resolve().then(() => {
            if (isMounted) setIsLoading(true)
        })

        supabase
            .from('notes')
            .select('*')
            .order('updated_at', { ascending: false })
            .then(({ data, error }) => {
                if(isMounted) {
                    if(error) {
                        setError(error.message)
                    } else {
                        setNotes(data || [])
                    } 
                    setIsLoading(false)
                }
            })
        return () => {
            isMounted = false
        }
    }, [user])

    return {
        notes,
        isLoading,
        error,
        refetch: fetchNotes,
        addNote,
        updateNote,
        deleteNote,
    }
}