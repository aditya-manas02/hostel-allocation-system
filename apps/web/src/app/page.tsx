'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated, switchRole } = useAuth();

  // If unauthenticated, show welcome portal with 1-click role logins
  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-800 border border-blue-200">
            <span>🏛️</span>
            <span>National Institute of Technology &bull; Residential Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Policy-Driven Hostel Allocation &amp; Roommate Matching Engine
          </h1>

          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Deterministic, explainable room allotment powered by a multi-pass heuristic engine,
            AES-256-GCM lifestyle compatibility scoring, and SHA-256 tamper-evident audit logs.
          </p>

          {/* Quick Demo Personas */}
          <div className="pt-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Select a User Persona to Experience Their Tailored Interface:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
              <button
                onClick={() => switchRole('STUDENT')}
                className="p-4 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/70 shadow-sm transition hover:shadow group"
              >
                <div className="text-2xl mb-2">🎓</div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Student Portal</div>
                <div className="text-xs text-slate-500 mt-1">Aditya Manas</div>
                <div className="text-[11px] text-blue-600 font-medium mt-3">Enter Portal &rarr;</div>
              </button>

              <button
                onClick={() => switchRole('WARDEN')}
                className="p-4 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50/70 shadow-sm transition hover:shadow group"
              >
                <div className="text-2xl mb-2">🏢</div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600">Hostel Warden</div>
                <div className="text-xs text-slate-500 mt-1">Tagore Bhawan (TB)</div>
                <div className="text-[11px] text-indigo-600 font-medium mt-3">Enter Portal &rarr;</div>
              </button>

              <button
                onClick={() => switchRole('CHIEF_WARDEN')}
                className="p-4 rounded-xl border border-amber-200 bg-white hover:bg-amber-50/70 shadow-sm transition hover:shadow group"
              >
                <div className="text-2xl mb-2">⚖️</div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-amber-600">Chief Warden</div>
                <div className="text-xs text-slate-500 mt-1">Cross-Hostel Authority</div>
                <div className="text-[11px] text-amber-600 font-medium mt-3">Enter Portal &rarr;</div>
              </button>

              <button
                onClick={() => switchRole('ADMIN')}
                className="p-4 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50/70 shadow-sm transition hover:shadow group"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Administrator</div>
                <div className="text-xs text-slate-500 mt-1">Inventory &amp; Cycles</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-3">Enter Portal &rarr;</div>
              </button>

              <button
                onClick={() => switchRole('DEAN')}
                className="p-4 rounded-xl border border-purple-200 bg-white hover:bg-purple-50/70 shadow-sm transition hover:shadow group"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-purple-600">Dean of Welfare</div>
                <div className="text-xs text-slate-500 mt-1">Campus Analytics</div>
                <div className="text-[11px] text-purple-600 font-medium mt-3">Enter Portal &rarr;</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 1. STUDENT INTERFACE
  // ==========================================
  if (user.role === 'STUDENT') {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Student Dashboard
            </span>
            <span className="text-xs text-slate-400">&bull; Academic Year 2026–2027</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Welcome back, {user.fullName}!</h1>
          <p className="text-xs text-slate-500">
            Roll No: <strong>{user.studentRollNumber || '2023CS101'}</strong> &bull; B.Tech Computer Science &amp; Engineering
          </p>
        </div>

        {/* Allotment Notification Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white mb-2">
                OFFICIAL ALLOTMENT CONFIRMED
              </span>
              <h2 className="text-xl font-extrabold text-emerald-950">
                You have been allotted Room 104, Bed A in Tagore Bhawan
              </h2>
              <p className="text-xs text-emerald-800 mt-1">
                Your preference choice #1 was successfully matched by the policy engine. Reporting date: <strong>October 15, 2026</strong>.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/result"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow-sm transition"
              >
                View Details &amp; PDF Order
              </Link>
            </div>
          </div>
        </div>

        {/* Student Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/apply"
            className="p-5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 shadow-sm transition group"
          >
            <div className="text-xl mb-1">📝</div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Application Form</div>
            <div className="text-xs text-slate-500 mt-1">Inspect uploaded ID and fee receipts</div>
            <div className="mt-3 text-[11px] text-emerald-600 font-semibold">Status: Submitted ✓</div>
          </Link>

          <Link
            href="/eligibility"
            className="p-5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 shadow-sm transition group"
          >
            <div className="text-xl mb-1">📋</div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Eligibility Status</div>
            <div className="text-xs text-slate-500 mt-1">Review declarative criteria checks</div>
            <div className="mt-3 text-[11px] text-emerald-600 font-semibold">Status: Eligible ✓</div>
          </Link>

          <Link
            href="/preferences"
            className="p-5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 shadow-sm transition group"
          >
            <div className="text-xl mb-1">🎯</div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Ranked Preferences</div>
            <div className="text-xs text-slate-500 mt-1">Drag-and-drop hostel choices</div>
            <div className="mt-3 text-[11px] text-blue-600 font-semibold">Choice 1: Tagore Bhawan ✓</div>
          </Link>

          <Link
            href="/questionnaire"
            className="p-5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 shadow-sm transition group"
          >
            <div className="text-xl mb-1">🔒</div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600">Lifestyle Survey</div>
            <div className="text-xs text-slate-500 mt-1">AES-256-GCM encrypted responses</div>
            <div className="mt-3 text-[11px] text-indigo-600 font-semibold">Compatibility: 82% ✓</div>
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // 2. WARDEN INTERFACE
  // ==========================================
  if (user.role === 'WARDEN') {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Warden Command Portal
              </span>
              <span className="text-xs text-slate-400">&bull; Scoped: Tagore Bhawan (TB)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{user.fullName} &bull; Tagore Bhawan</h1>
            <p className="text-xs text-slate-500">
              Hostel ID: <code>hostel-tb</code> &bull; 4 Residential Blocks (A, B, C, D) &bull; 16 Floors
            </p>
          </div>

          <Link
            href="/bedmap"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold shadow-sm transition inline-flex items-center gap-2"
          >
            <span>🗺️</span>
            <span>Launch Visual Bed Map</span>
          </Link>
        </div>

        {/* Warden Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Hostel Beds</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">1,605</div>
            <p className="text-xs text-slate-500 mt-1">Across 592 rooms</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600">98.8%</div>
            <p className="text-xs text-slate-500 mt-1">1,580 beds assigned</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accessible Beds</span>
            <div className="mt-2 text-3xl font-extrabold text-blue-600">45</div>
            <p className="text-xs text-slate-500 mt-1">100% PWD certified</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Overrides</span>
            <div className="mt-2 text-3xl font-extrabold text-amber-600">2</div>
            <p className="text-xs text-slate-500 mt-1">Invariant I5 reasoned changes</p>
          </div>
        </div>

        {/* Quick Bed Map Preview Link */}
        <div className="bg-slate-900 text-white rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-2">Interactive Floor Bed Map</h2>
          <p className="text-xs text-slate-300 max-w-xl mb-6">
            Inspect individual student assignments, view explanation breakdowns, reassign beds via drag-and-drop, and submit manual overrides with mandatory justification.
          </p>
          <Link
            href="/bedmap"
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-md text-xs font-semibold shadow-sm transition"
          >
            Open Bed Map for Tagore Bhawan &rarr;
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // 3. CHIEF WARDEN INTERFACE
  // ==========================================
  if (user.role === 'CHIEF_WARDEN') {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Chief Warden Portal
              </span>
              <span className="text-xs text-slate-400">&bull; Cross-Hostel Authority</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{user.fullName} &bull; Council of Wardens</h1>
            <p className="text-xs text-slate-500">
              Cross-hostel oversight across all 5 campus hostels &bull; Hard-Constraint Escalation Authority (Invariant I5)
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/escalations"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-sm transition"
            >
              Review Escalations Queue (2)
            </Link>
            <Link
              href="/bedmap"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition"
            >
              Cross-Hostel Map
            </Link>
          </div>
        </div>

        {/* Escalation Alert */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                2 Pending Hard-Constraint Override Escalations
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                Wardens have requested exceptions for accessibility and room capacity. Chief Warden approval is required to proceed.
              </p>
            </div>
            <Link
              href="/escalations"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-sm"
            >
              Resolve Now &rarr;
            </Link>
          </div>
        </div>

        {/* Campus Hostel Overview Grid */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-sm">Campus Residences Overview</h3>
            <span className="text-xs text-slate-500">8,015 Total Campus Capacity</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Hostel</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">Occupied</th>
                <th className="px-6 py-3">Accessible</th>
                <th className="px-6 py-3 text-right">Occupancy</th>
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
                  <td className="px-6 py-3 font-medium text-slate-900">{h.name}</td>
                  <td className="px-6 py-3">{h.gender}</td>
                  <td className="px-6 py-3">{h.cap.toLocaleString()}</td>
                  <td className="px-6 py-3">{h.occ.toLocaleString()}</td>
                  <td className="px-6 py-3">{h.acc}</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">{h.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    );
  }

  if (user.role === 'ADMIN' || user.role === 'SYSTEM_ADMIN') {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                System Administration
              </span>
              <span className="text-xs text-slate-400">&bull; Inventory &amp; Allocation Pipeline</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Administrator Control Panel</h1>
            <p className="text-xs text-slate-500">
              Manage inventory, bulk CSV imports, allocation cycles, deterministic engine runs, and verifications.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/inventory"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm transition"
            >
              Bulk CSV Import
            </Link>
            <Link
              href="/runs"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition"
            >
              Allocation Runs
            </Link>
          </div>
        </div>

        {/* Admin Dashboard Operations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/inventory"
            className="p-6 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 shadow-sm transition group"
          >
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Campus Inventory</div>
            <div className="text-2xl font-extrabold text-slate-900 my-1">8,015 beds</div>
            <p className="text-xs text-slate-500">2,960 rooms across 5 hostels</p>
          </Link>

          <Link
            href="/cycles"
            className="p-6 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 shadow-sm transition group"
          >
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Allocation Cycles</div>
            <div className="text-2xl font-extrabold text-slate-900 my-1">2026–2027</div>
            <p className="text-xs text-slate-500">Fall regular cycle published</p>
          </Link>

          <Link
            href="/runs"
            className="p-6 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 shadow-sm transition group"
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Engine Runs</div>
            <div className="text-2xl font-extrabold text-slate-900 my-1">1.445s</div>
            <p className="text-xs text-slate-500">8,015 applicants allocated</p>
          </Link>

          <Link
            href="/verifications"
            className="p-6 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 shadow-sm transition group"
          >
            <div className="text-2xl mb-2">📑</div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Quota Verifications</div>
            <div className="text-2xl font-extrabold text-emerald-600 my-1">All Verified</div>
            <p className="text-xs text-slate-500">Disability &amp; category proofs</p>
          </Link>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Operations &amp; Reporting Tools</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/reports"
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              📊 Allocation Reports &amp; Heatmap
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reports/export?type=occupancy`}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              ⬇ Export Occupancy CSV
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reports/export?type=overrides`}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              ⬇ Export Overrides Audit CSV
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                Dean of Student Welfare
              </span>
              <span className="text-xs text-slate-400">&bull; Institutional Oversight &amp; Compliance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Institutional Analytics Dashboard</h1>
            <p className="text-xs text-slate-500">
              High-level campus capacity utilization, policy compliance, and demographic distribution.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/analytics"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold shadow-sm transition"
            >
              Full Analytics Portal
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/reports/export?type=occupancy`}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition"
            >
              Export Occupancy CSV
            </a>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Capacity</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">8,015</div>
            <p className="text-xs text-slate-500 mt-1">Across 5 hostels</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Occupancy</span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-600">95.5%</div>
            <p className="text-xs text-slate-500 mt-1">7,559 occupied</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1st-Choice Matched</span>
            <div className="mt-2 text-3xl font-extrabold text-indigo-600">42.4%</div>
            <p className="text-xs text-slate-500 mt-1">88.2% in Top-3</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PWD Compliance</span>
            <div className="mt-2 text-3xl font-extrabold text-amber-600">100%</div>
            <p className="text-xs text-slate-500 mt-1">Zero accessibility violations</p>
          </div>
        </div>

        {/* Analytics Deep Dive Link */}
        <div className="bg-purple-900 text-white rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-2">Executive Reports &amp; Policy Efficacy</h2>
          <p className="text-xs text-purple-200 max-w-xl mb-6">
            Access demographic distributions, override category breakdowns, SHA-256 audit log verifications, and downloadable compliance datasets.
          </p>
          <Link
            href="/analytics"
            className="px-5 py-2.5 bg-white text-purple-950 hover:bg-purple-50 rounded-md text-xs font-semibold shadow-sm transition"
          >
            Launch Institutional Analytics View &rarr;
          </Link>
        </div>
      </main>
    );
  }

  return null;
}
