import { Task } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { cn, getInitials } from '@/lib/utils';
import { AlertCircle, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityLabel = () => {
    return task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 cursor-pointer hover:shadow-md transition-shadow',
        isDragging && 'opacity-50',
        task.status === 'blocked' && 'border-red-300 bg-red-50/30'
      )}
      onClick={() => onEdit(task)}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. Status: ${task.status}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(task);
        }
      }}
    >
      <div className="flex items-start gap-2">
        <button
          className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-gray-600"
          aria-label="Drag to move task"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Priority and Blocker Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full text-white',
                getPriorityColor()
              )}
            >
              {getPriorityLabel()}
            </span>
            {task.status === 'blocked' && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-700">
                <AlertCircle className="w-3 h-3" />
                Blocked
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Blocker Details */}
          {task.blockerDetails && task.status === 'blocked' && (
            <div className="bg-red-100 border border-red-200 rounded p-2 mb-3">
              <p className="text-xs text-red-800 font-medium mb-1">Blocker:</p>
              <p className="text-xs text-red-700 line-clamp-2">{task.blockerDetails}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {/* Assignee Avatar */}
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                  {getInitials(task.assignee)}
                </div>
                <span className="text-gray-600">{task.assignee}</span>
              </div>
            </div>

            {/* Story Points */}
            <div className="flex items-center gap-1 text-gray-600">
              <span className="font-mono font-semibold">{task.storyPoints}</span>
              <span>SP</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
