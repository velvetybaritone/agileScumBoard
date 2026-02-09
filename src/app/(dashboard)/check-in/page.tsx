import React, { useState, useEffect } from 'react';
import Select from 'path/to/Select'; // Adjust the import path as necessary
import X from 'path/to/X'; // Adjust the import path as necessary

const CheckInPage = ({ checkIns }) => {
  const [sprintWeekFilter, setSprintWeekFilter] = useState('');
  const uniqueSprintWeeks = [...new Set(checkIns.map(checkIn => checkIn.sprintWeek))];
  
  const filteredMyCheckIns = myCheckIns.filter(checkIn => checkIn.sprintWeek === sprintWeekFilter);
  const filteredRecentTeamCheckIns = recentTeamCheckIns.filter(checkIn => checkIn.sprintWeek === sprintWeekFilter);

  return (
    <div>
      <Select value={sprintWeekFilter} onChange={e => setSprintWeekFilter(e.target.value)}>
        <option value="">All Sprint Weeks</option>
        {uniqueSprintWeeks.map(week => (
          <option key={week} value={week}>{week}</option>
        ))}
      </Select>
      {sprintWeekFilter && <X onClick={() => setSprintWeekFilter('')}>Clear</X>}
      {/* Render the filtered check-ins */}
    </div>
  );
};