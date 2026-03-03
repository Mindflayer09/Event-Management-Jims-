import { useState, useEffect } from 'react';
import { getAllTasks } from '../../api/services/task.service';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';

export default function VolunteerDashboard() {
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allRes, approvedRes, pendingRes] = await Promise.all([
          getAllTasks({ limit: 1 }),
          getAllTasks({ status: 'approved', limit: 1 }),
          getAllTasks({ status: 'pending', limit: 1 }),
        ]);
        setStats({
          total: allRes.data.pagination.totalItems,
          completed: approvedRes.data.pagination.totalItems,
          pending: pendingRes.data.pagination.totalItems,
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
    { label: 'Total Tasks', value: stats.total, icon: ClipboardList, color: 'bg-blue-100 text-blue-600' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Dashboard</h1>
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
