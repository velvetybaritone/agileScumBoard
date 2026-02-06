import { DailyCheckIn } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { formatDate, formatFullDate, getInitials } from '@/lib/utils';
import { Calendar, User, AlertCircle, HandHelping } from 'lucide-react';

interface CheckInListProps {
  checkIns: DailyCheckIn[];
  emptyMessage: string;
  showAuthor?: boolean;
}

export function CheckInList({ checkIns, emptyMessage, showAuthor = false }: CheckInListProps) {
  if (checkIns.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {checkIns.map((checkIn) => (
        <CheckInCard key={checkIn.id} checkIn={checkIn} showAuthor={showAuthor} />
      ))}
    </div>
  );
}

function CheckInCard({ checkIn, showAuthor }: { checkIn: DailyCheckIn; showAuthor: boolean }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {showAuthor && (
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              {getInitials(checkIn.displayName)}
            </div>
          )}
          <div>
            {showAuthor && (
              <p className="font-semibold text-sm text-gray-900">{checkIn.displayName}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatFullDate(checkIn.date)}</span>
              <span className="text-gray-400">•</span>
              <span>{checkIn.sprintWeek}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-700 mb-1">What I Did Yesterday</p>
          <p className="text-gray-600">{checkIn.whatIDidYesterday}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700 mb-1">What I Am Doing Today</p>
          <p className="text-gray-600">{checkIn.whatIAmDoingToday}</p>
        </div>

        {checkIn.impediments && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">Impediments</p>
                <p className="text-amber-800 text-xs">{checkIn.impediments}</p>
              </div>
            </div>
          </div>
        )}

        {checkIn.helpNeeded && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <HandHelping className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Help Needed</p>
                <p className="text-blue-800 text-xs">{checkIn.helpNeeded}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ClipboardCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}
