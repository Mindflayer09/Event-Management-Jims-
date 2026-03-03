import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { Users, Calendar, ClipboardList, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalEvents: 0,
    totalTasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const selectedClub = localStorage.getItem('selectedClub');

      // 🚨 Block request if no club selected
      if (!selectedClub) {
        setError('No club selected');
        setLoading(false);
        return;
      }

      const response = await axios.get('/admin/stats');

      // Because interceptor returns response.data
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to load stats');
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 font-medium">
        {error}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      route: '/admin/users',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: UserCheck,
      color: 'bg-yellow-100 text-yellow-600',
      route: '/admin/users?filter=pending',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      route: '/admin/events',
    },
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: ClipboardList,
      color: 'bg-purple-100 text-purple-600',
      route: '/admin/tasks',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, route }) => (
          <Card
            key={label}
            onClick={() => navigate(route)}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}
              >
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