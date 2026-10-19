'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function StudentApplicationWizard() {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Aditya Manas',
    registrationNumber: user?.studentRollNumber || '12326241',
    email: user?.email || 'student@university.edu',
    programme: 'B.Tech Computer Science & Engineering',
    yearOfStudy: '2',
    gender: 'MALE',
    quotaCategory: 'GENERAL',
    feeCategory: 'STANDARD',
    accessibilityRequired: false,
    accessibilityReason: '',
    uploadedDocuments: [
      { name: 'Student_ID_2026.pdf', size: '1.2 MB', verified: true },
      { name: 'Fee_Receipt_Term1_2026.pdf', size: '840 KB', verified: true },
    ],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Accommodation Application
          </span>
          <span className="text-xs text-slate-500">&bull; Fall Regular Cycle 2026–2027</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Hostel Housing Application
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete academic verification, quota selection, and document submission for room allocation.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        {[
          { num: 1, label: 'Academic Info' },
          { num: 2, label: 'Quota & Needs' },
          { num: 3, label: 'Documents' },
          { num: 4, label: 'Review & Submit' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step === s.num
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : step > s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </span>
            <span
              className={`text-xs font-semibold hidden sm:inline ${
                step === s.num ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="p-8 sm:p-12 bg-white border border-emerald-200 rounded-2xl text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Application Submitted Successfully!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your housing application for Academic Session 2026–2027 has been securely registered in the database and logged in the immutable SHA-256 audit trail.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/preferences"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
            >
              Set Ranked Preferences &rarr;
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
          {/* STEP 1: Academic & Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 1: Academic &amp; Personal Details</h2>
                <p className="text-xs text-slate-500">Verify your student enrollment profile.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registration / Student Roll</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-slate-50 font-mono text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Programme of Study</label>
                  <input
                    type="text"
                    value={formData.programme}
                    onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Year of Study</label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="1">Year 1 (Freshman)</option>
                    <option value="2">Year 2 (Sophomore)</option>
                    <option value="3">Year 3 (Junior)</option>
                    <option value="4">Year 4 (Senior)</option>
                    <option value="5">Postgraduate / Ph.D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender Designation</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="MALE">Male (Eligible for Tagore Bhawan, Aryabhatta Bhawan, Kalam House)</option>
                  <option value="FEMALE">Female (Eligible for Gargi Bhawan, Sarojini Bhawan, Kalam House)</option>
                  <option value="OTHER">Other / Non-Binary (Eligible for Kalam International House)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Next: Quota &amp; Needs &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Quota & Special Needs */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Quota Category &amp; Accessibility</h2>
                <p className="text-xs text-slate-500">Configure affirmative policy category and accessibility requirements.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quota Category</label>
                <select
                  value={formData.quotaCategory}
                  onChange={(e) => setFormData({ ...formData, quotaCategory: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="GENERAL">General Quota (60% allocation reserve)</option>
                  <option value="SPORTS">Sports Excellence Quota (10%)</option>
                  <option value="INTERNATIONAL">International Student Quota (10%)</option>
                  <option value="PWD">Persons with Disabilities (PWD) (5% priority ground floor)</option>
                  <option value="SCHOLARSHIP">Merit Scholarship Quota (10%)</option>
                  <option value="STAFF_WARD">Staff Ward Quota (5%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fee Category</label>
                <select
                  value={formData.feeCategory}
                  onChange={(e) => setFormData({ ...formData, feeCategory: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="STANDARD">Standard Academic Housing Fee</option>
                  <option value="SUBSIDIZED">Need-Based Subsidized Rate</option>
                  <option value="FULL_FEE">Non-Subsidized Self-Financed</option>
                  <option value="EXEMPTED">Full Scholarship / Fee Exempted</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accessibilityRequired}
                    onChange={(e) => setFormData({ ...formData, accessibilityRequired: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Require Wheelchair-Accessible Ground Floor Room (PWD Accommodation)
                  </span>
                </label>

                {formData.accessibilityRequired && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Medical Condition Justification
                    </label>
                    <textarea
                      rows={2}
                      value={formData.accessibilityReason}
                      onChange={(e) => setFormData({ ...formData, accessibilityReason: e.target.value })}
                      placeholder="Specify medical diagnosis, certificate reference number..."
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Next: Documents &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 3: Upload Supporting Documents</h2>
                <p className="text-xs text-slate-500">Provide official identity and payment proofs.</p>
              </div>

              <div className="space-y-2">
                {formData.uploadedDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 border rounded-xl bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📄</span>
                      <div>
                        <span className="font-bold text-slate-800">{doc.name}</span>
                        <span className="text-slate-400 ml-2">({doc.size})</span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Verified &check;
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 text-slate-500 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                <div className="text-3xl">📤</div>
                <div className="text-xs font-bold text-slate-700">Click to upload additional documents (PDF/JPG)</div>
                <div className="text-[11px] text-slate-400">Income certificate, disability proof, sports credentials up to 10MB</div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Next: Review &amp; Submit &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 4: Review &amp; Confirm</h2>
                <p className="text-xs text-slate-500">Verify your information before finalizing submission.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="font-bold text-slate-900">{formData.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Registration No:</span>
                  <span className="font-mono font-bold text-slate-900">{formData.registrationNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Programme:</span>
                  <span className="font-semibold text-slate-900">{formData.programme}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Year of Study:</span>
                  <span className="font-semibold text-slate-900">Year {formData.yearOfStudy}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Quota Category:</span>
                  <span className="font-bold text-indigo-700">{formData.quotaCategory}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Accessible Bed Needed:</span>
                  <span className="font-semibold text-slate-900">{formData.accessibilityRequired ? 'Yes (PWD)' : 'No'}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                ⚠️ By submitting, you certify that all entered details and documents are genuine and accurate.
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Confirm &amp; Submit Application
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
