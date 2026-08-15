import { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../hooks/useAuth.js';
import { useSubjects } from '../hooks/useSubjects.js'
import { useAssignments } from '../hooks/useAssignments.js';
import { useNotes } from '../hooks/useNotes.js';
import { useEvents } from '../hooks/useEvents.js';

export function DashboardPage() {
    const { user } = useAuth();
    const { subjects, isLoading, error, addSubject, updateSubject, deleteSubject } = useSubjects();
    const { assignments, isLoading: isAssignmentsLoading, error: assignmentsError, addAssignment, updateAssignment, deleteAssignment } = useAssignments();
    const { notes, isLoading: isNotesLoading, error: notesError, addNote, deleteNote } = useNotes()
    const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
    const [newAssignmentSubjectId, setNewAssignmentSubjectId] = useState<string>('');
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState<string>('');
    const [newNoteTitle, setNewNoteTitle] = useState<string>('');
    const [newNoteContent, setNewNoteContent] = useState<string>('');
    const [newNoteSubjectId, setNewNoteSubjectId] = useState<string>('');
    const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
    const { events, addEvent, deleteEvent } = useEvents();
    
    const [newEventTitle, setNewEventTitle] = useState<string>('');
    const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);

    const [calendarDate, setCalendarDate] = useState<Date>(new Date())
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const [isAddingAssignment, setIsAddingAssignment] = useState<boolean>(false);

    const [newSubjectName, setNewSubjectName] = useState<string>('');
    const [isAdding, setIsAdding] = useState<boolean>(false);

    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
    const [editSubjectName, setEditSubjectName] = useState<string>('')



    const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newSubjectName.trim()) return;

        setIsAdding(true)
        try {
            await addSubject(newSubjectName)
            setNewSubjectName('')
        } catch (err){
            console.error('Failed to add subject:', err)
        } finally {
            setIsAdding(false)
        }
    }

    const handleDeleteSubject = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await deleteSubject(id);
        } catch (err) {
            console.error('Failed to delete subject:', err);
        }
    };

    const handleSaveSubjectEdit = async (id: string) => {
        if (!editSubjectName.trim()) {
            setEditingSubjectId(null)
            return
        }
        try {
            await updateSubject(id, { name: editSubjectName })
            setEditingSubjectId(null)
        } catch (err) {
            console.error('Failed to update subject', err)
        }
    }

    const handleAddAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newAssignmentTitle.trim()) return;

        setIsAddingAssignment(true)
        try {
            // Convert empty string due date to ISO format or null
            const dueDateISO = newAssignmentDueDate ? new Date(newAssignmentDueDate).toISOString() : null
            const subjecetIdVal = newAssignmentSubjectId || null

            await addAssignment(newAssignmentTitle, subjecetIdVal, dueDateISO)
            setNewAssignmentTitle('')
            setNewAssignmentSubjectId('')
            setNewAssignmentDueDate('')
        } catch (err){
            console.error('Failed to add assignment:', err)
        } finally {
            setIsAddingAssignment(false)
        }
    }
    const handleToggleAssignmentStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        try {
            await updateAssignment(id, { status: newStatus });
        } catch (err) {
            console.error('Failed to update assignment:', err);
        }
    };

    const handleDeleteAssignment = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await deleteAssignment(id);
        } catch (err) {
            console.error('Failed to delete assignment:', err);
        }
    };

        const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newNoteTitle.trim()) return;

        setIsAddingNote(true);
        try {
            const subjectIdVal = newNoteSubjectId || null;
            await addNote(newNoteTitle, newNoteContent, subjectIdVal);
            setNewNoteTitle('');
            setNewNoteContent('');
            setNewNoteSubjectId('');
        } catch (err) {
            console.error('Failed to add note:', err);
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleDeleteNote = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            await deleteNote(id);
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

    const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newEventTitle.trim()) return;

        setIsAddingEvent(true);
        try {
            // Format selected date correctly for PostgreSQL (YYYY-MM-DD)
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

    const calendarYear = calendarDate.getFullYear()
    const calendarMonth = calendarDate.getMonth()
    const firstDayOfMonth = new Date(calendarYear, calendarMonth,1).getDay()
    const daysInMonth = new Date(calendarDate, calendarMonth + 1, 0).getDate()

    const handlePrevMonth = () => {
        setCalendarDate(new Date(calendarYear, calendarMonth - 1, 1))
    }

    const handleNextMonth = () => {
        setCalendarDate(new Date(calendarYear, calendarMonth + 1, 1))
    }

    // Helper to query what items are scheduled for a specific day
    const getItemsForDate = (day: number) => {
        // Format local date: YYYY-MM-DD
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayAssignments = assignments.filter(a => a.due_date && a.due_date.startsWith(dateStr));
        const dayEvents = events.filter(e => e.event_date && e.event_date.startsWith(dateStr));

        return {
            assignments: dayAssignments,
            events: dayEvents,
            hasItems: dayAssignments.length > 0 || dayEvents.length > 0,
        };
    };
    return (
        <DashboardLayout>
                
                {/* Left Column: Subjects and Notes (col-span-3) */}
                <div className="lg:col-span-3 flex flex-col gap-8 w-full">
                    
                    {/* Subjects Panel */}
                    <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Your Subjects</h2>
                        <form onSubmit={handleAddSubject} className="w-full flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                placeholder="New subject..."
                                className="flex-1 bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                                disabled={isAdding}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isAdding}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded transition-colors disabled:opacity-50 text-sm cursor-pointer"
                            >
                                {isAdding ? 'Adding...' : 'Add'}
                            </button>
                        </form>

                        {isLoading ? (
                            <p className="text-slate-500 text-sm italic text-center">Loading...</p>
                        ) : error ? (
                            <p className='text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-3 py-2 rounded text-center'>{error}</p>
                        ) : subjects.length === 0 ? (
                            <p className='text-slate-500 text-sm italic text-center'>No subjects yet.</p>
                        ) : (
                            <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                {subjects.map((subject) => (
                                    <li key={subject.id} className="bg-slate-950/80 border border-slate-850 rounded px-3 py-2 text-sm flex justify-between items-center gap-2">
                                        {editingSubjectId === subject.id ? (
                                            <input
                                                type="text"
                                                value={editSubjectName}
                                                onChange={(e) => setEditSubjectName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveSubjectEdit(subject.id);
                                                    if (e.key === 'Escape') setEditingSubjectId(null);
                                                }}
                                                className="flex-1 bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-200 truncate pr-2">{subject.name}</span>
                                        )}

                                        <div className="flex items-center gap-2 shrink-0">
                                            {subject.grade && !editingSubjectId && (
                                                <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-semibold">
                                                    {subject.grade}
                                                </span>
                                            )}
                                            
                                            {editingSubjectId === subject.id ? (
                                                <button onClick={() => handleSaveSubjectEdit(subject.id)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium p-1 cursor-pointer">Save</button>
                                            ) : (
                                                <button 
                                                    onClick={() => { setEditingSubjectId(subject.id); setEditSubjectName(subject.name); }} 
                                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium p-1 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                            )}

                                            {editingSubjectId === subject.id ? (
                                                <button onClick={() => setEditingSubjectId(null)} className="text-xs text-slate-400 hover:text-slate-300 font-medium p-1 cursor-pointer">Cancel</button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteSubject(subject.id)}
                                                    className="text-xs text-rose-400 hover:text-rose-350 font-medium p-1 transition-colors cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Notes Panel */}
                    <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Your Notes</h2>
                        <form onSubmit={handleAddNote} className="w-full flex flex-col gap-2 bg-slate-950/40 border border-slate-850 rounded p-3 mb-4">
                            <input
                                type="text"
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                placeholder="Note title..."
                                className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                                disabled={isAddingNote}
                                required
                            />
                            <textarea
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                placeholder="Content..."
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-855 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                                disabled={isAddingNote}
                            />
                            <div className="flex gap-2">
                                <select
                                    value={newNoteSubjectId}
                                    onChange={(e) => setNewNoteSubjectId(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-855 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                                    disabled={isAddingNote}
                                >
                                    <option value="">No Subject</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    disabled={isAddingNote}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded transition-colors disabled:opacity-50 text-sm cursor-pointer"
                                >
                                    {isAddingNote ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                        </form>

                        {isNotesLoading ? (
                            <p className="text-slate-500 text-sm italic text-center">Loading...</p>
                        ) : notesError ? (
                            <p className="text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-3 py-2 rounded text-center">{notesError}</p>
                        ) : notes.length === 0 ? (
                            <p className="text-slate-500 text-sm italic text-center">No notes yet.</p>
                        ) : (
                            <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                                {notes.map((note) => {
                                    const subject = subjects.find(s => s.id === note.subject_id);
                                    return (
                                        <li key={note.id} className="bg-slate-950/80 border border-slate-850 rounded px-3 py-2 text-sm flex justify-between items-center gap-2">
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-medium text-slate-200 truncate">{note.title}</span>
                                                {subject && (
                                                    <span className="text-xs text-indigo-400 font-semibold truncate">{subject.name}</span>
                                                )}
                                                {note.content && (
                                                    <span className="text-xs text-slate-400 truncate mt-1">
                                                        {note.content}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="text-xs text-rose-400 hover:text-rose-350 font-medium p-1 transition-colors cursor-pointer shrink-0"
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Middle Column: Assignments (col-span-5) */}
                <div className="lg:col-span-5 w-full">
                    <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-lg backdrop-blur-sm flex flex-col h-full">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Your Assignments</h2>
                        <form onSubmit={handleAddAssignment} className="w-full flex flex-col gap-2 bg-slate-950/40 border border-slate-855 rounded p-3 mb-4">
                            <input
                                type="text"
                                value={newAssignmentTitle}
                                onChange={(e) => setNewAssignmentTitle(e.target.value)}
                                placeholder="Assignment name..."
                                className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                                disabled={isAddingAssignment}
                                required
                            />
                            <div className="flex gap-2">
                                <select
                                    value={newAssignmentSubjectId}
                                    onChange={(e) => setNewAssignmentSubjectId(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
                                    disabled={isAddingAssignment}
                                >
                                    <option value="">No Subject</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={newAssignmentDueDate}
                                    onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                                    className="flex-1 bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                                    disabled={isAddingAssignment}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAddingAssignment}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1.5 rounded transition-colors disabled:opacity-50 text-sm cursor-pointer w-full mt-1"
                            >
                                {isAddingAssignment ? 'Adding...' : 'Add Assignment'}
                            </button>
                        </form>

                        <div className="flex-1 overflow-y-auto max-h-[550px] pr-1">
                            {isAssignmentsLoading ? (
                                <p className="text-slate-500 text-sm italic text-center py-4">Loading...</p>
                            ) : assignmentsError ? (
                                <p className="text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-3 py-2 rounded text-center">{assignmentsError}</p>
                            ) : assignments.length === 0 ? (
                                <p className="text-slate-500 text-sm italic text-center py-4">No assignments yet.</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {assignments.map((assignment) => {
                                        const subject = subjects.find(s => s.id === assignment.subject_id);
                                        const isCompleted = assignment.status === 'completed';
                                        return (
                                            <li key={assignment.id} className="bg-slate-950/80 border border-slate-850 rounded px-3 py-2.5 text-sm flex justify-between items-center gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleted}
                                                        onChange={() => handleToggleAssignmentStatus(assignment.id, assignment.status)}
                                                        className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer shrink-0"
                                                    />
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className={`font-medium transition-all truncate ${isCompleted ? 'line-through text-slate-505' : 'text-slate-200'}`}>
                                                            {assignment.title}
                                                        </span>
                                                        {subject && (
                                                            <span className="text-xs text-indigo-400 font-semibold truncate">{subject.name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {assignment.due_date && (
                                                        <span className="text-xs text-slate-400 bg-slate-900 border border-slate-850/60 px-2 py-1 rounded">
                                                            {new Date(assignment.due_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                                        className="text-xs text-rose-400 hover:text-rose-350 font-medium p-1 transition-colors cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Calendar and Selected Date Details (col-span-4) */}
                <div className="lg:col-span-4 flex flex-col gap-8 w-full">
                    
                    {/* Calendar Panel */}
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
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
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
                                    {getItemsForDate(selectedDate.getDate()).events.map(event => (
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
                                    {getItemsForDate(selectedDate.getDate()).assignments.map(assignment => (
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
                </div>

        </DashboardLayout>
    );
}