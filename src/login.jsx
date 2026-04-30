import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Github, Chrome, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
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
    
    const result = login(formData.email, formData.password);
    
    setTimeout(() => {
      setIsLoading(false);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        // Navigate to intended page or role default
        const from = location.state?.from?.pathname || (result.user.role === 'admin' ? '/clients' : '/clientportal');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message);
      }
    }, 1000);
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
      <div className="relative w-full max-w-[480px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-2 md:p-4">
        
        {/* Logo / Icon Header */}
        <div className="flex flex-col  items-center mb-10">
        
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">Enter your credentials to continue</p>
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
                className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-end mb-2 ml-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Password
              </label>
              <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.25rem] pl-12 pr-12 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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

          <div className="flex items-center gap-2 py-1">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">Remember for 30 days</label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-[1.25rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-200 group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="tracking-tight">Sign In to Dashboard</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Social Login Divider */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <span className="relative bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Or continue with
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm">
            <Chrome size={18} className="text-red-500" /> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm">
            <Github size={18} /> Github
          </button>
        </div>

        {/* <p className="text-center mt-8 text-sm text-slate-400 font-medium">
          New to the platform? {' '}
          <a href="#" className="text-blue-600 font-bold hover:underline underline-offset-4">Request Access</a>
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;