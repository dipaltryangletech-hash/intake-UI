import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from './Context/Auth/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // Default to client internally
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);

    // Simulate small delay for UX
    setTimeout(async () => {
      const result = await signup({
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setIsLoading(false);

      if (result.success) {
        toast.success("Account created successfully! Please login.");
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-poppins flex items-center justify-center p-4 antialiased">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-3xl"></div>
      </div>

      {/* Card Container */}
      <div className="relative w-full max-w-[580px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:px-6 py-6">

        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Your Account</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Join the Intake Platform and start managing your assignments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Row 1: Full Name & Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Row 2: Password & Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-all  group disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="tracking-tight font-medium ">Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-2">
          <p className="text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;