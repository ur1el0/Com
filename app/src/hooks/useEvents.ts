import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.js";
import type { Database } from '../database.types.js'

export type CustomEvent = Database['public']['Tables']['events']['Row']
type InsertCustomEvent = Database['public']['Tables']['events']['Insert'];
type UpdateCustomEvent = Database['public']['Tables']['events']['Update'];

export function useEvents() {
    const { user } = useAuth()
    const [events, setEvents] = useState<CustomEvent[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEvents = useCallback(async (showLoading = true) => {
        if (!user) return
        if (showLoading) {
            setIsLoading(true)
        }
        setError(null)
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: true })

            if (error) throw error
            setEvents(data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch events')
        } finally {
            setIsLoading(false)
        }
    }, [user])

    async function addEvent(title: string, eventdDate: string, description?: string | null, color?: string | null) {
        if (!user) return
        setError(null)
        try {
            const newEvent: InsertCustomEvent = {
                user_id: user.id,
                title,
                event_date: eventdDate,
                description: description || null,
                color: color || null,
            }

            const { data, error } = await supabase
                .from('events')
                .insert(newEvent)
                .select()
                .single()
            
            if (error) throw error
            if (data) {
                setEvents((prev) => [...prev, data].sort((a, b) => 
                    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                ));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add event')
            throw err
        }
    }
    
   async function updateEvent(id: string, updates: Omit<UpdateCustomEvent, 'id' | 'user_id' | 'created_at'>) {
        setError(null);
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            if (data) {
                setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update event');
            throw err;
        }
    }
    async function deleteEvent(id: string) {
        setError(null);
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete event');
            throw err;
        }
    }
    useEffect(() => {
        let isMounted = true;
        if (!user) {
            Promise.resolve().then(() => {
                if (isMounted) setIsLoading(false);
            });
            return;
        }
        Promise.resolve().then(() => {
            if (isMounted) setIsLoading(true);
        });
        supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: true })
            .then(({ data, error }) => {
                if (isMounted) {
                    if (error) {
                        setError(error.message);
                    } else {
                        setEvents(data || []);
                    }
                    setIsLoading(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [user]);
    return {
        events,
        isLoading,
        error,
        refetch: fetchEvents,
        addEvent,
        updateEvent,
        deleteEvent,
    };
}