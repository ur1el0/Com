import React, { useState } from 'react';
import type { Subject } from '../../hooks/useSubjects.js';
import type { Assignment, UpdateAssignment } from '../../hooks/useAssignments.js';

interface AssignmentsPanelProps {
    subjects: Subject[];
    assignments: Assignment[];
    isLoading: boolean;
    error: string | null;
    addAssignment: (title: string, subjectId?: string | null, dueDate?: string | null) => Promise<void>;
    updateAssignment: (id: string, updates: Omit<UpdateAssignment, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    deleteAssignment: (id: string) => Promise<void>;
}

export function AssignmentsPanel({
    subjects,
    assignments,
    isLoading,
    error,
    addAssignment,
    updateAssignment,
    deleteAssignment,
}: AssignmentsPanelProps) {
    const [newAssignmentTitle, setNewAssignmentTitle] = useState<string>('');
    const [newAssignmentSubjectId, setNewAssignmentSubjectId] = useState<string>('');
    const [newAssignmentDueDate, setNewAssignmentDueDate] = useState<string>('');
    const [isAddingAssignment, setIsAddingAssignment] = useState<boolean>(false);

    const handleAddAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newAssignmentTitle.trim()) return;

        setIsAddingAssignment(true);
        try {
            const dueDateISO = newAssignmentDueDate ? new Date(newAssignmentDueDate).toISOString() : null;
            const subjectIdVal = newAssignmentSubjectId || null;

            await addAssignment(newAssignmentTitle, subjectIdVal, dueDateISO);
            setNewAssignmentTitle('');
            setNewAssignmentSubjectId('');
            setNewAssignmentDueDate('');
        } catch (err) {
            console.error('Failed to add assignment:', err);
        } finally {
            setIsAddingAssignment(false);
        }
    };

    const handleToggleAssignmentStatus = async (id: string, currentStatus: string | null) => {
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

    return (
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
                {isLoading ? (
                    <p className="text-slate-500 text-sm italic text-center py-4">Loading...</p>
                ) : error ? (
                    <p className="text-red-400 text-sm bg-red-950/20 border border-red-900/30 px-3 py-2 rounded text-center">{error}</p>
                ) : assignments.length === 0 ? (
                    <p className="text-slate-500 text-sm italic text-center py-4">No assignments yet.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {assignments.map((assignment) => {
                            const subject = subjects.find((s) => s.id === assignment.subject_id);
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
    );
}