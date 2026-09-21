'use client';

import React, { useState } from 'react';

export default function CyclesPage() {
  const [cycles, setCycles] = useState([
    {
      id: 'cycle-2026-fall',
      academicYear: '2026-2027',
      term: 'Fall Semester',
      status: 'APPLICATIONS_OPEN',
      applicationStartDate: '2026-08-01',
      applicationEndDate: '2026-10-31',
      rulesetVersion: 'v1',
      quotas: {
        General: '60%',
        Sports: '10%',
        International: '10%',
        PWD: '5%',
        Scholarship: '10%',
        'Staff Ward': '5%',
      },
      applicantsCount: 8000,
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Allocation Cycles</h1>
          <p className="text-slate-500 mt-1">Configure academic terms, application windows, quotas, and ruleset versions</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">
          + Create New Cycle
        </button>
      </div>

      <div className="space-y-4">
        {cycles.map((c) => (
          <div key={c.id} className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{c.academicYear} — {c.term}</h2>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Ruleset: {c.rulesetVersion} | Cycle ID: {c.id}</p>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Registered Applicants</div>
                <div className="text-2xl font-bold text-indigo-600">{c.applicantsCount.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-sm">
              <div>
                <div className="text-xs text-slate-500">Window Start</div>
                <div className="font-medium text-slate-800">{c.applicationStartDate}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Window End</div>
                <div className="font-medium text-slate-800">{c.applicationEndDate}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Documents Required</div>
                <div className="font-medium text-slate-800">ID, Fee Receipt, Income</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Allocation Status</div>
                <div className="font-medium text-amber-600">Pending Execution</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Configured Quota Buckets</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(c.quotas).map(([k, v]) => (
                  <span key={k} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                    {k}: <strong className="text-slate-900">{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
