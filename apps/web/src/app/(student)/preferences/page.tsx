'use client';

import React, { useState } from 'react';

interface PreferenceItem {
  id: string;
  name: string;
  detail: string;
}

export default function PreferencesPage() {
  const [hostelRanking, setHostelRanking] = useState<PreferenceItem[]>([
    { id: 'GB', name: 'Gargi Bhawan', detail: 'Female Residential Complex — Modern Wing' },
    { id: 'SB', name: 'Sarojini Bhawan', detail: 'Female Residential Complex — Central Campus' },
    { id: 'KB', name: 'Kalam International House', detail: 'Co-ed / Postgrad Quad' },
  ]);

  const [roomTypeRanking, setRoomTypeRanking] = useState<string[]>([
    'DOUBLE',
    'SINGLE',
    'TRIPLE',
    'QUAD',
  ]);

  const [roommateRequests, setRoommateRequests] = useState('');
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
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ranked Accommodation Preferences</h1>
        <p className="text-slate-500 mt-1">
          Rank your preferred hostels and room types in order of priority. Reorder items using buttons or drag handles.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg font-medium">
          ✓ Your accommodation preferences have been successfully recorded!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Ranked Hostels */}
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">1. Preferred Hostels (Rank Order)</h2>
            <p className="text-xs text-slate-500">1st choice receives highest priority weight in allocation pass</p>
          </div>

          <div className="space-y-2">
            {hostelRanking.map((h, idx) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{h.name}</div>
                    <div className="text-xs text-slate-500">{h.detail}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveHostel(idx, 'up')}
                    className="p-2 text-xs border rounded hover:bg-white disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === hostelRanking.length - 1}
                    onClick={() => moveHostel(idx, 'down')}
                    className="p-2 text-xs border rounded hover:bg-white disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranked Room Types */}
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">2. Preferred Room Types (Rank Order)</h2>
            <p className="text-xs text-slate-500">Single, Double, Triple, or Quad rooms</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomTypeRanking.map((type, idx) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 border rounded-lg bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-slate-800">{type} ROOM</span>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveRoomType(idx, 'up')}
                    className="px-2 py-1 text-xs border rounded hover:bg-white disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === roomTypeRanking.length - 1}
                    onClick={() => moveRoomType(idx, 'down')}
                    className="px-2 py-1 text-xs border rounded hover:bg-white disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mutual Roommate Requests */}
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">3. Mutual Roommate Requests (Optional)</h2>
            <p className="text-xs text-slate-500">
              Enter up to 3 student emails or student IDs. Both applicants must mutually request each other to be co-assigned when feasible.
            </p>
          </div>

          <input
            type="text"
            value={roommateRequests}
            onChange={(e) => setRoommateRequests(e.target.value)}
            placeholder="student.2@university.edu, student.3@university.edu"
            className="w-full p-2.5 border rounded-lg text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition"
          >
            Save Ranked Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
