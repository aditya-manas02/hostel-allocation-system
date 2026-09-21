import { z } from 'zod';
import {
  ROLES,
  BED_STATUSES,
  ROOM_STATUSES,
  GENDERS,
  GENDER_DESIGNATIONS,
  ROOM_TYPES,
  CYCLE_STATUSES,
  APPLICATION_STATUSES,
  DRAFT_STATUSES,
  OVERRIDE_CATEGORIES,
  AUDIT_ACTIONS,
  QUOTA_CATEGORIES,
  FEE_CATEGORIES,
} from '../constants/index.js';

// --- User Schemas ---
export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  passwordHash: z.string().optional(),
  fullName: z.string().min(2),
  role: z.enum(ROLES),
  assignedHostelId: z.string().optional(), // For Wardens
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema.omit({ passwordHash: true, password: true }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// --- Inventory Schemas ---
export const HostelSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2).max(10),
  genderDesignation: z.enum(GENDER_DESIGNATIONS),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Hostel = z.infer<typeof HostelSchema>;

export const BlockSchema = z.object({
  id: z.string().optional(),
  hostelId: z.string(),
  name: z.string().min(1),
  code: z.string().min(1).max(10),
  genderDesignation: z.enum(GENDER_DESIGNATIONS),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Block = z.infer<typeof BlockSchema>;

export const FloorSchema = z.object({
  id: z.string().optional(),
  blockId: z.string(),
  hostelId: z.string(),
  floorNumber: z.number().int(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Floor = z.infer<typeof FloorSchema>;

export const RoomSchema = z.object({
  id: z.string().optional(),
  floorId: z.string(),
  blockId: z.string(),
  hostelId: z.string(),
  roomNumber: z.string().min(1),
  roomType: z.enum(ROOM_TYPES),
  capacity: z.number().int().min(1).max(8),
  genderDesignation: z.enum(GENDER_DESIGNATIONS),
  isAccessible: z.boolean().default(false),
  status: z.enum(ROOM_STATUSES).default('AVAILABLE'),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Room = z.infer<typeof RoomSchema>;

export const BedSchema = z.object({
  id: z.string().optional(),
  roomId: z.string(),
  floorId: z.string(),
  blockId: z.string(),
  hostelId: z.string(),
  bedLabel: z.string().min(1),
  status: z.enum(BED_STATUSES).default('AVAILABLE'),
  isAccessible: z.boolean().default(false),
  currentOccupantId: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Bed = z.infer<typeof BedSchema>;

// --- Allocation Cycle Schemas ---
export const AllocationCycleSchema = z.object({
  id: z.string().optional(),
  academicYear: z.string(),
  term: z.string(),
  status: z.enum(CYCLE_STATUSES).default('UPCOMING'),
  applicationStartDate: z.coerce.date(),
  applicationEndDate: z.coerce.date(),
  eligibilityRuleSetVersion: z.string().default('v1'),
  documentRequirements: z.array(z.string()).default([]),
  quotas: z
    .record(z.enum(QUOTA_CATEGORIES), z.number().min(0).max(100))
    .default({
      GENERAL: 60,
      SPORTS: 10,
      INTERNATIONAL: 10,
      PWD: 5,
      SCHOLARSHIP: 10,
      STAFF_WARD: 5,
    }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type AllocationCycle = z.infer<typeof AllocationCycleSchema>;

// --- Application Schemas ---
export const ApplicationSchema = z.object({
  id: z.string().optional(),
  cycleId: z.string(),
  studentId: z.string(),
  status: z.enum(APPLICATION_STATUSES).default('DRAFT'),
  programme: z.string().min(1),
  yearOfStudy: z.number().int().min(1).max(6),
  gender: z.enum(GENDERS),
  quotaCategory: z.enum(QUOTA_CATEGORIES).default('GENERAL'),
  feeCategory: z.enum(FEE_CATEGORIES).default('STANDARD'),
  accessibilityRequired: z.boolean().default(false),
  accessibilityReason: z.string().optional(),
  meritRank: z.number().optional(),
  submittedAt: z.date().optional(),
  documents: z
    .array(
      z.object({
        docType: z.string(),
        url: z.string(),
        verified: z.boolean().default(false),
      }),
    )
    .default([]),
  eligibilityResult: z
    .object({
      isEligible: z.boolean(),
      evaluatedAt: z.date(),
      reasons: z.array(z.string()),
      failedRuleIds: z.array(z.string()),
    })
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Application = z.infer<typeof ApplicationSchema>;

// --- Preferences Schemas ---
export const PreferenceSchema = z.object({
  id: z.string().optional(),
  cycleId: z.string(),
  studentId: z.string(),
  rankedHostelIds: z.array(z.string()).min(1),
  rankedRoomTypes: z.array(z.enum(ROOM_TYPES)).min(1),
  requestedRoommateStudentIds: z.array(z.string()).max(3).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Preference = z.infer<typeof PreferenceSchema>;

// --- Compatibility & Sensitive Questionnaire Schemas ---
export const QuestionnaireAnswersSchema = z.object({
  sleepSchedule: z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE']),
  cleanlinessLevel: z.number().int().min(1).max(5),
  noiseTolerance: z.number().int().min(1).max(5),
  studyHabits: z.enum(['IN_ROOM_SILENT', 'IN_ROOM_MUSIC', 'LIBRARY_ONLY']),
  guestFrequency: z.enum(['NEVER', 'OCCASIONAL', 'FREQUENT']),
  smokingHabit: z.boolean(),
});
export type QuestionnaireAnswers = z.infer<typeof QuestionnaireAnswersSchema>;

export const CompatibilityResponseSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  consentGiven: z.boolean(),
  consentTimestamp: z.date(),
  encryptedPayload: z.string(), // enc:<version>:<iv>:<tag>:<ciphertext>
  keyVersion: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type CompatibilityResponse = z.infer<typeof CompatibilityResponseSchema>;

// --- Allocation Draft & Assignment Schemas ---
export const StructuredExplanationSchema = z.object({
  preferenceRankSatisfied: z.number().nullable(),
  isFirstChoice: z.boolean(),
  constraintsChecked: z.array(z.string()),
  quotaBucketUsed: z.enum(QUOTA_CATEGORIES),
  tiebreakValue: z.number(),
  roommateCompatibilityScore: z.number().nullable(),
  rationaleText: z.string(),
});
export type StructuredExplanation = z.infer<typeof StructuredExplanationSchema>;

export const AllocationAssignmentSchema = z.object({
  id: z.string().optional(),
  draftId: z.string(),
  bedId: z.string(),
  roomId: z.string(),
  hostelId: z.string(),
  studentId: z.string(),
  explanation: StructuredExplanationSchema,
  isOverridden: z.boolean().default(false),
  overrideId: z.string().optional(),
  createdAt: z.date().optional(),
});
export type AllocationAssignment = z.infer<typeof AllocationAssignmentSchema>;

export const AllocationDraftSchema = z.object({
  id: z.string().optional(),
  cycleId: z.string(),
  version: z.number().int().default(1),
  status: z.enum(DRAFT_STATUSES).default('GENERATING'),
  seed: z.string(),
  parameters: z.record(z.any()),
  inputSnapshotHash: z.string(),
  engineVersion: z.string(),
  outputHash: z.string(),
  stats: z.object({
    totalAssigned: z.number(),
    totalUnassigned: z.number(),
    firstChoicePercentage: z.number(),
    averageCompatibilityScore: z.number().nullable(),
    executionTimeMs: z.number(),
  }),
  approvalId: z.string().optional(),
  publishedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type AllocationDraft = z.infer<typeof AllocationDraftSchema>;

// --- Override & Approval Schemas ---
export const OverrideSchema = z.object({
  id: z.string().optional(),
  draftId: z.string(),
  bedId: z.string(),
  previousStudentId: z.string().nullable(),
  newStudentId: z.string(),
  reasonCategory: z.enum(OVERRIDE_CATEGORIES),
  reasonText: z.string().min(10, 'Override reason must be at least 10 characters'),
  actorId: z.string(),
  actorRole: z.enum(ROLES),
  isEscalated: z.boolean().default(false),
  chiefWardenApprovalId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export type Override = z.infer<typeof OverrideSchema>;

export const ApprovalSchema = z.object({
  id: z.string().optional(),
  draftId: z.string(),
  approverId: z.string(),
  approverRole: z.enum(ROLES),
  draftVersionHash: z.string(),
  scope: z.enum(['HOSTEL_SPECIFIC', 'CROSS_HOSTEL_ALL']),
  targetHostelId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export type Approval = z.infer<typeof ApprovalSchema>;

// --- Waitlist & Letters ---
export const WaitlistEntrySchema = z.object({
  id: z.string().optional(),
  cycleId: z.string(),
  studentId: z.string(),
  position: z.number().int(),
  reason: z.string(),
  status: z.enum(['ACTIVE', 'PROMOTED', 'CANCELLED']).default('ACTIVE'),
  promotedToBedId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

// --- Hash-Chained Audit Log Schema ---
export const AuditLogSchema = z.object({
  id: z.string().optional(),
  sequence: z.number().int(),
  batchId: z.string().optional(),
  action: z.enum(AUDIT_ACTIONS),
  actorId: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  before: z.record(z.any()).nullable(),
  after: z.record(z.any()).nullable(),
  timestamp: z.date().default(() => new Date()),
  previousHash: z.string(),
  hash: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;
