'use client';

import React, { useState } from 'react';

export default function StudentEligibilityPage() {
  const [report, setReport] = useState({
    isEligible: false,
    evaluatedAt: new Date().toISOString(),
    reasons: [
      'Mandatory verification documents are missing: FEE_RECEIPT.',
      'Accessible accommodation was requested but no medical or disability justification was provided.',
    ],
    remedies: [
      'Upload clear copies of the missing documents in the application portal and click Resubmit.',
      'Provide specific details or medical certificate reference in the accessibility reason field.',
    ],
    failedRuleIds: ['RULE_DOCUMENT_COMPLIANCE', 'RULE_ACCESSIBILITY_JUSTIFICATION'],
    details: [
      {
        ruleId: 'RULE_ACADEMIC_DURATION',
        name: 'Maximum Residence Duration',
        policyClause: 'Hostel Policy Manual 2026, Section 3.1',
        passed: true,
        reason: 'Applicant is within standard programme duration limits.',
      },
      {
        ruleId: 'RULE_DOCUMENT_COMPLIANCE',
        name: 'Mandatory Document Verification',
        policyClause: 'Hostel Policy Manual 2026, Section 4.2',
        passed: false,
        reason: 'Mandatory verification documents are missing: FEE_RECEIPT.',
        remedy: 'Upload clear copies of the missing documents in the application portal and click Resubmit.',
      },
      {
        ruleId: 'RULE_ACCESSIBILITY_JUSTIFICATION',
        name: 'Accessibility Accommodation Justification',
        policyClause: 'Hostel Policy Manual 2026, Section 5.4',
        passed: false,
        reason: 'Accessible accommodation was requested but no medical or disability justification was provided.',
        remedy: 'Provide specific details or medical certificate reference in the accessibility reason field.',
      },
      {
        ruleId: 'RULE_PROGRAMME_ENROLLMENT',
        name: 'Active Degree Enrollment',
        policyClause: 'Hostel Policy Manual 2026, Section 2.1',
        passed: true,
        reason: 'Valid enrollment in B.Tech Computer Science.',
      },
    ],
  });

  const [fixing, setFixing] = useState(false);
  const [justificationInput, setJustificationInput] = useState('');
  const [uploadedReceipt, setUploadedReceipt] = useState(false);

  const handleFixAndResubmit = () => {
    setFixing(true);
    setTimeout(() => {
      setReport({
        isEligible: true,
        evaluatedAt: new Date().toISOString(),
        reasons: [],
        remedies: [],
        failedRuleIds: [],
        details: [
          {
            ruleId: 'RULE_ACADEMIC_DURATION',
            name: 'Maximum Residence Duration',
            policyClause: 'Hostel Policy Manual 2026, Section 3.1',
            passed: true,
            reason: 'Applicant is within standard programme duration limits.',
          },
          {
            ruleId: 'RULE_DOCUMENT_COMPLIANCE',
            name: 'Mandatory Document Verification',
            policyClause: 'Hostel Policy Manual 2026, Section 4.2',
            passed: true,
            reason: 'Fee receipt document uploaded and verified.',
          },
          {
            ruleId: 'RULE_ACCESSIBILITY_JUSTIFICATION',
            name: 'Accessibility Accommodation Justification',
            policyClause: 'Hostel Policy Manual 2026, Section 5.4',
            passed: true,
            reason: 'Medical certificate verified: Mobility impairment requiring ground-floor accessible bed.',
          },
          {
            ruleId: 'RULE_PROGRAMME_ENROLLMENT',
            name: 'Active Degree Enrollment',
            policyClause: 'Hostel Policy Manual 2026, Section 2.1',
            passed: true,
            reason: 'Valid enrollment in B.Tech Computer Science.',
          },
        ],
      });
      setFixing(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Application Eligibility Validation</h1>
        <p className="text-slate-500 mt-1">
          Automated evaluation against institutional policy criteria with transparent reasons
        </p>
      </div>

      {/* Status Banner */}
      <div
        className={`p-6 rounded-xl border ${
          report.isEligible
            ? 'bg-green-50 border-green-200 text-green-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
              report.isEligible ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {report.isEligible ? '✓' : '!'}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">
              {report.isEligible ? 'Application Eligible for Allocation' : 'Eligibility Action Required'}
            </h2>
            <p className="text-sm">
              {report.isEligible
                ? 'Your application satisfies all institutional policy clauses and will be included in the allocation engine run.'
                : 'One or more policy conditions were not satisfied. Review the required remedies below, update your details, and re-submit.'}
            </p>
          </div>
        </div>
      </div>

      {/* Rules Breakdown Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-bold text-slate-800">
          Policy Evaluation Breakdown
        </div>
        <div className="divide-y">
          {report.details.map((d) => (
            <div key={d.ruleId} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{d.name}</span>
                  <span className="text-xs text-slate-400 ml-2">({d.policyClause})</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    d.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {d.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-sm text-slate-600">{d.reason}</p>
              {d.remedy && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <strong>Recommended Remedy:</strong> {d.remedy}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Correction Panel if Ineligible */}
      {!report.isEligible && (
        <div className="p-6 bg-slate-50 border rounded-xl space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Correct Deficiencies & Resubmit</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                1. Upload Missing Document: Term 1 Fee Receipt
              </label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setUploadedReceipt(true)}
                  className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-slate-100 font-medium"
                >
                  {uploadedReceipt ? '✓ Fee_Receipt_2026.pdf Uploaded' : '📁 Select Fee Receipt PDF'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                2. Accessibility Accommodation Justification
              </label>
              <textarea
                rows={2}
                value={justificationInput}
                onChange={(e) => setJustificationInput(e.target.value)}
                placeholder="E.g., Medical certificate #MED-9921: Lower limb mobility impairment requiring wheelchair-accessible ground floor room."
                className="mt-1 w-full text-sm p-2.5 border rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFixAndResubmit}
              disabled={fixing}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {fixing ? 'Evaluating Policy Rules...' : 'Submit Corrections & Re-evaluate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
