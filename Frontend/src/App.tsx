import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthGuard } from './components/AuthGuard';
import { PulseLayout } from './components/PulseLayout';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TeamManagement } from './components/TeamManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { ActivityManagement } from './components/ActivityManagement';
import { SettingsPanel } from './components/SettingsPanel';
import { useInactivityTimer } from './hooks/useInactivityTimer';

// Type definitions for Board components
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
}

export default function App() {
  const [currentSection, setCurrentSection] = useState('team');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sessionTimeoutEnabled');
    return saved === null ? true : saved === 'true'; // Default to enabled
  });

  // Initialize inactivity timer
  useInactivityTimer(sessionTimeoutEnabled);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for session timeout preference changes
  useEffect(() => {
    const handlePreferenceChange = (event: CustomEvent) => {
      setSessionTimeoutEnabled(event.detail);
    };

    window.addEventListener('sessionTimeoutPreferenceChanged', handlePreferenceChange as EventListener);
    return () => {
      window.removeEventListener('sessionTimeoutPreferenceChanged', handlePreferenceChange as EventListener);
    };
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case 'team':
        return <TeamManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'activity':
        return <ActivityManagement />;
      case 'settings':
        return (
          <SettingsPanel
            theme={theme}
            onThemeChange={setTheme}
            onProfileUpdate={() => {
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        );
      default:
        return <TeamManagement />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <AuthGuard>
        <PulseLayout
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          refreshTrigger={refreshTrigger}
        >
          {renderSection()}
        </PulseLayout>
      </AuthGuard>
    </>
  );
}
