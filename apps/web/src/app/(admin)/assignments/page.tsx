'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  StudentRosterItem,
  getStudentRoster,
  assignStudentToBed,
} from '../../../lib/allocationStore';

export default function AdminAssignmentsPage() {
  const { user } = useAuth();
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ALLOCATED' | 'UNALLOCATED'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE' | 'COED'>('ALL');
  const [quotaFilter, setQuotaFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected student for assignment/reassignment modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterItem | null>(null);

  // Form states for assignment
  const [hostelCode, setHostelCode] = useState('TB');
  const [blockName, setBlockName] = useState('Block A');
  const [floorNum, setFloorNum] = useState<number>(1);
  const [roomNumber, setRoomNumber] = useState('101');
  const [bedLabel, setBedLabel] = useState('A');
  const [roomType, setRoomType] = useState<'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'>('DOUBLE');
  const [reason, setReason] = useState('Administrative direct allotment according to merit and category priority.');

  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const hostels = [
    { code: 'TB', name: 'Tagore Bhawan (TB)', gender: 'MALE', roomsCount: 592 },
    { code: 'AB', name: 'Aryabhatta Bhawan (AB)', gender: 'MALE', roomsCount: 584 },
    { code: 'GB', name: 'Gargi Bhawan (GB)', gender: 'FEMALE', roomsCount: 604 },
    { code: 'SB', name: 'Sarojini Bhawan (SB)', gender: 'FEMALE', roomsCount: 598 },
    { code: 'KB', name: 'Kalam International (KB)', gender: 'COED', roomsCount: 572 },
  ];

  const loadRoster = () => {
    setRoster(getStudentRoster());
  };

  useEffect(() => {
    loadRoster();

    const handleUpdate = () => loadRoster();
    window.addEventListener('hostel_roster_updated', handleUpdate);
    return () => window.removeEventListener('hostel_roster_updated', handleUpdate);
  }, []);

  // Filter students
  const filteredRoster = roster.filter((student) => {
    if (statusFilter === 'ALLOCATED' && !student.allocatedBed) return false;
    if (statusFilter === 'UNALLOCATED' && student.allocatedBed) return false;
    if (genderFilter !== 'ALL' && student.gender !== genderFilter) return false;
    if (quotaFilter !== 'ALL' && student.quotaCategory !== quotaFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = student.fullName.toLowerCase().includes(q);
      const matchRoll = student.rollNumber.toLowerCase().includes(q);
      const matchProg = student.programme.toLowerCase().includes(q);
      const matchRoom =
        student.allocatedBed &&
        `${student.allocatedBed.hostelCode} ${student.allocatedBed.roomNumber} ${student.allocatedBed.blockName}`
          .toLowerCase()
          .includes(q);

      if (!matchName && !matchRoll && !matchProg && !matchRoom) return false;
    }

    return true;
  });

  const totalCount = roster.length;
  const allocatedCount = roster.filter((s) => s.allocatedBed).length;
  const unallocatedCount = totalCount - allocatedCount;

  const handleOpenAssignModal = (student: StudentRosterItem) => {
    setSelectedStudent(student);

    if (student.allocatedBed) {
      setHostelCode(student.allocatedBed.hostelCode);
      setBlockName(student.allocatedBed.blockName);
      setRoomNumber(student.allocatedBed.roomNumber);
      setBedLabel(student.allocatedBed.bedLabel);
      setRoomType(student.allocatedBed.roomType as any);
      setReason(`Reassigning student ${student.fullName} to optimize department grouping.`);
    } else {
      // Pick matching hostel by gender
      if (student.gender === 'FEMALE') {
        setHostelCode('GB');
      } else if (student.gender === 'COED') {
        setHostelCode('KB');
      } else {
        setHostelCode('TB');
      }

      // If accessible is required, default to ground floor
      if (student.isAccessibleRequired) {
        setFloorNum(0);
        setRoomNumber('G01');
      } else {
        setFloorNum(1);
        setRoomNumber('102');
      }

      setBedLabel('A');
      setRoomType('DOUBLE');
      setReason(`Manual allotment of waitlisted applicant ${student.fullName} under ${student.quotaCategory} quota.`);
    }
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (reason.trim().length < 10) {
      alert('Administrative justification must be at least 10 characters (Invariant I5).');
      return;
    }

    const hostelObj = hostels.find((h) => h.code === hostelCode) || hostels[0]!;
    const floorLabel = floorNum === 0 ? 'Ground Floor (Accessible ♿)' : `Floor ${floorNum}`;

    const ok = assignStudentToBed(
      selectedStudent.rollNumber,
      {
        hostelCode,
        hostelName: hostelObj.name,
        blockName,
        floorName: floorLabel,
        roomNumber,
        bedLabel,
        roomType,
      },
      user?.fullName || 'Hostel Administrator',
      reason
    );

    if (ok) {
      setNotification({
        type: 'success',
        message: `Successfully allocated Bed ${bedLabel} in Room ${roomNumber} (${hostelObj.name}) to ${selectedStudent.fullName} (${selectedStudent.rollNumber}).`,
      });
      setSelectedStudent(null);
      loadRoster();
      setTimeout(() => setNotification(null), 6000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Administrative Control
            </span>
            <span className="text-xs text-slate-500">&bull; Manual Allotments &amp; Roster Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Student Hostel Room Allocations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Directly allot rooms, manage waitlisted students, reassign beds, and override placements with full Invariant I5 audit trail.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/room-changes"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Room Change Requests</span>
          </Link>
          <Link
            href="/bedmap"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
          >
            <span>🗺️</span>
            <span>Visual Bed Map</span>
          </Link>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Applicants</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{totalCount}</div>
          <p className="text-xs text-slate-500 mt-1">Across all degree programmes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Allotted Students</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">{allocatedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Confirmed hostel accommodation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Waitlisted / Unallocated</div>
          <div className="mt-2 text-3xl font-extrabold text-amber-600">{unallocatedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Eligible for manual direct allotment</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by student name, roll number, programme, or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses ({totalCount})</option>
              <option value="ALLOCATED">Allotted ({allocatedCount})</option>
              <option value="UNALLOCATED">Waitlisted / Unallocated ({unallocatedCount})</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male Hostels (TB, AB)</option>
              <option value="FEMALE">Female Hostels (GB, SB)</option>
              <option value="COED">Coed (KB)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm">
            Student Allotment Roster ({filteredRoster.length})
          </h2>
          <span className="text-xs text-slate-500">Live Synchronized with Student &amp; Bed Map Portals</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">Student Details</th>
                <th className="px-6 py-3.5">Programme &amp; Year</th>
                <th className="px-6 py-3.5">Quota / Accessibility</th>
                <th className="px-6 py-3.5">Current Bed Allotment</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRoster.map((student) => {
                  const isAllocated = !!student.allocatedBed;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      {/* Student Details */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{student.fullName}</div>
                        <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                          Roll: {student.rollNumber} &bull; {student.email}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              student.gender === 'MALE'
                                ? 'bg-blue-100 text-blue-800'
                                : student.gender === 'FEMALE'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {student.gender}
                          </span>
                        </div>
                      </td>

                      {/* Programme */}
                      <td className="px-6 py-4 text-slate-700">
                        <div className="font-medium">{student.programme}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Year {student.yearOfStudy}</div>
                      </td>

                      {/* Quota & Needs */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {student.quotaCategory}
                        </span>
                        {student.isAccessibleRequired && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-700">
                            <span>♿</span> Ground floor wheelchair required
                          </div>
                        )}
                      </td>

                      {/* Allotment Status */}
                      <td className="px-6 py-4">
                        {isAllocated ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span>{student.allocatedBed?.hostelCode} &bull; Room {student.allocatedBed?.roomNumber}</span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              Bed {student.allocatedBed?.bedLabel} ({student.allocatedBed?.roomType}) &bull; {student.allocatedBed?.blockName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {student.allocatedBed?.hostelName}
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span>⏳</span>
                            <span>Waitlisted / Unallocated</span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {isAllocated ? (
                          <button
                            onClick={() => handleOpenAssignModal(student)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-300"
                          >
                            Reassign Bed &rarr;
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(student)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                          >
                            Assign Room &rarr;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign / Reassign Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {selectedStudent.allocatedBed ? 'Reassign Bed' : 'Direct Room Allotment'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Assign Hostel Bed for {selectedStudent.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  Roll: <strong className="text-slate-800">{selectedStudent.rollNumber}</strong> &bull; {selectedStudent.programme} &bull; Gender: {selectedStudent.gender}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {selectedStudent.isAccessibleRequired && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
                <span className="text-lg">♿</span>
                <div>
                  <strong>Accessible Bed Required:</strong> Student is flagged for PWD accommodation. Ground floor allocation is strongly advised to maintain Invariant I8.
                </div>
              </div>
            )}

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              {/* Target Hostel */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Target Hostel
                </label>
                <select
                  value={hostelCode}
                  onChange={(e) => setHostelCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-medium"
                >
                  {hostels.map((h) => (
                    <option key={h.code} value={h.code}>
                      {h.name} &bull; {h.gender}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block & Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Block
                  </label>
                  <select
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Block D">Block D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Floor
                  </label>
                  <select
                    value={floorNum}
                    onChange={(e) => {
                      const f = parseInt(e.target.value);
                      setFloorNum(f);
                      if (f === 0) setRoomNumber('G01');
                      else setRoomNumber(`${f}01`);
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  >
                    <option value={0}>Ground Floor (♿ Accessible)</option>
                    <option value={1}>Floor 1</option>
                    <option value={2}>Floor 2</option>
                    <option value={3}>Floor 3</option>
                  </select>
                </div>
              </div>

              {/* Room Number & Bed Label & Room Type */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 104"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bed Label
                  </label>
                  <select
                    value={bedLabel}
                    onChange={(e) => setBedLabel(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  >
                    <option value="A">Bed A</option>
                    <option value="B">Bed B</option>
                    <option value="C">Bed C</option>
                    <option value="D">Bed D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Room Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                  >
                    <option value="SINGLE">Single Occupancy</option>
                    <option value="DOUBLE">Double Occupancy</option>
                    <option value="TRIPLE">Triple Occupancy</option>
                    <option value="QUAD">Quad Occupancy</option>
                  </select>
                </div>
              </div>

              {/* Mandatory Reason (Invariant I5) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Administrative Reason / Override Justification (Min 10 characters)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the administrative or medical basis for this room assignment..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
                <span className="text-[10px] text-slate-400">
                  Enforces Invariant I5: All direct assignments are stamped to the SHA-256 tamper-evident audit log.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border rounded-lg text-xs text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Confirm &amp; Allot Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
