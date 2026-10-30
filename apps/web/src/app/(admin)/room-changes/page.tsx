'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  RoomChangeRequest,
  getRoomChangeRequests,
  approveRoomChangeRequest,
  rejectRoomChangeRequest,
} from '../../../lib/allocationStore';

export default function RoomChangeRequestsAdminPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RoomChangeRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected request for Approve & Assign Modal
  const [selectedRequest, setSelectedRequest] = useState<RoomChangeRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  // New room assignment fields
  const [targetHostelCode, setTargetHostelCode] = useState('TB');
  const [targetBlock, setTargetBlock] = useState('Block A');
  const [targetFloor, setTargetFloor] = useState(1);
  const [targetRoomNum, setTargetRoomNum] = useState('102');
  const [targetBedLabel, setTargetBedLabel] = useState('A');
  const [targetRoomType, setTargetRoomType] = useState<'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD'>('SINGLE');

  // Reject Modal state
  const [rejectingRequest, setRejectingRequest] = useState<RoomChangeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Load requests
  const loadRequests = () => {
    setRequests(getRoomChangeRequests());
  };

  useEffect(() => {
    loadRequests();

    const handleUpdate = () => loadRequests();
    window.addEventListener('hostel_room_change_updated', handleUpdate);
    return () => window.removeEventListener('hostel_room_change_updated', handleUpdate);
  }, []);

  const hostels = [
    { code: 'TB', name: 'Tagore Bhawan (TB)', gender: 'MALE' },
    { code: 'AB', name: 'Aryabhatta Bhawan (AB)', gender: 'MALE' },
    { code: 'GB', name: 'Gargi Bhawan (GB)', gender: 'FEMALE' },
    { code: 'SB', name: 'Sarojini Bhawan (SB)', gender: 'FEMALE' },
    { code: 'KB', name: 'Kalam International House (KB)', gender: 'COED' },
  ];

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = r.studentName.toLowerCase().includes(q);
      const matchRoll = r.studentRoll.toLowerCase().includes(q);
      const matchReason = r.reasonText.toLowerCase().includes(q);
      const matchHostel = r.requestedHostelName.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchReason && !matchHostel) return false;
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  const handleOpenApproveModal = (req: RoomChangeRequest) => {
    setSelectedRequest(req);
    setTargetHostelCode(req.requestedHostelCode || 'TB');
    setTargetRoomType((req.requestedRoomType as any) || 'SINGLE');
    setDecisionNotes(`Approved room reallocation request upon review of academic and medical grounds.`);
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const hostelObj = hostels.find((h) => h.code === targetHostelCode) || hostels[0]!;
    const floorLabel = targetFloor === 0 ? 'Ground Floor (Accessible ♿)' : `Floor ${targetFloor}`;

    const updated = approveRoomChangeRequest(
      selectedRequest.id,
      {
        hostelCode: targetHostelCode,
        hostelName: hostelObj.name,
        blockName: targetBlock,
        floorName: floorLabel,
        roomNumber: targetRoomNum,
        bedLabel: targetBedLabel,
        roomType: targetRoomType,
      },
      decisionNotes,
      user?.fullName || 'Hostel Administrator'
    );

    if (updated) {
      setNotification({
        type: 'success',
        message: `Room Change #${selectedRequest.id} approved! ${selectedRequest.studentName} has been allotted ${hostelObj.name}, Room ${targetBlock.replace('Block ', '')}-${targetRoomNum}, Bed ${targetBedLabel}.`,
      });
      setSelectedRequest(null);
      loadRequests();
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    if (rejectionReason.trim().length < 5) {
      alert('Please provide a descriptive reason for rejecting this request.');
      return;
    }

    const updated = rejectRoomChangeRequest(
      rejectingRequest.id,
      rejectionReason,
      user?.fullName || 'Hostel Administrator'
    );

    if (updated) {
      setNotification({
        type: 'info',
        message: `Request #${rejectingRequest.id} for ${rejectingRequest.studentName} has been rejected.`,
      });
      setRejectingRequest(null);
      setRejectionReason('');
      loadRequests();
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Housing Operations
            </span>
            <span className="text-xs text-slate-500">&bull; Invariant I5 Change Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Student Room Change Requests Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review room reallocation requests submitted by students, verify justifications, and execute immediate bed reassignments.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/assignments"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
          >
            <span>🏢</span>
            <span>Direct Room Allocations &rarr;</span>
          </Link>
          <Link
            href="/bedmap"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            Visual Bed Map
          </Link>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
              : 'bg-blue-50 border border-blue-200 text-blue-950'
          }`}
        >
          <span>✓</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Requests</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{requests.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Submitted across campus</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-semibold">Action required</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Approved &amp; Reallocated</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-semibold">Beds reassigned</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Rejected Requests</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-1">{rejectedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">With reason logged</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: `All Requests (${requests.length})` },
            { id: 'PENDING', label: `Pending (${pendingCount})` },
            { id: 'APPROVED', label: `Approved (${approvedCount})` },
            { id: 'REJECTED', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll number, hostel..."
            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">Current Room</th>
                <th className="px-5 py-3.5">Requested Reallocation</th>
                <th className="px-5 py-3.5">Category &amp; Justification</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const isAditya = req.studentRoll === '12326241' || req.studentName.includes('Aditya Manas');

                return (
                  <tr
                    key={req.id}
                    className={`hover:bg-slate-50/80 transition ${
                      isAditya ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900 text-sm">{req.studentName}</div>
                        {isAditya && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                            Primary Student
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Roll: <strong>{req.studentRoll}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.id}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{req.currentHostelName}</div>
                      <div className="text-[11px] text-indigo-600 font-bold mt-0.5">
                        Room {req.currentRoom} &bull; Bed {req.currentBed}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{req.requestedHostelName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Preferred: <strong className="text-slate-800">{req.requestedRoomType} Room</strong>
                      </div>
                      {req.preferredRoom && (
                        <div className="text-[10px] text-slate-400">Target: Room {req.preferredRoom}</div>
                      )}
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {req.reasonCategory.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                        {req.reasonText}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(req.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}
                      >
                        {req.status}
                      </span>
                      {req.status === 'APPROVED' && req.assignedRoom && (
                        <div className="text-[10px] text-emerald-700 font-bold mt-1">
                          Allotted: {req.assignedRoom.roomNumber}-{req.assignedRoom.bedLabel}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenApproveModal(req)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
                          >
                            Approve &amp; Assign Bed
                          </button>
                          <button
                            onClick={() => setRejectingRequest(req)}
                            className="px-3 py-1.5 border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-lg font-bold text-xs transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          Decided by {req.decidedBy || 'Admin'}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-sm">
            No room change requests found matching current filter or search.
          </div>
        )}
      </div>

      {/* APPROVE & ASSIGN ROOM MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Approve Reallocation
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedRequest.id}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Assign New Room for {selectedRequest.studentName}
              </h3>
              <p className="text-xs text-slate-500">
                Roll No: <strong>{selectedRequest.studentRoll}</strong> &bull; Current: {selectedRequest.currentHostelName}, Room {selectedRequest.currentRoom} (Bed {selectedRequest.currentBed})
              </p>
            </div>

            {/* Request Justification Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-700">Student&apos;s Justification:</div>
              <p className="text-slate-600 leading-relaxed">{selectedRequest.reasonText}</p>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Hostel */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Assign To Hostel
                  </label>
                  <select
                    value={targetHostelCode}
                    onChange={(e) => setTargetHostelCode(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                  >
                    {hostels.map((h) => (
                      <option key={h.code} value={h.code}>
                        {h.name} ({h.gender})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Block */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Block
                  </label>
                  <select
                    value={targetBlock}
                    onChange={(e) => setTargetBlock(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                  >
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Block D">Block D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Floor Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Floor
                  </label>
                  <select
                    value={targetFloor}
                    onChange={(e) => setTargetFloor(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                  >
                    <option value={0}>Ground Floor (♿ Accessible)</option>
                    <option value={1}>Floor 1</option>
                    <option value={2}>Floor 2</option>
                    <option value={3}>Floor 3</option>
                  </select>
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={targetRoomNum}
                    onChange={(e) => setTargetRoomNum(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    placeholder="e.g. 102, 201, G01"
                    required
                  />
                </div>

                {/* Bed Label */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Bed Label
                  </label>
                  <select
                    value={targetBedLabel}
                    onChange={(e) => setTargetBedLabel(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white font-mono font-bold"
                  >
                    <option value="A">Bed A</option>
                    <option value="B">Bed B</option>
                    <option value="C">Bed C</option>
                    <option value="D">Bed D</option>
                  </select>
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Room Type Designation
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTargetRoomType(t)}
                      className={`py-2 rounded-lg text-xs font-bold border transition ${
                        targetRoomType === t
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decision Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Admin Decision Notes (Mandatory for Invariant I5 audit log)
                </label>
                <textarea
                  rows={2}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Record rationale for approving this room reassignment..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Confirm Allotment &amp; Reassign Bed &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Reject Room Change Request #{rejectingRequest.id}
            </h3>
            <p className="text-xs text-slate-500">
              Student: {rejectingRequest.studentName} ({rejectingRequest.studentRoll})
            </p>

            <form onSubmit={handleConfirmRejection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Rejection Reason / Guidance for Student
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. No single occupancy vacancies currently available in Aryabhatta Bhawan. Eligible to reapply in supplementary round..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingRequest(null)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
