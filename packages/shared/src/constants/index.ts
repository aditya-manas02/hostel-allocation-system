export const ROLES = [
  'STUDENT',
  'WARDEN',
  'CHIEF_WARDEN',
  'ADMIN',
  'DEAN',
  'SYSTEM_ADMIN',
] as const;
export type Role = (typeof ROLES)[number];

export const BED_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'] as const;
export type BedStatus = (typeof BED_STATUSES)[number];

export const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_DESIGNATIONS = ['MALE', 'FEMALE', 'COED', 'OTHER'] as const;
export type GenderDesignation = (typeof GENDER_DESIGNATIONS)[number];

export const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const CYCLE_STATUSES = [
  'UPCOMING',
  'APPLICATIONS_OPEN',
  'APPLICATIONS_CLOSED',
  'ALLOCATING',
  'UNDER_REVIEW',
  'PUBLISHED',
  'ARCHIVED',
] as const;
export type CycleStatus = (typeof CYCLE_STATUSES)[number];

export const APPLICATION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_VERIFICATION',
  'ELIGIBLE',
  'INELIGIBLE',
  'ALLOCATED',
  'WAITLISTED',
  'CANCELLED',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const DRAFT_STATUSES = [
  'GENERATING',
  'DRAFT',
  'UNDER_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'FAILED',
  'SUPERSEDED',
  'CANCELLED',
] as const;
export type DraftStatus = (typeof DRAFT_STATUSES)[number];

export const OVERRIDE_CATEGORIES = [
  'MEDICAL_ACCOMMODATION',
  'ACCESSIBILITY_NEEDS',
  'ADMINISTRATIVE_CORRECTION',
  'DISCIPLINARY_SEPARATION',
  'SPECIAL_QUOTA_ADJUSTMENT',
  'MUTUAL_REQUEST_RESOLVED',
  'OTHER',
] as const;
export type OverrideCategory = (typeof OVERRIDE_CATEGORIES)[number];

export const AUDIT_ACTIONS = [
  'USER_CREATED',
  'USER_LOGIN',
  'INVENTORY_CREATED',
  'INVENTORY_UPDATED',
  'INVENTORY_DELETED',
  'CYCLE_CREATED',
  'CYCLE_UPDATED',
  'APPLICATION_SUBMITTED',
  'APPLICATION_VERIFIED',
  'ELIGIBILITY_EVALUATED',
  'COMPATIBILITY_SUBMITTED',
  'COMPATIBILITY_DELETED',
  'ALLOCATION_STARTED',
  'ALLOCATION_COMPLETED',
  'ALLOCATION_FAILED',
  'DRAFT_CREATED',
  'OVERRIDE_APPLIED',
  'OVERRIDE_ESCALATED',
  'DRAFT_APPROVED',
  'DRAFT_PUBLISHED',
  'WAITLIST_PROMOTED',
  'ROOM_CHANGE_REQUESTED',
  'ROOM_CHANGE_DECIDED',
  'LETTER_GENERATED',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const QUOTA_CATEGORIES = [
  'GENERAL',
  'SPORTS',
  'INTERNATIONAL',
  'PWD',
  'SCHOLARSHIP',
  'STAFF_WARD',
] as const;
export type QuotaCategory = (typeof QUOTA_CATEGORIES)[number];

export const FEE_CATEGORIES = [
  'STANDARD',
  'SUBSIDIZED',
  'FULL_FEE',
  'EXEMPTED',
] as const;
export type FeeCategory = (typeof FEE_CATEGORIES)[number];
