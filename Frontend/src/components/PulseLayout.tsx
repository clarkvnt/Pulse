import React from 'react';
import { Zap, Users, FolderKanban, Activity, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface PulseLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function PulseLayout({ children, currentSection, onSectionChange }: PulseLayoutProps) {
  const navItems = [
    { id: 'team', label: 'Team', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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

        <nav className="flex-1 p-6 flex flex-col justify-between">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white dark:text-slate-900">AM</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-slate-100">Alex Morgan</p>
                <p className="text-slate-400">Project Manager</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600 dark:text-slate-400">
              <LogOut className="w-4 h-4" />
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
