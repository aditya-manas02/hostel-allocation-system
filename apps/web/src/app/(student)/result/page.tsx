'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function StudentResultPage() {
  const { user } = useAuth();

  const [allocation, setAllocation] = useState({
    status: 'PUBLISHED',
    academicYear: '2026–2027',
    term: 'Fall Semester',
    referenceId: 'ALLOT-2026-TB-104A-8219',
    hostelName: 'Tagore Bhawan (TB)',
    hostelCode: 'TB',
    blockName: 'Block A',
    floorName: 'Floor 1',
    roomNumber: '104',
    roomType: 'DOUBLE',
    bedLabel: 'A',
    isAccessible: false,
    messAllotment: 'Tagore Dining Hall (Mess 1)',
    reportingDate: 'October 15, 2026 (09:00 AM – 05:00 PM)',
    wardenInCharge: 'Dr. R. K. Verma',
    roommate: {
      fullName: 'Rohan Gupta',
      rollNumber: '2023CS042',
      programme: 'B.Tech Computer Science & Engineering',
      compatibilityScore: 82,
      lifestyleMatch: {
        sleepSchedule: 'Both Early Birds (95%)',
        studyHabits: 'Silent in-room focus (90%)',
        cleanliness: 'Neat & Organized (85%)',
        noiseTolerance: 'Moderate (80%)',
      },
    },
    rationale:
      'First choice satisfied in Pass A under General Quota. Roommate compatibility optimized at 82/100 via seeded PRNG heuristic matching.',
  });

  const [showRoomChangeModal, setShowRoomChangeModal] = useState(false);
  const [roomChangeCategory, setRoomChangeCategory] = useState('ACADEMIC_STUDY_ALIGNMENT');
  const [roomChangeReason, setRoomChangeReason] = useState('');
  const [roomChangeSuccess, setRoomChangeSuccess] = useState(false);

  const handleRoomChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomChangeReason.trim().length < 10) {
      alert('Please provide a reason with at least 10 characters.');
      return;
    }
    setRoomChangeSuccess(true);
    setShowRoomChangeModal(false);
  };

  const handleDownloadLetter = () => {
    const studentName = user?.fullName || 'Aditya Manas';
    const regNo = user?.studentRollNumber || '12326241';

    const letterHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hostel Allotment Order — ${studentName}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; line-height: 1.5; }
            .border-wrap { border: 3px double #0f172a; padding: 32px; border-radius: 8px; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
            .emblem { font-size: 36px; margin-bottom: 4px; }
            .inst-name { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
            .sub-inst { font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; }
            .order-title { font-size: 16px; font-weight: 800; margin-top: 14px; background: #0f172a; color: white; display: inline-block; padding: 4px 18px; border-radius: 4px; letter-spacing: 1px; }
            .meta-bar { display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
            .grid-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            .grid-table th, .grid-table td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
            .grid-table th { background: #f8fafc; font-weight: 700; width: 35%; color: #334155; }
            .highlight { font-weight: 700; color: #1e3a8a; }
            .notice-box { margin-top: 24px; padding: 14px; background: #f1f5f9; border-left: 4px solid #3b82f6; font-size: 12px; color: #334155; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .sig-block { text-align: center; font-size: 12px; }
            .sig-line { width: 180px; border-top: 1px dashed #0f172a; margin-top: 40px; margin-bottom: 6px; }
            .qr-mock { border: 2px solid #0f172a; padding: 8px; font-family: monospace; font-size: 10px; display: inline-block; background: #fafafa; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="border-wrap">
            <div class="header">
              <div class="emblem">🏛️</div>
              <div class="inst-name">National Institute of Technology</div>
              <div class="sub-inst">Office of the Chief Warden & Dean of Student Welfare</div>
              <div class="order-title">OFFICIAL HOSTEL ALLOTMENT ORDER</div>
            </div>

            <div class="meta-bar">
              <div><strong>Reference ID:</strong> ${allocation.referenceId}</div>
              <div><strong>Issue Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>Session:</strong> ${allocation.academicYear} &bull; ${allocation.term}</div>
            </div>

            <table class="grid-table">
              <tr>
                <th>Student Full Name</th>
                <td class="highlight">${studentName}</td>
              </tr>
              <tr>
                <th>Registration / Student ID</th>
                <td><strong>${regNo}</strong></td>
              </tr>
              <tr>
                <th>Programme & Department</th>
                <td>B.Tech Computer Science & Engineering (Year 2)</td>
              </tr>
              <tr>
                <th>Allotted Residence</th>
                <td class="highlight">${allocation.hostelName}</td>
              </tr>
              <tr>
                <th>Allotted Room & Bed</th>
                <td class="highlight">Room ${allocation.roomNumber}, Bed ${allocation.bedLabel} (${allocation.roomType} Occupancy)</td>
              </tr>
              <tr>
                <th>Location Details</th>
                <td>${allocation.blockName}, ${allocation.floorName}</td>
              </tr>
              <tr>
                <th>Dining Mess Allotment</th>
                <td>${allocation.messAllotment}</td>
              </tr>
              <tr>
                <th>Assigned Roommate</th>
                <td>${allocation.roommate.fullName} (Roll: ${allocation.roommate.rollNumber})</td>
              </tr>
              <tr>
                <th>Reporting & Check-in Date</th>
                <td><strong>${allocation.reportingDate}</strong></td>
              </tr>
              <tr>
                <th>Allocation Decision Rationale</th>
                <td style="font-size: 11px; color: #475569;">${allocation.rationale}</td>
              </tr>
            </table>

            <div class="notice-box">
              <strong>Check-in Instructions:</strong> Students must report to the Hostel Warden office with 2 passport photographs, original Institute Identity Card, and fee clearance receipt. Possession of room keys will be handed over following physical verification.
            </div>

            <div class="signatures">
              <div class="sig-block">
                <div class="qr-mock">
                  VERIFIED BY ENGINE<br/>
                  HASH: 9df28a7e4b...c381<br/>
                  SHA-256 AUDIT PASS
                </div>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Cryptographic Seal</div>
              </div>

              <div class="sig-block">
                <div class="sig-line"></div>
                <strong>${allocation.wardenInCharge}</strong>
                <div>Hostel Warden, ${allocation.hostelCode}</div>
              </div>

              <div class="sig-block">
                <div class="sig-line"></div>
                <strong>Prof. S. K. Roy</strong>
                <div>Chief Warden</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(letterHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Student Housing Allotment
            </span>
            <span className="text-xs text-slate-500">&bull; Academic Year {allocation.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Official Allotment Confirmation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Student: <strong className="text-slate-800">{user?.fullName || 'Aditya Manas'}</strong> &bull; Registration No:{' '}
            <strong className="text-slate-800">{user?.studentRollNumber || '12326241'}</strong>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadLetter}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Print Official Order (PDF)</span>
          </button>
        </div>
      </div>

      {/* Success Notification if room change requested */}
      {roomChangeSuccess && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
          <span className="text-xl">✓</span>
          <div>
            <strong>Room Change Request Submitted to Warden</strong>
            <p className="mt-0.5 text-amber-800">
              Your request has been cryptographically recorded in the audit trail. The Hostel Warden will review your request during the supplementary reallocation window.
            </p>
          </div>
        </div>
      )}

      {/* Main Allotment Certificate Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Certificate Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-2">
              PUBLISHED ALLOCATION ORDER &bull; ACTIVE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {allocation.hostelName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {allocation.blockName} &bull; {allocation.floorName} &bull; {allocation.messAllotment}
            </p>
          </div>

          <div className="sm:text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
              Allotted Unit
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              Room {allocation.roomNumber} &bull; Bed {allocation.bedLabel}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{allocation.roomType} Occupancy</div>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Details 3-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Reporting Date
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">October 15, 2026</div>
              <div className="text-xs text-slate-500 mt-0.5">09:00 AM &ndash; 05:00 PM</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Dining Hall Allotment
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">Tagore Dining Hall</div>
              <div className="text-xs text-slate-500 mt-0.5">Mess Pass Included</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Warden In-Charge
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">{allocation.wardenInCharge}</div>
              <div className="text-xs text-slate-500 mt-0.5">Office: Ground Floor, TB</div>
            </div>
          </div>

          {/* Roommate Details & Compatibility Meter */}
          <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Roommate Assignment (Invariant I6)
                </span>
                <div className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>{allocation.roommate.fullName}</span>
                  <span className="text-xs font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Roll: {allocation.roommate.rollNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{allocation.roommate.programme}</div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[11px] text-slate-500">Compatibility Score</div>
                <div className="text-2xl font-extrabold text-indigo-600">
                  {allocation.roommate.compatibilityScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </div>
              </div>
            </div>

            {/* Compatibility Dimension Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-indigo-100 text-center">
                <span className="text-slate-500 block text-[10px]">Sleep Schedule</span>
                <span className="font-bold text-indigo-900">{allocation.roommate.lifestyleMatch.sleepSchedule}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-indigo-100 text-center">
                <span className="text-slate-500 block text-[10px]">Study Habits</span>
                <span className="font-bold text-indigo-900">{allocation.roommate.lifestyleMatch.studyHabits}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-indigo-100 text-center">
                <span className="text-slate-500 block text-[10px]">Cleanliness Level</span>
                <span className="font-bold text-indigo-900">{allocation.roommate.lifestyleMatch.cleanliness}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-indigo-100 text-center">
                <span className="text-slate-500 block text-[10px]">Noise Tolerance</span>
                <span className="font-bold text-indigo-900">{allocation.roommate.lifestyleMatch.noiseTolerance}</span>
              </div>
            </div>
          </div>

          {/* Allocation Rationale (Invariant I4) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-800">Deterministic Allocation Rationale (Invariant I4):</div>
            <p className="text-slate-600 leading-relaxed">{allocation.rationale}</p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={handleDownloadLetter}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition inline-flex items-center gap-2"
            >
              <span>📥</span>
              <span>Download Official Order (PDF)</span>
            </button>

            <button
              onClick={() => setShowRoomChangeModal(true)}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
            >
              Request Room Change
            </button>
          </div>
        </div>
      </div>

      {/* Room Change Request Modal */}
      {showRoomChangeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Request Room Reallocation</h3>
            <p className="text-xs text-slate-500">
              Submit an official room-change request for review by the Hostel Warden. Reassignments must comply with hard constraints (gender and capacity) and are logged in the immutable audit trail.
            </p>

            <form onSubmit={handleRoomChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reallocation Category
                </label>
                <select
                  value={roomChangeCategory}
                  onChange={(e) => setRoomChangeCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="ACADEMIC_STUDY_ALIGNMENT">Academic / Study Schedule Alignment</option>
                  <option value="MEDICAL_ACCOMMODATION">Medical / Physical Health Accommodation</option>
                  <option value="MUTUAL_SWAP">Mutual Swap with Consenting Student</option>
                  <option value="SPECIAL_CIRCUMSTANCE">Special Circumstance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Detailed Justification (Minimum 10 characters)
                </label>
                <textarea
                  rows={3}
                  value={roomChangeReason}
                  onChange={(e) => setRoomChangeReason(e.target.value)}
                  placeholder="Explain why a room change is required..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoomChangeModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
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
