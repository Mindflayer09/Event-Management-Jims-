import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getClubs } from '../../api/services/club.service';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { Calendar } from 'lucide-react';
import axios from 'axios';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  club: z.string().min(1, 'Please select a club'),
  adminSecret: z.string().min(1, 'Admin secret key is required'),
});

export default function RegisterAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await getClubs();
        setClubs(res.data.clubs);
      } catch (err) {
        toast.error('Failed to load clubs');
      }
    };
    fetchClubs();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/register-admin', data);
      toast.success('Admin registered successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-indigo-600">
            <Calendar className="h-7 w-7" />
            ClubEvents
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Admin Registration</h2>
          <p className="mt-2 text-sm text-gray-500">
            Only authorized personnel can register as admin
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Admin Name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            <Select
              label="Club"
              placeholder="Select a club"
              options={clubs.map((c) => ({ value: c._id, label: c.name }))}
              error={errors.club?.message}
              {...register('club')}
            />
            <Input
              label="Admin Secret Key"
              type="password"
              placeholder="Enter secret key"
              error={errors.adminSecret?.message}
              {...register('adminSecret')}
            />
            <Button type="submit" loading={loading} className="w-full">
              Register Admin
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}