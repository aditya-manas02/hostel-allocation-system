'use client';

import React, { useState } from 'react';

export default function StudentApplicationWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    programme: 'B.Tech Computer Science',
    yearOfStudy: '2',
    gender: 'FEMALE',
    quotaCategory: 'GENERAL',
    feeCategory: 'STANDARD',
    accessibilityRequired: false,
    accessibilityReason: '',
    uploadedDocuments: ['Student_ID_2026.pdf', 'Fee_Receipt_Term1.pdf'],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Hostel Accommodation Application</h1>
        <p className="text-slate-500 mt-1">Cycle 2026-2027 — Fall Semester</p>
      </div>

      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between border-b pb-4">
        {[
          { num: 1, label: 'Academic & Programme' },
          { num: 2, label: 'Quota & Needs' },
          { num: 3, label: 'Documents' },
          { num: 4, label: 'Review & Submit' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s.num
                  ? 'bg-indigo-600 text-white'
                  : step > s.num
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </span>
            <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {submitted ? (
        <div className="p-8 bg-green-50 border border-green-200 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-green-900">Application Submitted Successfully!</h2>
          <p className="text-sm text-green-700 max-w-md mx-auto">
            Your application for the 2026-2027 Fall Semester has been securely submitted and logged in the immutable audit trail.
          </p>
          <div className="pt-4">
            <a
              href="/"
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Return to Student Dashboard
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-white border rounded-xl shadow-sm space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Step 1: Academic & Programme Details</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700">Programme of Study</label>
                <input
                  type="text"
                  value={formData.programme}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                  className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Year of Study</label>
                <select
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1">Year 1 (Freshman)</option>
                  <option value="2">Year 2 (Sophomore)</option>
                  <option value="3">Year 3 (Junior)</option>
                  <option value="4">Year 4 (Senior)</option>
                  <option value="5">Postgraduate / Ph.D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="mt-1 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Next: Quotas & Needs →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Step 2: Quota & Special Accommodations</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700">Quota Category</label>
                <select
                  value={formData.quotaCategory}
                  onChange={(e) => setFormData({ ...formData, quotaCategory: e.target.value })}
                  className="mt-1 w-full p-2.5 border rounded-lg"
                >
                  <option value="GENERAL">General Quota (60%)</option>
                  <option value="SPORTS">Sports Quota (10%)</option>
                  <option value="INTERNATIONAL">International Student Quota (10%)</option>
                  <option value="PWD">Persons with Disabilities (PWD) (5%)</option>
                  <option value="SCHOLARSHIP">Merit Scholarship Quota (10%)</option>
                  <option value="STAFF_WARD">Staff Ward Quota (5%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Fee Category</label>
                <select
                  value={formData.feeCategory}
                  onChange={(e) => setFormData({ ...formData, feeCategory: e.target.value })}
                  className="mt-1 w-full p-2.5 border rounded-lg"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="SUBSIDIZED">Subsidized</option>
                  <option value="FULL_FEE">Full Fee</option>
                  <option value="EXEMPTED">Exempted</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accessibilityRequired}
                    onChange={(e) => setFormData({ ...formData, accessibilityRequired: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-800">
                    I require an accessible room (Ground floor / wheelchair accessible)
                  </span>
                </label>

                {formData.accessibilityRequired && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Reason / Medical Condition</label>
                    <textarea
                      rows={2}
                      value={formData.accessibilityReason}
                      onChange={(e) => setFormData({ ...formData, accessibilityReason: e.target.value })}
                      placeholder="Please provide details for accessibility allocation..."
                      className="mt-1 w-full text-xs p-2 border rounded"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Next: Documents →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Step 3: Document Uploads</h2>
              <p className="text-xs text-slate-500">
                Mandatory verification documents for cycle 2026-2027: Student ID, Fee Receipt.
              </p>

              <div className="space-y-2">
                {formData.uploadedDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 text-sm">
                    <span className="font-medium text-slate-700">📄 {doc}</span>
                    <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded">Ready</span>
                  </div>
                ))}
              </div>

              <div className="p-6 border-2 border-dashed rounded-xl text-center space-y-2 text-slate-500 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div className="text-2xl">📤</div>
                <div className="text-sm font-medium">Click to upload additional supporting documents</div>
                <div className="text-xs text-slate-400">PDF, PNG, JPG up to 10MB</div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Next: Review & Submit →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Step 4: Review Application</h2>
              <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                <div><strong className="text-slate-500">Programme:</strong> {formData.programme}</div>
                <div><strong className="text-slate-500">Year:</strong> {formData.yearOfStudy}</div>
                <div><strong className="text-slate-500">Gender:</strong> {formData.gender}</div>
                <div><strong className="text-slate-500">Quota:</strong> {formData.quotaCategory}</div>
                <div><strong className="text-slate-500">Fee Category:</strong> {formData.feeCategory}</div>
                <div><strong className="text-slate-500">Accessible Bed Needed:</strong> {formData.accessibilityRequired ? 'Yes' : 'No'}</div>
                <div><strong className="text-slate-500">Documents:</strong> {formData.uploadedDocuments.join(', ')}</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                ⚠️ By submitting, you certify that all entered details and documents are genuine. Your submission will be recorded in the audit trail.
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Submit Application
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
