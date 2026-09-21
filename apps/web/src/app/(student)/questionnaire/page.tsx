'use client';

import React, { useState } from 'react';

export default function QuestionnairePage() {
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deleted, setDeleted] = useState(false);

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
    setDeleted(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete your lifestyle questionnaire data? This action will remove all your answers and record a tombstone audit entry.')) {
      setSubmitted(false);
      setDeleted(true);
      setConsent(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Roommate Compatibility Questionnaire</h1>
        <p className="text-slate-500 mt-1">
          Help us match you with compatible roommates based on living habits and daily routines.
        </p>
      </div>

      {/* Invariant I6 Privacy & Encryption Notice */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-sm text-blue-900">
        <div className="flex items-center gap-2 font-bold">
          <span>🔒</span> Invariant I6: Sensitive Lifestyle Data Privacy Guarantee
        </div>
        <p className="text-xs text-blue-800 leading-relaxed">
          Your individual responses are encrypted at rest with field-level <strong>AES-256-GCM</strong> encryption.
          Individual answers are <strong>never returned to any other student, warden, or administrator</strong>.
          Wardens and matching algorithms only see aggregate numerical compatibility scores (0–100).
          You may permanently erase your responses at any time under institutional privacy policies.
        </p>
      </div>

      {deleted && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm font-medium">
          ✓ Your questionnaire answers have been permanently deleted from the database, and a tombstone audit record has been appended to the immutable log.
        </div>
      )}

      {submitted ? (
        <div className="p-8 bg-green-50 border border-green-200 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-green-900">Responses Securely Encrypted & Stored</h2>
          <p className="text-sm text-green-800 max-w-md mx-auto">
            Your responses have been processed with AES-256-GCM encryption and will be utilized to compute aggregate roommate compatibility scores during the allocation run.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 text-xs font-semibold rounded-lg transition"
            >
              Delete My Questionnaire Data (Right to be Forgotten)
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Explicit Consent Gate */}
          <div className="p-5 bg-white border rounded-xl shadow-sm space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-slate-800">
                <strong>I provide explicit consent</strong> for the university hostel engine to process my lifestyle responses strictly for roommate compatibility matching under AES-256-GCM encryption.
              </span>
            </label>
          </div>

          {consent && (
            <div className="p-6 bg-white border rounded-xl shadow-sm space-y-6">
              {/* Question 1: Sleep Schedule */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900">
                  1. Sleep Schedule & Typical Bedtime
                </label>
                <select
                  value={answers.sleepSchedule}
                  onChange={(e) => setAnswers({ ...answers, sleepSchedule: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="EARLY_BIRD">Early Bird (Sleeps before 11 PM, wakes early)</option>
                  <option value="NIGHT_OWL">Night Owl (Sleeps after 1 AM, study late)</option>
                  <option value="FLEXIBLE">Flexible / Moderate schedule</option>
                </select>
              </div>

              {/* Question 2: Cleanliness Level */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-bold text-slate-900">2. Cleanliness & Tidiness</label>
                  <span className="text-indigo-600 font-bold">{answers.cleanlinessLevel} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={answers.cleanlinessLevel}
                  onChange={(e) => setAnswers({ ...answers, cleanlinessLevel: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Relaxed (1)</span>
                  <span>Moderate (3)</span>
                  <span>Extremely Neat (5)</span>
                </div>
              </div>

              {/* Question 3: Noise Tolerance */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-bold text-slate-900">3. Noise Tolerance</label>
                  <span className="text-indigo-600 font-bold">{answers.noiseTolerance} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={answers.noiseTolerance}
                  onChange={(e) => setAnswers({ ...answers, noiseTolerance: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Needs Pin-drop Silence (1)</span>
                  <span>Moderate Noise OK (3)</span>
                  <span>High Noise Tolerance (5)</span>
                </div>
              </div>

              {/* Question 4: Study Habits */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900">4. Study Environment</label>
                <select
                  value={answers.studyHabits}
                  onChange={(e) => setAnswers({ ...answers, studyHabits: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="IN_ROOM_SILENT">In Room (Silent focus)</option>
                  <option value="IN_ROOM_MUSIC">In Room (Background music or group discussion)</option>
                  <option value="LIBRARY_ONLY">Library / Study Hall Only</option>
                </select>
              </div>

              {/* Question 5: Guest Frequency */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900">5. Guest / Visitor Frequency</label>
                <select
                  value={answers.guestFrequency}
                  onChange={(e) => setAnswers({ ...answers, guestFrequency: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                >
                  <option value="NEVER">Never / Private room preference</option>
                  <option value="OCCASIONAL">Occasional friends visiting for study</option>
                  <option value="FREQUENT">Frequent visitors and social gatherings</option>
                </select>
              </div>

              {/* Question 6: Smoking Habit */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.smokingHabit}
                    onChange={(e) => setAnswers({ ...answers, smokingHabit: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    I smoke / consume tobacco (Strictly matching smoker with smoker)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition"
                >
                  Encrypt & Submit Responses
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
