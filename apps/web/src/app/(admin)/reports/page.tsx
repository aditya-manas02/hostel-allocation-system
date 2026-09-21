'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminReportsPage() {
  const [selectedCycle, setSelectedCycle] = useState('cycle-2026-fall');
  const [activeTab, setActiveTab] = useState<'occupancy' | 'overrides' | 'satisfaction'>('occupancy');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
              Admin Portal
            </span>
            <h1 className="text-xl font-bold mt-1">Institutional Reporting & Data Exports</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/inventory" className="text-slate-300 hover:text-white">Inventory</Link>
            <Link href="/cycles" className="text-slate-300 hover:text-white">Cycles</Link>
            <Link href="/runs" className="text-slate-300 hover:text-white">Runs</Link>
            <Link href="/verifications" className="text-slate-300 hover:text-white">Verifications</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Allocation Performance & Occupancy Reports</h2>
            <p className="text-xs text-slate-500">
              Audit-ready summaries, compliance metrics, and downloadable CSV datasets for external reporting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 shadow-sm"
            >
              <option value="cycle-2026-fall">Academic Year 2026–27 (Fall Regular)</option>
              <option value="cycle-2026-spring">Academic Year 2025–26 (Spring Supplementary)</option>
            </select>

            <a
              href={`/api/reports/export?type=${activeTab === 'overrides' ? 'overrides' : 'occupancy'}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
            >
              ⬇ Export {activeTab.toUpperCase()} CSV
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('occupancy')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === 'occupancy'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Hostel Occupancy & Capacity
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === 'overrides'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Overrides Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('satisfaction')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === 'satisfaction'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Preference Satisfaction
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'occupancy' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Occupancy Heatmap across Campus</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { name: 'Gargi (GB)', rate: '96.3%', count: '1,540 / 1,600', color: 'bg-emerald-500' },
                { name: 'Sarojini (SB)', rate: '94.4%', count: '1,510 / 1,600', color: 'bg-emerald-500' },
                { name: 'Tagore (TB)', rate: '98.8%', count: '1,580 / 1,600', color: 'bg-emerald-600' },
                { name: 'Aryabhatta (AB)', rate: '95.0%', count: '1,520 / 1,600', color: 'bg-emerald-500' },
                { name: 'Ramanujan (RB)', rate: '93.1%', count: '1,490 / 1,600', color: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.name} className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <div className="text-xs font-semibold text-slate-700">{item.name}</div>
                  <div className="text-2xl font-extrabold text-slate-900 my-1">{item.rate}</div>
                  <div className="text-[11px] text-slate-500">{item.count} beds</div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: item.rate }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Total campus occupancy: <strong>95.5%</strong> across 8,000 standard and accessible beds.
            </p>
          </div>
        )}

        {activeTab === 'overrides' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Manual Override Log (Invariant I5 Compliance)</h3>
              <span className="text-xs text-slate-500">38 Total Overrides Recorded</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Hostel & Room</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Mandatory Reason Text (&ge;10 chars)</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Escalated (I5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">Tagore Bhawan &bull; Room 104-A</td>
                  <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">MEDICAL_ACCOMMODATION</span></td>
                  <td className="px-6 py-3 text-slate-700">Student fractured leg post-allocation and urgently requires ground floor accessible room.</td>
                  <td className="px-6 py-3 text-slate-600">WARDEN (Dr. Verma)</td>
                  <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">YES (CW Approved)</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">Gargi Bhawan &bull; Room 202-B</td>
                  <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">DISCIPLINARY_SEPARATION</span></td>
                  <td className="px-6 py-3 text-slate-700">Hostel proctorial committee order separating incompatible roommates.</td>
                  <td className="px-6 py-3 text-slate-600">WARDEN (Dr. Rao)</td>
                  <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">NO</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'satisfaction' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Preference Rank Satisfaction Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 text-center">
                <div className="text-xs font-semibold text-indigo-800 uppercase">1st Choice Preference</div>
                <div className="text-3xl font-extrabold text-indigo-900 my-1">42.4%</div>
                <div className="text-xs text-indigo-700">3,388 students</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 text-center">
                <div className="text-xs font-semibold text-blue-800 uppercase">Top 3 Choices</div>
                <div className="text-3xl font-extrabold text-blue-900 my-1">88.2%</div>
                <div className="text-xs text-blue-700">7,056 students</div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-xs font-semibold text-emerald-800 uppercase">Mean Roommate Compatibility</div>
                <div className="text-3xl font-extrabold text-emerald-900 my-1">78.6 / 100</div>
                <div className="text-xs text-emerald-700">Weighted lifestyle score</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs font-semibold text-slate-700 uppercase">Waitlist Auto-Promoted</div>
                <div className="text-3xl font-extrabold text-slate-900 my-1">124</div>
                <div className="text-xs text-slate-500">Upon vacancy creation</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
