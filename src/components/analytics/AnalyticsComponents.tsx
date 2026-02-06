import { TenantStats, UserStats, TaskStatus, TaskPriority } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  CheckSquare, 
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface StatsCardsProps {
  tenantStats: TenantStats[];
  userStats: UserStats[];
}

export function StatsCards({ tenantStats, userStats }: StatsCardsProps) {
  const totalTasks = tenantStats.reduce((sum, t) => sum + t.totalTasks, 0);
  const totalStoryPoints = tenantStats.reduce((sum, t) => sum + t.totalStoryPoints, 0);
  const totalUsers = userStats.length;
  const totalCheckIns = tenantStats.reduce((sum, t) => sum + t.totalCheckIns, 0);
  const activeTenants = tenantStats.filter((t) => t.activeUsers > 0).length;
  const blockedTasks = tenantStats.reduce((sum, t) => sum + t.tasksByStatus.blocked, 0);

  const cards = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Story Points',
      value: totalStoryPoints,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Students',
      value: totalUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Check-Ins',
      value: totalCheckIns,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Active Tenants',
      value: `${activeTenants}/${tenantStats.length}`,
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Blocked Tasks',
      value: blockedTasks,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface TenantStatsTableProps {
  tenantStats: TenantStats[];
}

export function TenantStatsTable({ tenantStats }: TenantStatsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-sm">Tenant</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Students</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Tasks</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Story Points</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Check-Ins</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Blocked</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Completed</th>
              </tr>
            </thead>
            <tbody>
              {tenantStats.map((tenant) => (
                <tr key={tenant.tenantId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{tenant.tenantName}</td>
                  <td className="py-3 px-4 text-right">{tenant.activeUsers}</td>
                  <td className="py-3 px-4 text-right">{tenant.totalTasks}</td>
                  <td className="py-3 px-4 text-right">{tenant.totalStoryPoints}</td>
                  <td className="py-3 px-4 text-right">{tenant.totalCheckIns}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={tenant.tasksByStatus.blocked > 0 ? 'text-red-600 font-semibold' : ''}>
                      {tenant.tasksByStatus.blocked}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-green-600 font-semibold">
                    {tenant.tasksByStatus.done}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface UserStatsTableProps {
  userStats: UserStats[];
}

export function UserStatsTable({ userStats }: UserStatsTableProps) {
  // Sort by total check-ins descending
  const sortedUsers = [...userStats].sort((a, b) => b.totalCheckIns - a.totalCheckIns);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Participation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-sm">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Tenant</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Check-Ins</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Streak</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Tasks</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Points</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">Completed</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.username} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{user.tenantName}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={user.totalCheckIns === 0 ? 'text-red-600' : ''}>
                      {user.totalCheckIns}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {user.checkInStreak > 0 ? (
                      <span className="text-green-600 font-semibold">{user.checkInStreak} 🔥</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">{user.totalTasks}</td>
                  <td className="py-3 px-4 text-right">{user.totalStoryPoints}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-semibold">
                    {user.tasksByStatus.done}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface TaskDistributionProps {
  tenantStats: TenantStats[];
}

export function TaskDistributionChart({ tenantStats }: TaskDistributionProps) {
  const statusColors: Record<TaskStatus, string> = {
    backlog: 'bg-gray-400',
    todo: 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    blocked: 'bg-red-500',
    done: 'bg-green-500',
  };

  const statusLabels: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    todo: 'To Do',
    'in-progress': 'In Progress',
    blocked: 'Blocked',
    done: 'Done',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Distribution by Tenant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenantStats.map((tenant) => {
            const total = tenant.totalTasks;
            
            return (
              <div key={tenant.tenantId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{tenant.tenantName}</span>
                  <span className="text-xs text-muted-foreground">{total} tasks</span>
                </div>
                
                <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100">
                  {total === 0 ? (
                    <div className="flex items-center justify-center w-full text-xs text-muted-foreground">
                      No tasks
                    </div>
                  ) : (
                    <>
                      {(Object.keys(statusColors) as TaskStatus[]).map((status) => {
                        const count = tenant.tasksByStatus[status];
                        const percentage = (count / total) * 100;
                        
                        if (count === 0) return null;
                        
                        return (
                          <div
                            key={status}
                            className={`${statusColors[status]} flex items-center justify-center text-white text-xs font-semibold`}
                            style={{ width: `${percentage}%` }}
                            title={`${statusLabels[status]}: ${count}`}
                          >
                            {percentage > 10 && count}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-4 text-xs">
            {(Object.keys(statusColors) as TaskStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${statusColors[status]}`}></div>
                <span>{statusLabels[status]}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CheckInParticipationChartProps {
  participation: Array<{
    date: string;
    totalUsers: number;
    checkedInUsers: number;
    participationRate: number;
  }>;
}

export function CheckInParticipationChart({ participation }: CheckInParticipationChartProps) {
  // Show last 14 days, reverse for chronological order
  const recentData = participation.slice(0, 14).reverse();
  const maxRate = Math.max(...recentData.map((d) => d.participationRate), 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Check-In Participation (Last 14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {recentData.map((day) => {
            const date = new Date(day.date);
            const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const percentage = day.participationRate;
            
            return (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-16 text-xs text-muted-foreground">{dateLabel}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full ${
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 50 ? 'bg-yellow-500' :
                      percentage >= 20 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center px-2 text-xs font-semibold">
                    <span className={percentage > 30 ? 'text-white' : 'text-gray-700'}>
                      {day.checkedInUsers}/{day.totalUsers} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {recentData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No check-in data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
