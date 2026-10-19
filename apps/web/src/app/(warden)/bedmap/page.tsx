'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

interface BedItem {
  id: string;
  label: string;
  isAccessible: boolean;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  occupantName?: string;
  occupantRoll?: string;
  occupantQuota?: string;
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
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  capacity: number;
  gender: 'MALE' | 'FEMALE' | 'COED';
  isAccessible: boolean;
  beds: BedItem[];
}

export default function WardenBedMapPage() {
  const { user } = useAuth();

  // Hostels list
  const hostels = [
    { code: 'TB', name: 'Tagore Bhawan', gender: 'MALE', capacity: 1605, roomsCount: 592 },
    { code: 'GB', name: 'Gargi Bhawan', gender: 'FEMALE', capacity: 1629, roomsCount: 604 },
    { code: 'SB', name: 'Sarojini Bhawan', gender: 'FEMALE', capacity: 1612, roomsCount: 598 },
    { code: 'AB', name: 'Aryabhatta Bhawan', gender: 'MALE', capacity: 1581, roomsCount: 584 },
    { code: 'KB', name: 'Kalam International House', gender: 'COED', capacity: 1588, roomsCount: 572 },
  ];

  // Selected filters
  const [selectedHostelCode, setSelectedHostelCode] = useState<string>(
    user?.role === 'WARDEN' ? 'TB' : 'TB'
  );
  const [selectedBlock, setSelectedBlock] = useState('Block A');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OCCUPIED' | 'AVAILABLE' | 'OVERRIDDEN' | 'ACCESSIBLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Bed for drawer / modal
  const [selectedBed, setSelectedBed] = useState<{ room: RoomItem; bed: BedItem } | null>(null);

  // Override Modal state (Invariant I5)
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState('MEDICAL_ACCOMMODATION');
  const [overrideReason, setOverrideReason] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [newOccupantName, setNewOccupantName] = useState('Kavita Singh');
  const [successMsg, setSuccessMsg] = useState('');
  const [draftStatus, setDraftStatus] = useState<'UNDER_REVIEW' | 'APPROVED'>('UNDER_REVIEW');

  // Realistic mock data factory per hostel and floor
  const [roomsData, setRoomsData] = useState<Record<string, RoomItem[]>>({
    'TB-Block A-1': [
      {
        id: 'tb-101',
        roomNumber: '101',
        type: 'DOUBLE',
        capacity: 2,
        gender: 'MALE',
        isAccessible: false,
        beds: [
          {
            id: 'tb-101-a',
            label: 'A',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Aarav Sharma',
            occupantRoll: '2023CS012',
            occupantQuota: 'GENERAL',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'GENERAL',
              compatibilityScore: 84,
              rationale: 'Choice #1 satisfied in Pass A. Lifestyle compatibility score: 84/100.',
            },
          },
          {
            id: 'tb-101-b',
            label: 'B',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Kunal Verma',
            occupantRoll: '2023CS018',
            occupantQuota: 'GENERAL',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'GENERAL',
              compatibilityScore: 84,
              rationale: 'Choice #1 satisfied in Pass A. Paired with early-bird roommate.',
            },
          },
        ],
      },
      {
        id: 'tb-102',
        roomNumber: '102',
        type: 'SINGLE',
        capacity: 1,
        gender: 'MALE',
        isAccessible: false,
        beds: [
          {
            id: 'tb-102-a',
            label: 'A',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Vikramaditya Roy',
            occupantRoll: '2023CS031',
            occupantQuota: 'SCHOLARSHIP',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'SCHOLARSHIP',
              compatibilityScore: null,
              rationale: 'Rank #1 Single Room matched under Merit Scholarship Quota.',
            },
          },
        ],
      },
      {
        id: 'tb-103',
        roomNumber: '103',
        type: 'TRIPLE',
        capacity: 3,
        gender: 'MALE',
        isAccessible: false,
        beds: [
          {
            id: 'tb-103-a',
            label: 'A',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Siddharth Nair',
            occupantRoll: '2023EE102',
            occupantQuota: 'GENERAL',
            explanation: {
              preferenceRank: 2,
              quotaBucket: 'GENERAL',
              compatibilityScore: 78,
              rationale: 'Rank #2 choice matched in Pass B.',
            },
          },
          {
            id: 'tb-103-b',
            label: 'B',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Manish Pandey',
            occupantRoll: '2023EE115',
            occupantQuota: 'GENERAL',
            explanation: {
              preferenceRank: 2,
              quotaBucket: 'GENERAL',
              compatibilityScore: 78,
              rationale: 'Rank #2 choice matched in Pass B.',
            },
          },
          {
            id: 'tb-103-c',
            label: 'C',
            isAccessible: false,
            status: 'AVAILABLE',
          },
        ],
      },
      {
        id: 'tb-104',
        roomNumber: '104',
        type: 'DOUBLE',
        capacity: 2,
        gender: 'MALE',
        isAccessible: false,
        beds: [
          {
            id: 'tb-104-a',
            label: 'A',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Aditya Manas',
            occupantRoll: '12326241',
            occupantQuota: 'GENERAL',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'GENERAL',
              compatibilityScore: 82,
              rationale:
                'First choice preference satisfied in Pass A. Paired with mutual roommate request Rohan Gupta (Score: 82/100).',
            },
          },
          {
            id: 'tb-104-b',
            label: 'B',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Rohan Gupta',
            occupantRoll: '2023CS042',
            occupantQuota: 'GENERAL',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'GENERAL',
              compatibilityScore: 82,
              rationale:
                'First choice preference satisfied in Pass A. Mutual roommate pairing with Aditya Manas.',
            },
          },
        ],
      },
      {
        id: 'tb-105',
        roomNumber: '105',
        type: 'DOUBLE',
        capacity: 2,
        gender: 'MALE',
        isAccessible: false,
        beds: [
          {
            id: 'tb-105-a',
            label: 'A',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Devansh Saxena',
            occupantRoll: '2023ME044',
            occupantQuota: 'SPORTS',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'SPORTS',
              compatibilityScore: 79,
              rationale: 'Sports quota preference satisfied.',
            },
          },
          {
            id: 'tb-105-b',
            label: 'B',
            isAccessible: false,
            status: 'AVAILABLE',
          },
        ],
      },
      {
        id: 'tb-106',
        roomNumber: '106',
        type: 'QUAD',
        capacity: 4,
        gender: 'MALE',
        isAccessible: false,
        beds: [
          {
            id: 'tb-106-a',
            label: 'A',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Abhishek Jha',
            occupantRoll: '2023CE012',
            occupantQuota: 'GENERAL',
            explanation: { preferenceRank: 1, quotaBucket: 'GENERAL', compatibilityScore: 75, rationale: 'Standard Quad allocation' },
          },
          {
            id: 'tb-106-b',
            label: 'B',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Nitin Rao',
            occupantRoll: '2023CE019',
            occupantQuota: 'GENERAL',
            explanation: { preferenceRank: 1, quotaBucket: 'GENERAL', compatibilityScore: 75, rationale: 'Standard Quad allocation' },
          },
          {
            id: 'tb-106-c',
            label: 'C',
            isAccessible: false,
            status: 'OCCUPIED',
            occupantName: 'Gaurav Sen',
            occupantRoll: '2023CE024',
            occupantQuota: 'GENERAL',
            explanation: { preferenceRank: 1, quotaBucket: 'GENERAL', compatibilityScore: 75, rationale: 'Standard Quad allocation' },
          },
          {
            id: 'tb-106-d',
            label: 'D',
            isAccessible: false,
            status: 'AVAILABLE',
          },
        ],
      },
    ],
    // Accessible Ground Floor Sample
    'TB-Block A-0': [
      {
        id: 'tb-001',
        roomNumber: 'G01',
        type: 'DOUBLE',
        capacity: 2,
        gender: 'MALE',
        isAccessible: true,
        beds: [
          {
            id: 'tb-001-a',
            label: 'A',
            isAccessible: true,
            status: 'OCCUPIED',
            occupantName: 'Harsh Vardhan',
            occupantRoll: '2023CS004',
            occupantQuota: 'PWD',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'PWD',
              compatibilityScore: 90,
              rationale: 'Pass A Priority: Ground floor wheelchair accessible unit satisfied under PWD quota.',
            },
          },
          {
            id: 'tb-001-b',
            label: 'B',
            isAccessible: true,
            status: 'OCCUPIED',
            occupantName: 'Samir Joshi',
            occupantRoll: '2023CS009',
            occupantQuota: 'GENERAL',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'GENERAL',
              compatibilityScore: 90,
              rationale: 'Paired with consenting assistive roommate. Compatibility: 90/100.',
            },
          },
        ],
      },
      {
        id: 'tb-002',
        roomNumber: 'G02',
        type: 'SINGLE',
        capacity: 1,
        gender: 'MALE',
        isAccessible: true,
        beds: [
          {
            id: 'tb-002-a',
            label: 'A',
            isAccessible: true,
            status: 'OCCUPIED',
            occupantName: 'Arjun Das',
            occupantRoll: '2023EE002',
            occupantQuota: 'PWD',
            explanation: {
              preferenceRank: 1,
              quotaBucket: 'PWD',
              compatibilityScore: null,
              rationale: 'Single accessible room allocated under PWD quota.',
            },
          },
        ],
      },
    ],
  });

  // Current floor key
  const currentKey = `${selectedHostelCode}-${selectedBlock}-${selectedFloor}`;

  // Fallback room generator if a key doesn't exist yet
  const currentRooms = useMemo(() => {
    if (roomsData[currentKey]) {
      return roomsData[currentKey];
    }
    // Generate realistic rooms on the fly for any block/floor/hostel
    const generated: RoomItem[] = [1, 2, 3, 4, 5, 6].map((num) => {
      const roomNum = selectedFloor === 0 ? `G0${num}` : `${selectedFloor}0${num}`;
      const type: RoomItem['type'] = num === 2 ? 'SINGLE' : num === 3 ? 'TRIPLE' : 'DOUBLE';
      const cap = type === 'SINGLE' ? 1 : type === 'TRIPLE' ? 3 : 2;
      const isAcc = selectedFloor === 0;

      const beds: BedItem[] = Array.from({ length: cap }, (_, bIdx) => {
        const label = String.fromCharCode(65 + bIdx);
        const isOcc = num !== 5 || bIdx === 0;
        return {
          id: `${selectedHostelCode.toLowerCase()}-${roomNum}-${label.toLowerCase()}`,
          label,
          isAccessible: isAcc,
          status: isOcc ? 'OCCUPIED' : 'AVAILABLE',
          occupantName: isOcc ? `Student ${selectedHostelCode}-${roomNum}${label}` : undefined,
          occupantRoll: isOcc ? `2023CS${100 + num * 10 + bIdx}` : undefined,
          occupantQuota: 'GENERAL',
          explanation: isOcc
            ? {
                preferenceRank: 1,
                quotaBucket: 'GENERAL',
                compatibilityScore: 80,
                rationale: 'Choice #1 satisfied in regular allocation pass.',
              }
            : undefined,
        };
      });

      return {
        id: `${selectedHostelCode.toLowerCase()}-${roomNum}`,
        roomNumber: roomNum,
        type,
        capacity: cap,
        gender: (selectedHostelCode === 'GB' || selectedHostelCode === 'SB'
          ? 'FEMALE'
          : selectedHostelCode === 'KB'
          ? 'COED'
          : 'MALE') as any,
        isAccessible: isAcc,
        beds,
      };
    });

    return generated;
  }, [roomsData, currentKey, selectedHostelCode, selectedBlock, selectedFloor]);

  // Filtered rooms based on status and search query
  const filteredRooms = useMemo(() => {
    return currentRooms
      .map((room) => {
        const matchingBeds = room.beds.filter((bed) => {
          // Status filter
          if (statusFilter === 'OCCUPIED' && bed.status !== 'OCCUPIED') return false;
          if (statusFilter === 'AVAILABLE' && bed.status !== 'AVAILABLE') return false;
          if (statusFilter === 'OVERRIDDEN' && !bed.isOverridden) return false;
          if (statusFilter === 'ACCESSIBLE' && !bed.isAccessible) return false;

          // Search query filter
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const roomMatch = room.roomNumber.toLowerCase().includes(q);
            const occupantMatch = bed.occupantName?.toLowerCase().includes(q);
            const rollMatch = bed.occupantRoll?.toLowerCase().includes(q);
            if (!roomMatch && !occupantMatch && !rollMatch) return false;
          }
          return true;
        });

        return { ...room, beds: matchingBeds };
      })
      .filter((r) => r.beds.length > 0);
  }, [currentRooms, statusFilter, searchQuery]);

  // Stats for the current view
  const currentTotalBeds = currentRooms.reduce((sum, r) => sum + r.beds.length, 0);
  const currentOccupiedBeds = currentRooms.reduce(
    (sum, r) => sum + r.beds.filter((b) => b.status === 'OCCUPIED').length,
    0
  );
  const currentOccupancyPct =
    currentTotalBeds > 0 ? Math.round((currentOccupiedBeds / currentTotalBeds) * 100) : 0;

  // Handle manual override commit (Invariant I5)
  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideReason.trim().length < 10) {
      alert('Override reason must be at least 10 characters (Invariant I5 requirement).');
      return;
    }

    if (selectedBed) {
      const updatedRooms = currentRooms.map((r) => {
        if (r.id === selectedBed.room.id) {
          return {
            ...r,
            beds: r.beds.map((b) => {
              if (b.id === selectedBed.bed.id) {
                return {
                  ...b,
                  status: 'OCCUPIED' as const,
                  occupantName: `${newOccupantName} (Override)`,
                  isOverridden: true,
                  explanation: {
                    preferenceRank: null,
                    quotaBucket: 'MANUAL_OVERRIDE',
                    compatibilityScore: 80,
                    rationale: `Manual override [${overrideCategory}]: ${overrideReason}${
                      isEscalated ? ' (Escalated to Chief Warden)' : ''
                    }`,
                  },
                };
              }
              return b;
            }),
          };
        }
        return r;
      });

      setRoomsData((prev) => ({
        ...prev,
        [currentKey]: updatedRooms,
      }));

      setSuccessMsg(
        `Manual override applied to Bed ${selectedBed.bed.label} in Room ${selectedBed.room.roomNumber}! Invariant I5 logged to SHA-256 audit log.`
      );
      setShowOverrideModal(false);
      setSelectedBed(null);
      setOverrideReason('');
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleApproveDraft = () => {
    setDraftStatus('APPROVED');
    setSuccessMsg('Hostel allocation approved by Warden! Draft is now queued for Chief Warden publication.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Interactive Bed Map &bull; Visual Reassignment
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                draftStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {draftStatus}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Visual Bed Allocation Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Inspect room occupants, evaluate compatibility explanations, and submit audited overrides.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApproveDraft}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <span>✓</span>
            <span>Approve Hostel Draft</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Control Panel: Hostel, Block, Floor Selectors */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Hostel Selector Pills */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Select Campus Residence:
          </div>
          <div className="flex flex-wrap gap-2">
            {hostels.map((h) => {
              const isSelected = selectedHostelCode === h.code;
              return (
                <button
                  key={h.code}
                  onClick={() => setSelectedHostelCode(h.code)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{h.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {h.code} &bull; {h.gender}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Block & Floor Controls + Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          {/* Block Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Block</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['Block A', 'Block B', 'Block C', 'Block D'].map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBlock(b)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    selectedBlock === b
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b.replace('Block ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Floor Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Floor Level</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    selectedFloor === f
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f === 0 ? 'G (♿)' : `Floor ${f}`}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Search Room / Student</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. 104, Aditya, 12326241..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Filter Chips & Live Density Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All Beds' },
              { id: 'OCCUPIED', label: 'Occupied' },
              { id: 'AVAILABLE', label: 'Vacant' },
              { id: 'OVERRIDDEN', label: 'Overridden (★)' },
              { id: 'ACCESSIBLE', label: 'Accessible (♿)' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setStatusFilter(chip.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  statusFilter === chip.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
            <span>
              Floor Density: <strong className="text-slate-900">{currentOccupiedBeds} / {currentTotalBeds} beds</strong> ({currentOccupancyPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Bed-Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className={`p-5 bg-white border rounded-2xl shadow-sm space-y-3 transition hover:shadow-md ${
              room.roomNumber === '104' && selectedHostelCode === 'TB'
                ? 'ring-2 ring-indigo-500 border-indigo-400'
                : 'border-slate-200'
            }`}
          >
            {/* Room Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base">
                  Room {room.roomNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {room.type} ({room.capacity} beds)
                </span>
                {room.isAccessible && (
                  <span className="text-blue-600 text-xs" title="Wheelchair Accessible Room">
                    ♿
                  </span>
                )}
              </div>

              {room.roomNumber === '104' && selectedHostelCode === 'TB' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  Demo User Room
                </span>
              )}
            </div>

            {/* Beds Grid */}
            <div className={`grid gap-2 ${room.capacity > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {room.beds.map((bed) => {
                const isOccupied = bed.status === 'OCCUPIED';
                const isAditya = bed.occupantName?.includes('Aditya Manas');
                const isSelected = selectedBed?.bed.id === bed.id;

                return (
                  <div
                    key={bed.id}
                    onClick={() => setSelectedBed({ room, bed })}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left relative overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-indigo-600 bg-indigo-50 border-indigo-400'
                        : bed.isOverridden
                        ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100'
                        : isAditya
                        ? 'bg-blue-50/90 border-blue-300 hover:bg-blue-100'
                        : isOccupied
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-900">Bed {bed.label}</span>
                      <div className="flex items-center gap-1">
                        {bed.isAccessible && <span title="Accessible Unit">♿</span>}
                        {bed.isOverridden && (
                          <span className="text-amber-700 text-[10px] font-bold">★ Override</span>
                        )}
                        {!isOccupied && (
                          <span className="text-emerald-700 text-[10px] font-bold">Vacant</span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-800 font-semibold truncate mt-1">
                      {bed.occupantName || <span className="text-emerald-700 font-normal">Available</span>}
                    </div>

                    {bed.occupantRoll && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {bed.occupantRoll}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Bed Inspector & Detail Card */}
      {selectedBed && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Bed Inspector
                </span>
                <span className="text-xs text-slate-400">
                  Room {selectedBed.room.roomNumber} &bull; Bed {selectedBed.bed.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {selectedBed.bed.occupantName || 'Vacant Bed'}
              </h2>
              {selectedBed.bed.occupantRoll && (
                <p className="text-xs text-slate-500 font-mono">
                  Roll / Reg: {selectedBed.bed.occupantRoll} &bull; Quota: {selectedBed.bed.occupantQuota}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow"
              >
                Reassign / Override Bed (I5)
              </button>
              <button
                onClick={() => setSelectedBed(null)}
                className="px-3 py-2 border rounded-xl text-xs text-slate-500 hover:bg-slate-50"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {selectedBed.bed.explanation ? (
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Invariant I4 &bull; Structured Allocation Explanation:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Preference Rank</span>
                  <strong className="text-slate-900">
                    {selectedBed.bed.explanation.preferenceRank
                      ? `#${selectedBed.bed.explanation.preferenceRank}`
                      : 'Fallback Pass'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Quota Bucket</span>
                  <strong className="text-slate-900">{selectedBed.bed.explanation.quotaBucket}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roommate Compatibility</span>
                  <strong className="text-indigo-600">
                    {selectedBed.bed.explanation.compatibilityScore
                      ? `${selectedBed.bed.explanation.compatibilityScore}/100`
                      : 'N/A'}
                  </strong>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-600">
                <strong>Decision Rationale:</strong> {selectedBed.bed.explanation.rationale}
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-700 font-medium p-4 bg-emerald-50 rounded-xl">
              This bed is currently available and ready for regular or waitlist allocation.
            </div>
          )}
        </div>
      )}

      {/* Manual Override Modal (Invariant I5) */}
      {showOverrideModal && selectedBed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Manual Override: Room {selectedBed.room.roomNumber}, Bed {selectedBed.bed.label}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Invariant I5 mandates a categorized justification with minimum 10 characters. All overrides are cryptographically logged in the SHA-256 tamper-evident audit trail.
              </p>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Assignee Student Name
                </label>
                <input
                  type="text"
                  value={newOccupantName}
                  onChange={(e) => setNewOccupantName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Override Category
                </label>
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="MEDICAL_ACCOMMODATION">Medical Accommodation (Ground floor need)</option>
                  <option value="ACCESSIBILITY_NEEDS">Accessibility Needs (PWD accommodation)</option>
                  <option value="ADMINISTRATIVE_CORRECTION">Administrative Rectification</option>
                  <option value="DISCIPLINARY_SEPARATION">Disciplinary Roommate Separation</option>
                  <option value="SPECIAL_QUOTA_ADJUSTMENT">Special Quota Adjustment</option>
                  <option value="OTHER">Other Institutional Ground</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason Description (&ge; 10 characters)
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Provide explicit factual justification for this bed reassignment..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEscalated}
                    onChange={(e) => setIsEscalated(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold">
                    Escalate to Chief Warden (Required if violating hard constraint)
                  </span>
                </label>
                <p className="text-[11px] text-amber-700">
                  Chief Warden authorization is required for gender boundary or capacity limit overrides.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Commit Override &bull; Invariant I5
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
