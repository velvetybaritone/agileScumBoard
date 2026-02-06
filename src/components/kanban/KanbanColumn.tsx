import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export function KanbanColumn({ column, tasks, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case 'backlog':
        return 'bg-gray-100 border-gray-300';
      case 'todo':
        return 'bg-blue-50 border-blue-300';
      case 'in-progress':
        return 'bg-amber-50 border-amber-300';
      case 'blocked':
        return 'bg-red-50 border-red-300';
      case 'done':
        return 'bg-green-50 border-green-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      <div className={cn(
        'px-4 py-3 rounded-t-lg border-t border-x',
        getColumnColor(column.id)
      )}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900">{column.title}</h3>
          <span className="text-xs font-medium bg-white/60 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 border-x border-b rounded-b-lg p-3 space-y-3 min-h-[500px] transition-colors',
          isOver ? 'bg-blue-100/50 border-blue-400' : 'bg-white border-gray-200'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No tasks
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
