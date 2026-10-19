'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface RuleDetail {
  ruleId: string;
  name: string;
  policyClause: string;
  passed: boolean;
  reason: string;
  remedy?: string;
}

interface EligibilityReport {
  isEligible: boolean;
  evaluatedAt: string;
  reasons: string[];
  remedies: string[];
  failedRuleIds: string[];
  details: RuleDetail[];
}

export default function StudentEligibilityPage() {
  const [report, setReport] = useState<EligibilityReport>({
    isEligible: true,
    evaluatedAt: new Date().toISOString(),
    reasons: [],
    remedies: [],
    failedRuleIds: [],
    details: [
      {
        ruleId: 'RULE_ACADEMIC_DURATION',
        name: 'Maximum Residence Duration Policy',
        policyClause: 'Hostel Policy Manual 2026, Section 3.1',
        passed: true,
        reason: 'Applicant is in Year 2 of B.Tech programme, well within 4-year limit.',
      },
      {
        ruleId: 'RULE_DOCUMENT_COMPLIANCE',
        name: 'Mandatory Institutional Verification',
        policyClause: 'Hostel Policy Manual 2026, Section 4.2',
        passed: true,
        reason: 'Student ID and Term 1 fee receipts verified by system.',
      },
      {
        ruleId: 'RULE_DISCIPLINARY_STANDING',
        name: 'Proctorial Conduct Clearance',
        policyClause: 'Hostel Policy Manual 2026, Section 5.1',
        passed: true,
        reason: 'No disciplinary citations or conduct holds recorded.',
      },
      {
        ruleId: 'RULE_PROGRAMME_ENROLLMENT',
        name: 'Active Degree Enrollment',
        policyClause: 'Hostel Policy Manual 2026, Section 2.1',
        passed: true,
        reason: 'Valid enrollment in B.Tech Computer Science & Engineering verified.',
      },
    ],
  });

  const [testingDeficiency, setTestingDeficiency] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState(false);

  // Toggle to demonstrate the failure-and-remedy loop from Phase 2
  const triggerSimulation = () => {
    if (!testingDeficiency) {
      setReport({
        isEligible: false,
        evaluatedAt: new Date().toISOString(),
        reasons: ['Mandatory verification documents are missing: FEE_RECEIPT.'],
        remedies: ['Upload clear copy of the missing fee receipt and click Re-evaluate.'],
        failedRuleIds: ['RULE_DOCUMENT_COMPLIANCE'],
        details: [
          {
            ruleId: 'RULE_ACADEMIC_DURATION',
            name: 'Maximum Residence Duration Policy',
            policyClause: 'Hostel Policy Manual 2026, Section 3.1',
            passed: true,
            reason: 'Applicant is in Year 2 of B.Tech programme, well within 4-year limit.',
          },
          {
            ruleId: 'RULE_DOCUMENT_COMPLIANCE',
            name: 'Mandatory Institutional Verification',
            policyClause: 'Hostel Policy Manual 2026, Section 4.2',
            passed: false,
            reason: 'Mandatory verification documents are missing: FEE_RECEIPT.',
            remedy: 'Upload clear copy of the missing fee receipt and click Re-evaluate.',
          },
          {
            ruleId: 'RULE_DISCIPLINARY_STANDING',
            name: 'Proctorial Conduct Clearance',
            policyClause: 'Hostel Policy Manual 2026, Section 5.1',
            passed: true,
            reason: 'No disciplinary citations or conduct holds recorded.',
          },
          {
            ruleId: 'RULE_PROGRAMME_ENROLLMENT',
            name: 'Active Degree Enrollment',
            policyClause: 'Hostel Policy Manual 2026, Section 2.1',
            passed: true,
            reason: 'Valid enrollment in B.Tech Computer Science & Engineering verified.',
          },
        ],
      });
      setTestingDeficiency(true);
    }
  };

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
            name: 'Maximum Residence Duration Policy',
            policyClause: 'Hostel Policy Manual 2026, Section 3.1',
            passed: true,
            reason: 'Applicant is within standard programme duration limits.',
          },
          {
            ruleId: 'RULE_DOCUMENT_COMPLIANCE',
            name: 'Mandatory Institutional Verification',
            policyClause: 'Hostel Policy Manual 2026, Section 4.2',
            passed: true,
            reason: 'Fee receipt document uploaded, verified, and cleared.',
          },
          {
            ruleId: 'RULE_DISCIPLINARY_STANDING',
            name: 'Proctorial Conduct Clearance',
            policyClause: 'Hostel Policy Manual 2026, Section 5.1',
            passed: true,
            reason: 'No disciplinary citations or conduct holds recorded.',
          },
          {
            ruleId: 'RULE_PROGRAMME_ENROLLMENT',
            name: 'Active Degree Enrollment',
            policyClause: 'Hostel Policy Manual 2026, Section 2.1',
            passed: true,
            reason: 'Valid enrollment in B.Tech Computer Science & Engineering verified.',
          },
        ],
      });
      setFixing(false);
      setTestingDeficiency(false);
      setUploadedReceipt(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Policy Engine Check
            </span>
            <span className="text-xs text-slate-500">&bull; Declarative Rules Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Housing Eligibility Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time evaluation against institutional hostel eligibility bylaws.
          </p>
        </div>

        <div>
          <button
            onClick={triggerSimulation}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            title="Demonstrate deficiency remediation loop"
          >
            🧪 Simulate Deficiency Test
          </button>
        </div>
      </div>

      {/* Main Status Banner */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition ${
          report.isEligible
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-rose-50/80 border-rose-200 text-rose-950'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shrink-0 ${
              report.isEligible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {report.isEligible ? '✓' : '!'}
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Automated Policy Result
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              {report.isEligible
                ? 'Candidate Eligible for Hostel Allocation'
                : 'Eligibility Action Required (Deficiency Identified)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {report.isEligible
                ? 'Your application satisfies all 4 institutional rules and is cleared for allocation in the upcoming deterministic run.'
                : 'One or more institutional criteria were not met. Follow the remedy instructions below to correct your records and re-evaluate.'}
            </p>
          </div>
        </div>
      </div>

      {/* Declarative Rules Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs sm:text-sm flex justify-between items-center">
          <span>Evaluated Policy Clauses</span>
          <span className="text-xs font-mono text-slate-400">Ruleset Engine v1.4</span>
        </div>

        <div className="divide-y divide-slate-100">
          {report.details.map((d: any) => (
            <div key={d.ruleId} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                  <span className="text-[11px] text-slate-400 ml-2 font-mono">({d.policyClause})</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    d.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {d.passed ? 'PASSED ✓' : 'FAILED ✗'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{d.reason}</p>

              {d.remedy && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-0.5">
                  <strong>Remedy Action:</strong>
                  <p>{d.remedy}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deficiency Remediation Panel */}
      {!report.isEligible && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Remediate Deficiencies &amp; Re-evaluate
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Missing Fee Receipt
              </label>
              <button
                type="button"
                onClick={() => setUploadedReceipt(true)}
                className="px-4 py-2 border rounded-xl text-xs bg-white hover:bg-slate-100 font-semibold text-slate-700 transition"
              >
                {uploadedReceipt ? '✓ Fee_Receipt_2026.pdf Ready' : '📁 Upload Fee Receipt PDF'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleFixAndResubmit}
              disabled={fixing || !uploadedReceipt}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow disabled:opacity-50"
            >
              {fixing ? 'Evaluating Policy Rules...' : 'Submit Documents & Clear Deficiency'}
            </button>
          </div>
        </div>
      )}

      {/* Back to Portal CTA */}
      <div className="flex justify-between items-center pt-2">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          &larr; Return to Dashboard
        </Link>
        <Link
          href="/preferences"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
        >
          Continue to Hostel Preferences &rarr;
        </Link>
      </div>
    </div>
  );
}
