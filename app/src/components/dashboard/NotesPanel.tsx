import React, { useState } from 'react';
import { useNotes } from '../../hooks/useNotes.js';
import type { Subject } from '../../hooks/useSubjects.js';

interface NotesPanelProps {
    subjects: Subject[];
}

export function NotesPanel({ subjects }: NotesPanelProps) {
    const { notes, isLoading: isNotesLoading, error: notesError, addNote, deleteNote } = useNotes();
    
    const [newNoteTitle, setNewNoteTitle] = useState<string>('');
    const [newNoteContent, setNewNoteContent] = useState<string>('');
    const [newNoteSubjectId, setNewNoteSubjectId] = useState<string>('');
    const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

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
    );
}
