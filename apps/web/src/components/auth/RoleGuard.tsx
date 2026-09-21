'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '@hostel/shared';
import Link from 'next/link';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, switchRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xl mb-4">
          🔒
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          You must be logged in to access this page.
        </p>
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-xl mb-4">
          ⛔
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 max-w-md mb-4">
          Your current role (<strong>{user.role}</strong>) is not authorized to access this page. Required roles:{' '}
          {allowedRoles.join(', ')}.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => switchRole(allowedRoles[0]!)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-sm transition"
          >
            Switch to {allowedRoles[0]} Demo Account
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-md shadow-sm transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
