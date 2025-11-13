import React, { useState, useEffect } from 'react';
import { Zap, Users, FolderKanban, Activity, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { authApi } from '../lib/api';
import { toast } from 'sonner';
import { useActivityBadges } from '../hooks/useActivityBadges';

interface PulseLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
  refreshTrigger?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  initials?: string;
  avatar?: string;
}

export function PulseLayout({ children, currentSection, onSectionChange, refreshTrigger }: PulseLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [activityIndicatorsEnabled, setActivityIndicatorsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('activityIndicatorsEnabled');
    return saved === null ? true : saved === 'true'; // Default to enabled
  });

  // Fetch activity badges
  const { badges } = useActivityBadges(activityIndicatorsEnabled);

  const navItems = [
    { id: 'team', label: 'Team', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Refresh user data when navigating to settings or when refreshTrigger changes
  useEffect(() => {
    if (currentSection === 'settings' || refreshTrigger) {
      fetchCurrentUser();
    }
  }, [currentSection, refreshTrigger]);

  // Listen for activity indicators preference changes
  useEffect(() => {
    const handlePreferenceChange = (event: CustomEvent) => {
      setActivityIndicatorsEnabled(event.detail);
    };

    window.addEventListener('activityIndicatorsPreferenceChanged', handlePreferenceChange as EventListener);
    return () => {
      window.removeEventListener('activityIndicatorsPreferenceChanged', handlePreferenceChange as EventListener);
    };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data as User;
        console.log('User role from API:', userData.role); // Debug log
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const handleSignOut = () => {
    authApi.logout();
    toast.success('Signed out successfully');
    // Reload page to trigger AuthGuard to show login screen
    window.location.reload();
  };

  // Generate initials from name if not provided
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role display name
  const getRoleDisplay = (role?: string): string => {
    if (!role) return 'Team Member';
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      project_manager: 'Project Manager',
      team_member: 'Team Member',
      viewer: 'Viewer',
    };
    return roleMap[role.toLowerCase()] || role;
  };

  return (
    <div className="h-screen bg-white dark:bg-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white dark:text-slate-900" />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-slate-100">Pulse</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {activityIndicatorsEnabled && (
                    <>
                      {item.id === 'team' && badges.team > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs flex items-center justify-center">
                          {badges.team > 99 ? '99+' : badges.team}
                        </Badge>
                      )}
                      {item.id === 'projects' && badges.projects > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs flex items-center justify-center">
                          {badges.projects > 99 ? '99+' : badges.projects}
                        </Badge>
                      )}
                      {item.id === 'activity' && badges.activity > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs flex items-center justify-center">
                          {badges.activity > 99 ? '99+' : badges.activity}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            {user && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white dark:text-slate-900 text-sm font-medium">
                    {user.initials || getInitials(user.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-slate-400 text-sm truncate" title={`Role: ${user.role || 'not set'}`}>
                    {getRoleDisplay(user.role)}
                  </p>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              Sign Out
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        {children}
      </main>
    </div>
  );
}
