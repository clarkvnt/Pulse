import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { projectApi, ApiError } from '../lib/api';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
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
import { Slider } from './ui/slider';

interface Project {
  id: number;
  name: string;
  progress: number;
  tasks: { completed: number; total: number };
  status: string;
  dueDate?: string;
  description?: string;
}

// Helper to format date for display (e.g., "Nov 3")
const formatDateForDisplay = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to format date for HTML date input (yyyy-MM-dd)
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  // Format as yyyy-MM-dd for HTML date input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to convert display date to ISO
const parseDateInput = (dateString: string): string => {
  if (!dateString) return '';
  // Try to parse various formats
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString();
};

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'Started' as 'Started' | 'In progress' | 'On track' | 'Almost done' | 'Completed',
    progress: 0,
  });

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getAll();
      if (response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    try {
      const response = await projectApi.create({
        name: formData.name,
        description: formData.description,
        dueDate: formData.dueDate ? parseDateInput(formData.dueDate) : undefined,
      });

      if (response.data) {
        toast.success('Project created successfully');
        await fetchProjects(); // Refresh list
        setIsAddDialogOpen(false);
        setFormData({ name: '', description: '', dueDate: '', status: 'Started', progress: 0 });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create project');
      }
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await projectApi.update(selectedProject.id, {
        name: formData.name,
        description: formData.description,
        dueDate: formData.dueDate ? parseDateInput(formData.dueDate) : '',
        status: formData.status,
        progress: formData.progress,
      });

      if (response.data) {
        toast.success('Project updated successfully');
        await fetchProjects(); // Refresh list
        setIsEditDialogOpen(false);
        setSelectedProject(null);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update project');
      }
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await projectApi.delete(selectedProject.id);
      toast.success('Project deleted successfully');
      await fetchProjects(); // Refresh list
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete project');
      }
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      dueDate: project.dueDate ? formatDateForInput(project.dueDate) : '',
      status: (project.status as 'Started' | 'In progress' | 'On track' | 'Almost done' | 'Completed') || 'Started',
      progress: project.progress || 0,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-12 min-h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 dark:text-slate-100 mb-1">Project Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Track and manage all your projects</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">No projects yet. Create your first project to get started.</div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Project Name</th>
                <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Status</th>
                <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Progress</th>
                <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Tasks</th>
                <th className="text-left px-6 py-4 text-slate-900 dark:text-slate-100">Due Date</th>
                <th className="text-right px-6 py-4 text-slate-900 dark:text-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4">
                    <p className="text-slate-900 dark:text-slate-100 font-medium">{project.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600 dark:text-slate-300">{project.status}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="h-2 w-32" />
                      <p className="text-slate-900 dark:text-slate-100">{project.progress}%</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      {project.tasks.completed}/{project.tasks.total}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-400 dark:text-slate-500">{project.dueDate ? formatDateForDisplay(project.dueDate) : '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(project)}>
                          <Pencil className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(project)}
                          className="text-red-600 dark:text-red-400"
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
      )}

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
            <DialogDescription>
              Create a new project. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="New Project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProject}>Add Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as 'Started' | 'In progress' | 'On track' | 'Almost done' | 'Completed',
                  })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Started">Started</SelectItem>
                  <SelectItem value="In progress">In Progress</SelectItem>
                  <SelectItem value="On track">On Track</SelectItem>
                  <SelectItem value="Almost done">Almost Done</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-progress">Progress: {formData.progress}%</Label>
              <div className="space-y-3">
                <Slider
                  id="edit-progress"
                  min={0}
                  max={100}
                  step={1}
                  value={[formData.progress]}
                  onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.progress}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      const clamped = Math.min(100, Math.max(0, val));
                      setFormData({ ...formData, progress: clamped });
                    }}
                    className="w-20"
                  />
                  <span className="text-sm text-slate-500">%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tasks (computed from project tasks)</Label>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Completed: {selectedProject?.tasks.completed || 0} / Total: {selectedProject?.tasks.total || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Task counts are automatically calculated from the project's tasks. Edit tasks to change these numbers.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProject?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
