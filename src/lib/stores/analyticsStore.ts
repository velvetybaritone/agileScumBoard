import { create } from 'zustand';
import {
  TenantId,
  TENANTS,
  STORAGE_KEYS,
  Task,
  DailyCheckIn,
  User,
  TenantStats,
  UserStats,
  CheckInParticipation,
  TaskStatus,
  TaskPriority,
} from '@/lib/types';

/**
 * Analytics Store
 * Aggregates data from all tenants for admin users
 * Provides cross-tenant statistics and insights
 */
interface AnalyticsState {
  // Computed stats
  tenantStats: TenantStats[];
  userStats: UserStats[];
  checkInParticipation: CheckInParticipation[];
  isLoading: boolean;

  // Actions
  loadAnalytics: () => void;
  getTenantStats: (tenantId?: TenantId) => TenantStats[];
  getUserStats: (tenantId?: TenantId, username?: string) => UserStats[];
  getCheckInParticipation: (days?: number) => CheckInParticipation[];
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  tenantStats: [],
  userStats: [],
  checkInParticipation: [],
  isLoading: false,

  loadAnalytics: () => {
    // Guard against SSR
    if (typeof window === 'undefined') return;

    set({ isLoading: true });

    try {
      // Get all users
      const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
      const allUsers: Record<string, User> = usersData ? JSON.parse(usersData) : {};

      // Filter out admin users from regular tenants (admins don't count in tenant participation)
      const regularTenants = TENANTS.filter((t) => !t.isAdmin);

      // Calculate tenant statistics
      const tenantStats: TenantStats[] = regularTenants.map((tenant) => {
        // Load tasks for this tenant
        const tasksData = localStorage.getItem(STORAGE_KEYS.getTenantTasks(tenant.id));
        const tasks: Task[] = tasksData ? JSON.parse(tasksData) : [];

        // Load check-ins for this tenant
        const checkInsData = localStorage.getItem(STORAGE_KEYS.getTenantCheckIns(tenant.id));
        const checkIns: DailyCheckIn[] = checkInsData ? JSON.parse(checkInsData) : [];

        // Get users in this tenant
        const tenantUsers = Object.values(allUsers).filter((u) => u.tenantId === tenant.id);

        // Aggregate task statistics
        const tasksByStatus: Record<TaskStatus, number> = {
          backlog: 0,
          todo: 0,
          'in-progress': 0,
          blocked: 0,
          done: 0,
        };

        const tasksByPriority: Record<TaskPriority, number> = {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        };

        let totalStoryPoints = 0;

        tasks.forEach((task) => {
          tasksByStatus[task.status]++;
          tasksByPriority[task.priority]++;
          totalStoryPoints += task.storyPoints;
        });

        return {
          tenantId: tenant.id,
          tenantName: tenant.displayName,
          totalTasks: tasks.length,
          totalStoryPoints,
          tasksByStatus,
          tasksByPriority,
          totalCheckIns: checkIns.length,
          activeUsers: tenantUsers.length,
          usernames: tenantUsers.map((u) => u.username),
        };
      });

      // Calculate user statistics
      const userStats: UserStats[] = Object.values(allUsers)
        .filter((user) => user.tenantId !== 'admin') // Exclude admin users
        .map((user) => {
          const tenant = TENANTS.find((t) => t.id === user.tenantId);
          
          // Load tasks for user's tenant
          const tasksData = localStorage.getItem(STORAGE_KEYS.getTenantTasks(user.tenantId));
          const allTasks: Task[] = tasksData ? JSON.parse(tasksData) : [];
          const userTasks = allTasks.filter((t) => t.assignee === user.username);

          // Load check-ins for user
          const checkInsData = localStorage.getItem(STORAGE_KEYS.getTenantCheckIns(user.tenantId));
          const allCheckIns: DailyCheckIn[] = checkInsData ? JSON.parse(checkInsData) : [];
          const userCheckIns = allCheckIns.filter((c) => c.username === user.username);

          // Calculate task statistics
          const tasksByStatus: Record<TaskStatus, number> = {
            backlog: 0,
            todo: 0,
            'in-progress': 0,
            blocked: 0,
            done: 0,
          };

          let totalStoryPoints = 0;

          userTasks.forEach((task) => {
            tasksByStatus[task.status]++;
            totalStoryPoints += task.storyPoints;
          });

          // Calculate check-in streak
          const sortedCheckIns = userCheckIns
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          let streak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = 0; i < sortedCheckIns.length; i++) {
            const checkInDate = new Date(sortedCheckIns[i].date);
            checkInDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            expectedDate.setHours(0, 0, 0, 0);

            if (checkInDate.getTime() === expectedDate.getTime()) {
              streak++;
            } else {
              break;
            }
          }

          return {
            username: user.username,
            displayName: user.displayName,
            tenantId: user.tenantId,
            tenantName: tenant?.displayName || 'Unknown',
            totalTasks: userTasks.length,
            totalStoryPoints,
            totalCheckIns: userCheckIns.length,
            lastCheckInDate: sortedCheckIns[0]?.date || null,
            checkInStreak: streak,
            tasksByStatus,
          };
        });

      // Calculate check-in participation over time
      const checkInParticipation = calculateCheckInParticipation(regularTenants, allUsers, 30);

      set({
        tenantStats,
        userStats,
        checkInParticipation,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      set({ isLoading: false });
    }
  },

  getTenantStats: (tenantId?: TenantId) => {
    const { tenantStats } = get();
    if (tenantId) {
      return tenantStats.filter((s) => s.tenantId === tenantId);
    }
    return tenantStats;
  },

  getUserStats: (tenantId?: TenantId, username?: string) => {
    const { userStats } = get();
    let filtered = userStats;

    if (tenantId) {
      filtered = filtered.filter((s) => s.tenantId === tenantId);
    }

    if (username) {
      filtered = filtered.filter((s) => s.username === username);
    }

    return filtered;
  },

  getCheckInParticipation: (days = 30) => {
    const { checkInParticipation } = get();
    return checkInParticipation.slice(0, days);
  },
}));

/**
 * Helper function to calculate daily check-in participation
 */
function calculateCheckInParticipation(
  tenants: typeof TENANTS,
  allUsers: Record<string, User>,
  days: number
): CheckInParticipation[] {
  const participation: CheckInParticipation[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    let totalUsers = 0;
    let checkedInUsers = 0;
    const byTenant: Record<string, { total: number; checkedIn: number }> = {};

    tenants.forEach((tenant) => {
      if (tenant.isAdmin) return; // Skip admin tenant

      // Get users for this tenant
      const tenantUsers = Object.values(allUsers).filter((u) => u.tenantId === tenant.id);
      const tenantUserCount = tenantUsers.length;

      // Get check-ins for this date and tenant
      const checkInsData = localStorage.getItem(STORAGE_KEYS.getTenantCheckIns(tenant.id));
      const checkIns: DailyCheckIn[] = checkInsData ? JSON.parse(checkInsData) : [];
      const dateCheckIns = checkIns.filter((c) => c.date.startsWith(dateStr));

      totalUsers += tenantUserCount;
      checkedInUsers += dateCheckIns.length;

      byTenant[tenant.id] = {
        total: tenantUserCount,
        checkedIn: dateCheckIns.length,
      };
    });

    participation.push({
      date: dateStr,
      totalUsers,
      checkedInUsers,
      participationRate: totalUsers > 0 ? (checkedInUsers / totalUsers) * 100 : 0,
      byTenant: byTenant as Record<TenantId, { total: number; checkedIn: number }>,
    });
  }

  return participation;
}
