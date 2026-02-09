import React, { useState } from 'react';

const AdminAnalyticsPage = () => {
    const [selectedSprintWeek, setSelectedSprintWeek] = useState('');

    const handleSprintWeekChange = (event) => {
        setSelectedSprintWeek(event.target.value);
    };

    return (
        <div>
            <h1>Admin Analytics</h1>
            <div>
                <label htmlFor="sprint-week-filter">Sprint Week:</label>
                <select id="sprint-week-filter" value={selectedSprintWeek} onChange={handleSprintWeekChange}>
                    <option value="">Select a week</option>
                    <option value="2026-02-06">Week of 2026-02-06</option>
                    <option value="2026-02-13">Week of 2026-02-13</option>
                    <option value="2026-02-20">Week of 2026-02-20</option>
                    <option value="2026-02-27">Week of 2026-02-27</option>
                </select>
            </div>
            {/* Analytics data display would go here */}
        </div>
    );
};

export default AdminAnalyticsPage;