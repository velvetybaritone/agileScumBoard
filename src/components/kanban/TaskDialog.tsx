import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useTaskStore } from '@/lib/stores/taskStore';
import { Task, TaskPriority, TaskStatus, STORAGE_KEYS, User } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const { session } = useAuthStore();
  const { addTask, updateTask, deleteTask } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [storyPoints, setStoryPoints] = useState('3');
  const [assignee, setAssignee] = useState('');
  const [blockerDetails, setBlockerDetails] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  // Load team members for the tenant
  useEffect(() => {
    if (session?.tenantId) {
      const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
      if (usersData) {
        const users = JSON.parse(usersData) as Record<string, User>;
        const members = Object.values(users)
          .filter((u) => u.tenantId === session.tenantId)
          .map((u) => u.username);
        setTeamMembers(members);
      }
    }
  }, [session?.tenantId]);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setStoryPoints(task.storyPoints.toString());
      setAssignee(task.assignee);
      setBlockerDetails(task.blockerDetails || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('backlog');
      setStoryPoints('3');
      setAssignee(session?.username || '');
      setBlockerDetails('');
    }
  }, [task, session?.username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) return;

    const taskData = {
      title,
      description,
      priority,
      status,
      storyPoints: parseInt(storyPoints) || 0,
      assignee,
      blockerDetails: status === 'blocked' ? blockerDetails : undefined,
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData, session.tenantId);
    }

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (task && session && confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id, session.tenantId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details below' : 'Fill in the task details below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Implement user authentication"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Story Points */}
            <div className="space-y-2">
              <Label htmlFor="storyPoints">Story Points *</Label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                required
              />
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee *</Label>
              {teamMembers.length > 0 ? (
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              )}
            </div>
          </div>

          {/* Blocker Details (shown only when status is blocked) */}
          {status === 'blocked' && (
            <div className="space-y-2">
              <Label htmlFor="blockerDetails">Blocker Details</Label>
              <Textarea
                id="blockerDetails"
                value={blockerDetails}
                onChange={(e) => setBlockerDetails(e.target.value)}
                placeholder="Describe what's blocking this task..."
                rows={3}
                className="border-red-300 focus:border-red-400"
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            {task && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? 'Update' : 'Create'} Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
