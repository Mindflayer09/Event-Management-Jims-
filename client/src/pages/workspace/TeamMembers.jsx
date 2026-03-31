import { useState, useEffect } from 'react';
import { getAllUsers, approveUser, deleteUser, updateUserRole } from '../../api/services/user.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// 🏆 Define Hierarchy Power Levels (Must match backend strings exactly)
const ROLE_POWER = {
  'super_admin': 4,
  'admin': 3,
  'sub-admin': 2,
  'user': 1,
  'volunteer': 1 // Including both in case your DB uses either
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'pending') params.isApproved = 'false';
      if (filter === 'approved') params.isApproved = 'true';

      const res = await getAllUsers({ ...params, limit: 100 });
      const fetchedUsers = Array.isArray(res) ? res : (res?.users || res?.data?.users || []);
      setUsers(fetchedUsers);
      
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleApprove = async (userToApprove) => {
    const position = window.prompt(
      `Enter a job title for ${userToApprove.name}:`, 
      'Volunteer'
    );
    if (position === null) return;

    try {
      await approveUser(userToApprove._id);
      toast.success(`${userToApprove.name} approved!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to approve');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Members</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">No users found.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0!">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Organization</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">App Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = user._id === currentUser?._id;
                
                // 🚀 HIERARCHY LOGIC
                const currentUserPower = ROLE_POWER[currentUser?.role] || 0;
                const targetUserPower = ROLE_POWER[user.role] || 0;
                
                // You can only take action if you are strictly higher in the food chain
                const canManage = currentUserPower > targetUserPower;

                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.name}
                      {isSelf && <span className="ml-2 text-xs text-indigo-600">(You)</span>}
                    </td>

                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500">{user.team?.name || '-'}</td>

                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        user.role === "super_admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <Badge className={user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* ✅ Only show Approve if target is lower power AND pending */}
                        {canManage && !user.isApproved && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(user)}
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}

                        {/* ✅ Only show Delete if target is lower power (Garv won't see this for Suraj) */}
                        {canManage && !isSelf && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(user._id)}
                          >
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}