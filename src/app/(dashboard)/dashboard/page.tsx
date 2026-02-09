import React, { useState, useEffect } from 'react';
import { Select } from 'your-select-library'; // Adjust based on actual library used
import { Task } from 'your-task-types'; // Import your task type if needed

const DashboardPage = ({ tasks }) => {
    const [sprintWeekFilter, setSprintWeekFilter] = useState('');
    const uniqueSprintWeeks = [...new Set(tasks.map(task => task.sprintWeek))];

    const filteredTasks = sprintWeekFilter ? tasks.filter(task => task.sprintWeek === sprintWeekFilter) : tasks;

    useEffect(() => {
        // Optionally perform any side effect when the sprintWeekFilter changes
    }, [sprintWeekFilter]);

    return (
        <div>
            <div>
                <Select
                    value={sprintWeekFilter}
                    onChange={setSprintWeekFilter}
                    placeholder="Select Sprint Week"
                >
                    <option value="">All</option>
                    {uniqueSprintWeeks.map((week, index) => (
                        <option key={index} value={week}>{week}</option>
                    ))}
                </Select>
                <span>{filteredTasks.length} tasks</span>
            </div>
            {/* Kanban Board Rendering Logic Here */}
            <Kanban tasks={filteredTasks} />
        </div>
    );
};

export default DashboardPage;