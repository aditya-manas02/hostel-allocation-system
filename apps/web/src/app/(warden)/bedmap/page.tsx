'use client';

import React, { useState } from 'react';

interface BedItem {
  id: string;
  label: string;
  isAccessible: boolean;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  occupantName?: string;
  explanation?: {
    preferenceRank: number | null;
    quotaBucket: string;
    compatibilityScore: number | null;
    rationale: string;
  };
  isOverridden?: boolean;
}

interface RoomItem {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  gender: string;
  beds: BedItem[];
}

export default function WardenBedMapPage() {
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [selectedBed, setSelectedBed] = useState<BedItem | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState('MEDICAL_ACCOMMODATION');
  const [overrideReason, setOverrideReason] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [chiefWardenId, setChiefWardenId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [draftStatus, setDraftStatus] = useState('UNDER_REVIEW');

  // Simulated floor rooms with beds
  const [rooms, setRooms] = useState<RoomItem[]>([
    {
      id: 'r-001',
      roomNumber: 'G01',
      type: 'DOUBLE',
      capacity: 2,
      gender: 'FEMALE',
      beds: [
        {
          id: 'b-01',
          label: 'A',
          isAccessible: true,
          status: 'OCCUPIED',
          occupantName: 'Ananya Sharma',
          explanation: {
            preferenceRank: 1,
            quotaBucket: 'PWD',
            compatibilityScore: 88,
            rationale: 'First choice satisfied. Matched to wheelchair-accessible ground floor unit.',
          },
        },
        {
          id: 'b-02',
          label: 'B',
          isAccessible: true,
          status: 'OCCUPIED',
          occupantName: 'Priya Patel',
          explanation: {
            preferenceRank: 1,
            quotaBucket: 'GENERAL',
            compatibilityScore: 88,
            rationale: 'First choice satisfied. Roommate compatibility score: 88/100.',
          },
        },
      ],
    },
    {
      id: 'r-002',
      roomNumber: 'G02',
      type: 'SINGLE',
      capacity: 1,
      gender: 'FEMALE',
      beds: [
        {
          id: 'b-03',
          label: 'A',
          isAccessible: true,
          status: 'OCCUPIED',
          occupantName: 'Sneha Rao',
          explanation: {
            preferenceRank: 2,
            quotaBucket: 'SCHOLARSHIP',
            compatibilityScore: null,
            rationale: 'Second choice satisfied under SCHOLARSHIP quota.',
          },
        },
      ],
    },
    {
      id: 'r-003',
      roomNumber: 'G03',
      type: 'TRIPLE',
      capacity: 3,
      gender: 'FEMALE',
      beds: [
        {
          id: 'b-04',
          label: 'A',
          isAccessible: false,
          status: 'OCCUPIED',
          occupantName: 'Deepa Verma',
          explanation: {
            preferenceRank: 1,
            quotaBucket: 'GENERAL',
            compatibilityScore: 75,
            rationale: 'First choice satisfied. Compatibility score: 75/100.',
          },
        },
        {
          id: 'b-05',
          label: 'B',
          isAccessible: false,
          status: 'OCCUPIED',
          occupantName: 'Meera Nair',
          explanation: {
            preferenceRank: 1,
            quotaBucket: 'GENERAL',
            compatibilityScore: 75,
            rationale: 'First choice satisfied. Compatibility score: 75/100.',
          },
        },
        {
          id: 'b-06',
          label: 'C',
          isAccessible: false,
          status: 'AVAILABLE',
        },
      ],
    },
  ]);

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideReason.trim().length < 10) {
      alert('Override reason must be at least 10 characters.');
      return;
    }

    if (selectedBed) {
      const updatedRooms = rooms.map((r) => ({
        ...r,
        beds: r.beds.map((b) =>
          b.id === selectedBed.id
            ? {
                ...b,
                status: 'OCCUPIED' as const,
                occupantName: 'Kavita Singh (Override)',
                isOverridden: true,
                explanation: {
                  preferenceRank: null,
                  quotaBucket: 'GENERAL',
                  compatibilityScore: 82,
                  rationale: `Manually reassigned: ${overrideReason}`,
                },
              }
            : b,
        ),
      }));

      setRooms(updatedRooms);
      setSuccessMsg(`Manual override applied to Bed ${selectedBed.label}! Invariant I5 logged.`);
      setShowOverrideModal(false);
      setSelectedBed(null);
      setOverrideReason('');
    }
  };

  const handleApprove = () => {
    setDraftStatus('APPROVED');
    setSuccessMsg('Hostel allocation approved! Ready for Chief Warden publication.');
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Visual Bed-Map & Review</h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
              {draftStatus}
            </span>
          </div>
          <p className="text-slate-500 mt-1">Gargi Bhawan (Female) — Interactive Floor Plan</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
          >
            ✓ Approve Hostel Draft
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-900 rounded-lg text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Floor Selector Tabs */}
      <div className="flex border-b gap-2">
        {[0, 1, 2, 3].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFloor(f)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition ${
              selectedFloor === f
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 0 ? 'Ground Floor (Accessible)' : `Floor ${f}`}
          </button>
        ))}
      </div>

      {/* Bed-Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="p-5 bg-white border rounded-xl shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-bold text-slate-900 text-lg">Room {room.roomNumber}</span>
                <span className="text-xs text-slate-400 ml-2">({room.type})</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {room.gender}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {room.beds.map((bed) => {
                const isOccupied = bed.status === 'OCCUPIED';
                return (
                  <div
                    key={bed.id}
                    onClick={() => setSelectedBed(bed)}
                    className={`p-3 rounded-lg border cursor-pointer transition text-left ${
                      bed.isOverridden
                        ? 'bg-amber-50 border-amber-300'
                        : isOccupied
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>Bed {bed.label}</span>
                      {bed.isAccessible && <span title="Accessible Unit">♿</span>}
                      {bed.isOverridden && <span className="text-amber-700">★ Override</span>}
                    </div>
                    <div className="text-xs text-slate-700 truncate mt-1">
                      {bed.occupantName || <span className="text-green-700 font-semibold">Vacant</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Bed Details Card */}
      {selectedBed && (
        <div className="p-6 bg-white border rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Bed {selectedBed.label} Details
              </h2>
              <p className="text-xs text-slate-500">
                Status: <strong className="text-slate-800">{selectedBed.status}</strong>
                {selectedBed.isAccessible && ' | Wheelchair Accessible Unit'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Reassign / Override Bed (I5)
              </button>
              <button
                onClick={() => setSelectedBed(null)}
                className="px-3 py-2 border rounded-lg text-xs text-slate-500 hover:bg-slate-50"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {selectedBed.explanation ? (
            <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                Decision Explanation (Invariant I4):
              </div>
              <div><strong>Assigned Student:</strong> {selectedBed.occupantName}</div>
              <div><strong>Preference Rank:</strong> {selectedBed.explanation.preferenceRank ? `#${selectedBed.explanation.preferenceRank}` : 'Fallback'}</div>
              <div><strong>Quota Bucket:</strong> {selectedBed.explanation.quotaBucket}</div>
              <div><strong>Roommate Compatibility Score:</strong> {selectedBed.explanation.compatibilityScore ? `${selectedBed.explanation.compatibilityScore}/100` : 'N/A'}</div>
              <div><strong>Decision Rationale:</strong> {selectedBed.explanation.rationale}</div>
            </div>
          ) : (
            <div className="text-sm text-green-700 font-medium">
              This bed is currently available and unassigned.
            </div>
          )}
        </div>
      )}

      {/* Override Modal (Invariant I5) */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Manual Override for Bed {selectedBed?.label}
            </h3>
            <p className="text-xs text-slate-500">
              Invariant I5 requires a mandatory non-empty reason category and descriptive text (minimum 10 characters). All overrides are recorded in the append-only audit log.
            </p>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Override Category
                </label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="mt-1 w-full p-2 border rounded text-xs"
                >
                  <option value="MEDICAL_ACCOMMODATION">Medical Accommodation</option>
                  <option value="ACCESSIBILITY_NEEDS">Accessibility Needs</option>
                  <option value="ADMINISTRATIVE_CORRECTION">Administrative Correction</option>
                  <option value="DISCIPLINARY_SEPARATION">Disciplinary Separation</option>
                  <option value="SPECIAL_QUOTA_ADJUSTMENT">Special Quota Adjustment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Reason Description (Min. 10 characters)
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Detail the justification for this bed reassignment..."
                  className="mt-1 w-full p-2 border rounded text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEscalated}
                    onChange={(e) => setIsEscalated(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span className="font-semibold">
                    Escalate to Chief Warden (Required if violating hard constraint)
                  </span>
                </label>

                {isEscalated && (
                  <input
                    type="text"
                    value={chiefWardenId}
                    onChange={(e) => setChiefWardenId(e.target.value)}
                    placeholder="Chief Warden Approval Reference ID"
                    className="w-full p-1.5 border rounded bg-white text-xs"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 border rounded text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded"
                >
                  Commit Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
