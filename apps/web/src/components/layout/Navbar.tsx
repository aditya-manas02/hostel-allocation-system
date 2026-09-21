'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Role } from '@hostel/shared';

export function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  // Role color mappings
  const roleConfig: Record<Role, { label: string; badgeClass: string; icon: string }> = {
    STUDENT: {
      label: 'Student Portal',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: '🎓',
    },
    WARDEN: {
      label: 'Warden Portal',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: '🏢',
    },
    CHIEF_WARDEN: {
      label: 'Chief Warden',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '⚖️',
    },
    ADMIN: {
      label: 'Administrator',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '⚙️',
    },
    DEAN: {
      label: 'Dean of Student Welfare',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '📊',
    },
    SYSTEM_ADMIN: {
      label: 'System Administrator',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '⚙️',
    },
  };

  // Dynamic Navigation Items per Role
  const getNavLinks = (role?: Role) => {
    switch (role) {
      case 'STUDENT':
        return [
          { href: '/', label: 'Overview' },
          { href: '/apply', label: 'Apply' },
          { href: '/eligibility', label: 'Eligibility' },
          { href: '/preferences', label: 'Preferences' },
          { href: '/questionnaire', label: 'Lifestyle Survey' },
          { href: '/result', label: 'Allotment Order' },
        ];
      case 'WARDEN':
        return [
          { href: '/', label: 'Overview' },
          { href: '/bedmap', label: 'Bed Map' },
        ];
      case 'CHIEF_WARDEN':
        return [
          { href: '/', label: 'Overview' },
          { href: '/escalations', label: 'Escalations Queue' },
          { href: '/bedmap', label: 'Cross-Hostel Map' },
          { href: '/runs', label: 'Run History' },
        ];
      case 'ADMIN':
        return [
          { href: '/', label: 'Overview' },
          { href: '/inventory', label: 'Inventory' },
          { href: '/cycles', label: 'Cycles' },
          { href: '/runs', label: 'Runs' },
          { href: '/verifications', label: 'Verifications' },
          { href: '/reports', label: 'Reports' },
        ];
      case 'DEAN':
        return [
          { href: '/', label: 'Overview' },
          { href: '/analytics', label: 'Institutional Analytics' },
          { href: '/reports', label: 'Reports & CSV' },
          { href: '/runs', label: 'Run History' },
        ];
      default:
        return [{ href: '/', label: 'Home' }];
    }
  };

  const navLinks = getNavLinks(user?.role);
  const currentRole = user?.role || 'STUDENT';
  const roleBadge = roleConfig[currentRole];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
                🏛️
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  Hostel Allocation Engine
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 tracking-wider uppercase font-semibold">
                  National Institute of Technology
                </span>
              </div>
            </Link>

            {/* Dynamic Role Badge */}
            {isAuthenticated && (
              <span
                className={`ml-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.badgeClass}`}
              >
                <span>{roleBadge.icon}</span>
                <span>{roleBadge.label}</span>
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar: Quick Role Switcher + User Info */}
          <div className="flex items-center gap-3">
            {/* 1-Click Role Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                title="Switch role view for live demonstration"
              >
                <span>Switch Role</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Demo Personas
                  </div>
                  {(['STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'ADMIN', 'DEAN'] as Role[]).map((r) => {
                    const cfg = roleConfig[r];
                    const isSelected = user?.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          isSelected ? 'font-bold bg-blue-50/60 text-blue-900' : 'text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </span>
                        {isSelected && <span className="text-blue-600 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Details & Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                    {user?.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 rounded text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 border border-rose-900/50 transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
