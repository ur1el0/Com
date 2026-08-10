import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSubjects } from '../hooks/useSubjects.js'
import { useAssignments } from '../hooks/useAssignments.js';
import { useNotes } from '../hooks/useNotes.js';

export function DashboardPage() {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const { subjects, isLoading, error, addSubject, deleteSubject } = useSubjects();
    const { assignments, isLoading: isAssignmentsLoading, error: assignmentsError, addAssignment, updateAssignment, deleteAssignment } = useAssignments();
    const { notes, isLoading: isNotesLoading, error: notesError, addNote, deleteNote } = useNotes()
    const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
    const [newAssignmentSubjectId, setNewAssignmentSubjectId] = useState<string>('');
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState<string>('');
    const [newNoteTitle, setNewNoteTitle] = useState<string>('');
    const [newNoteContent, setNewNoteContent] = useState<string>('');
    const [newNoteSubjectId, setNewNoteSubjectId] = useState<string>('');
    const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

    const [isAddingAssignment, setIsAddingAssignment] = useState<boolean>(false);

    const [newSubjectName, setNewSubjectName] = useState<string>('');
    const [isAdding, setIsAdding] = useState<boolean>(false);


    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

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

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 font-sans">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-lg p-6 shadow-xl flex flex-col items-center gap-5 text-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
                {user && (
                    <p className="text-slate-350 text-sm">
                        Welcome, <span className="font-semibold text-slate-100">{user.email}</span>!
                    </p>
                )}
                <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-5 rounded transition-colors disabled:opacity-50 text-sm cursor-pointer"
                >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
                <div className="w-full flex flex-col items-stretch text-left gap-3 my-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Subjects</h2>
                    <form onSubmit={handleAddSubject} className="w-full flex gap-2">
                        <input
                            type="text"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="Add new subject..."
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                            disabled={isAdding}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-1.5 rounded transition-colors disabled:opacity-50 text-sm cursor-pointer"
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
                        <ul className="flex flex-col gap-2">
                            {subjects.map((subject) => (
                                <li key={subject.id} className="bg-slate-950 border border-slate-800/80 rounded px-3 py-2 text-sm flex justify-between items-center">
                                    <span className="font-medium text-slate-200">{subject.name}</span>
                                    <div className="flex items-center gap-3">
                                        {subject.grade && (
                                            <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-semibold">
                                                {subject.grade}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleDeleteSubject(subject.id)}
                                            className="text-xs text-rose-450 hover:text-rose-400 font-medium px-2 py-1 rounded transition-colors cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>

                            ))}
                        </ul>
                    )}
                <div className="w-full flex flex-col items-stretch text-left gap-3 mt-4 border-t border-slate-800/60 pt-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Assignments</h2>
                    <form onSubmit={handleAddAssignment} className="w-full flex flex-col gap-2 bg-slate-950/40 border border-slate-800/80 rounded p-3">
                        <input
                            type="text"
                            value={newAssignmentTitle}
                            onChange={(e) => setNewAssignmentTitle(e.target.value)}
                            placeholder="Assignment name..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                            disabled={isAddingAssignment}
                            required
                        />
                        <div className="flex gap-2">
                            <select
                                value={newAssignmentSubjectId}
                                onChange={(e) => setNewAssignmentSubjectId(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
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
                                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
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

                        <ul className="flex flex-col gap-2">
                            {assignments.map((assignment) => {
                                const subject = subjects.find(s => s.id === assignment.subject_id);
                                const isCompleted = assignment.status === 'completed';
                                return (
                                    <li key={assignment.id} className="bg-slate-950 border border-slate-800/80 rounded px-3 py-2 text-sm flex justify-between items-center gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={isCompleted}
                                                onChange={() => handleToggleAssignmentStatus(assignment.id, assignment.status)}
                                                className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                                            />
                                            <div className="flex flex-col gap-0.5">
                                                <span className={`font-medium transition-all ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                                    {assignment.title}
                                                </span>
                                                {subject && (
                                                    <span className="text-xs text-indigo-400 font-semibold">{subject.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {assignment.due_date && (
                                                <span className="text-xs text-slate-500">
                                                    {new Date(assignment.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleDeleteAssignment(assignment.id)}
                                                className="text-xs text-rose-450 hover:text-rose-400 font-medium px-2 py-1 rounded transition-colors cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                    {isAssignmentsLoading ? (
                        <p className="text-slate-500 text-sm italic text-center">Loading...</p>
                    ) : assignmentsError ? (
                        <p className="text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-3 py-2 rounded text-center">{assignmentsError}</p>
                    ) : assignments.length === 0 ? (
                        <p className="text-slate-500 text-sm italic text-center">No assignments yet.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {assignments.map((assignment) => {
                                const subject = subjects.find(s => s.id === assignment.subject_id);
                                return (
                                    <li key={assignment.id} className="bg-slate-950 border border-slate-800/80 rounded px-3 py-2 text-sm flex justify-between items-center">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-slate-200">{assignment.title}</span>
                                            {subject && (
                                                <span className="text-xs text-indigo-400 font-semibold">{subject.name}</span>
                                            )}
                                        </div>
                                        {assignment.due_date && (
                                            <span className="text-xs text-slate-500">
                                                {new Date(assignment.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                                
                <div className="w-full flex flex-col items-stretch text-left gap-3 mt-4 border-t border-slate-800/60 pt-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Notes</h2>
<form onSubmit={handleAddNote} className="w-full flex flex-col gap-2 bg-slate-950/40 border border-slate-800/80 rounded p-3">
                        <input
                            type="text"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            placeholder="Note title..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                            disabled={isAddingNote}
                            required
                        />
                        <textarea
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder="Note content..."
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
                            disabled={isAddingNote}
                        />
                        <div className="flex gap-2">
                            <select
                                value={newNoteSubjectId}
                                onChange={(e) => setNewNoteSubjectId(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm cursor-pointer"
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
                        <ul className="flex flex-col gap-2">
                            {notes.map((note) => {
                                const subject = subjects.find(s => s.id === note.subject_id);
                                return (
                                    <li key={note.id} className="bg-slate-950 border border-slate-800/80 rounded px-3 py-2 text-sm flex justify-between items-center gap-3">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-slate-200">{note.title}</span>
                                            {subject && (
                                                <span className="text-xs text-indigo-400 font-semibold">{subject.name}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {note.content && (
                                                <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                                    {note.content}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="text-xs text-rose-450 hover:text-rose-400 font-medium px-2 py-1 rounded transition-colors cursor-pointer"
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

                </div>
            </div>
        </main>
    );
}