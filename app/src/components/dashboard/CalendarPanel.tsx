import React, { useState } from 'react';
import { useEvents } from '../../hooks/useEvents.js';
import type { Assignment } from '../../hooks/useAssignments.js';

interface CalendarPanelProps {
    assignments: Assignment[];
}

export function CalendarPanel({ assignments }: CalendarPanelProps) {
    const { events, addEvent, deleteEvent } = useEvents();

    const [newEventTitle, setNewEventTitle] = useState<string>('');
    const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);

    const [calendarDate, setCalendarDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newEventTitle.trim()) return;

        setIsAddingEvent(true);
        try {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            await addEvent(newEventTitle, dateStr);
            setNewEventTitle('');
        } catch (err) {
            console.error('Failed to add event:', err);
        } finally {
            setIsAddingEvent(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await deleteEvent(id);
        } catch (err) {
            console.error('Failed to delete event:', err);
        }
    };

    const calendarYear = calendarDate.getFullYear();
    const calendarMonth = calendarDate.getMonth();
    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const handlePrevMonth = () => {
        setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
    };

    const getItemsForDate = (day: number) => {
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayAssignments = assignments.filter((a) => a.due_date && a.due_date.startsWith(dateStr));
        const dayEvents = events.filter((e) => e.event_date && e.event_date.startsWith(dateStr));

        return {
            assignments: dayAssignments,
            events: dayEvents,
            hasItems: dayAssignments.length > 0 || dayEvents.length > 0,
        };
    };

    return (
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calendar</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 cursor-pointer">&lt;</button>
                    <span className="text-sm font-medium text-slate-200 w-32 text-center">
                        {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} className="text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 cursor-pointer">&gt;</button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-slate-500 font-medium py-1">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const { hasItems } = getItemsForDate(day);
                    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === calendarMonth && selectedDate.getFullYear() === calendarYear;
                    const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth && new Date().getFullYear() === calendarYear;

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(new Date(calendarYear, calendarMonth, day))}
                            className={`
                                p-2 rounded-lg flex flex-col items-center justify-center relative transition-all duration-200 aspect-square text-sm cursor-pointer
                                ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' : 'hover:bg-slate-800/70 text-slate-300'}
                                ${isToday && !isSelected ? 'text-indigo-400 font-bold bg-indigo-500/10' : ''}
                            `}
                        >
                            <span>{day}</span>
                            {hasItems && (
                                <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`}></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Date Details */}
            <div className="mt-6 bg-slate-950/60 border border-slate-850 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 border-b border-slate-850 pb-2 flex justify-between items-center">
                    <span>{selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </h3>

                {getItemsForDate(selectedDate.getDate()).hasItems ? (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 mb-3">
                        {getItemsForDate(selectedDate.getDate()).events.map((event) => (
                            <div key={event.id} className="flex justify-between items-center gap-2 text-sm w-full bg-slate-900/40 px-2.5 py-1.5 rounded border border-slate-850/60">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                    <span className="text-slate-300 truncate">{event.title}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="text-xs text-rose-400 hover:text-rose-350 font-medium px-2 py-0.5 rounded transition-colors cursor-pointer shrink-0"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                        {getItemsForDate(selectedDate.getDate()).assignments.map((assignment) => (
                            <div key={assignment.id} className="flex justify-between items-center gap-2 text-sm w-full bg-slate-900/40 px-2.5 py-1.5 rounded border border-slate-850/60">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                    <span className="text-slate-300 truncate">{assignment.title}</span>
                                </div>
                                {assignment.status === 'completed' && <span className="text-xs text-slate-500 italic shrink-0 mr-2">(Done)</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm italic text-center py-4">No items for this day.</p>
                )}

                <form onSubmit={handleAddEvent} className="mt-3 flex gap-2 pt-3 border-t border-slate-850">
                    <input
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="Add event..."
                        className="flex-1 bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                        disabled={isAddingEvent}
                        required
                    />
                    <button
                        type="submit"
                        disabled={isAddingEvent}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50 text-xs cursor-pointer"
                    >
                        {isAddingEvent ? 'Adding...' : 'Add'}
                    </button>
                </form>
            </div>
        </section>
    );
}
