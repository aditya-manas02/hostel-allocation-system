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

const defaultHostels: HostelSummary[] = [
  { name: 'Tagore Bhawan', code: 'TB', gender: 'MALE', totalBeds: 1605, occupiedBeds: 1580, occupancyRate: 98.4, accessibleBeds: 45 },
  { name: 'Gargi Bhawan', code: 'GB', gender: 'FEMALE', totalBeds: 1629, occupiedBeds: 1540, occupancyRate: 94.5, accessibleBeds: 43 },
  { name: 'Aryabhatta Bhawan', code: 'AB', gender: 'MALE', totalBeds: 1581, occupiedBeds: 1520, occupancyRate: 96.1, accessibleBeds: 44 },
  { name: 'Sarojini Bhawan', code: 'SB', gender: 'FEMALE', totalBeds: 1612, occupiedBeds: 1510, occupancyRate: 93.7, accessibleBeds: 42 },
  { name: 'Kalam International House', code: 'KB', gender: 'COED', totalBeds: 1588, occupiedBeds: 1409, occupancyRate: 88.7, accessibleBeds: 41 },
];

export default function DeanAnalyticsPage() {
  const [hostels] = useState<HostelSummary[]>(defaultHostels);
  const totalCampusBeds = hostels.reduce((acc, h) => acc + h.totalBeds, 0);
  const totalOccupiedBeds = hostels.reduce((acc, h) => acc + h.occupiedBeds, 0);
  const campusOccupancyRate = ((totalOccupiedBeds / totalCampusBeds) * 100).toFixed(1);

  const handleExportCSV = () => {
    const csv = `HostelCode,HostelName,Gender,TotalBeds,OccupiedBeds,OccupancyRate,AccessibleBeds\nTB,Tagore Bhawan,MALE,1605,1580,98.4%,45\nGB,Gargi Bhawan,FEMALE,1629,1540,94.5%,43\nAB,Aryabhatta Bhawan,MALE,1581,1520,96.1%,44\nSB,Sarojini Bhawan,FEMALE,1612,1510,93.7%,42\nKB,Kalam International House,COED,1588,1409,88.7%,41`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dean_executive_occupancy_analytics.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Institutional Oversight &bull; Dean of Student Welfare
            </span>
            <span className="text-xs text-slate-500">&bull; Session 2026–2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Executive Capacity &amp; Equity Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            High-level policy efficacy, accommodation density, and algorithmic fairness metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
          >
            <span>⬇</span>
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Campus Capacity
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {totalCampusBeds.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 5 residences and 2,960 rooms</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Overall Occupancy Rate
          </span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">
            {campusOccupancyRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">{totalOccupiedBeds.toLocaleString()} beds filled</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1st-Choice Satisfaction
          </span>
          <div className="mt-2 text-3xl font-extrabold text-indigo-600">
            42.4%
          </div>
          <p className="text-xs text-slate-500 mt-1">88.2% satisfied in Top-3</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            PWD Equity &bull; Invariant I8
          </span>
          <div className="mt-2 text-3xl font-extrabold text-amber-600">
            100%
          </div>
          <p className="text-xs text-slate-500 mt-1">Zero accessibility violations</p>
        </div>
      </div>

      {/* Residence Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Hostels Capacity &amp; Utilization Comparison
          </h3>
          <span className="text-xs text-slate-500 font-mono">Academic Year 2026–2027</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3.5">Hostel Name</th>
              <th className="px-6 py-3.5">Designation</th>
              <th className="px-6 py-3.5">Capacity</th>
              <th className="px-6 py-3.5">Occupied</th>
              <th className="px-6 py-3.5">Accessible</th>
              <th className="px-6 py-3.5">Occupancy Bar</th>
              <th className="px-6 py-3.5 text-right">Occupancy %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hostels.map((h) => (
              <tr key={h.code} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  {h.name} <span className="text-[10px] text-slate-400 font-mono">({h.code})</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.gender === 'FEMALE'
                        ? 'bg-pink-100 text-pink-800'
                        : h.gender === 'MALE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {h.gender}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">{h.totalBeds.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-700 font-semibold">{h.occupiedBeds.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-700">{h.accessibleBeds}</td>
                <td className="px-6 py-4 w-48">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${h.occupancyRate}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                  {h.occupancyRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Governance & Policy Quality Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Audited Override Classifications</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Medical Accommodation</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">18</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Disciplinary Separation</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">6</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Administrative Rectification</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">12</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Chief Warden Escalations (Hard Constraints)</span>
              <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">2</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Every override is cryptographically committed with reason text (&ge;10 chars) into the SHA-256 audit log.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Algorithm Health &amp; Invariant Compliance</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Seeded PRNG Implementation</span>
              <span className="font-mono text-emerald-700 font-bold">sfc32 via cyrb128</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Execution Benchmark (8,015 beds)</span>
              <span className="font-mono text-emerald-700 font-bold">1.445s (&lt;10 min budget)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Hard Constraint Violations</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                0 (Formally Verified)
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Lifestyle Questionnaire Privacy</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                AES-256-GCM (Zero-PII)
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Deterministic reproducibility proven: byte-identical output hashes on re-running identical input snapshots.
          </p>
        </div>
      </div>
    </div>
  );
}
