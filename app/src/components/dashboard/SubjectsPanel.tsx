import React, { useState } from "react";
import { useSubjects } from "../../hooks/useSubjects.js";

export function SubjectsPanel() {
    const { subjects, isLoading, error, addSubject, updateSubject, deleteSubject } = useSubjects()
    const [newSubjectName, setNewSubjectName] = useState<string>('')
    const [isAdding, setIsAdding] = useState<boolean>(false)

    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
    const [editSubjectName, setEditSubjectName] = useState<string>('')

    const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newSubjectName.trim()) return
        
        setIsAdding(true)
        try {
            await addSubject(newSubjectName)
            setNewSubjectName('')
        } catch (err) {
            console.error('Failed to add subject', err)
        } finally {
            setIsAdding(false)
        }
    }

    const handleDeleteSubject = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return
        try {
            await deleteSubject(id)
        } catch (err) {
            console.error('Failed to delete subject', err)
        }
    }

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

    return (
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
    );
}
