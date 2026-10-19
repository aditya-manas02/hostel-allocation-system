'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

interface PreferenceHostel {
  id: string;
  name: string;
  code: string;
  gender: string;
  typeDesc: string;
  facilities: string[];
}

export default function PreferencesPage() {
  const { user } = useAuth();

  const [hostelRanking, setHostelRanking] = useState<PreferenceHostel[]>([
    {
      id: 'TB',
      name: 'Tagore Bhawan',
      code: 'TB',
      gender: 'MALE',
      typeDesc: 'Senior Engineering Complex &bull; Central Quad',
      facilities: ['Wi-Fi 6', 'Gymnasium', 'Study Lounge', 'Canteen'],
    },
    {
      id: 'AB',
      name: 'Aryabhatta Bhawan',
      code: 'AB',
      gender: 'MALE',
      typeDesc: 'Technical Campus Residence &bull; Modern Wing',
      facilities: ['High-speed LAN', 'Badminton Court', 'Library'],
    },
    {
      id: 'KB',
      name: 'Kalam International House',
      code: 'KB',
      gender: 'COED',
      typeDesc: 'Postgraduate &amp; International Residence',
      facilities: ['AC Option', 'Elevators', 'Cafeteria', 'Quiet Pods'],
    },
  ]);

  const [roomTypeRanking, setRoomTypeRanking] = useState<string[]>([
    'DOUBLE',
    'SINGLE',
    'TRIPLE',
    'QUAD',
  ]);

  const [roommateRequests, setRoommateRequests] = useState('2023CS042 (Rohan Gupta)');
  const [saved, setSaved] = useState(false);

  const moveHostel = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= hostelRanking.length) return;
    const items = [...hostelRanking];
    const [moved] = items.splice(index, 1);
    items.splice(newIndex, 0, moved!);
    setHostelRanking(items);
  };

  const moveRoomType = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= roomTypeRanking.length) return;
    const items = [...roomTypeRanking];
    const [moved] = items.splice(index, 1);
    items.splice(newIndex, 0, moved!);
    setRoomTypeRanking(items);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            Preference Formulation
          </span>
          <span className="text-xs text-slate-500">&bull; Academic Session 2026–2027</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Ranked Accommodation Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Prioritize hostels and room types in order of preference. The heuristic engine processes choices in Pass A to maximize satisfaction.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm">
          <span>✓</span>
          <span>Your ranked preferences have been saved and locked for the allocation run!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Ranked Hostels Section */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">1. Preferred Hostels (Rank Order)</h2>
            <p className="text-xs text-slate-500">
              Rank #1 receives highest mathematical weighting during allocation passes.
            </p>
          </div>

          <div className="space-y-3">
            {hostelRanking.map((h, idx) => (
              <div
                key={h.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0 ${
                      idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-blue-600' : 'bg-slate-500'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{h.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {h.code} &bull; {h.gender}
                      </span>
                    </div>
                    <div
                      className="text-xs text-slate-500 mt-0.5"
                      dangerouslySetInnerHTML={{ __html: h.typeDesc }}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {h.facilities.map((fac) => (
                        <span key={fac} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-slate-200 text-slate-600">
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveHostel(idx, 'up')}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 transition"
                    title="Move higher priority"
                  >
                    ▲ Up
                  </button>
                  <button
                    type="button"
                    disabled={idx === hostelRanking.length - 1}
                    onClick={() => moveHostel(idx, 'down')}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 transition"
                    title="Move lower priority"
                  >
                    ▼ Down
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranked Room Types */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">2. Preferred Room Types (Rank Order)</h2>
            <p className="text-xs text-slate-500">Order by Single, Double, Triple, or Quad occupancy.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomTypeRanking.map((type, idx) => (
              <div
                key={type}
                className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900">{type} ROOM</span>
                    <span className="text-[10px] text-slate-400 block">
                      {type === 'SINGLE' && 'Individual Room &bull; 1 Bed'}
                      {type === 'DOUBLE' && 'Two Occupants &bull; 2 Beds'}
                      {type === 'TRIPLE' && 'Three Occupants &bull; 3 Beds'}
                      {type === 'QUAD' && 'Four Occupants &bull; 4 Beds'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveRoomType(idx, 'up')}
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === roomTypeRanking.length - 1}
                    onClick={() => moveRoomType(idx, 'down')}
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mutual Roommate Requests */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">3. Mutual Roommate Requests (Optional)</h2>
            <p className="text-xs text-slate-500">
              Enter student roll numbers or campus email addresses. The algorithm satisfies pairing only when <strong>mutual requests</strong> are submitted by both applicants.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Requested Roommate(s)
            </label>
            <input
              type="text"
              value={roommateRequests}
              onChange={(e) => setRoommateRequests(e.target.value)}
              placeholder="e.g. 2023CS042, student.partner@university.edu"
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
            />
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>💡</span>
              <span>Matched with <strong>Rohan Gupta (2023CS042)</strong> in Tagore Bhawan Room 104.</span>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3">
          <Link
            href="/questionnaire"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Go to Lifestyle Survey &rarr;
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Save Ranked Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
