'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCheckInStore } from '@/lib/stores/checkInStore';
import { CheckInForm } from '@/components/check-in/CheckInForm';
import { CheckInList } from '@/components/check-in/CheckInList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Plus, AlertCircle } from 'lucide-react';

export default function CheckInPage() {
  const { session } = useAuthStore();
  const { hasCheckInToday, getCheckInsByUser, getRecentCheckIns } = useCheckInStore();
  const [showForm, setShowForm] = useState(false);

  const hasSubmittedToday = session ? hasCheckInToday(session.username) : false;
  const myCheckIns = session ? getCheckInsByUser(session.username) : [];
  const recentTeamCheckIns = getRecentCheckIns(20);

  const handleFormClose = () => {
    setShowForm(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Check-In</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share your daily standup updates with your team
            </p>
          </div>
          {!hasSubmittedToday && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Check-In
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Today's Status */}
          {hasSubmittedToday ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Check-in submitted today</p>
                  <p className="text-sm text-green-700">Great job staying on track!</p>
                </div>
              </CardContent>
            </Card>
          ) : showForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Submit Daily Check-In</CardTitle>
                <CardDescription>
                  Share what you worked on, what you're doing today, and any blockers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheckInForm onClose={handleFormClose} />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">You haven't checked in today</p>
                  <p className="text-sm text-blue-700">Submit your daily standup update</p>
                </div>
                <Button onClick={() => setShowForm(true)}>Submit Check-In</Button>
              </CardContent>
            </Card>
          )}

          {/* Check-In Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Check-Ins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Check-Ins</CardTitle>
                <CardDescription>Your standup history</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckInList checkIns={myCheckIns} emptyMessage="No check-ins yet" />
              </CardContent>
            </Card>

            {/* Team Check-Ins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Check-Ins</CardTitle>
                <CardDescription>Recent updates from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckInList
                  checkIns={recentTeamCheckIns}
                  emptyMessage="No team check-ins yet"
                  showAuthor
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
