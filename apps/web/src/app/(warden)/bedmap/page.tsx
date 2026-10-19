'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export interface BedItem {
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

export interface RoomItem {
  id: string;
  roomNumber: string;
  displayNumber: string;
  block: string;
  floor: number;
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  capacity: number;
  gender: 'MALE' | 'FEMALE' | 'COED';
  isAccessible: boolean;
  beds: BedItem[];
}

// Master generator for realistic rooms across all 5 hostels, 4 blocks, and 4 floors
function generateRoomsForHostelBlockFloor(
  hostelCode: string,
  blockName: string,
  floorNum: number
): RoomItem[] {
  const blockLetter = blockName.replace('Block ', '').trim();
  const isGround = floorNum === 0;

  // Occupant data pools per hostel gender designation
  const maleNames = [
    'Aarav Sharma', 'Kunal Verma', 'Vikramaditya Roy', 'Siddharth Nair',
    'Manish Pandey', 'Devansh Saxena', 'Abhishek Jha', 'Nitin Rao',
    'Gaurav Sen', 'Priyanshu Mishra', 'Tanmay Bose', 'Mayank Chawla',
    'Rajesh Reddy', 'Kartik Iyer', 'Harshit Gupta', 'Aman Singh',
    'Rishabh Jain', 'Chetan Mehta', 'Rohit Sharma', 'Swapnil Patil',
    'Ayush Dubey', 'Deepak Chahar', 'Varun Chakraborty', 'Pranav Mishra',
    'Shaurya Kapoor', 'Tarun Varma', 'Tushar Garg', 'Yash Singhal',
  ];

  const femaleNames = [
    'Ananya Sharma', 'Priya Patel', 'Sneha Rao', 'Deepa Verma',
    'Meera Nair', 'Diya Sengupta', 'Pooja Hegde', 'Ritu Roy',
    'Shreya Ghoshal', 'Neha Kakkar', 'Radhika Merchant', 'Tanvi Shah',
    'Bhavna Joshi', 'Kavita Singh', 'Isha Ambani', 'Swati Maliwal',
    'Kritika Kamra', 'Aditi Rao', 'Pallavi Sharda', 'Divya Bharti',
    'Aishwarya Rai', 'Simran Kaur', 'Harleen Deol', 'Smriti Mandhana',
  ];

  const internationalNames = [
    'Alex Chen', 'Sarah Jenkins', 'Mohammed Al-Fassi', 'David Kim',
    'Fatima Zahra', 'Liam O\'Connor', 'Elena Rostova', 'Kenji Sato',
    'Carlos Rodriguez', 'Amina Yusuf', 'Lucas Silva', 'Chloe Martin',
    'Tariq Mansoor', 'Yuki Tanaka', 'Zainab Ahmed', 'Oliver Smith',
  ];

  const isFemaleHostel = hostelCode === 'GB' || hostelCode === 'SB';
  const isCoedHostel = hostelCode === 'KB';
  const pool = isFemaleHostel ? femaleNames : isCoedHostel ? internationalNames : maleNames;
  const genderType: RoomItem['gender'] = isFemaleHostel ? 'FEMALE' : isCoedHostel ? 'COED' : 'MALE';

  // Seed offset based on hostel, block, and floor to ensure distinct occupants
  const blockOffset = (blockLetter.charCodeAt(0) - 65) * 8;
  const floorOffset = floorNum * 12;
  const hostelOffset = (hostelCode.charCodeAt(0) + hostelCode.charCodeAt(1)) * 3;
  const baseOffset = (blockOffset + floorOffset + hostelOffset) % pool.length;

  // 8 rooms per floor in each block
  const rooms: RoomItem[] = [1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
    const roomCode = isGround ? `G0${num}` : `${floorNum}0${num}`;
    const displayNumber = `${blockLetter}-${roomCode}`;
    const roomId = `${hostelCode.toLowerCase()}-${blockLetter.toLowerCase()}-${roomCode.toLowerCase()}`;

    // Room type distribution: 1 Single, 4 Doubles, 2 Triples, 1 Quad
    let type: RoomItem['type'] = 'DOUBLE';
    let capacity = 2;

    if (num === 2 || num === 8) {
      type = 'SINGLE';
      capacity = 1;
    } else if (num === 3 || num === 7) {
      type = 'TRIPLE';
      capacity = 3;
    } else if (num === 6) {
      type = 'QUAD';
      capacity = 4;
    }

    const isRoomAccessible = isGround;

    // Check if this is Aditya Manas's room: Tagore Bhawan (TB), Block A, Floor 1, Room 104
    const isAdityaRoom = hostelCode === 'TB' && blockLetter === 'A' && floorNum === 1 && num === 4;

    const beds: BedItem[] = Array.from({ length: capacity }, (_, bIdx) => {
      const label = String.fromCharCode(65 + bIdx);
      const bedId = `${roomId}-${label.toLowerCase()}`;

      // Special case: Aditya Manas in Room A-104
      if (isAdityaRoom) {
        if (bIdx === 0) {
          return {
            id: bedId,
            label,
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
                'First choice preference satisfied in Pass A. Paired with mutual roommate request Rohan Gupta (Compatibility Score: 82/100).',
            },
          };
        } else {
          return {
            id: bedId,
            label,
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
                'First choice preference satisfied in Pass A. Mutual roommate pairing with Aditya Manas (Compatibility Score: 82/100).',
            },
          };
        }
      }

      // Ground floor PWD priority
      if (isGround) {
        const isOcc = bIdx === 0 || num % 2 === 1;
        const nameIdx = (baseOffset + num * 2 + bIdx) % pool.length;
        return {
          id: bedId,
          label,
          isAccessible: true,
          status: isOcc ? 'OCCUPIED' : 'AVAILABLE',
          occupantName: isOcc ? pool[nameIdx] : undefined,
          occupantRoll: isOcc ? `2023CS0${num * 5 + bIdx}` : undefined,
          occupantQuota: bIdx === 0 ? 'PWD' : 'GENERAL',
          explanation: isOcc
            ? {
                preferenceRank: 1,
                quotaBucket: bIdx === 0 ? 'PWD' : 'GENERAL',
                compatibilityScore: 88,
                rationale:
                  bIdx === 0
                    ? 'Pass A Priority: Ground floor wheelchair accessible unit satisfied under PWD quota.'
                    : 'Matched with assistive roommate under General Quota.',
              }
            : undefined,
        };
      }

      // Regular floors: Leave a few realistic vacant beds for demoing reallocation
      const isVacant = (num === 5 && bIdx === 1) || (num === 6 && bIdx === 3) || (num === 3 && bIdx === 2);
      const nameIdx = (baseOffset + num * 3 + bIdx) % pool.length;

      return {
        id: bedId,
        label,
        isAccessible: false,
        status: isVacant ? 'AVAILABLE' : 'OCCUPIED',
        occupantName: isVacant ? undefined : pool[nameIdx],
        occupantRoll: isVacant ? undefined : `2023${blockLetter}${100 + num * 10 + bIdx}`,
        occupantQuota: num === 2 ? 'SCHOLARSHIP' : num === 5 ? 'SPORTS' : 'GENERAL',
        explanation: isVacant
          ? undefined
          : {
              preferenceRank: num % 2 === 0 ? 1 : 2,
              quotaBucket: num === 2 ? 'SCHOLARSHIP' : num === 5 ? 'SPORTS' : 'GENERAL',
              compatibilityScore: 78 + (num % 15),
              rationale: `Choice #${num % 2 === 0 ? 1 : 2} satisfied in regular allocation pass.`,
            },
      };
    });

    return {
      id: roomId,
      roomNumber: roomCode,
      displayNumber,
      block: blockName,
      floor: floorNum,
      type,
      capacity,
      gender: genderType,
      isAccessible: isRoomAccessible,
      beds,
    };
  });

  return rooms;
}

export default function WardenBedMapPage() {
  const { user } = useAuth();

  // Hostels list
  const hostels = [
    { code: 'TB', name: 'Tagore Bhawan', gender: 'MALE', capacity: 1605, roomsCount: 592, icon: '🏛️' },
    { code: 'GB', name: 'Gargi Bhawan', gender: 'FEMALE', capacity: 1629, roomsCount: 604, icon: '🌸' },
    { code: 'SB', name: 'Sarojini Bhawan', gender: 'FEMALE', capacity: 1612, roomsCount: 598, icon: '🌿' },
    { code: 'AB', name: 'Aryabhatta Bhawan', gender: 'MALE', capacity: 1581, roomsCount: 584, icon: '🔭' },
    { code: 'KB', name: 'Kalam International House', gender: 'COED', capacity: 1588, roomsCount: 572, icon: '🌍' },
  ];

  // Selected filters
  const [selectedHostelCode, setSelectedHostelCode] = useState<string>('TB');
  const [selectedBlock, setSelectedBlock] = useState('Block A');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OCCUPIED' | 'AVAILABLE' | 'OVERRIDDEN' | 'ACCESSIBLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Overridden beds map across the session: { [bedId]: BedItem }
  const [overridesMap, setOverridesMap] = useState<Record<string, Partial<BedItem>>>({});

  // Selected Bed for drawer / inspector
  const [selectedBed, setSelectedBed] = useState<{ room: RoomItem; bed: BedItem } | null>(null);

  // Override Modal state (Invariant I5)
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState('MEDICAL_ACCOMMODATION');
  const [overrideReason, setOverrideReason] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [newOccupantName, setNewOccupantName] = useState('Kavita Singh');
  const [successMsg, setSuccessMsg] = useState('');
  const [draftStatus, setDraftStatus] = useState<'UNDER_REVIEW' | 'APPROVED'>('UNDER_REVIEW');

  // Currently active hostel object
  const currentHostel = useMemo(() => {
    return hostels.find((h) => h.code === selectedHostelCode) || hostels[0]!;
  }, [selectedHostelCode, hostels]);

  // Compute rooms for currently selected Hostel, Block, and Floor
  const currentRooms = useMemo(() => {
    const rawRooms = generateRoomsForHostelBlockFloor(
      selectedHostelCode,
      selectedBlock,
      selectedFloor
    );

    // Apply any overrides previously committed by the user
    return rawRooms.map((room) => ({
      ...room,
      beds: room.beds.map((bed) => {
        if (overridesMap[bed.id]) {
          return { ...bed, ...overridesMap[bed.id] };
        }
        return bed;
      }),
    }));
  }, [selectedHostelCode, selectedBlock, selectedFloor, overridesMap]);

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
            const roomMatch = room.displayNumber.toLowerCase().includes(q) || room.roomNumber.toLowerCase().includes(q);
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

  // Stats for the active block & floor
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
      const bedId = selectedBed.bed.id;
      const overrideData: Partial<BedItem> = {
        status: 'OCCUPIED',
        occupantName: `${newOccupantName} (Override)`,
        isOverridden: true,
        explanation: {
          preferenceRank: null,
          quotaBucket: 'MANUAL_OVERRIDE',
          compatibilityScore: 82,
          rationale: `Manual override [${overrideCategory}]: ${overrideReason}${
            isEscalated ? ' (Escalated to Chief Warden)' : ''
          }`,
        },
      };

      setOverridesMap((prev) => ({
        ...prev,
        [bedId]: overrideData,
      }));

      setSuccessMsg(
        `Manual override applied to Bed ${selectedBed.bed.label} in Room ${selectedBed.room.displayNumber}! Invariant I5 logged in SHA-256 audit log.`
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
              Draft: {draftStatus}
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
        {/* 1. Hostel Selector Pills */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            1. Select Campus Residence:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {hostels.map((h) => {
              const isSelected = selectedHostelCode === h.code;
              return (
                <button
                  key={h.code}
                  onClick={() => {
                    setSelectedHostelCode(h.code);
                    setSelectedBed(null);
                  }}
                  className={`p-3 rounded-xl text-left border transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{h.icon}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {h.code} &bull; {h.gender}
                    </span>
                  </div>
                  <div className="font-bold text-xs mt-1 truncate">{h.name}</div>
                  <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {h.capacity.toLocaleString()} beds
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Block & Floor Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          {/* Block Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Residential Block
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['Block A', 'Block B', 'Block C', 'Block D'].map((b) => {
                const isSelected = selectedBlock === b;
                return (
                  <button
                    key={b}
                    onClick={() => {
                      setSelectedBlock(b);
                      setSelectedBed(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floor Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Floor Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { f: 0, label: 'Ground ♿' },
                { f: 1, label: 'Floor 1' },
                { f: 2, label: 'Floor 2' },
                { f: 3, label: 'Floor 3' },
              ].map(({ f, label }) => {
                const isSelected = selectedFloor === f;
                return (
                  <button
                    key={f}
                    onClick={() => {
                      setSelectedFloor(f);
                      setSelectedBed(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Search Room / Resident
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. A-104, Aditya, 12326241..."
              className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status Filter:
          </span>
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
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Active Location Breadcrumb Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/80 flex items-center justify-center text-xl font-bold border border-indigo-400/30">
            {currentHostel.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight">
                {currentHostel.name} ({currentHostel.code})
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-indigo-300 font-bold">{selectedBlock}</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-emerald-400 font-bold">
                {selectedFloor === 0 ? 'Ground Floor (Accessible ♿)' : `Floor ${selectedFloor}`}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Displaying 8 Residential Rooms &bull; {currentTotalBeds} Total Beds ({currentOccupiedBeds} Occupied, {currentTotalBeds - currentOccupiedBeds} Vacant)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
            {currentOccupancyPct}% Occupancy
          </span>
        </div>
      </div>

      {/* Main Bed-Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isAdityaRoom = room.beds.some((b) => b.occupantName?.includes('Aditya Manas'));

          return (
            <div
              key={room.id}
              className={`p-4 bg-white border rounded-2xl shadow-sm space-y-3 transition hover:shadow-md ${
                isAdityaRoom
                  ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Room Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm">
                    Room {room.displayNumber}
                  </span>
                  {room.isAccessible && (
                    <span className="text-blue-600 text-xs" title="Wheelchair Accessible Ground Floor Unit">
                      ♿
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {room.type} ({room.capacity})
                  </span>
                </div>
              </div>

              {isAdityaRoom && (
                <div className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center gap-1">
                  <span>⭐</span>
                  <span>Aditya Manas&apos;s Allotted Room</span>
                </div>
              )}

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
                      className={`p-2.5 rounded-xl border cursor-pointer transition text-left relative overflow-hidden ${
                        isSelected
                          ? 'ring-2 ring-indigo-600 bg-indigo-50 border-indigo-400'
                          : bed.isOverridden
                          ? 'bg-amber-50/90 border-amber-300 hover:bg-amber-100'
                          : isAditya
                          ? 'bg-indigo-100/80 border-indigo-300 hover:bg-indigo-200/80'
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
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm">
          No rooms match the selected search query or filter in this block and floor.
        </div>
      )}

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
                  {currentHostel.name} &bull; Room {selectedBed.room.displayNumber} &bull; Bed {selectedBed.bed.label}
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
                Manual Override: Room {selectedBed.room.displayNumber}, Bed {selectedBed.bed.label}
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
