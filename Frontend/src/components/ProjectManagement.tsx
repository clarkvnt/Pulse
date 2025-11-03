import { useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
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
import { Slider } from './ui/slider';

interface Project {
  id: number;
  name: string;
  progress: number;
  tasks: { completed: number; total: number };
  status: string;
  dueDate: string;
}

const initialProjects: Project[] = [
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

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dueDate: '',
    totalTasks: 0,
    completedTasks: 0,
    progress: 0
  });

  const handleAddProject = () => {
    const newProject: Project = {
      id: Math.max(...projects.map(p => p.id)) + 1,
      name: formData.name,
      progress: formData.progress,
      tasks: { completed: formData.completedTasks, total: formData.totalTasks },
      status: formData.progress >= 80 ? 'Almost done' : formData.progress >= 50 ? 'On track' : 'Started',
      dueDate: formData.dueDate
    };
    
    setProjects([...projects, newProject]);
    setIsAddDialogOpen(false);
    setFormData({ name: '', dueDate: '', totalTasks: 0, completedTasks: 0, progress: 0 });
  };

  const handleEditProject = () => {
    if (!selectedProject) return;
    
    setProjects(projects.map(p => 
      p.id === selectedProject.id 
        ? {
            ...p,
            name: formData.name,
            dueDate: formData.dueDate,
            progress: formData.progress,
            tasks: { completed: formData.completedTasks, total: formData.totalTasks },
            status: formData.progress >= 80 ? 'Almost done' : formData.progress >= 50 ? 'On track' : 'Started'
          }
        : p
    ));
    setIsEditDialogOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;
    setProjects(projects.filter(p => p.id !== selectedProject.id));
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      dueDate: project.dueDate,
      totalTasks: project.tasks.total,
      completedTasks: project.tasks.completed,
      progress: project.progress
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-1">Project Management</h2>
          <p className="text-slate-500">Track and manage all your projects</p>
        </div>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="border border-slate-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-slate-900 mb-1">{project.name}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-slate-500">
                      {project.tasks.completed}/{project.tasks.total} tasks
                    </p>
                    <span className="text-slate-300">•</span>
                    <p className="text-slate-400">Due {project.dueDate}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(project)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(project)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600">{project.status}</p>
                  <p className="text-slate-900">{project.progress}%</p>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-slate-900">Project Name</th>
                <th className="text-left px-6 py-4 text-slate-900">Status</th>
                <th className="text-left px-6 py-4 text-slate-900">Progress</th>
                <th className="text-left px-6 py-4 text-slate-900">Tasks</th>
                <th className="text-left px-6 py-4 text-slate-900">Due Date</th>
                <th className="text-right px-6 py-4 text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{project.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600">{project.status}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="h-2 w-32" />
                      <p className="text-slate-900">{project.progress}%</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600">
                      {project.tasks.completed}/{project.tasks.total}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-400">{project.dueDate}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(project)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(project)}
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                placeholder="Dec 31"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalTasks">Total Tasks</Label>
              <Input
                id="totalTasks"
                type="number"
                value={formData.totalTasks}
                onChange={(e) => setFormData({ ...formData, totalTasks: parseInt(e.target.value) || 0 })}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completedTasks">Completed Tasks</Label>
              <Input
                id="completedTasks"
                type="number"
                value={formData.completedTasks}
                onChange={(e) => setFormData({ ...formData, completedTasks: parseInt(e.target.value) || 0 })}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label>Progress: {formData.progress}%</Label>
              <Slider
                value={[formData.progress]}
                onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                max={100}
                step={5}
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
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-totalTasks">Total Tasks</Label>
              <Input
                id="edit-totalTasks"
                type="number"
                value={formData.totalTasks}
                onChange={(e) => setFormData({ ...formData, totalTasks: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-completedTasks">Completed Tasks</Label>
              <Input
                id="edit-completedTasks"
                type="number"
                value={formData.completedTasks}
                onChange={(e) => setFormData({ ...formData, completedTasks: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Progress: {formData.progress}%</Label>
              <Slider
                value={[formData.progress]}
                onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
                max={100}
                step={5}
              />
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
