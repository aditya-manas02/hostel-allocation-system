import { Application } from '@hostel/shared';

export interface RuleEvaluationResult {
  ruleId: string;
  name: string;
  policyClause: string;
  passed: boolean;
  reason: string;
  remedy?: string;
}

export interface EligibilityEvaluationReport {
  isEligible: boolean;
  evaluatedAt: Date;
  reasons: string[];
  remedies: string[];
  failedRuleIds: string[];
  details: RuleEvaluationResult[];
}

export class EligibilityEngine {
  /**
   * Evaluates an application against declared institutional policy rules.
   * Returns pass/fail with structured human-readable reasons and actionable remedies.
   */
  public static evaluate(
    application: Partial<Application>,
    requiredDocumentTypes: string[] = ['STUDENT_ID', 'FEE_RECEIPT'],
  ): EligibilityEvaluationReport {
    const details: RuleEvaluationResult[] = [];
    const reasons: string[] = [];
    const remedies: string[] = [];
    const failedRuleIds: string[] = [];

    // Rule 1: Academic Standing & Max Duration
    const maxYear = 5;
    const year = application.yearOfStudy || 1;
    if (year > maxYear) {
      const reason = `Year of study (${year}) exceeds maximum allowable hostel residence duration of ${maxYear} years.`;
      const remedy = `Submit an academic extension request approved by Dean of Academic Affairs.`;
      details.push({
        ruleId: 'RULE_ACADEMIC_DURATION',
        name: 'Maximum Residence Duration',
        policyClause: 'Hostel Policy Manual 2026, Section 3.1',
        passed: false,
        reason,
        remedy,
      });
      reasons.push(reason);
      remedies.push(remedy);
      failedRuleIds.push('RULE_ACADEMIC_DURATION');
    } else {
      details.push({
        ruleId: 'RULE_ACADEMIC_DURATION',
        name: 'Maximum Residence Duration',
        policyClause: 'Hostel Policy Manual 2026, Section 3.1',
        passed: true,
        reason: 'Applicant is within standard programme duration limits.',
      });
    }

    // Rule 2: Mandatory Document Upload Verification
    const uploadedTypes = (application.documents || []).map((d) => d.docType);
    const missingDocs = requiredDocumentTypes.filter((doc) => !uploadedTypes.includes(doc));
    if (missingDocs.length > 0) {
      const reason = `Mandatory verification documents are missing: ${missingDocs.join(', ')}.`;
      const remedy = `Upload clear copies of the missing documents in the application portal and click Resubmit.`;
      details.push({
        ruleId: 'RULE_DOCUMENT_COMPLIANCE',
        name: 'Mandatory Document Verification',
        policyClause: 'Hostel Policy Manual 2026, Section 4.2',
        passed: false,
        reason,
        remedy,
      });
      reasons.push(reason);
      remedies.push(remedy);
      failedRuleIds.push('RULE_DOCUMENT_COMPLIANCE');
    } else {
      details.push({
        ruleId: 'RULE_DOCUMENT_COMPLIANCE',
        name: 'Mandatory Document Verification',
        policyClause: 'Hostel Policy Manual 2026, Section 4.2',
        passed: true,
        reason: 'All mandatory verification documents have been submitted.',
      });
    }

    // Rule 3: Accessibility Reason Justification
    if (application.accessibilityRequired) {
      const reasonText = application.accessibilityReason?.trim() || '';
      if (reasonText.length < 10) {
        const reason = 'Accessible accommodation was requested but no medical or disability justification was provided.';
        const remedy = 'Provide specific details or medical certificate reference in the accessibility reason field.';
        details.push({
          ruleId: 'RULE_ACCESSIBILITY_JUSTIFICATION',
          name: 'Accessibility Accommodation Justification',
          policyClause: 'Hostel Policy Manual 2026, Section 5.4',
          passed: false,
          reason,
          remedy,
        });
        reasons.push(reason);
        remedies.push(remedy);
        failedRuleIds.push('RULE_ACCESSIBILITY_JUSTIFICATION');
      } else {
        details.push({
          ruleId: 'RULE_ACCESSIBILITY_JUSTIFICATION',
          name: 'Accessibility Accommodation Justification',
          policyClause: 'Hostel Policy Manual 2026, Section 5.4',
          passed: true,
          reason: 'Accessibility justification provided and meets minimum threshold.',
        });
      }
    }

    // Rule 4: Valid Programme Enrollment
    if (!application.programme || application.programme.trim().length === 0) {
      const reason = 'No registered university degree programme specified.';
      const remedy = 'Select your degree programme from the approved university academic roster.';
      details.push({
        ruleId: 'RULE_PROGRAMME_ENROLLMENT',
        name: 'Active Degree Enrollment',
        policyClause: 'Hostel Policy Manual 2026, Section 2.1',
        passed: false,
        reason,
        remedy,
      });
      reasons.push(reason);
      remedies.push(remedy);
      failedRuleIds.push('RULE_PROGRAMME_ENROLLMENT');
    } else {
      details.push({
        ruleId: 'RULE_PROGRAMME_ENROLLMENT',
        name: 'Active Degree Enrollment',
        policyClause: 'Hostel Policy Manual 2026, Section 2.1',
        passed: true,
        reason: `Valid enrollment in ${application.programme}.`,
      });
    }

    const isEligible = failedRuleIds.length === 0;

    return {
      isEligible,
      evaluatedAt: new Date(),
      reasons,
      remedies,
      failedRuleIds,
      details,
    };
  }
}
