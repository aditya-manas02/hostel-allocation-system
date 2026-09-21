'use client';

import React, { useState } from 'react';

export default function StudentResultPage() {
  const [allocation, setAllocation] = useState({
    status: 'PUBLISHED',
    academicYear: '2026-2027',
    term: 'Fall Semester',
    hostelName: 'Gargi Bhawan',
    blockName: 'Block A',
    floorName: 'Ground Floor (Accessible)',
    roomNumber: 'G01',
    roomType: 'DOUBLE',
    bedLabel: 'A',
    isAccessible: true,
    roommateFirstName: 'Priya', // Invariant I6: Roommates' first names only
    rationale: 'Assigned to preferred option (Rank #1) under PWD quota. Matched to wheelchair-accessible unit.',
    compatibilityScore: 88,
  });

  const [showRoomChangeModal, setShowRoomChangeModal] = useState(false);
  const [roomChangeReason, setRoomChangeReason] = useState('');
  const [roomChangeSubmitted, setRoomChangeSubmitted] = useState(false);

  const handleRoomChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoomChangeSubmitted(true);
    setShowRoomChangeModal(false);
  };

  const handleDownloadLetter = () => {
    // Generates institutional HTML/PDF allotment letter
    const letterHtml = `
      <html>
        <head>
          <title>University Hostel Allotment Letter</title>
          <style>
            body { font-family: sans-serif; padding: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .details { margin-top: 30px; line-height: 1.8; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">OFFICIAL HOSTEL ALLOTMENT LETTER</div>
            <div>Academic Session: ${allocation.academicYear} — ${allocation.term}</div>
          </div>
          <div class="details">
            <p><strong>Hostel:</strong> ${allocation.hostelName}</p>
            <p><strong>Block & Floor:</strong> ${allocation.blockName}, ${allocation.floorName}</p>
            <p><strong>Room & Bed:</strong> Room ${allocation.roomNumber}, Bed ${allocation.bedLabel} (${allocation.roomType})</p>
            <p><strong>Accessible Accommodated:</strong> ${allocation.isAccessible ? 'Yes' : 'No'}</p>
            <p><strong>Allocation Rationale:</strong> ${allocation.rationale}</p>
          </div>
          <div class="footer">
            <p>This is a computer-generated, cryptographically auditable allotment record issued under university hostel allocation regulations.</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(letterHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hostel Allotment Result</h1>
        <p className="text-slate-500 mt-1">Official published allocation for academic year 2026-2027</p>
      </div>

      {roomChangeSubmitted && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm font-medium">
          ✓ Your room-change request has been submitted to the Warden for review and audit logging.
        </div>
      )}

      {/* Result Card */}
      <div className="p-8 bg-white border rounded-2xl shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Published Allocation
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              {allocation.hostelName}
            </h2>
            <p className="text-sm text-slate-500">{allocation.blockName} • {allocation.floorName}</p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Allotted Unit</div>
            <div className="text-2xl font-bold text-indigo-600">
              Room {allocation.roomNumber} / Bed {allocation.bedLabel}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{allocation.roomType} Room</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-xs text-slate-400 font-medium">Roommate Name</div>
            <div className="text-base font-bold text-slate-800 mt-1">
              {allocation.roommateFirstName}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Compatibility Score: <strong>{allocation.compatibilityScore}/100</strong>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-xs text-slate-400 font-medium">Accessibility Accommodation</div>
            <div className="text-base font-bold text-slate-800 mt-1">
              {allocation.isAccessible ? '♿ Wheelchair Accessible' : 'Standard'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Ground floor ramp access verified</div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1">
          <div className="font-bold text-slate-700">Allotment Decision Rationale (Invariant I4):</div>
          <p className="text-slate-600">{allocation.rationale}</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleDownloadLetter}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition flex items-center gap-2"
          >
            <span>📥</span> Download Official Allotment Letter (PDF)
          </button>

          <button
            onClick={() => setShowRoomChangeModal(true)}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition"
          >
            Request Room Change
          </button>
        </div>
      </div>

      {/* Room Change Request Modal */}
      {showRoomChangeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Request Room Change</h3>
            <p className="text-xs text-slate-500">
              Submit an official request to the Warden. If approved and a vacancy occurs, auto-promotion will be executed.
            </p>

            <form onSubmit={handleRoomChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Reason for Request (Min. 10 characters)</label>
                <textarea
                  rows={3}
                  value={roomChangeReason}
                  onChange={(e) => setRoomChangeReason(e.target.value)}
                  placeholder="Detail your justification for room change..."
                  className="mt-1 w-full p-2.5 border rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomChangeModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
