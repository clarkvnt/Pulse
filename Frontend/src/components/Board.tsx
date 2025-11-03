import { Column } from './Column';
import { AddColumnDialog } from './AddColumnDialog';
import type { Column as ColumnType, Task } from '../App';

interface BoardProps {
  columns: ColumnType[];
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newColumnId: string) => void;
  onAddColumn: (title: string, color: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, title: string) => void;
}

export function Board({
  columns,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumn
}: BoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          tasks={tasks.filter(task => task.columnId === column.id)}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
          onDeleteColumn={onDeleteColumn}
          onUpdateColumn={onUpdateColumn}
        />
      ))}
      <AddColumnDialog onAddColumn={onAddColumn} />
    </div>
  );
}
