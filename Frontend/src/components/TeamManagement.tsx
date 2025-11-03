import { useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  initials: string;
  tasksCompleted: number;
  avatar: string;
}

const initialMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Product Designer',
    email: 'sarah.j@company.com',
    initials: 'SJ',
    tasksCompleted: 24,
    avatar: 'bg-slate-900'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Frontend Developer',
    email: 'michael.c@company.com',
    initials: 'MC',
    tasksCompleted: 18,
    avatar: 'bg-slate-700'
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Backend Developer',
    email: 'emily.d@company.com',
    initials: 'ED',
    tasksCompleted: 31,
    avatar: 'bg-slate-600'
  },
  {
    id: 4,
    name: 'James Wilson',
    role: 'UX Researcher',
    email: 'james.w@company.com',
    initials: 'JW',
    tasksCompleted: 15,
    avatar: 'bg-slate-700'
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    role: 'Marketing Lead',
    email: 'lisa.a@company.com',
    initials: 'LA',
    tasksCompleted: 22,
    avatar: 'bg-slate-600'
  }
];

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    avatar: 'bg-slate-900'
  });

  const handleAddMember = () => {
    const initials = formData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    
    const newMember: TeamMember = {
      id: Math.max(...members.map(m => m.id)) + 1,
      name: formData.name,
      role: formData.role,
      email: formData.email,
      initials,
      tasksCompleted: 0,
      avatar: formData.avatar
    };
    
    setMembers([...members, newMember]);
    setIsAddDialogOpen(false);
    setFormData({ name: '', role: '', email: '', avatar: 'bg-slate-900' });
  };

  const handleEditMember = () => {
    if (!selectedMember) return;
    
    const initials = formData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    
    setMembers(members.map(m => 
      m.id === selectedMember.id 
        ? { ...m, name: formData.name, role: formData.role, email: formData.email, initials, avatar: formData.avatar }
        : m
    ));
    setIsEditDialogOpen(false);
    setSelectedMember(null);
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;
    setMembers(members.filter(m => m.id !== selectedMember.id));
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      avatar: member.avatar
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-1">Team Management</h2>
          <p className="text-slate-500">Manage your team members and their roles</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-slate-900">Member</th>
              <th className="text-left px-6 py-4 text-slate-900">Role</th>
              <th className="text-left px-6 py-4 text-slate-900">Email</th>
              <th className="text-left px-6 py-4 text-slate-900">Tasks Completed</th>
              <th className="text-right px-6 py-4 text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-slate-100 last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${member.avatar} rounded-full flex items-center justify-center`}>
                      <span className="text-white">{member.initials}</span>
                    </div>
                    <div>
                      <p className="text-slate-900">{member.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600">{member.role}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600">{member.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600">{member.tasksCompleted}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(member)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(member)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your team. Fill in their details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar Color</Label>
              <Select value={formData.avatar} onValueChange={(value) => setFormData({ ...formData, avatar: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-slate-900">Dark</SelectItem>
                  <SelectItem value="bg-slate-700">Medium</SelectItem>
                  <SelectItem value="bg-slate-600">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update the member's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Avatar Color</Label>
              <Select value={formData.avatar} onValueChange={(value) => setFormData({ ...formData, avatar: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-slate-900">Dark</SelectItem>
                  <SelectItem value="bg-slate-700">Medium</SelectItem>
                  <SelectItem value="bg-slate-600">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.name} from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
