import { describe, it, expect } from 'vitest';
import { EligibilityEngine } from '../src/services/EligibilityEngine.js';

describe('Eligibility Rules Engine (M3)', () => {
  it('approves an application that satisfies all institutional policy clauses', () => {
    const app = {
      programme: 'B.Tech Computer Science',
      yearOfStudy: 2,
      gender: 'FEMALE' as const,
      accessibilityRequired: false,
      documents: [
        { docType: 'STUDENT_ID', url: 'https://docs.edu/id.pdf', verified: true },
        { docType: 'FEE_RECEIPT', url: 'https://docs.edu/fee.pdf', verified: true },
      ],
    };

    const report = EligibilityEngine.evaluate(app, ['STUDENT_ID', 'FEE_RECEIPT']);

    expect(report.isEligible).toBe(true);
    expect(report.failedRuleIds.length).toBe(0);
    expect(report.reasons.length).toBe(0);
    expect(report.details.every((d) => d.passed)).toBe(true);
  });

  it('fails with transparent human-readable reason when mandatory documents are missing', () => {
    const app = {
      programme: 'B.Tech Computer Science',
      yearOfStudy: 2,
      documents: [{ docType: 'STUDENT_ID', url: 'https://docs.edu/id.pdf', verified: true }],
    };

    const report = EligibilityEngine.evaluate(app, ['STUDENT_ID', 'FEE_RECEIPT']);

    expect(report.isEligible).toBe(false);
    expect(report.failedRuleIds).toContain('RULE_DOCUMENT_COMPLIANCE');
    expect(report.reasons[0]).toContain('Mandatory verification documents are missing: FEE_RECEIPT');
    expect(report.remedies[0]).toContain('Upload clear copies of the missing documents');
  });

  it('fails when residence duration exceeds maximum allowable years', () => {
    const app = {
      programme: 'Ph.D',
      yearOfStudy: 6, // Exceeds 5
      documents: [
        { docType: 'STUDENT_ID', url: 'https://docs.edu/id.pdf', verified: true },
        { docType: 'FEE_RECEIPT', url: 'https://docs.edu/fee.pdf', verified: true },
      ],
    };

    const report = EligibilityEngine.evaluate(app, ['STUDENT_ID', 'FEE_RECEIPT']);

    expect(report.isEligible).toBe(false);
    expect(report.failedRuleIds).toContain('RULE_ACADEMIC_DURATION');
    expect(report.reasons[0]).toContain('exceeds maximum allowable hostel residence duration');
  });

  it('fails when accessible room requested without justification text', () => {
    const app = {
      programme: 'MBA',
      yearOfStudy: 1,
      accessibilityRequired: true,
      accessibilityReason: '', // Empty
      documents: [
        { docType: 'STUDENT_ID', url: 'https://docs.edu/id.pdf', verified: true },
        { docType: 'FEE_RECEIPT', url: 'https://docs.edu/fee.pdf', verified: true },
      ],
    };

    const report = EligibilityEngine.evaluate(app, ['STUDENT_ID', 'FEE_RECEIPT']);

    expect(report.isEligible).toBe(false);
    expect(report.failedRuleIds).toContain('RULE_ACCESSIBILITY_JUSTIFICATION');
    expect(report.reasons[0]).toContain('no medical or disability justification was provided');
  });

  it('succeeds upon correction and re-evaluation (fix-and-resubmit flow)', () => {
    const defectiveApp = {
      programme: 'B.Tech',
      yearOfStudy: 2,
      accessibilityRequired: true,
      accessibilityReason: '',
      documents: [],
    };

    const initialReport = EligibilityEngine.evaluate(defectiveApp, ['STUDENT_ID', 'FEE_RECEIPT']);
    expect(initialReport.isEligible).toBe(false);
    expect(initialReport.failedRuleIds.length).toBe(2);

    // Student corrects application
    const correctedApp = {
      ...defectiveApp,
      accessibilityReason: 'Wheelchair user requiring ground floor ramp access (Cert #WC-99)',
      documents: [
        { docType: 'STUDENT_ID', url: 'https://docs.edu/id.pdf', verified: true },
        { docType: 'FEE_RECEIPT', url: 'https://docs.edu/fee.pdf', verified: true },
      ],
    };

    const correctedReport = EligibilityEngine.evaluate(correctedApp, ['STUDENT_ID', 'FEE_RECEIPT']);
    expect(correctedReport.isEligible).toBe(true);
    expect(correctedReport.failedRuleIds.length).toBe(0);
  });
});
