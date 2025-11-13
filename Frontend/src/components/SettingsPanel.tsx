import { useState, useEffect } from 'react';
import { Shield, Palette, Database, Moon, Sun, User, FileDown, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { authApi, userApi, teamApi, projectApi, ApiError } from '../lib/api';
import { toast } from 'sonner';
import { downloadJSON, downloadCSV } from '../utils/dataExport';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SettingsPanelProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onProfileUpdate?: () => void;
}

export function SettingsPanel({ theme, onThemeChange, onProfileUpdate }: SettingsPanelProps) {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    role: 'team_member' as 'admin' | 'project_manager' | 'team_member' | 'viewer',
  });
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sessionTimeoutEnabled');
    return saved === null ? true : saved === 'true'; // Default to enabled
  });
  const [activityIndicatorsEnabled, setActivityIndicatorsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('activityIndicatorsEnabled');
    return saved === null ? true : saved === 'true'; // Default to enabled
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleSessionTimeoutToggle = (enabled: boolean) => {
    setSessionTimeoutEnabled(enabled);
    localStorage.setItem('sessionTimeoutEnabled', String(enabled));
    // Update the preference globally so App.tsx can pick it up
    window.dispatchEvent(new CustomEvent('sessionTimeoutPreferenceChanged', { detail: enabled }));
  };

  const handleActivityIndicatorsToggle = (enabled: boolean) => {
    setActivityIndicatorsEnabled(enabled);
    localStorage.setItem('activityIndicatorsEnabled', String(enabled));
    // Update the preference globally so PulseLayout can pick it up
    window.dispatchEvent(new CustomEvent('activityIndicatorsPreferenceChanged', { detail: enabled }));
  };

  const handleExportTeamData = async (format: 'json' | 'csv' = 'csv') => {
    try {
      setIsExporting(true);
      const response = await teamApi.getAll();
      
      if (response.success && response.data) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `team-data-${timestamp}`;
        
        if (format === 'csv') {
          downloadCSV(response.data as Array<Record<string, unknown>>, filename);
          toast.success('Team data exported as CSV');
        } else {
          downloadJSON(response.data, filename);
          toast.success('Team data exported as JSON');
        }
      } else {
        toast.error('Failed to export team data');
      }
    } catch (error) {
      console.error('Export error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to export team data');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportProjectData = async (format: 'json' | 'csv' = 'csv') => {
    try {
      setIsExporting(true);
      const response = await projectApi.getAll();
      
      if (response.success && response.data) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `project-data-${timestamp}`;
        
        if (format === 'csv') {
          downloadCSV(response.data as Array<Record<string, unknown>>, filename);
          toast.success('Project data exported as CSV');
        } else {
          downloadJSON(response.data, filename);
          toast.success('Project data exported as JSON');
        }
      } else {
        toast.error('Failed to export project data');
      }
    } catch (error) {
      console.error('Export error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to export project data');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setIsExporting(true);
      
      // Get all data first (for backup)
      const [teamResponse, projectResponse] = await Promise.all([
        teamApi.getAll(),
        projectApi.getAll(),
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        team: teamResponse.success ? teamResponse.data : [],
        projects: projectResponse.success ? projectResponse.data : [],
      };

      // Save backup
      downloadJSON(backupData, `backup-before-delete-${new Date().toISOString().split('T')[0]}`);
      toast.info('Backup created before deletion');

      // Delete all team members
      if (teamResponse.success && teamResponse.data) {
        await Promise.all(
          teamResponse.data.map((member) => teamApi.delete(member.id))
        );
      }

      // Delete all projects
      if (projectResponse.success && projectResponse.data) {
        await Promise.all(
          projectResponse.data.map((project) => projectApi.delete(project.id))
        );
      }

      toast.success('All data deleted successfully');
      setIsDeleteDialogOpen(false);
      
      // Reload page to refresh the UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete data');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setProfileData({
          name: userData.name || '',
          role: userData.role || 'team_member',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const response = await userApi.update(user.id, {
        name: profileData.name,
        role: profileData.role,
      });

      if (response.success) {
        toast.success('Profile updated successfully');
        await fetchCurrentUser();
        // Trigger sidebar refresh
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
    }
  };

  return (
    <div className="p-12 min-h-full">
      <div className="mb-8">
        <h2 className="text-slate-900 dark:text-slate-100 mb-1">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your Pulse preferences and configurations</p>
      </div>

      <div className="max-w-6xl space-y-8">
        {/* Profile */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100">Profile</h3>
              <p className="text-slate-500 dark:text-slate-400">Update your account information</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role">Role</Label>
              <Select
                value={profileData.role}
                onValueChange={(value) =>
                  setProfileData({
                    ...profileData,
                    role: value as 'admin' | 'project_manager' | 'team_member' | 'viewer',
                  })
                }
              >
                <SelectTrigger id="profile-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your role determines what actions you can perform in Pulse.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-slate-50 dark:bg-slate-800"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email cannot be changed. Contact an administrator to change your email.
              </p>
            </div>
            <Button onClick={handleUpdateProfile} className="w-full">
              Save Profile Changes
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100">Security</h3>
              <p className="text-slate-500 dark:text-slate-400">Manage your account security settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session timeout</Label>
                <p className="text-slate-500 dark:text-slate-400">Auto logout after 30 minutes of inactivity</p>
              </div>
              <Switch 
                checked={sessionTimeoutEnabled}
                onCheckedChange={handleSessionTimeoutToggle}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100">Appearance</h3>
              <p className="text-slate-500 dark:text-slate-400">Customize the look and feel</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Label>Dark mode</Label>
                        {theme === 'dark' ? (
                          <Moon className="w-4 h-4 text-slate-400 dark:text-slate-300" />
                        ) : (
                          <Sun className="w-4 h-4 text-slate-400 dark:text-slate-300" />
                        )}
                      </div>
                <p className="text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show activity indicators</Label>
                <p className="text-slate-500 dark:text-slate-400">Display real-time activity badges</p>
              </div>
              <Switch 
                checked={activityIndicatorsEnabled}
                onCheckedChange={handleActivityIndicatorsToggle}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100">Data Management</h3>
              <p className="text-slate-500 dark:text-slate-400">Export and backup your data</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  disabled={isExporting}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export team data'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleExportTeamData('csv')} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportTeamData('json')} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  disabled={isExporting}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export project data'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleExportProjectData('csv')} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportProjectData('json')} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isExporting}
            >
              Delete all data
            </Button>
          </div>
        </div>
      </div>

      {/* Delete All Data Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all team members and projects. A backup will be automatically created before deletion.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you absolutely sure you want to proceed? All data will be lost permanently.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllData}
              disabled={isExporting}
            >
              {isExporting ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
