import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Github, Chrome, ShieldCheck } from 'lucide-react';
import { useAuth } from './Context/Auth/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      setIsLoading(false);
      navigate('/assignments', { replace: true });
    } else {
      setIsLoading(false);
      toast.error(result.message);
    }
  };

  return (
    /* 1. Use flex items-center justify-center to center the content */
    <div className="min-h-screen w-full bg-[#F8FAFC] font-poppins flex items-center justify-center p-4 antialiased">

      {/* 2. Added a subtle background decoration to make the center card pop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-3xl"></div>
      </div>

      {/* 3. The Card Container */}
      <div className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:px-6 py-6">

        {/* Logo / Icon Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-5 border border-blue-100">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-2xl font-bold text-blue-700 font-bold tracking-wideat">Welcome Back
            in Intake Platform

          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="mb-2 ml-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Password
              </label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-12 pr-12 py-3.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">Remember me</label>
            </div>
            <Link to="/forgot-password" size="sm" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-3 transition-all group disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="tracking-tight font-medium p-">Sign In</span>
                {/* <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> */}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center border-t border-slate-100 pt-2">
          <p className="text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
              Sign up here
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;