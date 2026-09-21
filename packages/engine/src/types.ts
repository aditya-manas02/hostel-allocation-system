import {
  Gender,
  GenderDesignation,
  RoomType,
  QuotaCategory,
  StructuredExplanation,
} from '@hostel/shared';

export interface EngineApplicant {
  id: string;
  gender: Gender;
  quotaCategory: QuotaCategory;
  yearOfStudy: number;
  meritRank?: number;
  accessibilityRequired: boolean;
  isEligible: boolean;
  ineligibleReasons?: string[];
  rankedHostelIds: string[];
  rankedRoomTypes: RoomType[];
  requestedRoommateIds: string[];
}

export interface EngineBed {
  id: string;
  roomId: string;
  floorId: string;
  blockId: string;
  hostelId: string;
  bedLabel: string;
  isAccessible: boolean;
  genderDesignation: GenderDesignation;
  roomType: RoomType;
  roomCapacity: number;
}

export interface EngineInputSnapshot {
  applicants: EngineApplicant[];
  beds: EngineBed[];
  quotas: Record<QuotaCategory, number>; // Percentage e.g. { GENERAL: 60, ... }
  compatibilityMatrix?: Record<string, Record<string, number>>; // [studentA][studentB] -> 0-100
  priorityWeights?: {
    meritWeight?: number;
    seniorityWeight?: number;
  };
  preferenceWeight?: number; // default 0.70
  compatibilityWeight?: number; // default 0.30
  maxImprovementIterations?: number; // default 500
}

export interface EngineAssignment {
  bedId: string;
  roomId: string;
  hostelId: string;
  studentId: string;
  explanation: StructuredExplanation;
}

export interface EngineWaitlistEntry {
  studentId: string;
  position: number;
  reason: string;
}

export interface EngineOutput {
  assignments: EngineAssignment[];
  waitlist: EngineWaitlistEntry[];
  stats: {
    totalAssigned: number;
    totalUnassigned: number;
    firstChoicePercentage: number;
    averageCompatibilityScore: number | null;
    executionTimeMs: number;
  };
  inputSnapshotHash: string;
  outputHash: string;
  engineVersion: string;
}
