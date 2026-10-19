'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CyclesPage() {
  const [cycles, setCycles] = useState([
    {
      id: 'cycle-2026-fall',
      academicYear: '2026–2027',
      term: 'Fall Semester',
      status: 'PUBLISHED',
      applicationStartDate: '2026-08-01',
      applicationEndDate: '2026-10-31',
      rulesetVersion: 'v1.4',
      quotas: {
        General: '60%',
        Sports: '10%',
        International: '10%',
        PWD: '5%',
        Scholarship: '10%',
        'Staff Ward': '5%',
      },
      applicantsCount: 8015,
      allottedCount: 7559,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAcademicYear, setNewAcademicYear] = useState('2026–2027');
  const [newTerm, setNewTerm] = useState('Spring Semester');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      id: `cycle-${Date.now()}`,
      academicYear: newAcademicYear,
      term: newTerm,
      status: 'DRAFT' as const,
      applicationStartDate: '2027-01-05',
      applicationEndDate: '2027-02-15',
      rulesetVersion: 'v1.4',
      quotas: {
        General: '60%',
        Sports: '10%',
        International: '10%',
        PWD: '5%',
        Scholarship: '10%',
        'Staff Ward': '5%',
      },
      applicantsCount: 0,
      allottedCount: 0,
    };
    setCycles([...cycles, created]);
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Academic Term Cycles
            </span>
            <span className="text-xs text-slate-500">&bull; Master Pipeline Config</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Allocation Cycles Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define academic terms, quota bucket reserves, and ruleset versions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Create New Cycle</span>
          </button>
        </div>
      </div>

      {/* Cycles List */}
      <div className="space-y-4">
        {cycles.map((c) => (
          <div key={c.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900">
                    {c.academicYear} &bull; {c.term}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      c.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Ruleset: {c.rulesetVersion} &bull; Cycle ID: {c.id}
                </p>
              </div>

              <div className="sm:text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Registered Applicants</div>
                <div className="text-2xl font-extrabold text-indigo-600">
                  {c.applicantsCount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Window Start</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{c.applicationStartDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Window End</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{c.applicationEndDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Documents Required</span>
                <span className="font-bold text-slate-900 mt-0.5 block">Student ID, Fee Receipt</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Allotted Residents</span>
                <span className="font-bold text-emerald-600 mt-0.5 block">
                  {c.allottedCount.toLocaleString()} beds
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Configured Quota Buckets
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(c.quotas).map(([k, v]) => (
                  <span
                    key={k}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium"
                  >
                    {k}: <strong className="text-slate-900">{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Create New Academic Cycle</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Academic Session Year
                </label>
                <input
                  type="text"
                  value={newAcademicYear}
                  onChange={(e) => setNewAcademicYear(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Term / Semester
                </label>
                <select
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-xs bg-white"
                >
                  <option value="Fall Semester">Fall Semester</option>
                  <option value="Spring Semester">Spring Semester</option>
                  <option value="Summer Supplementary">Summer Supplementary</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Cycle Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
