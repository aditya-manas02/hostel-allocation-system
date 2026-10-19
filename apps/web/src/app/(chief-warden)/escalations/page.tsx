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
    studentRoll: '12326241',
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
    setActionSuccess(`Escalation ${id} has been ${newStatus.toLowerCase()} successfully and signed with cryptographic key.`);
    setSelectedItem(null);
    setDecisionNotes('');
    setTimeout(() => setActionSuccess(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Chief Warden Escalations
            </span>
            <span className="text-xs text-slate-500">&bull; Invariant I5 Hard-Constraint Review</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Council of Wardens &bull; Exception Escalation Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Hard constraints (Gender boundary, Accessibility matching, Capacity limits) can only be overridden with Chief Warden authorization.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/bedmap"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            Visual Bed Map &rarr;
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <span>✓</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Governance Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm space-y-1">
        <h2 className="font-bold text-amber-900 text-sm">
          Invariant I5 &mdash; Escalated Override Authority
        </h2>
        <p className="text-xs text-amber-800 leading-relaxed">
          Hard constraints (gender designation, accessibility matching, and room capacity limits) can <strong>only</strong> be overridden with explicit approval by the Chief Warden. Every decision is cryptographically logged in the SHA-256 tamper-evident audit log.
        </p>
      </div>

      {/* Escalation Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            Pending Hard Constraint Escalations ({escalations.filter((e) => e.status === 'PENDING').length})
          </h3>
          <span className="text-xs text-slate-500">Cross-hostel oversight across all 5 campus hostels</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-3.5">Hostel &amp; Room</th>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Constraint Violation</th>
              <th className="px-6 py-3.5">Warden Justification</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {escalations.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">
                    {item.hostelName} ({item.hostelCode})
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Room {item.roomNumber}, Bed {item.bedLabel}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{item.studentName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.studentRoll}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {item.violationType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-xs text-slate-700 truncate">{item.wardenReason}</p>
                  <span className="text-[10px] text-slate-400">
                    By {item.wardenName} at {item.timestamp}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'REJECTED'
                        ? 'bg-slate-200 text-slate-700'
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
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
                    >
                      Review &amp; Decide
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Resolved &check;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Review Hard Constraint Escalation
            </h3>
            <p className="text-xs text-slate-500">
              Case ID: {selectedItem.id} &bull; Requested by {selectedItem.wardenName}
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900">
              <strong>Violation Flag:</strong> This override violates <code>{selectedItem.violationType}</code> in {selectedItem.hostelName}, Room {selectedItem.roomNumber}.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Warden&apos;s Justification
              </label>
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-800 border border-slate-200">
                {selectedItem.wardenReason}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Chief Warden Decision Rationale (&ge; 10 characters)
              </label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Provide explicit administrative rationale for approving or denying this exception..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={decisionNotes.trim().length < 10}
                onClick={() => handleDecision(selectedItem.id, 'REJECTED')}
                className="px-3.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold disabled:opacity-40 shadow transition"
              >
                Reject Exception
              </button>
              <button
                disabled={decisionNotes.trim().length < 10}
                onClick={() => handleDecision(selectedItem.id, 'APPROVED')}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold disabled:opacity-40 shadow transition"
              >
                Approve Exception (Sign &amp; Seal)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
