import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      login(res.data.token, res.data.user);
      toast.success('Account created');
      navigate('/');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed');
    }
  };
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    <h1 className="text-2xl font-semibold">Create account</h1>
    <input className="w-full rounded-xl bg-white/5 p-3" placeholder="Name" {...register('name')} />
    <input className="w-full rounded-xl bg-white/5 p-3" placeholder="Email" {...register('email')} />
    <input type="password" className="w-full rounded-xl bg-white/5 p-3" placeholder="Password" {...register('password')} />
    <button className="w-full rounded-xl bg-blue-500 py-3 font-medium">Register</button>
    <p className="text-sm text-white/60">Have an account? <Link className="text-blue-400" to="/login">Login</Link></p>
  </form>;
}
