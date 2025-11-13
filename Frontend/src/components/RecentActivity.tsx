import { CheckCircle2, MessageSquare, UserPlus, FileText } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'task',
    icon: CheckCircle2,
    title: 'Task completed',
    description: 'Design system updates',
    time: '5m ago',
    color: 'bg-slate-900'
  },
  {
    id: 2,
    type: 'comment',
    icon: MessageSquare,
    title: 'New comment',
    description: 'On Mobile App Redesign',
    time: '12m ago',
    color: 'bg-slate-600'
  },
  {
    id: 3,
    type: 'member',
    icon: UserPlus,
    title: 'Team member added',
    description: 'Sarah joined the team',
    time: '1h ago',
    color: 'bg-slate-600'
  },
  {
    id: 4,
    type: 'document',
    icon: FileText,
    title: 'Document uploaded',
    description: 'Q4 roadmap.pdf',
    time: '2h ago',
    color: 'bg-slate-600'
  },
  {
    id: 5,
    type: 'task',
    icon: CheckCircle2,
    title: 'Task completed',
    description: 'API integration testing',
    time: '3h ago',
    color: 'bg-slate-900'
  }
];

export function RecentActivity() {
  return (
    <div className="border border-slate-200 rounded-lg p-8 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-slate-900 mb-1">Recent Activity</h3>
        <p className="text-slate-500">Latest updates from your team</p>
      </div>

      <div className="space-y-4 flex-1">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex gap-3">
              <div className={`flex-shrink-0 w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900">{activity.title}</p>
                <p className="text-slate-500 truncate">{activity.description}</p>
              </div>
              <div className="flex-shrink-0">
                <p className="text-slate-400">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
