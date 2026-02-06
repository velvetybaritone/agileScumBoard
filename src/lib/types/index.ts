/**
 * Core TypeScript types for the Multi-Tenant AGILE SCRUM Dashboard
 */

// ===== Tenant Types =====

export type TenantId = 
  | 'walmart'
  | '3c-consulting'
  | 'primary-battery-tech'
  | 'wac-amp'
  | 'cob'
  | 'echelon'
  | 'arvest'
  | 'startup-lab'
  | 'admin'; // Admin tenant with access to all data

export interface Tenant {
  id: TenantId;
  name: string;
  displayName: string;
  isAdmin?: boolean; // Flag to identify admin tenants
}

export const TENANTS: Tenant[] = [
  { id: 'walmart', name: 'walmart', displayName: 'Walmart' },
  { id: '3c-consulting', name: '3c-consulting', displayName: '3C Consulting' },
  { id: 'primary-battery-tech', name: 'primary-battery-tech', displayName: 'Primary Battery Technology' },
  { id: 'wac-amp', name: 'wac-amp', displayName: 'WAC/AMP' },
  { id: 'cob', name: 'cob', displayName: 'COB' },
  { id: 'echelon', name: 'echelon', displayName: 'Echelon' },
  { id: 'arvest', name: 'arvest', displayName: 'Arvest' },
  { id: 'startup-lab', name: 'startup-lab', displayName: 'Startup Lab' },
  { id: 'admin', name: 'admin', displayName: 'Admin / Instructor', isAdmin: true },
];

// ===== User Types =====

export interface User {
  username: string;
  tenantId: TenantId;
  displayName: string;
  createdAt: string;
}

export interface UserSession {
  username: string;
  tenantId: TenantId;
  displayName: string;
  loginTime: string;
}

// ===== Task Types =====

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  storyPoints: number;
  assignee: string; // username
  blockerDetails?: string;
  createdAt: string;
  tenantId: TenantId;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

// ===== Daily Check-In Types =====

export interface DailyCheckIn {
  id: string;
  date: string; // ISO date string
  sprintWeek: string;
  username: string;
  displayName: string;
  whatIDidYesterday: string;
  whatIAmDoingToday: string;
  impediments: string;
  helpNeeded: string;
  tenantId: TenantId;
  createdAt: string;
}

// ===== Analytics Types =====

export interface TenantStats {
  tenantId: TenantId;
  tenantName: string;
  totalTasks: number;
  totalStoryPoints: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  totalCheckIns: number;
  activeUsers: number;
  usernames: string[];
}

export interface UserStats {
  username: string;
  displayName: string;
  tenantId: TenantId;
  tenantName: string;
  totalTasks: number;
  totalStoryPoints: number;
  totalCheckIns: number;
  lastCheckInDate: string | null;
  checkInStreak: number;
  tasksByStatus: Record<TaskStatus, number>;
}

export interface CheckInParticipation {
  date: string;
  totalUsers: number;
  checkedInUsers: number;
  participationRate: number;
  byTenant: Record<TenantId, { total: number; checkedIn: number }>;
}

export type AnalyticsFilter = 'all' | 'by-tenant' | 'by-user';

// ===== Storage Keys =====

export const STORAGE_KEYS = {
  USER_SESSION: 'agile_user_session',
  USERS: 'agile_users',
  getTenantTasks: (tenantId: TenantId) => `agile_tenant_${tenantId}_tasks`,
  getTenantCheckIns: (tenantId: TenantId) => `agile_tenant_${tenantId}_checkins`,
} as const;
