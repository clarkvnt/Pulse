import { CheckCircle2, MessageSquare, UserPlus, FileText, Filter, Plus, Edit, Trash2, FolderKanban } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useState, useEffect } from 'react';
import { activityApi, ApiError } from '../lib/api';
import { toast } from 'sonner';

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    initials?: string;
    avatar?: string;
  };
  project?: {
    id: number;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

interface ActivityDisplay {
  id: number;
  type: string;
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  time: string;
  color: string;
  user: string;
}

// Helper to format relative time (e.g., "5m ago", "2h ago")
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

// Map activity type to icon and display info
const getActivityIcon = (type: string) => {
  if (type.includes('task_completed')) return CheckCircle2;
  if (type.includes('task_created') || type.includes('task_updated')) return Plus;
  if (type.includes('project')) return FolderKanban;
  if (type.includes('team') || type.includes('member')) return UserPlus;
  return FileText;
};

const getActivityColor = (type: string): string => {
  if (type.includes('task_completed')) return 'bg-green-600';
  if (type.includes('task_created') || type.includes('task_updated')) return 'bg-blue-600';
  if (type.includes('project')) return 'bg-purple-600';
  if (type.includes('team') || type.includes('member')) return 'bg-orange-600';
  return 'bg-slate-600';
};

const getActivityTitle = (type: string): string => {
  if (type.includes('task_completed')) return 'Task completed';
  if (type.includes('task_created')) return 'Task created';
  if (type.includes('task_updated')) return 'Task updated';
  if (type.includes('project_created')) return 'Project created';
  if (type.includes('project_updated')) return 'Project updated';
  if (type.includes('team_member_added')) return 'Team member added';
  if (type.includes('team_member_updated')) return 'Team member updated';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Transform API activity to display format
const transformActivity = (activity: Activity): ActivityDisplay => {
  const Icon = getActivityIcon(activity.type);
  
  return {
    id: activity.id,
    type: activity.type,
    icon: Icon,
    title: getActivityTitle(activity.type),
    description: activity.description || activity.task?.title || activity.project?.name || 'Activity',
    time: formatRelativeTime(activity.createdAt),
    color: getActivityColor(activity.type),
    user: activity.user?.name || 'System',
  };
};

export function ActivityManagement() {
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (filterType !== 'all') {
      fetchActivities(filterType);
    } else {
      fetchActivities();
    }
  }, [filterType]);

  const fetchActivities = async (typeFilter?: string) => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (typeFilter && typeFilter !== 'all') {
        params.type = typeFilter;
      }
      
      const response = await activityApi.getAll(params);
      
      if (response.success && response.data) {
        const data = response.data as any;
        // Handle paginated response structure: { activities: [], pagination: {} }
        const activitiesList = Array.isArray(data) ? data : (data.activities || []);
        const transformed = activitiesList.map(transformActivity);
        setActivities(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to load activities');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(activity => activity.type.includes(filterType));

  return (
    <div className="p-12 min-h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 mb-1">Activity Log</h2>
          <p className="text-slate-500 dark:text-slate-400">Monitor all team activities and updates</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-300" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg">
          Loading activities...
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredActivities.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">No activities found</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <div key={activity.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="text-slate-900 dark:text-slate-100">{activity.title}</p>
                      <p className="text-slate-400 dark:text-slate-500 whitespace-nowrap">{activity.time}</p>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-1">{activity.description}</p>
                    <p className="text-slate-400 dark:text-slate-500">by {activity.user}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
      )}
    </div>
  );
}
