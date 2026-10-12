'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { Role } from '@hostel/shared';

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    const success = await login(email, password || 'Password123!');
    setIsLoading(false);

    if (success) {
      router.push('/');
    } else {
      setError('Invalid credentials. Please try again or use a demo account below.');
    }
  };

  const handleQuickLogin = (role: Role) => {
    switchRole(role);
    router.push('/');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-md">
            🏛️
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            University Residential Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to access your role-specific hostel management dashboard
          </p>
        </div>

        {/* Credentials Form */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@university.edu"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In with University ID'}
            </button>
          </form>

          {/* 1-Click Role Demo Switcher Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or Quick Login as Demo Role
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click any persona below to immediately inspect their tailored interface:
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('STUDENT')}
                className="w-full p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>🎓</span>
                    <span>Student Portal (Aditya Manas)</span>
                  </div>
                  <div className="text-[11px] text-blue-800/80 font-mono">student@university.edu</div>
                </div>
                <span className="text-xs font-semibold text-blue-700">&rarr;</span>
              </button>

              <button
                onClick={() => handleQuickLogin('WARDEN')}
                className="w-full p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span>🏢</span>
                    <span>Hostel Warden (Dr. R. K. Verma &bull; Tagore Bhawan)</span>
                  </div>
                  <div className="text-[11px] text-indigo-800/80 font-mono">warden.tagore@university.edu</div>
                </div>
                <span className="text-xs font-semibold text-indigo-700">&rarr;</span>
              </button>

              <button
                onClick={() => handleQuickLogin('CHIEF_WARDEN')}
                className="w-full p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>⚖️</span>
                    <span>Chief Warden (Prof. S. K. Roy &bull; Cross-Hostel Oversight)</span>
                  </div>
                  <div className="text-[11px] text-amber-800/80 font-mono">chief.warden@university.edu</div>
                </div>
                <span className="text-xs font-semibold text-amber-700">&rarr;</span>
              </button>

              <button
                onClick={() => handleQuickLogin('ADMIN')}
                className="w-full p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>System Administrator (Inventory, Cycles & Runs)</span>
                  </div>
                  <div className="text-[11px] text-emerald-800/80 font-mono">admin@university.edu</div>
                </div>
                <span className="text-xs font-semibold text-emerald-700">&rarr;</span>
              </button>

              <button
                onClick={() => handleQuickLogin('DEAN')}
                className="w-full p-2.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-left flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <span>📊</span>
                    <span>Dean of Student Welfare (Analytics & Compliance)</span>
                  </div>
                  <div className="text-[11px] text-purple-800/80 font-mono">dean@university.edu</div>
                </div>
                <span className="text-xs font-semibold text-purple-700">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
