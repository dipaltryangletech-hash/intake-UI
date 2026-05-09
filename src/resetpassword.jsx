import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-poppins flex items-center justify-center p-4 antialiased relative overflow-hidden">

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6">

        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
            {isSuccess ? <CheckCircle2 size={28} /> : <Lock size={28} />}
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isSuccess ? "Password Updated" : "Reset Password"}
          </h2>
          <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed">
            {isSuccess
              ? "Your password has been reset successfully. You can now sign in with your new credentials."
              : "Please enter and confirm your new password below. Make sure it's secure!"}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-12 py-3.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Confirm New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-12 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100"
            >
              Back to Login
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* <p className="mt-8 text-center text-xs text-slate-400 font-medium">
          Need help? 
        </p> */}
      </div>
    </div>
  );
};

export default ResetPassword;
