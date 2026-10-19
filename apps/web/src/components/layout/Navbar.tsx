'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Role } from '@hostel/shared';

export function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [roleToast, setRoleToast] = useState<string | null>(null);

  // Role color mappings and icons
  const roleConfig: Record<Role, { label: string; badgeClass: string; icon: string; avatarBg: string }> = {
    STUDENT: {
      label: 'Student Portal',
      badgeClass: 'bg-blue-900/60 text-blue-200 border-blue-700/60',
      icon: '🎓',
      avatarBg: 'from-blue-600 to-indigo-600',
    },
    WARDEN: {
      label: 'Warden Portal',
      badgeClass: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/60',
      icon: '🏢',
      avatarBg: 'from-indigo-600 to-violet-600',
    },
    CHIEF_WARDEN: {
      label: 'Chief Warden',
      badgeClass: 'bg-amber-900/60 text-amber-200 border-amber-700/60',
      icon: '⚖️',
      avatarBg: 'from-amber-600 to-orange-600',
    },
    ADMIN: {
      label: 'Administrator',
      badgeClass: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60',
      icon: '⚙️',
      avatarBg: 'from-emerald-600 to-teal-600',
    },
    DEAN: {
      label: 'Dean of Welfare',
      badgeClass: 'bg-purple-900/60 text-purple-200 border-purple-700/60',
      icon: '📊',
      avatarBg: 'from-purple-600 to-pink-600',
    },
    SYSTEM_ADMIN: {
      label: 'System Admin',
      badgeClass: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60',
      icon: '⚙️',
      avatarBg: 'from-emerald-600 to-teal-600',
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
          { href: '/bedmap', label: 'Visual Bed Map' },
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
          { href: '/runs', label: 'Engine Runs' },
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

  // Helper for user initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Switch role handler with instant route transition to '/'
  const handleRoleSwitch = (r: Role) => {
    switchRole(r);
    setIsRoleMenuOpen(false);
    setIsMobileMenuOpen(false);

    const cfg = roleConfig[r];
    setRoleToast(`Switched to ${cfg.label}!`);
    setTimeout(() => setRoleToast(null), 3500);

    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">
                      Hostel Allocation Engine
                    </span>
                    {/* Live Cloud Status Pill */}
                    <span
                      className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                      title="Live Render Cloud API with MongoDB Atlas & Upstash Redis"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Cloud API Live
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block -mt-0.5 tracking-wider uppercase font-semibold">
                    National Institute of Technology &bull; Student Housing
                  </span>
                </div>
              </Link>

              {/* Dynamic Role Badge */}
              {isAuthenticated && (
                <span
                  className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.badgeClass}`}
                >
                  <span>{roleBadge.icon}</span>
                  <span>{roleBadge.label}</span>
                </span>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Bar: Quick Role Switcher + User Info */}
            <div className="flex items-center gap-2.5">
              {/* 1-Click Role Demo Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-200 border border-indigo-500/40 hover:border-indigo-400 transition shadow-sm"
                  title="Switch persona to test role-based portals"
                >
                  <span className="text-[11px] text-indigo-300 hidden sm:inline">Role:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>{roleBadge.icon}</span>
                    <span className="hidden sm:inline">{user?.role || 'Switch'}</span>
                  </span>
                  <span className="text-[10px] text-indigo-300">▼</span>
                </button>

                {isRoleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800">
                    <div className="px-3.5 py-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Demo Persona
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">
                        Immediately re-renders the portal for that role
                      </div>
                    </div>

                    <div className="py-1">
                      {(['STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'ADMIN', 'DEAN'] as Role[]).map((r) => {
                        const cfg = roleConfig[r];
                        const isSelected = user?.role === r;
                        return (
                          <button
                            key={r}
                            onClick={() => handleRoleSwitch(r)}
                            className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/70 transition ${
                              isSelected
                                ? 'font-bold bg-blue-600/15 text-blue-400 border-l-2 border-blue-500'
                                : 'text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{cfg.icon}</span>
                              <div>
                                <div className="font-semibold text-slate-200">{cfg.label}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {r === 'STUDENT' && 'Aditya Manas (12326241)'}
                                  {r === 'WARDEN' && 'Dr. R. K. Verma (Tagore)'}
                                  {r === 'CHIEF_WARDEN' && 'Prof. S. K. Roy'}
                                  {r === 'ADMIN' && 'System Administrator'}
                                  {r === 'DEAN' && 'Dr. Ananya Sen'}
                                </div>
                              </div>
                            </div>
                            {isSelected && <span className="text-blue-400 text-sm font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Logout */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  {/* Avatar Initial Circle */}
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-tr ${roleBadge.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-inner`}
                    title={`${user?.fullName} (${user?.email})`}
                  >
                    {getInitials(user?.fullName)}
                  </div>

                  <div className="hidden xl:block text-left text-xs">
                    <div className="font-bold text-slate-200 leading-tight truncate max-w-[120px]">
                      {user?.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono leading-tight">
                      {user?.role === 'STUDENT' ? `Reg: ${user?.studentRollNumber || '12326241'}` : user?.role}
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="px-2.5 py-1.5 rounded-md text-xs text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-900/40 transition font-medium"
                    title="Logout"
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

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2">
            <div className="py-1 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {roleBadge.label} Navigation
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                API Live
              </span>
            </div>

            {/* Quick Switch Roles on Mobile */}
            <div className="grid grid-cols-2 gap-1 py-1 border-b border-slate-800 mb-2">
              {(['STUDENT', 'WARDEN', 'CHIEF_WARDEN', 'ADMIN', 'DEAN'] as Role[]).map((r) => {
                const cfg = roleConfig[r];
                const isSelected = user?.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`p-2 rounded-lg text-xs font-semibold text-left flex items-center gap-1.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label.replace(' Portal', '')}</span>
                  </button>
                );
              })}
            </div>

            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Floating Role Switch Notification Toast */}
      {roleToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom-2 duration-150">
          <span className="text-emerald-400">✓</span>
          <span>{roleToast}</span>
        </div>
      )}
    </>
  );
}
