import { DashboardLayout } from '../components/dashboard/DashboardLayout.js';
import { useSubjects } from '../hooks/useSubjects.js';
import { useAssignments } from '../hooks/useAssignments.js';
import { SubjectsPanel } from '../components/dashboard/SubjectsPanel.js';
import { NotesPanel } from '../components/dashboard/NotesPanel.js';
import { AssignmentsPanel } from '../components/dashboard/AssignmentsPanel.js';
import { CalendarPanel } from '../components/dashboard/CalendarPanel.js';

export function DashboardPage() {
    const { subjects } = useSubjects();
    const {
        assignments,
        isLoading: isAssignmentsLoading,
        error: assignmentsError,
        addAssignment,
        updateAssignment,
        deleteAssignment,
    } = useAssignments();

    return (
        <DashboardLayout>
            {/* Left Column: Subjects and Notes (col-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-8 w-full">
                <SubjectsPanel />
                <NotesPanel subjects={subjects} />
            </div>

            {/* Middle Column: Assignments (col-span-5) */}
            <div className="lg:col-span-5 w-full">
                <AssignmentsPanel
                    subjects={subjects}
                    assignments={assignments}
                    isLoading={isAssignmentsLoading}
                    error={assignmentsError}
                    addAssignment={addAssignment}
                    updateAssignment={updateAssignment}
                    deleteAssignment={deleteAssignment}
                />
            </div>

            {/* Right Column: Calendar and Selected Date Details (col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-8 w-full">
                <CalendarPanel assignments={assignments} />
            </div>
        </DashboardLayout>
    );
}