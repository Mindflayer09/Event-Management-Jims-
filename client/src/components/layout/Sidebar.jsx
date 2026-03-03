import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FolderOpen,
  CheckSquare,
  FileCheck,
  ListTodo,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/events', label: 'Manage Events', icon: Calendar },
  { to: '/admin/tasks', label: 'Manage Tasks', icon: ClipboardList },
];

const subAdminLinks = [
  { to: '/subadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subadmin/events', label: 'My Events', icon: FolderOpen },
  { to: '/subadmin/tasks', label: 'Delegate Tasks', icon: ListTodo },
  { to: '/subadmin/submissions', label: 'Review Submissions', icon: FileCheck },
];

const volunteerLinks = [
  { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/volunteer/tasks', label: 'My Tasks', icon: CheckSquare },
];

const linksByRole = {
  admin: adminLinks,
  'sub-admin': subAdminLinks,
  volunteer: volunteerLinks,
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="p-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
