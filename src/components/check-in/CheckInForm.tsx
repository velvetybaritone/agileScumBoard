import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCheckInStore } from '@/lib/stores/checkInStore';
import { getTodayISO } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CheckInFormProps {
  onClose: () => void;
}

export function CheckInForm({ onClose }: CheckInFormProps) {
  const { session } = useAuthStore();
  const { addCheckIn } = useCheckInStore();

  const [sprintWeek, setSprintWeek] = useState('');
  const [whatIDidYesterday, setWhatIDidYesterday] = useState('');
  const [whatIAmDoingToday, setWhatIAmDoingToday] = useState('');
  const [impediments, setImpediments] = useState('');
  const [helpNeeded, setHelpNeeded] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    addCheckIn(
      {
        date: new Date().toISOString(),
        sprintWeek,
        username: session.username,
        displayName: session.displayName,
        whatIDidYesterday,
        whatIAmDoingToday,
        impediments,
        helpNeeded,
      },
      session.tenantId
    );

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Date (auto-filled, read-only) */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            value={getTodayISO()}
            readOnly
            className="bg-gray-50"
          />
        </div>

        {/* Sprint Week */}
        <div className="space-y-2">
          <Label htmlFor="sprintWeek">Sprint Week *</Label>
          <Input
            id="sprintWeek"
            value={sprintWeek}
            onChange={(e) => setSprintWeek(e.target.value)}
            placeholder="e.g., Week 3 or Sprint 2"
            required
          />
        </div>
      </div>

      {/* Student Name (auto-filled, read-only) */}
      <div className="space-y-2">
        <Label htmlFor="studentName">Student Name</Label>
        <Input
          id="studentName"
          value={session?.displayName || ''}
          readOnly
          className="bg-gray-50"
        />
      </div>

      {/* What I Did Yesterday */}
      <div className="space-y-2">
        <Label htmlFor="yesterday">What I Did Yesterday *</Label>
        <Textarea
          id="yesterday"
          value={whatIDidYesterday}
          onChange={(e) => setWhatIDidYesterday(e.target.value)}
          placeholder="Describe what you worked on yesterday..."
          rows={3}
          required
        />
      </div>

      {/* What I Am Doing Today */}
      <div className="space-y-2">
        <Label htmlFor="today">What I Am Doing Today *</Label>
        <Textarea
          id="today"
          value={whatIAmDoingToday}
          onChange={(e) => setWhatIAmDoingToday(e.target.value)}
          placeholder="Describe what you plan to work on today..."
          rows={3}
          required
        />
      </div>

      {/* Impediments or Blockers */}
      <div className="space-y-2">
        <Label htmlFor="impediments">Impediments or Blockers</Label>
        <Textarea
          id="impediments"
          value={impediments}
          onChange={(e) => setImpediments(e.target.value)}
          placeholder="Any blockers or challenges you're facing..."
          rows={2}
        />
      </div>

      {/* Help Action Needed */}
      <div className="space-y-2">
        <Label htmlFor="helpNeeded">Help Action Needed</Label>
        <Textarea
          id="helpNeeded"
          value={helpNeeded}
          onChange={(e) => setHelpNeeded(e.target.value)}
          placeholder="What help do you need from the team..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
        <Button type="submit" className="w-full">
          Submit Check-In
        </Button>
      </div>
    </form>
  );
}
