'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '../../../lib/api';

export default function AdminReportsPage() {
  const [selectedCycle, setSelectedCycle] = useState('cycle-2026-fall');
  const [activeTab, setActiveTab] = useState<'occupancy' | 'overrides' | 'satisfaction'>('occupancy');

  const handleExportCSV = (type: string) => {
    // Generate CSV on the fly or download from API
    if (type === 'occupancy') {
      const csv = `HostelCode,HostelName,Gender,TotalBeds,OccupiedBeds,AvailableBeds,OccupancyRate\nTB,Tagore Bhawan,MALE,1605,1580,25,98.4%\nGB,Gargi Bhawan,FEMALE,1629,1540,89,94.5%\nSB,Sarojini Bhawan,FEMALE,1612,1510,102,93.7%\nAB,Aryabhatta Bhawan,MALE,1581,1520,61,96.1%\nKB,Kalam International House,COED,1588,1409,179,88.7%`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `occupancy_report_${selectedCycle}.csv`;
      a.click();
    } else {
      const csv = `OverrideId,Hostel,RoomNumber,BedLabel,StudentName,Category,Reason,Actor,Escalated\nOVR-01,TB,104,A,Aditya Manas,MEDICAL_ACCOMMODATION,Temporary lower limb mobility accommodation,WARDEN,NO\nOVR-02,GB,G02,B,Diya Patel,CAPACITY_EXCEEDED,Emergency placement in buffer unit,WARDEN,YES`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overrides_audit_${selectedCycle}.csv`;
      a.click();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Institutional Reports &amp; Exports
            </span>
            <span className="text-xs text-slate-500">&bull; Academic Session 2026–2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Allocation Performance &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Compliance audits, demographic density heatmaps, and downloadable CSV datasets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 shadow-sm font-semibold"
          >
            <option value="cycle-2026-fall">Academic Year 2026–2027 (Fall Regular)</option>
            <option value="cycle-2025-spring">Academic Year 2025–2026 (Spring Regular)</option>
          </select>

          <button
            onClick={() => handleExportCSV(activeTab === 'overrides' ? 'overrides' : 'occupancy')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
          >
            <span>⬇</span>
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'occupancy', label: 'Hostel Occupancy & Capacity' },
          { id: 'overrides', label: 'Overrides Audit Trail (I5)' },
          { id: 'satisfaction', label: 'Preference Satisfaction' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Occupancy */}
      {activeTab === 'occupancy' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Campus Residence Occupancy Breakdown</h3>
                <p className="text-xs text-slate-500">Distribution across 8,015 total beds</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Overall: 94.3% Occupied
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              {[
                { name: 'Tagore Bhawan (TB)', code: 'TB', rate: '98.4%', count: '1,580 / 1,605', gender: 'MALE', color: 'bg-indigo-600' },
                { name: 'Gargi Bhawan (GB)', code: 'GB', rate: '94.5%', count: '1,540 / 1,629', gender: 'FEMALE', color: 'bg-emerald-600' },
                { name: 'Aryabhatta Bhawan (AB)', code: 'AB', rate: '96.1%', count: '1,520 / 1,581', gender: 'MALE', color: 'bg-blue-600' },
                { name: 'Sarojini Bhawan (SB)', code: 'SB', rate: '93.7%', count: '1,510 / 1,612', gender: 'FEMALE', color: 'bg-emerald-600' },
                { name: 'Kalam House (KB)', code: 'KB', rate: '88.7%', count: '1,409 / 1,588', gender: 'COED', color: 'bg-purple-600' },
              ].map((item) => (
                <div key={item.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <div className="text-xs font-bold text-slate-800">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.gender}</div>
                  <div className="text-2xl font-extrabold text-slate-900 my-1.5">{item.rate}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{item.count} beds</div>
                  <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.color} h-1.5 rounded-full`} style={{ width: item.rate }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Overrides */}
      {activeTab === 'overrides' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Manual Override Audit Trail (Invariant I5 Compliance)
            </h3>
            <span className="text-xs text-slate-500">2 Overrides Registered</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-3">Hostel &amp; Room</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Mandatory Reason Text (&ge;10 chars)</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Escalated (I5)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  Tagore Bhawan &bull; Room 104-A
                  <div className="text-[10px] text-slate-400 font-normal">Aditya Manas (12326241)</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    MEDICAL_ACCOMMODATION
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 max-w-sm">
                  Student fractured leg post-allocation and urgently requires ground floor accessible room.
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">WARDEN (Dr. Verma)</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    CW Escalated &check;
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  Gargi Bhawan &bull; Room G02-B
                  <div className="text-[10px] text-slate-400 font-normal">Diya Patel (2023EE204)</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                    CAPACITY_BUFFER
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 max-w-sm">
                  Emergency accommodation request due to family distress. Placed in buffer bed.
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">WARDEN (Dr. Rao)</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    CW Escalated &check;
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Satisfaction */}
      {activeTab === 'satisfaction' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Preference Rank Satisfaction Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
              <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">1st Choice Preference</div>
              <div className="text-3xl font-extrabold text-indigo-950 my-1">42.4%</div>
              <div className="text-xs text-indigo-800">3,388 students satisfied</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Top 3 Choices</div>
              <div className="text-3xl font-extrabold text-blue-950 my-1">88.2%</div>
              <div className="text-xs text-blue-800">7,056 students satisfied</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Mean Roommate Compatibility</div>
              <div className="text-3xl font-extrabold text-emerald-950 my-1">78.6 / 100</div>
              <div className="text-xs text-emerald-800">AES-256 questionnaire match</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-center">
              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Waitlist Auto-Promoted</div>
              <div className="text-3xl font-extrabold text-purple-950 my-1">124</div>
              <div className="text-xs text-purple-800">Vacancy auto-promotions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
