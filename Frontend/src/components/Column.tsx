import { useDrop } from 'react-dnd';
import { TaskCard } from './TaskCard';
import { AddTaskDialog } from './AddTaskDialog';
import { Button } from './ui/button';
import { MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { useState } from 'react';
import type { Column as ColumnType, Task } from '../App';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newColumnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, title: string) => void;
}

export function Column({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onDeleteColumn,
  onUpdateColumn
}: ColumnProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string }) => {
      onMoveTask(item.id, column.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdateColumn(column.id, editedTitle.trim());
    } else {
      setEditedTitle(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(column.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <>
      <div
        ref={drop}
        className={`flex-shrink-0 w-80 transition-colors ${
          isOver ? 'bg-slate-50' : ''
        }`}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-1">
            {isEditingTitle ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                className="h-7 border-0 bg-transparent px-0 focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h2 className="text-slate-900">{column.title}</h2>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 -mr-2">
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-slate-400">{tasks.length}</p>
        </div>

        <div className="space-y-3 min-h-[100px] max-h-[calc(100vh-280px)] overflow-y-auto">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>

        <AddTaskDialog columnId={column.id} onAddTask={onAddTask}>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-slate-400 hover:text-slate-600 hover:bg-transparent justify-start px-0"
          >
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </AddTaskDialog>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{column.title}"? This will also delete all {tasks.length} task(s) in this column. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteColumn(column.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
