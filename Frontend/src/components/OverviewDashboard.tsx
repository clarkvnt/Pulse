import { TeamMembers } from './TeamMembers';
import { ProjectsOverview } from './ProjectsOverview';
import { RecentActivity } from './RecentActivity';
import { Users, FolderKanban, CheckCircle2, TrendingUp } from 'lucide-react';

export function OverviewDashboard() {
  const stats = [
    {
      id: 1,
      title: 'Total Team Members',
      value: '5',
      icon: Users,
      change: '+1 this month'
    },
    {
      id: 2,
      title: 'Active Projects',
      value: '4',
      icon: FolderKanban,
      change: '2 completed'
    },
    {
      id: 3,
      title: 'Tasks Completed',
      value: '110',
      icon: CheckCircle2,
      change: '+24 this week'
    },
    {
      id: 4,
      title: 'Team Progress',
      value: '87%',
      icon: TrendingUp,
      change: '+12% this month'
    }
  ];

  return (
    <div className="p-12">
      <div className="mb-12">
        <h2 className="text-slate-900 dark:text-slate-100 mb-1">Overview</h2>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening with your team today.</p>
      </div>

      <div className="space-y-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} className="border border-slate-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-slate-900 mb-2">{stat.value}</p>
                  <p className="text-slate-400">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Members */}
        <div>
          <div className="mb-6">
            <h3 className="text-slate-900 mb-1">Team Members</h3>
            <p className="text-slate-500">Your current team overview</p>
          </div>
          <TeamMembers />
        </div>

        {/* Projects and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2">
            <ProjectsOverview />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
