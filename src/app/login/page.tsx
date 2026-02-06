'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { TenantId, TENANTS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Users } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, checkUserExists } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [needsTenantSelection, setNeedsTenantSelection] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Type-safe tenant ID
      const tenantIdValue = needsTenantSelection && selectedTenant 
        ? selectedTenant as TenantId 
        : undefined;
      
      const result = await login(username, password, tenantIdValue);

      if (result.success) {
        router.push('/dashboard');
      } else if (result.needsTenantSelection) {
        setNeedsTenantSelection(true);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    const existingUser = checkUserExists(username);
    
    if (existingUser) {
      // Existing user - attempt login
      handleLogin(e);
    } else {
      // New user - show tenant selection
      setNeedsTenantSelection(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">AGILE SCRUM Board</CardTitle>
          <CardDescription className="text-base">
            Multi-Tenant Training Dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={needsTenantSelection ? handleLogin : handleInitialSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={needsTenantSelection}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={needsTenantSelection}
                required
              />
            </div>

            {needsTenantSelection && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="tenant">Select Your AGILE Group</Label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger id="tenant">
                    <SelectValue placeholder="Choose your team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TENANTS.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This is a first-time setup. Your group cannot be changed later.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              {needsTenantSelection && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNeedsTenantSelection(false);
                    setSelectedTenant('');
                    setError('');
                  }}
                  className="w-full"
                >
                  Back
                </Button>
              )}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || (needsTenantSelection && !selectedTenant)}
              >
                {isLoading ? 'Logging in...' : needsTenantSelection ? 'Complete Setup' : 'Login'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <Lock className="inline w-4 h-4 mr-1" />
            Mock authentication for training purposes
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
