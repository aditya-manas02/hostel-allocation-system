'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HostelSummary {
  name: string;
  code: string;
  gender: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  accessibleBeds: number;
}

const mockHostels: HostelSummary[] = [
  { name: 'Gargi Bhawan', code: 'GB', gender: 'FEMALE', totalBeds: 1600, occupiedBeds: 1540, occupancyRate: 96.3, accessibleBeds: 40 },
  { name: 'Sarojini Bhawan', code: 'SB', gender: 'FEMALE', totalBeds: 1600, occupiedBeds: 1510, occupancyRate: 94.4, accessibleBeds: 35 },
  { name: 'Tagore Bhawan', code: 'TB', gender: 'MALE', totalBeds: 1600, occupiedBeds: 1580, occupancyRate: 98.8, accessibleBeds: 50 },
  { name: 'Aryabhatta Bhawan', code: 'AB', gender: 'MALE', totalBeds: 1600, occupiedBeds: 1520, occupancyRate: 95.0, accessibleBeds: 45 },
  { name: 'Ramanujan Bhawan', code: 'RB', gender: 'MALE', totalBeds: 1600, occupiedBeds: 1490, occupancyRate: 93.1, accessibleBeds: 30 },
];

export default function DeanAnalyticsPage() {
  const [hostels] = useState<HostelSummary[]>(mockHostels);
  const totalCampusBeds = hostels.reduce((acc, h) => acc + h.totalBeds, 0);
  const totalOccupiedBeds = hostels.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const campusOccupancyRate = ((totalOccupiedBeds / totalCampusBeds) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">
              Dean Portal
            </span>
            <h1 className="text-xl font-bold mt-1">Dean of Student Welfare &bull; Institutional Analytics</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/runs" className="text-slate-300 hover:text-white">Run History</Link>
            <Link href="/inventory" className="text-slate-300 hover:text-white">Inventory</Link>
            <Link href="/escalations" className="text-slate-300 hover:text-white">Escalations</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Action Bar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Annual Hostel Allocation & Demographics</h2>
            <p className="text-sm text-slate-500">
              High-level institutional oversight, policy efficacy, and capacity utilization across all residences.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/api/reports/export?type=occupancy"
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold shadow-sm"
            >
              Export Occupancy CSV
            </a>
            <a
              href="/api/reports/export?type=overrides"
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-semibold shadow-sm"
            >
              Export Overrides Audit CSV
            </a>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Campus Capacity</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{totalCampusBeds.toLocaleString()}</span>
              <span className="text-xs text-slate-500">beds</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Across 5 hostels and 20 residential blocks</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus Occupancy</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">{campusOccupancyRate}%</span>
              <span className="text-xs text-slate-500">({totalOccupiedBeds.toLocaleString()} filled)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Optimal residential density achieved</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1st-Choice Satisfaction</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600">42.4%</span>
              <span className="text-xs text-slate-500">(88.2% in Top-3)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Heuristic multi-pass preference optimization</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PWD Accommodation</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600">100%</span>
              <span className="text-xs text-slate-500">(Pass A)</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Zero accessibility violations (Invariant I8)</p>
          </div>
        </div>

        {/* Hostel Breakdown Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-sm">Residences Capacity & Utilization</h3>
            <span className="text-xs text-slate-500">Academic Year 2026–2027</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Hostel</th>
                <th className="px-6 py-3">Designation</th>
                <th className="px-6 py-3">Total Capacity</th>
                <th className="px-6 py-3">Occupied</th>
                <th className="px-6 py-3">Accessible Beds</th>
                <th className="px-6 py-3">Occupancy Bar</th>
                <th className="px-6 py-3 text-right">Occupancy %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hostels.map((h) => (
                <tr key={h.code} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {h.name} <span className="text-xs text-slate-500 font-mono">({h.code})</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      h.gender === 'FEMALE' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {h.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{h.totalBeds.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-700">{h.occupiedBeds.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-700">{h.accessibleBeds}</td>
                  <td className="px-6 py-4 w-48">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${h.occupancyRate}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">{h.occupancyRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Governance & Policy Audit Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Override Categories Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Medical Accommodation</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">18</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Disciplinary Separation</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">6</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Administrative Rectification</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">12</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Chief Warden Escalation (Hard Constraints)</span>
                <span className="font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">2</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              All 38 overrides require mandatory reason text (&ge;10 chars) and are verifiable via the SHA-256 audit chain.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Algorithm Health & Determinism</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Seeded PRNG Implementation</span>
                <span className="font-mono text-emerald-700 font-medium">sfc32 via cyrb128</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Average Execution Time (8,000 beds)</span>
                <span className="font-mono text-emerald-700 font-medium">3.52 seconds (&lt;10 min budget)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Hard Constraint Violations</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">0 (Proven via fast-check)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Lifestyle Questionnaire Privacy</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">AES-256-GCM (Write-only)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4">
              Reproducibility verified: byte-identical output hashes on identical seed snapshots.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
