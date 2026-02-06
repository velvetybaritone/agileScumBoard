'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useTaskStore } from '@/lib/stores/taskStore';
import { useCheckInStore } from '@/lib/stores/checkInStore';
import { AppShell } from '@/components/layout/AppShell';

/**
 * Protected Route Wrapper
 * Ensures user is authenticated and loads tenant-specific data
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session, isAuthenticated, isLoading, initializeSession } = useAuthStore();
  const loadTasks = useTaskStore(state => state.loadTasks);
  const loadCheckIns = useCheckInStore(state => state.loadCheckIns);

  // Initialize session on mount - only once
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load tenant-specific data when session is available
  // Use useCallback to stabilize the effect
  const tenantId = session?.tenantId;
  useEffect(() => {
    if (tenantId) {
      loadTasks(tenantId);
      loadCheckIns(tenantId);
    }
  }, [tenantId]); // Only depend on tenantId, not the functions

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !session) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
