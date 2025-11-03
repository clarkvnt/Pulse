import { useState, useEffect } from 'react';
import { PulseLayout } from './components/PulseLayout';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TeamManagement } from './components/TeamManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { ActivityManagement } from './components/ActivityManagement';
import { SettingsPanel } from './components/SettingsPanel';

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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderSection = () => {
    switch (currentSection) {
      case 'team':
        return <TeamManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'activity':
        return <ActivityManagement />;
      case 'settings':
        return <SettingsPanel theme={theme} onThemeChange={setTheme} />;
      default:
        return <TeamManagement />;
    }
  };

  return (
    <PulseLayout currentSection={currentSection} onSectionChange={setCurrentSection}>
      {renderSection()}
    </PulseLayout>
  );
}
