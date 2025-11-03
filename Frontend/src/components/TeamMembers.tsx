import { CheckCircle2 } from 'lucide-react';

const members = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Product Designer',
    initials: 'SJ',
    tasksCompleted: 24,
    avatar: 'bg-slate-900'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Frontend Developer',
    initials: 'MC',
    tasksCompleted: 18,
    avatar: 'bg-slate-700'
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Backend Developer',
    initials: 'ED',
    tasksCompleted: 31,
    avatar: 'bg-slate-600'
  },
  {
    id: 4,
    name: 'James Wilson',
    role: 'UX Researcher',
    initials: 'JW',
    tasksCompleted: 15,
    avatar: 'bg-slate-700'
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    role: 'Marketing Lead',
    initials: 'LA',
    tasksCompleted: 22,
    avatar: 'bg-slate-600'
  }
];

export function TeamMembers() {
  return (
    <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-6 pb-2">
        {members.map((member) => (
          <div key={member.id} className="border border-slate-200 rounded-lg p-6 flex-shrink-0 w-64">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 ${member.avatar} rounded-full flex items-center justify-center mb-4`}>
                <span className="text-white">{member.initials}</span>
              </div>
              <h3 className="text-slate-900 mb-1">{member.name}</h3>
              <p className="text-slate-500 mb-6">{member.role}</p>
              
              <div className="w-full pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <p className="text-slate-900">{member.tasksCompleted} tasks</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
