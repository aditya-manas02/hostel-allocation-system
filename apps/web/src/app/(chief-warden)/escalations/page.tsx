'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface EscalationItem {
  id: string;
  hostelName: string;
  hostelCode: string;
  roomNumber: string;
  bedLabel: string;
  studentName: string;
  studentRoll: string;
  violationType: 'GENDER_MISMATCH' | 'ACCESSIBILITY_MISMATCH' | 'CAPACITY_EXCEEDED';
  wardenName: string;
  wardenReason: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const mockEscalations: EscalationItem[] = [
  {
    id: 'esc-001',
    hostelName: 'Tagore Bhawan',
    hostelCode: 'TB',
    roomNumber: '104',
    bedLabel: 'A',
    studentName: 'Aditya Manas',
    studentRoll: '2023CS101',
    violationType: 'ACCESSIBILITY_MISMATCH',
    wardenName: 'Dr. R. K. Verma',
    wardenReason: 'Student fractured leg post-allocation and urgently requires ground floor accessible room for 1 semester.',
    timestamp: '2026-09-20 14:30',
    status: 'PENDING',
  },
  {
    id: 'esc-002',
    hostelName: 'Gargi Bhawan',
    hostelCode: 'GB',
    roomNumber: 'G02',
    bedLabel: 'B',
    studentName: 'Diya Patel',
    studentRoll: '2023EE204',
    violationType: 'CAPACITY_EXCEEDED',
    wardenName: 'Dr. Sunita Rao',
    wardenReason: 'Emergency accommodation request due to family distress. Placed in buffer bed pending next cycle.',
    timestamp: '2026-09-21 09:15',
    status: 'PENDING',
  },
];

export default function ChiefWardenEscalationsPage() {
  const [escalations, setEscalations] = useState<EscalationItem[]>(mockEscalations);
  const [selectedItem, setSelectedItem] = useState<EscalationItem | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleDecision = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setEscalations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setActionSuccess(`Escalation ${id} has been ${newStatus.toLowerCase()} successfully.`);
    setSelectedItem(null);
    setDecisionNotes('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
              Chief Warden Portal
            </span>
            <h1 className="text-xl font-bold mt-1">Cross-Hostel Governance & Escalation Queue</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/runs" className="text-slate-300 hover:text-white">Run History</Link>
            <Link href="/bedmap" className="text-slate-300 hover:text-white">Bed Map</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md font-medium text-sm">
            ✓ {actionSuccess}
          </div>
        )}

        {/* Governance banner */}
        <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
          <h2 className="font-semibold text-amber-900 text-sm">Invariant I5 — Escalated Override Authority</h2>
          <p className="text-xs text-amber-800 mt-1">
            Hard constraints (gender designation, accessibility matching, and room capacity limits) can <strong>only</strong> be overridden with explicit approval by the Chief Warden. Every decision is cryptographically logged in the SHA-256 tamper-evident audit log.
          </p>
        </div>

        {/* Escalation Queue Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Pending Hard Constraint Escalations ({escalations.filter(e => e.status === 'PENDING').length})</h3>
            <span className="text-xs text-slate-500">Cross-hostel oversight across all 5 campus hostels</span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Hostel & Room</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Constraint Violation</th>
                <th className="px-6 py-3">Warden Justification</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {escalations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.hostelName} ({item.hostelCode})</div>
                    <div className="text-xs text-slate-500">Room {item.roomNumber}, Bed {item.bedLabel}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.studentName}</div>
                    <div className="text-xs text-slate-500">{item.studentRoll}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                      {item.violationType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-slate-700 truncate">{item.wardenReason}</p>
                    <span className="text-[11px] text-slate-400">By {item.wardenName} at {item.timestamp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'REJECTED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'PENDING' ? (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium"
                      >
                        Review & Decide
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Decision */}
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Review Hard Constraint Escalation</h3>
              <p className="text-xs text-slate-500 mb-4">Case ID: {selectedItem.id} &bull; Requested by {selectedItem.wardenName}</p>

              <div className="bg-rose-50 border border-rose-200 rounded p-3 mb-4 text-xs text-rose-900">
                <strong>Violation Warning:</strong> This override violates <code>{selectedItem.violationType}</code> in {selectedItem.hostelName}, Room {selectedItem.roomNumber}.
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Warden's Justification</label>
                <div className="p-2.5 bg-slate-100 rounded text-xs text-slate-800 border border-slate-200">
                  {selectedItem.wardenReason}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Chief Warden Decision Notes (Mandatory min 10 chars)
                </label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Provide explicit administrative rationale for approving or denying this exception..."
                  rows={3}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  disabled={decisionNotes.trim().length < 10}
                  onClick={() => handleDecision(selectedItem.id, 'REJECTED')}
                  className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded font-medium disabled:opacity-40"
                >
                  Reject Exception
                </button>
                <button
                  disabled={decisionNotes.trim().length < 10}
                  onClick={() => handleDecision(selectedItem.id, 'APPROVED')}
                  className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium disabled:opacity-40"
                >
                  Approve Exception (Sign & Seal)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
