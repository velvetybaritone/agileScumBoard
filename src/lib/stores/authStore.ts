import { create } from 'zustand';
import { UserSession, User, TenantId, STORAGE_KEYS } from '@/lib/types';

/**
 * Authentication Store
 * Manages user session and authentication state
 */
interface AuthState {
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (username: string, password: string, tenantId?: TenantId) => Promise<{ success: boolean; needsTenantSelection: boolean; error?: string }>;
  logout: () => void;
  initializeSession: () => void;
  checkUserExists: (username: string) => User | null;
  
  // Helper to check if current user is admin
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isAuthenticated: false,
  isLoading: true,

  initializeSession: () => {
    // Guard against SSR - localStorage only available in browser
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (sessionData) {
        const session = JSON.parse(sessionData) as UserSession;
        set({ session, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      set({ isLoading: false });
    }
  },

  checkUserExists: (username: string): User | null => {
    if (typeof window === 'undefined') return null;

    try {
      const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!usersData) return null;
      
      const users = JSON.parse(usersData) as Record<string, User>;
      return users[username] || null;
    } catch (error) {
      console.error('Failed to check user:', error);
      return null;
    }
  },

  login: async (username: string, password: string, tenantId?: TenantId) => {
    // Guard against SSR
    if (typeof window === 'undefined') {
      return { success: false, needsTenantSelection: false, error: 'Cannot login during SSR' };
    }

    // Mock authentication - in production, this would validate against a backend
    if (!username || !password) {
      return { success: false, needsTenantSelection: false, error: 'Username and password are required' };
    }

    // Sanitize inputs to prevent XSS
    const sanitizedUsername = username.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
      return { success: false, needsTenantSelection: false, error: 'Username must be 3-50 characters' };
    }

    try {
      // Get existing users
      const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
      const users: Record<string, User> = usersData ? JSON.parse(usersData) : {};

      const existingUser = users[sanitizedUsername];

      // If user exists but no tenant provided, they're returning user
      if (existingUser && !tenantId) {
        const session: UserSession = {
          username: existingUser.username,
          tenantId: existingUser.tenantId,
          displayName: existingUser.displayName,
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
        set({ session, isAuthenticated: true });
        return { success: true, needsTenantSelection: false };
      }

      // If user exists and tenant provided (shouldn't happen in normal flow)
      if (existingUser && tenantId && existingUser.tenantId !== tenantId) {
        return { success: false, needsTenantSelection: false, error: 'User already assigned to a different tenant' };
      }

      // New user - requires tenant selection
      if (!existingUser && !tenantId) {
        return { success: false, needsTenantSelection: true };
      }

      // New user with tenant - create user
      if (!existingUser && tenantId) {
        const newUser: User = {
          username: sanitizedUsername,
          tenantId,
          displayName: sanitizedUsername, // In production, might ask for display name
          createdAt: new Date().toISOString(),
        };

        users[sanitizedUsername] = newUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        const session: UserSession = {
          username: newUser.username,
          tenantId: newUser.tenantId,
          displayName: newUser.displayName,
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
        set({ session, isAuthenticated: true });
        return { success: true, needsTenantSelection: false };
      }

      return { success: false, needsTenantSelection: false, error: 'Invalid login' };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, needsTenantSelection: false, error: 'Login failed' };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    set({ session: null, isAuthenticated: false });
  },

  isAdmin: () => {
    const { session } = get();
    return session?.tenantId === 'admin';
  },
}));
