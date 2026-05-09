import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success("Reset link sent to your email!");
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
            {isSent ? <CheckCircle2 size={28} /> : <ShieldCheck size={28} />}
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isSent ? "Check your email" : "Forgot Password?"}
          </h2>
          <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed">
            {isSent
              ? `We've sent a password reset link to ${email}`
              : "No worries, it happens! Enter your email below and we'll send you a reset link."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest py-2 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => window.open('https://gmail.com', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-100"
            >
              Open Email App
            </button>
            <p className="text-center text-xs text-slate-400 font-medium pt-2 py-2">
              Didn't receive the email? <button onClick={handleSubmit} className="text-blue-600 font-bold hover:underline">Click to resend</button>
            </p>
          </div>
        )}

        <div className="mt-3 pt-6 border-t border-slate-50">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
