import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { teamApi, ApiError } from '../lib/api';
import { toast } from 'sonner';
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

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    avatar: 'bg-slate-900',
    tasksCompleted: 0
  });
  const [customRole, setCustomRole] = useState('');

  // Fetch team members on mount
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getAll();
      if (response.data) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await teamApi.create({
      name: formData.name,
        role: formData.role === 'Other' ? customRole : formData.role,
        email: formData.email,
        avatar: formData.avatar,
      });
    
      if (response.data) {
        toast.success('Team member added successfully');
        setMembers([...members, response.data as TeamMember]);
    setIsAddDialogOpen(false);
        setFormData({ name: '', role: '', email: '', avatar: 'bg-slate-900', tasksCompleted: 0 });
        setCustomRole('');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add team member');
      }
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;
    
    try {
      const response = await teamApi.update(selectedMember.id, {
        name: formData.name,
        role: formData.role === 'Other' ? customRole : formData.role,
        email: formData.email,
        avatar: formData.avatar,
        tasksCompleted: formData.tasksCompleted,
      });

      if (response.data) {
        toast.success('Team member updated successfully');
    setMembers(members.map(m => 
          m.id === selectedMember.id ? response.data as TeamMember : m
    ));
    setIsEditDialogOpen(false);
    setSelectedMember(null);
        setCustomRole('');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update team member');
      }
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      await teamApi.delete(selectedMember.id);
      toast.success('Team member deleted successfully');
    setMembers(members.filter(m => m.id !== selectedMember.id));
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete team member');
      }
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member);
    // Check if role is in the predefined list, otherwise set to "Other"
    const predefinedRoles = [
      'Product Designer', 'UX Designer', 'UI Designer', 'Frontend Developer',
      'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'QA Engineer',
      'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst',
      'Data Analyst', 'Marketing Lead', 'Sales Representative', 'HR Manager',
      'Content Writer', 'Graphic Designer'
    ];
    const isPredefined = predefinedRoles.includes(member.role);
    
    setFormData({
      name: member.name,
      role: isPredefined ? member.role : 'Other',
      email: member.email,
      avatar: member.avatar,
      tasksCompleted: member.tasksCompleted
    });
    setCustomRole(isPredefined ? '' : member.role);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-12 min-h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 mb-1">Team Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your team members and their roles</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Member</th>
              <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Role</th>
              <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Email</th>
              <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Tasks</th>
              <th className="text-right px-6 py-4 text-slate-900 dark:text-slate-100">Actions</th>
            </tr>
          </thead>
          <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Loading team members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No team members yet. Add your first member to get started.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
              <tr key={member.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${member.avatar} rounded-full flex items-center justify-center`}>
                      <span className="text-white">{member.initials}</span>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100">{member.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600 dark:text-slate-300">{member.role}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600 dark:text-slate-300">{member.email}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-600 dark:text-slate-300">{member.tasksCompleted}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(member)}>
                        <Pencil className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(member)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
              ))
            )}
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
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Designer">Product Designer</SelectItem>
                  <SelectItem value="UX Designer">UX Designer</SelectItem>
                  <SelectItem value="UI Designer">UI Designer</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                  <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Scrum Master">Scrum Master</SelectItem>
                  <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="Marketing Lead">Marketing Lead</SelectItem>
                  <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Content Writer">Content Writer</SelectItem>
                  <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formData.role === 'Other' && (
              <Input
                  placeholder="Enter custom role"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
              />
              )}
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
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Product Designer">Product Designer</SelectItem>
                  <SelectItem value="UX Designer">UX Designer</SelectItem>
                  <SelectItem value="UI Designer">UI Designer</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                  <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="Scrum Master">Scrum Master</SelectItem>
                  <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="Marketing Lead">Marketing Lead</SelectItem>
                  <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Content Writer">Content Writer</SelectItem>
                  <SelectItem value="Graphic Designer">Graphic Designer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formData.role === 'Other' && (
              <Input
                  placeholder="Enter custom role"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
              />
              )}
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
            <div className="space-y-2">
              <Label htmlFor="edit-tasksCompleted">Tasks Completed</Label>
              <Input
                id="edit-tasksCompleted"
                type="number"
                min="0"
                value={formData.tasksCompleted}
                onChange={(e) => setFormData({ ...formData, tasksCompleted: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
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
