import { Bell, Shield, Palette, Database, Mail, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

interface SettingsPanelProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function SettingsPanel({ theme, onThemeChange }: SettingsPanelProps) {
  return (
    <div className="p-12">
      <div className="mb-8">
        <h2 className="text-slate-900 dark:text-slate-100 mb-1">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your Pulse preferences and configurations</p>
      </div>

      <div className="max-w-6xl space-y-8">
        {/* Notifications */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100">Notifications</h3>
              <p className="text-slate-500 dark:text-slate-400">Configure your notification preferences</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email notifications</Label>
                <p className="text-slate-500 dark:text-slate-400">Receive email updates about team activity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Task assignments</Label>
                <p className="text-slate-500 dark:text-slate-400">Get notified when tasks are assigned</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Project updates</Label>
                <p className="text-slate-500 dark:text-slate-400">Alerts for project milestone changes</p>
              </div>
              <Switch />
            </div>
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
                <Label>Two-factor authentication</Label>
                <p className="text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session timeout</Label>
                <p className="text-slate-500 dark:text-slate-400">Auto logout after 30 minutes of inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Change password</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="New password" />
                <Button>Update</Button>
              </div>
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
                    <Moon className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-slate-400" />
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
                <Label>Compact view</Label>
                <p className="text-slate-500 dark:text-slate-400">Reduce spacing between elements</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show activity indicators</Label>
                <p className="text-slate-500 dark:text-slate-400">Display real-time activity badges</p>
              </div>
              <Switch defaultChecked />
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
            <Button variant="outline" className="w-full justify-start">
              Export team data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Export project data
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
              Delete all data
            </Button>
          </div>
        </div>

        {/* Email Settings */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100">Email Settings</h3>
              <p className="text-slate-500 dark:text-slate-400">Configure email integration</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Primary email address</Label>
              <Input type="email" placeholder="email@company.com" defaultValue="alex.morgan@company.com" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Support email</Label>
              <Input type="email" placeholder="support@company.com" />
            </div>
            <Button className="w-full">Save Email Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
