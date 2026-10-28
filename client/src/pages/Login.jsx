import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Shield, Briefcase, UserCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);
    } catch (err) {
      error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsLoading(true);
    try {
      const user = await login(demoEmail, 'password123');
      success(`Logged in as ${user.name} (${user.role.toUpperCase()})`);
    } catch (err) {
      error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background ambient glow matching brand yellow & dark */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Logo */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl inline-block">
            <img 
              src="/logo.png" 
              alt="Smart Work Mart" 
              className="h-16 w-auto object-contain mx-auto"
            />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          CRM Enterprise Portal
        </h2>
        <p className="mt-1 text-sm font-semibold tracking-wider text-amber-400 uppercase">
          YOUR SEARCH ENDS HERE
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Corporate Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartworkmart.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Account Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 disabled:opacity-50 transition transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to CRM Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                One-Click Demo Profiles
              </span>
              <span className="text-[10px] text-slate-500 font-mono">pass: password123</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@smartworkmart.com')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                      System Admin
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Can create HRs & Employees + full data control
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
              </button>

              {/* HR Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('hr@smartworkmart.com')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-400 text-slate-950 font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-300 group-hover:text-sky-200">
                      HR Manager
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Can create Employees + full Sales capabilities
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition" />
              </button>

              {/* Employee / Sales Button */}
              <button
                type="button"
                onClick={() => handleQuickLogin('alex@smartworkmart.com')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-400 text-slate-950 font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                      Sales Representative
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Manage leads, deals, customers, activities
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
              </button>

            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Smart Work Mart. All rights reserved.
      </div>

    </div>
  );
}
