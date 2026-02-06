'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAnalyticsStore } from '@/lib/stores/analyticsStore';
import { TENANTS, TenantId } from '@/lib/types';
import {
  StatsCards,
  TenantStatsTable,
  UserStatsTable,
  TaskDistributionChart,
  CheckInParticipationChart,
} from '@/components/analytics/AnalyticsComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RefreshCw, BarChart3 } from 'lucide-react';

export default function AdminStatsPage() {
  const router = useRouter();
  const { session, isAdmin } = useAuthStore();
  const {
    tenantStats,
    userStats,
    checkInParticipation,
    loadAnalytics,
    getTenantStats,
    getUserStats,
    isLoading,
  } = useAnalyticsStore();

  const [tenantFilter, setTenantFilter] = useState<TenantId | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (session && !isAdmin()) {
      router.push('/dashboard');
    }
  }, [session, isAdmin, router]);

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    loadAnalytics();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Apply filters
  const filteredTenantStats = tenantFilter === 'all' 
    ? tenantStats 
    : getTenantStats(tenantFilter);
  
  const filteredUserStats = tenantFilter === 'all' 
    ? userStats 
    : getUserStats(tenantFilter);

  // Don't render for non-admin users
  if (!session || !isAdmin()) {
    return null;
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Analytics</h1>
              <p className="text-muted-foreground">
                Cross-tenant insights and student participation tracking
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing || isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tenant:</label>
              <Select value={tenantFilter} onValueChange={(value) => setTenantFilter(value as TenantId | 'all')}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {TENANTS.filter((t) => !t.isAdmin).map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      )}

      {/* Analytics Content */}
      {!isLoading && (
        <div className="space-y-6">
          {/* Overview Stats Cards */}
          <StatsCards tenantStats={filteredTenantStats} userStats={filteredUserStats} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskDistributionChart tenantStats={filteredTenantStats} />
            <CheckInParticipationChart participation={checkInParticipation} />
          </div>

          {/* Tables */}
          <TenantStatsTable tenantStats={filteredTenantStats} />
          <UserStatsTable userStats={filteredUserStats} />

          {/* Empty State */}
          {filteredTenantStats.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No data available</p>
                  <p className="text-sm">
                    {tenantFilter === 'all' 
                      ? 'Students haven\'t created any tasks or check-ins yet.'
                      : 'This tenant has no data yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
