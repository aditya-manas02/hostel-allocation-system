'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { fetchCampusOccupancy, OccupancyResponse } from '../lib/api';

export default function HomePage() {
  const { user, isAuthenticated, switchRole } = useAuth();
  const [occupancyData, setOccupancyData] = useState<OccupancyResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    // Attempt to fetch live campus occupancy stats from Cloud API
    setIsLoadingStats(true);
    fetchCampusOccupancy()
      .then((data) => setOccupancyData(data))
      .catch((err) => {
        console.info('[LiveStats] Using cached fallback stats:', err.message);
      })
      .finally(() => setIsLoadingStats(false));
  }, []);

  // Total bed counts with live API fallback
  const totalBeds = occupancyData?.summary.totalCampusBeds ?? 8015;
  const occupiedBeds = occupancyData?.summary.totalOccupiedBeds ?? 7559;
  const occupancyPct = occupancyData?.summary.campusOccupancyPercentage ?? 94.3;

  // ==========================================
  // 0. UNAUTHENTICATED HERO LANDING
  // ==========================================
  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-[88vh] flex flex-col justify-center px-4 py-12 max-w-7xl mx-auto">
        <div className="space-y-10 text-center max-w-4xl mx-auto">
          {/* Institution Header Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-800 border border-blue-200/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>National Institute of Technology &bull; Residential Life Management</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Policy-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Hostel Allocation</span> &amp; Roommate Matching
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Deterministic, explainable room allotment powered by a multi-pass heuristic engine,
              AES-256-GCM encrypted lifestyle questionnaire compatibility scoring, and SHA-256 tamper-evident audit logs.
            </p>
          </div>

          {/* Live Campus Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalBeds.toLocaleString()}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Total Campus Beds</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">2,960</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Residential Rooms</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">1.445s</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Allocation Engine Time</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">0</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Constraint Violations</div>
            </div>
          </div>

          {/* Quick Demo Personas Selection */}
          <div className="pt-4 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select a Role Persona to Explore Portal Features:
              </h2>
              <span className="text-xs text-slate-500 hidden sm:inline">1-Click Instant Demo Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* Student */}
              <button
                onClick={() => switchRole('STUDENT')}
                className="p-5 rounded-xl border border-blue-200/90 bg-white hover:bg-blue-50/60 shadow-sm transition hover:shadow-md group text-left relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                  🎓
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Student Portal</div>
                <div className="text-xs text-slate-600 font-semibold mt-1">Aditya Manas</div>
                <div className="text-[11px] text-slate-400">Reg: 12326241</div>
                <div className="text-[11px] text-blue-600 font-bold mt-3 flex items-center gap-1">
                  Launch &rarr;
                </div>
              </button>

              {/* Warden */}
              <button
                onClick={() => switchRole('WARDEN')}
                className="p-5 rounded-xl border border-indigo-200/90 bg-white hover:bg-indigo-50/60 shadow-sm transition hover:shadow-md group text-left relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                  🏢
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600">Hostel Warden</div>
                <div className="text-xs text-slate-600 font-semibold mt-1">Dr. R. K. Verma</div>
                <div className="text-[11px] text-slate-400">Tagore Bhawan (TB)</div>
                <div className="text-[11px] text-indigo-600 font-bold mt-3 flex items-center gap-1">
                  Launch &rarr;
                </div>
              </button>

              {/* Chief Warden */}
              <button
                onClick={() => switchRole('CHIEF_WARDEN')}
                className="p-5 rounded-xl border border-amber-200/90 bg-white hover:bg-amber-50/60 shadow-sm transition hover:shadow-md group text-left relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                  ⚖️
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-amber-600">Chief Warden</div>
                <div className="text-xs text-slate-600 font-semibold mt-1">Prof. S. K. Roy</div>
                <div className="text-[11px] text-slate-400">Escalations Authority</div>
                <div className="text-[11px] text-amber-600 font-bold mt-3 flex items-center gap-1">
                  Launch &rarr;
                </div>
              </button>

              {/* Admin */}
              <button
                onClick={() => switchRole('ADMIN')}
                className="p-5 rounded-xl border border-emerald-200/90 bg-white hover:bg-emerald-50/60 shadow-sm transition hover:shadow-md group text-left relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                  ⚙️
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Administrator</div>
                <div className="text-xs text-slate-600 font-semibold mt-1">System Admin</div>
                <div className="text-[11px] text-slate-400">Cycles &amp; Inventory</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1">
                  Launch &rarr;
                </div>
              </button>

              {/* Dean */}
              <button
                onClick={() => switchRole('DEAN')}
                className="p-5 rounded-xl border border-purple-200/90 bg-white hover:bg-purple-50/60 shadow-sm transition hover:shadow-md group text-left relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
                  📊
                </div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-purple-600">Dean of Welfare</div>
                <div className="text-xs text-slate-600 font-semibold mt-1">Dr. Ananya Sen</div>
                <div className="text-[11px] text-slate-400">Campus Analytics</div>
                <div className="text-[11px] text-purple-600 font-bold mt-3 flex items-center gap-1">
                  Launch &rarr;
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 1. STUDENT INTERFACE — ADITYA MANAS
  // ==========================================
  if (user.role === 'STUDENT') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Student Portal &bull; Session 2026–2027
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Allotment Confirmed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Welcome, {user.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Registration No: <strong className="text-slate-800">{user.studentRollNumber || '12326241'}</strong> &bull; B.Tech Computer Science &amp; Engineering &bull; 2nd Year
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/result"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
            >
              <span>📄</span>
              <span>View Official Allotment Order</span>
            </Link>
          </div>
        </div>

        {/* 5-Step Allotment Progress Stepper */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Allocation Process Status
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { step: 1, title: 'Application', desc: 'Submitted & Verified', status: 'COMPLETE' },
              { step: 2, title: 'Eligibility', desc: 'All Policy Rules Passed', status: 'COMPLETE' },
              { step: 3, title: 'Preferences', desc: 'Hostels & Room Types Ranked', status: 'COMPLETE' },
              { step: 4, title: 'Survey', desc: 'AES-256 Encrypted', status: 'COMPLETE' },
              { step: 5, title: 'Allotment', desc: 'Published Order Active', status: 'COMPLETE' },
            ].map((s) => (
              <div key={s.step} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    ✓
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Complete
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs mt-2">{s.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Allotment Order Showcase Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
                  OFFICIAL ALLOTMENT CONFIRMED &bull; PASS A (RANK #1)
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Tagore Bhawan &bull; Room 104, Bed A
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Block A, Floor 1 &bull; Double Occupancy Room &bull; Academic Year 2026–2027
                </p>
              </div>

              <div className="sm:text-right">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Reporting Date</div>
                <div className="text-xl font-bold text-emerald-400">October 15, 2026</div>
                <div className="text-xs text-slate-300 mt-0.5">Warden Office, Ground Floor</div>
              </div>
            </div>

            {/* Roommate & Compatibility Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-slate-400 font-medium">Roommate Details (Invariant I6)</div>
                <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <span>Rohan Gupta</span>
                  <span className="text-xs text-indigo-300 font-mono font-normal">(Roll: 2023CS042)</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  B.Tech Computer Science &bull; 2nd Year &bull; General Quota
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Roommate Compatibility Score</span>
                  <span className="text-lg font-extrabold text-emerald-400">82 / 100</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2 rounded-full" style={{ width: '82%' }} />
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">Early Bird: 95%</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">Study Noise: 90%</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200">Cleanliness: 85%</span>
                </div>
              </div>
            </div>

            {/* Explainability Rationale */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <div className="font-bold text-slate-300">Deterministic Allocation Rationale (Invariant I4):</div>
              <p className="text-slate-300 leading-relaxed">
                Applicant&apos;s 1st choice preference for Tagore Bhawan (TB) was matched under General Quota in Pass A.
                Roommate pairing optimized via seeded SFC32 PRNG with pairwise lifestyle compatibility score of 82/100.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/result"
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <span>📥</span>
                <span>Download Official Allotment Letter (PDF)</span>
              </Link>
              <Link
                href="/preferences"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition"
              >
                Review Preferences
              </Link>
              <Link
                href="/questionnaire"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition"
              >
                Inspect Privacy Guarantee (AES-256)
              </Link>
            </div>
          </div>
        </div>

        {/* Student Quick Navigation Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/apply"
            className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition">
              📝
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Application Form</div>
            <div className="text-xs text-slate-500 mt-1">Review verified documents &amp; fee receipts</div>
            <div className="mt-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              Status: Verified &check;
            </div>
          </Link>

          <Link
            href="/eligibility"
            className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition">
              📋
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Eligibility Status</div>
            <div className="text-xs text-slate-500 mt-1">Automated evaluation against policy rules</div>
            <div className="mt-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              Criteria: 4/4 Passed &check;
            </div>
          </Link>

          <Link
            href="/preferences"
            className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition">
              🎯
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Hostel Preferences</div>
            <div className="text-xs text-slate-500 mt-1">Ranked hostels &amp; room types</div>
            <div className="mt-3 text-[11px] font-bold text-indigo-600 flex items-center gap-1">
              Choice 1: Tagore Bhawan &check;
            </div>
          </Link>

          <Link
            href="/questionnaire"
            className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl mb-3 group-hover:scale-105 transition">
              🔒
            </div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Lifestyle Survey</div>
            <div className="text-xs text-slate-500 mt-1">AES-256-GCM encrypted questionnaire</div>
            <div className="mt-3 text-[11px] font-bold text-violet-600 flex items-center gap-1">
              Encrypted at Rest &check;
            </div>
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // 2. WARDEN INTERFACE — DR. VERMA
  // ==========================================
  if (user.role === 'WARDEN') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Warden Command Center &bull; Tagore Bhawan (TB)
              </span>
              <span className="text-xs text-slate-500">&bull; Academic Session 2026–2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {user.fullName} &bull; Warden Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Hostel Code: <code>TB</code> &bull; 4 Residential Blocks (A, B, C, D) &bull; 16 Total Floors &bull; 592 Rooms
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/bedmap"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-2"
            >
              <span>🗺️</span>
              <span>Launch Visual Bed Map</span>
            </Link>
          </div>
        </div>

        {/* Warden Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hostel Capacity</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">1,605</div>
            <p className="text-xs text-slate-500 mt-1">Tagore Bhawan beds</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600">98.4%</div>
            <p className="text-xs text-slate-500 mt-1">1,580 beds assigned</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accessible Beds</span>
            <div className="mt-2 text-3xl font-extrabold text-blue-600">45</div>
            <p className="text-xs text-slate-500 mt-1">PWD ground floor verified</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Overrides</span>
            <div className="mt-2 text-3xl font-extrabold text-amber-600">2</div>
            <p className="text-xs text-slate-500 mt-1">Invariant I5 reasoned edits</p>
          </div>
        </div>

        {/* Feature Hero Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Interactive Floor Bed Map &amp; Reassignment</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mb-6 leading-relaxed">
            Inspect individual student bed allocations, examine structured Invariant I4 explanations, reassign beds with mandatory justification, and request Chief Warden escalation for hard constraint exceptions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/bedmap"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-2"
            >
              <span>🗺️</span>
              <span>Open Visual Bed Map for Tagore Bhawan &rarr;</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 3. CHIEF WARDEN INTERFACE — PROF. ROY
  // ==========================================
  if (user.role === 'CHIEF_WARDEN') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Chief Warden &bull; Cross-Hostel Authority
              </span>
              <span className="text-xs text-slate-500">&bull; Academic Session 2026–2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Council of Wardens &bull; Governance Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Authority to resolve Invariant I5 hard constraint overrides (Gender, Accessibility, Capacity) across all 5 campus hostels.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/escalations"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
            >
              <span>⚖️</span>
              <span>Review Escalations (2)</span>
            </Link>
            <Link
              href="/bedmap"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Cross-Hostel Map
            </Link>
          </div>
        </div>

        {/* Escalation Alert */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <span>⚠️</span> 2 Hard-Constraint Override Escalations Awaiting Your Decision
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Wardens have submitted exceptions for medical ground-floor accommodation and buffer capacity. Chief Warden approval is required to update published records.
              </p>
            </div>
            <Link
              href="/escalations"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition shrink-0"
            >
              Review Queue &rarr;
            </Link>
          </div>
        </div>

        {/* 5 Campus Hostels Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">All Campus Residences Overview</h3>
            <span className="text-xs text-slate-500">8,015 Total Campus Beds</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Hostel</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Total Beds</th>
                <th className="px-6 py-3">Assigned</th>
                <th className="px-6 py-3">Accessible</th>
                <th className="px-6 py-3 text-right">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Gargi Bhawan (GB)', gender: 'FEMALE', cap: 1629, occ: 1540, acc: 43, rate: '94.5%' },
                { name: 'Sarojini Bhawan (SB)', gender: 'FEMALE', cap: 1612, occ: 1510, acc: 42, rate: '93.7%' },
                { name: 'Tagore Bhawan (TB)', gender: 'MALE', cap: 1605, occ: 1580, acc: 45, rate: '98.4%' },
                { name: 'Aryabhatta Bhawan (AB)', gender: 'MALE', cap: 1581, occ: 1520, acc: 44, rate: '96.1%' },
                { name: 'Kalam International (KB)', gender: 'COED', cap: 1588, occ: 1409, acc: 41, rate: '88.7%' },
              ].map((h) => (
                <tr key={h.name} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{h.name}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {h.gender}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">{h.cap.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-slate-700">{h.occ.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-slate-700">{h.acc}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-slate-900">{h.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    );
  }

  // ==========================================
  // 4. ADMIN INTERFACE
  // ==========================================
  if (user.role === 'ADMIN' || user.role === 'SYSTEM_ADMIN') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                System Administrator &bull; Pipeline Engine
              </span>
              <span className="text-xs text-slate-500">&bull; Academic Session 2026–2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Hostel Allocation Administration
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Bulk inventory management, cycle configuration, deterministic engine runs, and document verifications.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/inventory"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
            >
              <span>📁</span>
              <span>Bulk CSV Import</span>
            </Link>
            <Link
              href="/runs"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Run History
            </Link>
          </div>
        </div>

        {/* Admin Dashboard Operations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/inventory"
            className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition group"
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Campus Inventory</div>
            <div className="text-2xl font-extrabold text-slate-900 my-1">8,015 beds</div>
            <p className="text-xs text-slate-500">2,960 rooms across 5 hostels</p>
          </Link>

          <Link
            href="/cycles"
            className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition group"
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Allocation Cycles</div>
            <div className="text-2xl font-extrabold text-slate-900 my-1">2026–2027</div>
            <p className="text-xs text-slate-500">Fall regular cycle published</p>
          </Link>

          <Link
            href="/runs"
            className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition group"
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Engine Runs</div>
            <div className="text-2xl font-extrabold text-slate-900 my-1">1.445s</div>
            <p className="text-xs text-slate-500">8,015 applicants allocated</p>
          </Link>

          <Link
            href="/verifications"
            className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-md transition group"
          >
            <div className="text-2xl mb-2">📑</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Quota Verifications</div>
            <div className="text-2xl font-extrabold text-emerald-600 my-1">All Verified</div>
            <p className="text-xs text-slate-500">Disability &amp; category proofs</p>
          </Link>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Operations &amp; Reporting Tools</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/reports"
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              📊 Allocation Reports &amp; Heatmap
            </Link>
            <Link
              href="/bedmap"
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              🗺️ Cross-Hostel Bed Map
            </Link>
            <a
              href={`/api/reports/export?type=occupancy`}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              ⬇ Export Occupancy CSV
            </a>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 5. DEAN OF STUDENT WELFARE INTERFACE
  // ==========================================
  if (user.role === 'DEAN') {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Dean of Student Welfare &bull; Executive Oversight
              </span>
              <span className="text-xs text-slate-500">&bull; Academic Session 2026–2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Institutional Capacity &amp; Equity Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Campus-wide accommodation metrics, quota compliance, and policy fairness verification.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/analytics"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
            >
              <span>📊</span>
              <span>Full Analytics Portal</span>
            </Link>
            <Link
              href="/reports"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Reports &amp; CSV
            </Link>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Capacity</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">8,015</div>
            <p className="text-xs text-slate-500 mt-1">Across 5 residences</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Occupancy</span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600">95.5%</div>
            <p className="text-xs text-slate-500 mt-1">7,559 occupied</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1st-Choice Matched</span>
            <div className="mt-2 text-3xl font-extrabold text-indigo-600">42.4%</div>
            <p className="text-xs text-slate-500 mt-1">88.2% in Top-3</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PWD Compliance</span>
            <div className="mt-2 text-3xl font-extrabold text-amber-600">100%</div>
            <p className="text-xs text-slate-500 mt-1">Zero accessibility violations</p>
          </div>
        </div>

        {/* Dean Analytics Deep Dive CTA */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Executive Compliance &amp; Policy Efficacy</h2>
          <p className="text-xs sm:text-sm text-purple-200 max-w-2xl mb-6 leading-relaxed">
            Examine demographic equity, override category distributions, SHA-256 audit log integrity verification, and downloadable official compliance datasets.
          </p>
          <Link
            href="/analytics"
            className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-xs font-bold shadow transition inline-flex items-center gap-2"
          >
            <span>📊</span>
            <span>Launch Institutional Analytics Portal &rarr;</span>
          </Link>
        </div>
      </main>
    );
  }

  return null;
}
