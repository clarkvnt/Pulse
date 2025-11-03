import { Progress } from './ui/progress';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';

const projects = [
  {
    id: 1,
    name: 'Mobile App Redesign',
    progress: 75,
    tasks: { completed: 18, total: 24 },
    status: 'On track',
    dueDate: 'Dec 15'
  },
  {
    id: 2,
    name: 'Marketing Campaign',
    progress: 45,
    tasks: { completed: 9, total: 20 },
    status: 'In progress',
    dueDate: 'Dec 22'
  },
  {
    id: 3,
    name: 'API Development',
    progress: 90,
    tasks: { completed: 27, total: 30 },
    status: 'Almost done',
    dueDate: 'Dec 8'
  },
  {
    id: 4,
    name: 'Documentation',
    progress: 30,
    tasks: { completed: 6, total: 20 },
    status: 'Started',
    dueDate: 'Jan 5'
  }
];

export function ProjectsOverview() {
  return (
    <div className="border border-slate-200 rounded-lg p-8 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-slate-900 mb-1">Active Projects</h3>
        <p className="text-slate-500">Track your project progress</p>
      </div>

      <div className="space-y-6 flex-1">
        {projects.map((project) => (
          <div key={project.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-slate-900">{project.name}</h4>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mr-2">
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-slate-500">
                    {project.tasks.completed}/{project.tasks.total} tasks
                  </p>
                  <span className="text-slate-300">•</span>
                  <p className="text-slate-400">Due {project.dueDate}</p>
                </div>
              </div>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
