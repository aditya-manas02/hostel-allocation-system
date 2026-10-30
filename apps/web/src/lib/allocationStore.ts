/**
 * Centralized Store for Hostel Allocations & Room Change Requests
 * Provides full reactive synchronization between Student, Warden, and Admin portals.
 * Persists to localStorage and broadcasts update events across the application.
 */

export interface StudentAllocation {
  studentId: string;
  studentName: string;
  studentRoll: string;
  email: string;
  programme: string;
  yearOfStudy: number;
  gender: 'MALE' | 'FEMALE' | 'COED';
  hostelCode: string;
  hostelName: string;
  blockName: string;
  floorName: string;
  roomNumber: string;
  bedLabel: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  isAccessible: boolean;
  messAllotment: string;
  reportingDate: string;
  wardenInCharge: string;
  status: 'PUBLISHED' | 'PROVISIONAL' | 'WAITLISTED';
  roommate?: {
    fullName: string;
    rollNumber: string;
    programme: string;
    compatibilityScore: number;
    lifestyleMatch?: {
      sleepSchedule: string;
      studyHabits: string;
      cleanliness: string;
      noiseTolerance: string;
    };
  };
  rationale: string;
  referenceId: string;
  lastUpdated: string;
}

export interface RoomChangeRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  currentHostelCode: string;
  currentHostelName: string;
  currentRoom: string;
  currentBed: string;
  requestedHostelCode: string;
  requestedHostelName: string;
  requestedRoomType: string;
  preferredRoom?: string;
  reasonCategory: string;
  reasonText: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
  assignedRoom?: {
    hostelCode: string;
    hostelName: string;
    blockName: string;
    floorName: string;
    roomNumber: string;
    bedLabel: string;
    roomType: string;
  };
}

export interface StudentRosterItem {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'COED';
  programme: string;
  yearOfStudy: number;
  quotaCategory: string;
  isAccessibleRequired: boolean;
  allocatedBed?: {
    hostelCode: string;
    hostelName: string;
    blockName: string;
    floorName: string;
    roomNumber: string;
    bedLabel: string;
    roomType: string;
  };
}

// Default Seed Allocation for Aditya Manas
export const DEFAULT_ADITYA_ALLOCATION: StudentAllocation = {
  studentId: 'student-001',
  studentName: 'Aditya Manas',
  studentRoll: '12326241',
  email: 'student@university.edu',
  programme: 'B.Tech Computer Science & Engineering',
  yearOfStudy: 2,
  gender: 'MALE',
  hostelCode: 'TB',
  hostelName: 'Tagore Bhawan (TB)',
  blockName: 'Block A',
  floorName: 'Floor 1',
  roomNumber: '104',
  bedLabel: 'A',
  roomType: 'DOUBLE',
  isAccessible: false,
  messAllotment: 'Tagore Dining Hall (Mess 1)',
  reportingDate: 'October 15, 2026 (09:00 AM – 05:00 PM)',
  wardenInCharge: 'Dr. R. K. Verma',
  status: 'PUBLISHED',
  referenceId: 'ALLOT-2026-TB-104A-8219',
  roommate: {
    fullName: 'Rohan Gupta',
    rollNumber: '2023CS042',
    programme: 'B.Tech Computer Science & Engineering',
    compatibilityScore: 82,
    lifestyleMatch: {
      sleepSchedule: 'Both Early Birds (95%)',
      studyHabits: 'Silent in-room focus (90%)',
      cleanliness: 'Neat & Organized (85%)',
      noiseTolerance: 'Moderate (80%)',
    },
  },
  rationale:
    'First choice satisfied in Pass A under General Quota. Roommate compatibility optimized at 82/100 via seeded PRNG heuristic matching.',
  lastUpdated: new Date().toISOString(),
};

// Default Seed Room Change Requests
export const DEFAULT_ROOM_CHANGE_REQUESTS: RoomChangeRequest[] = [
  {
    id: 'RCR-2026-001',
    studentId: 'student-002',
    studentName: 'Devansh Saxena',
    studentRoll: '2023ME044',
    studentEmail: 'devansh.me@university.edu',
    currentHostelCode: 'TB',
    currentHostelName: 'Tagore Bhawan (TB)',
    currentRoom: 'A-105',
    currentBed: 'A',
    requestedHostelCode: 'AB',
    requestedHostelName: 'Aryabhatta Bhawan (AB)',
    requestedRoomType: 'SINGLE',
    reasonCategory: 'ACADEMIC_STUDY_ALIGNMENT',
    reasonText:
      'Preparing for national competitive exam and requires single study room for late night project simulation and zero noise disturbance.',
    status: 'PENDING',
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'RCR-2026-002',
    studentId: 'student-003',
    studentName: 'Sneha Rao',
    studentRoll: '2023CS088',
    studentEmail: 'sneha.rao@university.edu',
    currentHostelCode: 'GB',
    currentHostelName: 'Gargi Bhawan (GB)',
    currentRoom: 'B-202',
    currentBed: 'B',
    requestedHostelCode: 'SB',
    requestedHostelName: 'Sarojini Bhawan (SB)',
    requestedRoomType: 'DOUBLE',
    reasonCategory: 'MUTUAL_SWAP',
    reasonText:
      'Mutual swap request with laboratory partner to facilitate collaborative research work on IoT smart campus sensors.',
    status: 'PENDING',
    submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

// Default Student Roster for Admin Room Assignments
export const DEFAULT_STUDENT_ROSTER: StudentRosterItem[] = [
  {
    id: 'student-001',
    fullName: 'Aditya Manas',
    rollNumber: '12326241',
    email: 'student@university.edu',
    gender: 'MALE',
    programme: 'B.Tech Computer Science & Engineering',
    yearOfStudy: 2,
    quotaCategory: 'GENERAL',
    isAccessibleRequired: false,
    allocatedBed: {
      hostelCode: 'TB',
      hostelName: 'Tagore Bhawan',
      blockName: 'Block A',
      floorName: 'Floor 1',
      roomNumber: '104',
      bedLabel: 'A',
      roomType: 'DOUBLE',
    },
  },
  {
    id: 'student-002',
    fullName: 'Rohan Gupta',
    rollNumber: '2023CS042',
    email: 'rohan.gupta@university.edu',
    gender: 'MALE',
    programme: 'B.Tech Computer Science & Engineering',
    yearOfStudy: 2,
    quotaCategory: 'GENERAL',
    isAccessibleRequired: false,
    allocatedBed: {
      hostelCode: 'TB',
      hostelName: 'Tagore Bhawan',
      blockName: 'Block A',
      floorName: 'Floor 1',
      roomNumber: '104',
      bedLabel: 'B',
      roomType: 'DOUBLE',
    },
  },
  {
    id: 'student-003',
    fullName: 'Harsh Vardhan',
    rollNumber: '2023CS004',
    email: 'harsh.v@university.edu',
    gender: 'MALE',
    programme: 'B.Tech Computer Science & Engineering',
    yearOfStudy: 2,
    quotaCategory: 'PWD',
    isAccessibleRequired: true,
    allocatedBed: {
      hostelCode: 'TB',
      hostelName: 'Tagore Bhawan',
      blockName: 'Block A',
      floorName: 'Ground Floor',
      roomNumber: 'G01',
      bedLabel: 'A',
      roomType: 'DOUBLE',
    },
  },
  {
    id: 'student-004',
    fullName: 'Ananya Sharma',
    rollNumber: '2023EC015',
    email: 'ananya.s@university.edu',
    gender: 'FEMALE',
    programme: 'B.Tech Electronics & Communication',
    yearOfStudy: 2,
    quotaCategory: 'GENERAL',
    isAccessibleRequired: false,
    allocatedBed: {
      hostelCode: 'GB',
      hostelName: 'Gargi Bhawan',
      blockName: 'Block A',
      floorName: 'Floor 1',
      roomNumber: '101',
      bedLabel: 'A',
      roomType: 'DOUBLE',
    },
  },
  {
    id: 'student-005',
    fullName: 'Vikramaditya Roy',
    rollNumber: '2023CS031',
    email: 'vikram.roy@university.edu',
    gender: 'MALE',
    programme: 'B.Tech Computer Science & Engineering',
    yearOfStudy: 2,
    quotaCategory: 'SCHOLARSHIP',
    isAccessibleRequired: false,
    allocatedBed: {
      hostelCode: 'TB',
      hostelName: 'Tagore Bhawan',
      blockName: 'Block A',
      floorName: 'Floor 1',
      roomNumber: '102',
      bedLabel: 'A',
      roomType: 'SINGLE',
    },
  },
  {
    id: 'student-006',
    fullName: 'Kartik Sharma (Waitlisted)',
    rollNumber: '2023ME122',
    email: 'kartik.me@university.edu',
    gender: 'MALE',
    programme: 'B.Tech Mechanical Engineering',
    yearOfStudy: 2,
    quotaCategory: 'GENERAL',
    isAccessibleRequired: false,
    allocatedBed: undefined, // Unallocated / Waitlisted
  },
  {
    id: 'student-007',
    fullName: 'Pooja Hegde (Waitlisted)',
    rollNumber: '2023CE045',
    email: 'pooja.ce@university.edu',
    gender: 'FEMALE',
    programme: 'B.Tech Civil Engineering',
    yearOfStudy: 2,
    quotaCategory: 'GENERAL',
    isAccessibleRequired: false,
    allocatedBed: undefined, // Unallocated / Waitlisted
  },
  {
    id: 'student-008',
    fullName: 'Alex Chen (International)',
    rollNumber: '2023INT012',
    email: 'alex.chen@university.edu',
    gender: 'COED',
    programme: 'M.Tech Artificial Intelligence',
    yearOfStudy: 1,
    quotaCategory: 'INTERNATIONAL',
    isAccessibleRequired: false,
    allocatedBed: undefined, // Unallocated / Waitlisted
  },
];

// Storage keys
const KEY_STUDENT_ALLOCATION = 'hostel_student_allocation';
const KEY_ROOM_CHANGE_REQUESTS = 'hostel_room_change_requests';
const KEY_STUDENT_ROSTER = 'hostel_student_roster';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function broadcastUpdate(type: 'allocation' | 'room_change' | 'roster', detail?: any) {
  if (!isClient()) return;
  window.dispatchEvent(new CustomEvent(`hostel_${type}_updated`, { detail }));
}

/**
 * Get Student Allocation (defaulting to Aditya Manas or stored)
 */
export function getStudentAllocation(): StudentAllocation {
  if (!isClient()) return DEFAULT_ADITYA_ALLOCATION;
  try {
    const raw = localStorage.getItem(KEY_STUDENT_ALLOCATION);
    if (!raw) {
      localStorage.setItem(KEY_STUDENT_ALLOCATION, JSON.stringify(DEFAULT_ADITYA_ALLOCATION));
      return DEFAULT_ADITYA_ALLOCATION;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse student allocation', e);
    return DEFAULT_ADITYA_ALLOCATION;
  }
}

/**
 * Save / Update Student Allocation
 */
export function updateStudentAllocation(updated: Partial<StudentAllocation>): StudentAllocation {
  const current = getStudentAllocation();
  const next: StudentAllocation = {
    ...current,
    ...updated,
    lastUpdated: new Date().toISOString(),
  };
  if (isClient()) {
    localStorage.setItem(KEY_STUDENT_ALLOCATION, JSON.stringify(next));
    broadcastUpdate('allocation', next);
  }
  return next;
}

/**
 * Get all Room Change Requests
 */
export function getRoomChangeRequests(): RoomChangeRequest[] {
  if (!isClient()) return DEFAULT_ROOM_CHANGE_REQUESTS;
  try {
    const raw = localStorage.getItem(KEY_ROOM_CHANGE_REQUESTS);
    if (!raw) {
      localStorage.setItem(KEY_ROOM_CHANGE_REQUESTS, JSON.stringify(DEFAULT_ROOM_CHANGE_REQUESTS));
      return DEFAULT_ROOM_CHANGE_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse room change requests', e);
    return DEFAULT_ROOM_CHANGE_REQUESTS;
  }
}

/**
 * Submit a new Room Change Request by a Student
 */
export function submitRoomChangeRequest(data: {
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  currentHostelCode: string;
  currentHostelName: string;
  currentRoom: string;
  currentBed: string;
  requestedHostelCode: string;
  requestedHostelName: string;
  requestedRoomType: string;
  preferredRoom?: string;
  reasonCategory: string;
  reasonText: string;
}): RoomChangeRequest {
  const currentRequests = getRoomChangeRequests();

  const newRequest: RoomChangeRequest = {
    id: `RCR-2026-${String(currentRequests.length + 1).padStart(3, '0')}`,
    ...data,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
  };

  const updatedRequests = [newRequest, ...currentRequests];
  if (isClient()) {
    localStorage.setItem(KEY_ROOM_CHANGE_REQUESTS, JSON.stringify(updatedRequests));
    broadcastUpdate('room_change', newRequest);
  }

  return newRequest;
}

/**
 * Approve a Room Change Request and assign a new room/bed
 */
export function approveRoomChangeRequest(
  requestId: string,
  newAssignment: {
    hostelCode: string;
    hostelName: string;
    blockName: string;
    floorName: string;
    roomNumber: string;
    bedLabel: string;
    roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  },
  decisionNotes: string,
  decidedBy: string
): RoomChangeRequest | null {
  const currentRequests = getRoomChangeRequests();
  const targetReq = currentRequests.find((r) => r.id === requestId);
  if (!targetReq) return null;

  const updatedReq: RoomChangeRequest = {
    ...targetReq,
    status: 'APPROVED',
    decidedAt: new Date().toISOString(),
    decidedBy,
    decisionNotes,
    assignedRoom: newAssignment,
  };

  const updatedList = currentRequests.map((r) => (r.id === requestId ? updatedReq : r));
  if (isClient()) {
    localStorage.setItem(KEY_ROOM_CHANGE_REQUESTS, JSON.stringify(updatedList));
  }

  // If this request belongs to Aditya Manas (student-001 or roll 12326241), update student allocation!
  if (targetReq.studentRoll === '12326241' || targetReq.studentId === 'student-001') {
    updateStudentAllocation({
      hostelCode: newAssignment.hostelCode,
      hostelName: newAssignment.hostelName,
      blockName: newAssignment.blockName,
      floorName: newAssignment.floorName,
      roomNumber: newAssignment.roomNumber,
      bedLabel: newAssignment.bedLabel,
      roomType: newAssignment.roomType,
      rationale: `Room reallocated upon approval of Room Change Request #${requestId} by ${decidedBy}: ${decisionNotes}`,
    });
  }

  // Update Roster
  updateStudentRosterAssignment(targetReq.studentRoll, {
    hostelCode: newAssignment.hostelCode,
    hostelName: newAssignment.hostelName,
    blockName: newAssignment.blockName,
    floorName: newAssignment.floorName,
    roomNumber: newAssignment.roomNumber,
    bedLabel: newAssignment.bedLabel,
    roomType: newAssignment.roomType,
  });

  broadcastUpdate('room_change', updatedReq);
  return updatedReq;
}

/**
 * Reject a Room Change Request with mandatory explanation
 */
export function rejectRoomChangeRequest(
  requestId: string,
  decisionNotes: string,
  decidedBy: string
): RoomChangeRequest | null {
  const currentRequests = getRoomChangeRequests();
  const targetReq = currentRequests.find((r) => r.id === requestId);
  if (!targetReq) return null;

  const updatedReq: RoomChangeRequest = {
    ...targetReq,
    status: 'REJECTED',
    decidedAt: new Date().toISOString(),
    decidedBy,
    decisionNotes,
  };

  const updatedList = currentRequests.map((r) => (r.id === requestId ? updatedReq : r));
  if (isClient()) {
    localStorage.setItem(KEY_ROOM_CHANGE_REQUESTS, JSON.stringify(updatedList));
    broadcastUpdate('room_change', updatedReq);
  }

  return updatedReq;
}

/**
 * Get Student Roster
 */
export function getStudentRoster(): StudentRosterItem[] {
  if (!isClient()) return DEFAULT_STUDENT_ROSTER;
  try {
    const raw = localStorage.getItem(KEY_STUDENT_ROSTER);
    if (!raw) {
      localStorage.setItem(KEY_STUDENT_ROSTER, JSON.stringify(DEFAULT_STUDENT_ROSTER));
      return DEFAULT_STUDENT_ROSTER;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse student roster', e);
    return DEFAULT_STUDENT_ROSTER;
  }
}

/**
 * Directly assign or reassign any student to a room/bed (Admin / Warden manual assignment)
 */
export function assignStudentToBed(
  studentRoll: string,
  assignment: {
    hostelCode: string;
    hostelName: string;
    blockName: string;
    floorName: string;
    roomNumber: string;
    bedLabel: string;
    roomType: string;
  },
  assignedBy: string,
  reason: string
): boolean {
  const roster = getStudentRoster();
  const student = roster.find((s) => s.rollNumber === studentRoll);
  if (!student) return false;

  student.allocatedBed = assignment;

  if (isClient()) {
    localStorage.setItem(KEY_STUDENT_ROSTER, JSON.stringify(roster));
  }

  // If Aditya Manas, sync allocation
  if (studentRoll === '12326241' || student.id === 'student-001') {
    updateStudentAllocation({
      hostelCode: assignment.hostelCode,
      hostelName: assignment.hostelName,
      blockName: assignment.blockName,
      floorName: assignment.floorName,
      roomNumber: assignment.roomNumber,
      bedLabel: assignment.bedLabel,
      roomType: assignment.roomType as any,
      rationale: `Manual room assignment executed by ${assignedBy}: ${reason}`,
    });
  }

  broadcastUpdate('roster', { student, assignment });
  return true;
}

function updateStudentRosterAssignment(studentRoll: string, bedAssignment: any) {
  const roster = getStudentRoster();
  const student = roster.find((s) => s.rollNumber === studentRoll);
  if (student) {
    student.allocatedBed = bedAssignment;
    if (isClient()) {
      localStorage.setItem(KEY_STUDENT_ROSTER, JSON.stringify(roster));
    }
  }
}
