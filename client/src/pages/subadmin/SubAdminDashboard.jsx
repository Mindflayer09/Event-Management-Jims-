import { useState, useEffect } from 'react';
import { getAllEvents } from '../../api/services/event.service';
import { getAllTasks } from '../../api/services/task.service';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { Calendar, ClipboardList, FileCheck } from 'lucide-react';

export default function SubAdminDashboard() {
  const [stats, setStats] = useState({ events: 0, tasks: 0, pendingReview: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, tasksRes, submittedRes] = await Promise.all([
          getAllEvents({ limit: 1 }),
          getAllTasks({ limit: 1 }),
          getAllTasks({ status: 'submitted', limit: 1 }),
        ]);
        setStats({
          events: eventsRes.data.pagination.totalItems,
          tasks: tasksRes.data.pagination.totalItems,
          pendingReview: submittedRes.data.pagination.totalItems,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const cards = [
    { label: 'My Events', value: stats.events, icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Tasks', value: stats.tasks, icon: ClipboardList, color: 'bg-green-100 text-green-600' },
    { label: 'Pending Review', value: stats.pendingReview, icon: FileCheck, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sub-Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
