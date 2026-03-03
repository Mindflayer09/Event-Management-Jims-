import { useState, useEffect } from 'react';
import { getAllTasks, createTask, deleteTask } from '../../api/services/task.service';
import { getAllEvents } from '../../api/services/event.service';
import { getAllUsers } from '../../api/services/user.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  event: z.string().min(1, 'Select an event'),
  assignedTo: z.string().min(1, 'Select a user'),
  deadline: z.string().min(1, 'Set a deadline'),
  priority: z.string().optional(),
  phase: z.string().min(1, 'Select a phase'),
});

export default function DelegateTasks() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tasksRes, eventsRes, usersRes] = await Promise.all([
        getAllTasks({ limit: 100 }),
        getAllEvents({ limit: 100 }),
        getAllUsers({ isApproved: 'true', role: 'volunteer', limit: 100 }),
      ]);
      setTasks(tasksRes.data.tasks);
      setEvents(eventsRes.data.events);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const onSubmit = async (data) => {
    try {
      await createTask(data);
      toast.success('Task created and assigned');
      setShowModal(false);
      reset();
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delegate Tasks</h1>
        <Button onClick={() => { reset({ title: '', description: '', event: '', assignedTo: '', deadline: '', priority: 'medium', phase: '' }); setShowModal(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <Card><p className="text-gray-500 text-center py-8">No tasks yet. Create and assign tasks to volunteers.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task._id}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
                <Badge className={STATUS_COLORS[task.status]}>{task.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{task.description}</p>
              <div className="space-y-1 text-xs text-gray-400 mb-3">
                <p>Assigned to: {task.assignedTo?.name}</p>
                <p>Deadline: {formatDate(task.deadline)}</p>
                <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
              </div>
              <Button size="sm" variant="danger" onClick={() => handleDelete(task._id)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Task" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" {...register('description')} />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>
          <Select label="Event" placeholder="Select event" options={events.map((e) => ({ value: e._id, label: e.title }))} error={errors.event?.message} {...register('event')} />
          <Select label="Assign To" placeholder="Select volunteer" options={users.map((u) => ({ value: u._id, label: u.name }))} error={errors.assignedTo?.message} {...register('assignedTo')} />
          <Input label="Deadline" type="datetime-local" error={errors.deadline?.message} {...register('deadline')} />
          <Select label="Priority" options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} {...register('priority')} />
          <Select label="Phase" placeholder="Select phase" options={[{ value: 'pre-event', label: 'Pre-Event' }, { value: 'during-event', label: 'During Event' }, { value: 'post-event', label: 'Post-Event' }]} error={errors.phase?.message} {...register('phase')} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
