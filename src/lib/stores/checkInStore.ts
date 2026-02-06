import { create } from 'zustand';
import { DailyCheckIn, TenantId, STORAGE_KEYS } from '@/lib/types';
import { generateId, getTodayISO } from '@/lib/utils';

/**
 * Check-In Store
 * Manages daily check-ins with tenant isolation
 */
interface CheckInState {
  checkIns: DailyCheckIn[];
  isLoading: boolean;

  // Actions
  loadCheckIns: (tenantId: TenantId) => void;
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'createdAt' | 'tenantId'>, tenantId: TenantId) => void;
  updateCheckIn: (checkInId: string, updates: Partial<DailyCheckIn>, tenantId: TenantId) => void;
  deleteCheckIn: (checkInId: string, tenantId: TenantId) => void;
  hasCheckInToday: (username: string) => boolean;
  getCheckInsByUser: (username: string) => DailyCheckIn[];
  getRecentCheckIns: (limit?: number) => DailyCheckIn[];
}

export const useCheckInStore = create<CheckInState>((set, get) => ({
  checkIns: [],
  isLoading: false,

  loadCheckIns: (tenantId: TenantId) => {
    if (typeof window === 'undefined') {
      set({ checkIns: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const key = STORAGE_KEYS.getTenantCheckIns(tenantId);
      const checkInsData = localStorage.getItem(key);
      
      if (checkInsData) {
        const checkIns = JSON.parse(checkInsData) as DailyCheckIn[];
        set({ checkIns, isLoading: false });
      } else {
        // Initialize with empty check-ins for new tenant
        set({ checkIns: [], isLoading: false });
        localStorage.setItem(key, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Failed to load check-ins:', error);
      set({ checkIns: [], isLoading: false });
    }
  },

  addCheckIn: (checkInData, tenantId) => {
    if (typeof window === 'undefined') return;

    // Sanitize inputs
    const sanitizedData = {
      ...checkInData,
      sprintWeek: checkInData.sprintWeek.trim(),
      whatIDidYesterday: checkInData.whatIDidYesterday.trim(),
      whatIAmDoingToday: checkInData.whatIAmDoingToday.trim(),
      impediments: checkInData.impediments.trim(),
      helpNeeded: checkInData.helpNeeded.trim(),
    };

    const newCheckIn: DailyCheckIn = {
      ...sanitizedData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      tenantId,
    };

    const updatedCheckIns = [...get().checkIns, newCheckIn];
    set({ checkIns: updatedCheckIns });

    // Persist to localStorage
    try {
      const key = STORAGE_KEYS.getTenantCheckIns(tenantId);
      localStorage.setItem(key, JSON.stringify(updatedCheckIns));
    } catch (error) {
      console.error('Failed to save check-in:', error);
      // Revert on error
      set({ checkIns: get().checkIns.filter(c => c.id !== newCheckIn.id) });
    }
  },

  updateCheckIn: (checkInId, updates, tenantId) => {
    if (typeof window === 'undefined') return;

    const checkIns = get().checkIns;
    const updatedCheckIns = checkIns.map(checkIn =>
      checkIn.id === checkInId ? { ...checkIn, ...updates } : checkIn
    );

    set({ checkIns: updatedCheckIns });

    // Persist to localStorage
    try {
      const key = STORAGE_KEYS.getTenantCheckIns(tenantId);
      localStorage.setItem(key, JSON.stringify(updatedCheckIns));
    } catch (error) {
      console.error('Failed to update check-in:', error);
      set({ checkIns });
    }
  },

  deleteCheckIn: (checkInId, tenantId) => {
    if (typeof window === 'undefined') return;

    const checkIns = get().checkIns;
    const updatedCheckIns = checkIns.filter(checkIn => checkIn.id !== checkInId);
    set({ checkIns: updatedCheckIns });

    // Persist to localStorage
    try {
      const key = STORAGE_KEYS.getTenantCheckIns(tenantId);
      localStorage.setItem(key, JSON.stringify(updatedCheckIns));
    } catch (error) {
      console.error('Failed to delete check-in:', error);
      set({ checkIns });
    }
  },

  hasCheckInToday: (username: string) => {
    const today = getTodayISO();
    return get().checkIns.some(
      checkIn => checkIn.username === username && checkIn.date.startsWith(today)
    );
  },

  getCheckInsByUser: (username: string) => {
    return get().checkIns
      .filter(checkIn => checkIn.username === username)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getRecentCheckIns: (limit = 10) => {
    return [...get().checkIns]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
}));
