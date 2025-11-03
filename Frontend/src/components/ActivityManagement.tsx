import { CheckCircle2, MessageSquare, UserPlus, FileText, Filter } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useState } from 'react';

interface Activity {
  id: number;
  type: 'task' | 'comment' | 'member' | 'document';
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  time: string;
  color: string;
  user: string;
}

const allActivities: Activity[] = [
  {
    id: 1,
    type: 'task',
    icon: CheckCircle2,
    title: 'Task completed',
    description: 'Design system updates',
    time: '5m ago',
    color: 'bg-slate-900',
    user: 'Sarah Johnson'
  },
  {
    id: 2,
    type: 'comment',
    icon: MessageSquare,
    title: 'New comment',
    description: 'On Mobile App Redesign',
    time: '12m ago',
    color: 'bg-slate-600',
    user: 'Michael Chen'
  },
  {
    id: 3,
    type: 'member',
    icon: UserPlus,
    title: 'Team member added',
    description: 'Sarah joined the team',
    time: '1h ago',
    color: 'bg-slate-600',
    user: 'System'
  },
  {
    id: 4,
    type: 'document',
    icon: FileText,
    title: 'Document uploaded',
    description: 'Q4 roadmap.pdf',
    time: '2h ago',
    color: 'bg-slate-600',
    user: 'Emily Davis'
  },
  {
    id: 5,
    type: 'task',
    icon: CheckCircle2,
    title: 'Task completed',
    description: 'API integration testing',
    time: '3h ago',
    color: 'bg-slate-900',
    user: 'James Wilson'
  },
  {
    id: 6,
    type: 'comment',
    icon: MessageSquare,
    title: 'New comment',
    description: 'On Marketing Campaign',
    time: '4h ago',
    color: 'bg-slate-600',
    user: 'Lisa Anderson'
  },
  {
    id: 7,
    type: 'document',
    icon: FileText,
    title: 'Document uploaded',
    description: 'Sprint planning notes.pdf',
    time: '5h ago',
    color: 'bg-slate-600',
    user: 'Michael Chen'
  },
  {
    id: 8,
    type: 'task',
    icon: CheckCircle2,
    title: 'Task completed',
    description: 'User research interviews',
    time: '6h ago',
    color: 'bg-slate-900',
    user: 'James Wilson'
  }
];

export function ActivityManagement() {
  const [filterType, setFilterType] = useState<string>('all');
  
  const filteredActivities = filterType === 'all' 
    ? allActivities 
    : allActivities.filter(activity => activity.type === filterType);

  return (
    <div className="p-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-1">Activity Log</h2>
          <p className="text-slate-500">Monitor all team activities and updates</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
              <SelectItem value="member">Team</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg">
        <div className="divide-y divide-slate-100">
          {filteredActivities.map((activity) => {
            const Icon = activity.icon;
            
            return (
              <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 ${activity.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="text-slate-900">{activity.title}</p>
                      <p className="text-slate-400 whitespace-nowrap">{activity.time}</p>
                    </div>
                    <p className="text-slate-600 mb-1">{activity.description}</p>
                    <p className="text-slate-400">by {activity.user}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 border border-slate-200 rounded-lg">
          <p className="text-slate-500">No activities found for this filter</p>
        </div>
      )}
    </div>
  );
}
