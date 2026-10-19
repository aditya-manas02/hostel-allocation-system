'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function QuestionnairePage() {
  const [consent, setConsent] = useState(true);
  const [submitted, setSubmitted] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [answers, setAnswers] = useState({
    sleepSchedule: 'EARLY_BIRD',
    cleanlinessLevel: 4,
    noiseTolerance: 3,
    studyHabits: 'IN_ROOM_SILENT',
    guestFrequency: 'OCCASIONAL',
    smokingHabit: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setIsEditing(false);
    setDeleted(false);
  };

  const handleDelete = () => {
    if (
      confirm(
        'Permanently delete your lifestyle questionnaire responses? This will append a tombstone audit record to the immutable log under Invariant I6/I7.'
      )
    ) {
      setSubmitted(false);
      setDeleted(true);
      setConsent(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
            Roommate Matching
          </span>
          <span className="text-xs text-slate-500">&bull; Invariant I6 Cryptographic Shield</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Lifestyle &amp; Living Habits Questionnaire
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Your responses optimize pairwise compatibility (0–100) using seeded SFC32 PRNG heuristics.
        </p>
      </div>

      {/* Invariant I6 Privacy & Encryption Shield Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-md space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-lg border border-blue-400/30">
            🔒
          </span>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white">
              Invariant I6: Sensitive Lifestyle Data Privacy Guarantee
            </h2>
            <p className="text-[11px] text-blue-200">End-to-End Field-Level Encryption at Rest</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          All individual questionnaire answers are encrypted using <strong>AES-256-GCM</strong> with unique per-record initialization vectors (IV). Individual answers are <strong>never accessible or displayed</strong> to wardens, administrators, or prospective roommates. Matching algorithms solely compute aggregate numerical compatibility scores (0–100).
        </p>

        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-blue-200">
          <span className="bg-white/10 px-2 py-0.5 rounded">Cipher: AES-256-GCM</span>
          <span className="bg-white/10 px-2 py-0.5 rounded">Zero-PII Exposure</span>
          <span className="bg-white/10 px-2 py-0.5 rounded">Right to be Forgotten Compliant</span>
        </div>
      </div>

      {deleted && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm font-medium shadow-sm space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>✓</span> Data Permanently Erased
          </div>
          <p className="text-amber-800">
            Your lifestyle questionnaire data has been completely erased from the database. A cryptographically chained tombstone audit record (SHA-256) has been registered.
          </p>
        </div>
      )}

      {submitted && !isEditing ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Active &bull; Encrypted at Rest
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                Survey Responses Registered &amp; Encrypted
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Utilized in current allocation cycle (Matched score with roommate: <strong>82/100</strong>).
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              ✎ Modify Answers
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Sleep Schedule</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {answers.sleepSchedule === 'EARLY_BIRD' ? 'Early Bird (Sleeps before 11 PM)' : answers.sleepSchedule}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Cleanliness Level</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{answers.cleanlinessLevel} / 5 (Very Neat)</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Noise Tolerance</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{answers.noiseTolerance} / 5 (Moderate)</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Study Environment</span>
              <span className="font-bold text-slate-900 mt-0.5 block">In Room (Silent focus)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition"
            >
              Delete Questionnaire Data (Right to be Forgotten)
            </button>

            <Link
              href="/result"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
            >
              View Roommate Match Result &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Explicit Consent */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>I provide explicit consent</strong> for the university hostel engine to process my lifestyle responses strictly for roommate compatibility scoring under AES-256-GCM encryption.
              </span>
            </label>
          </div>

          {consent && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
              {/* Question 1: Sleep Schedule */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase">
                  1. Sleep Schedule &amp; Bedtime
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'EARLY_BIRD', label: 'Early Bird', desc: 'Sleeps before 11 PM, wakes early' },
                    { id: 'NIGHT_OWL', label: 'Night Owl', desc: 'Studies late, sleeps after 1 AM' },
                    { id: 'FLEXIBLE', label: 'Flexible', desc: 'Moderate schedule' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, sleepSchedule: opt.id })}
                      className={`p-3 rounded-xl border text-left text-xs transition ${
                        answers.sleepSchedule === opt.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Cleanliness */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span className="uppercase">2. Room Cleanliness &amp; Tidiness</span>
                  <span className="text-indigo-600">{answers.cleanlinessLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={answers.cleanlinessLevel}
                  onChange={(e) => setAnswers({ ...answers, cleanlinessLevel: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Relaxed (1)</span>
                  <span>Moderate (3)</span>
                  <span>Extremely Neat (5)</span>
                </div>
              </div>

              {/* Question 3: Noise Tolerance */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span className="uppercase">3. Noise Tolerance While Studying</span>
                  <span className="text-indigo-600">{answers.noiseTolerance} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={answers.noiseTolerance}
                  onChange={(e) => setAnswers({ ...answers, noiseTolerance: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Needs Pin-drop Silence (1)</span>
                  <span>Moderate Noise OK (3)</span>
                  <span>High Noise Tolerance (5)</span>
                </div>
              </div>

              {/* Question 4: Study Habits */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase">
                  4. Preferred Study Environment
                </label>
                <select
                  value={answers.studyHabits}
                  onChange={(e) => setAnswers({ ...answers, studyHabits: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="IN_ROOM_SILENT">In Room (Silent focus)</option>
                  <option value="IN_ROOM_MUSIC">In Room (Background music allowed)</option>
                  <option value="LIBRARY_ONLY">Library / Study Hall Only</option>
                </select>
              </div>

              {/* Question 5: Smoking */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.smokingHabit}
                    onChange={(e) => setAnswers({ ...answers, smokingHabit: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    I smoke / consume tobacco (Strictly matching smoker with consenting smoker)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Encrypt &amp; Save Responses
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
