import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Calendar, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login({ onSuccess, switchToRegister }) {
  const { login, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Dashboard route mapping
  const getDashboardRoute = (role) => {
    const routes = {
      admin: '/admin/dashboard',
      'sub-admin': '/subadmin/dashboard',
      volunteer: '/volunteer/dashboard',
    };
    return routes[role] || '/';
  };

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate(getDashboardRoute(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const user = await login(data.email, data.password);

      toast.success('Login successful!');

      if (onSuccess) {
        onSuccess(); // close modal
      } else {
        navigate(getDashboardRoute(user.role));
      }

    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Header */}
      <div className="text-center mb-6">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600"
        >
          <Calendar className="h-7 w-7" />
          ClubEvents
        </Link>

        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Don't have an account?{" "}
          {switchToRegister ? (
            <button
              onClick={switchToRegister}
              className="text-indigo-600 font-medium hover:underline"
            >
              Register
            </button>
          ) : (
            <Link
              to="/register"
              className="text-indigo-600 font-medium hover:underline"
            >
              Register
            </Link>
          )}
        </p>

      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <div className="relative">

            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Password
            </label>

            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-600`}
              {...register('password')}
            />

            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}

          </div>

          {/* Forgot Password */}
          <div className="text-right text-sm">
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>

        </form>

      </div>
    </div>
  );
}