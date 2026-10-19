/**
 * Centralized API Client for Hostel Allocation Engine
 * Connects to live Render cloud backend or local backend.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://hostel-allocation-system-46lj.onrender.com/api';

export interface HostelSummary {
  hostelCode: string;
  hostelName: string;
  genderDesignation: 'MALE' | 'FEMALE' | 'COED';
  totalCapacity: number;
  currentOccupancy: number;
  availableBeds: number;
  accessibleBeds: number;
  occupancyPercentage: number;
}

export interface OccupancyResponse {
  success: boolean;
  timestamp: string;
  summary: {
    totalCampusBeds: number;
    totalOccupiedBeds: number;
    totalAvailableBeds: number;
    campusOccupancyPercentage: number;
  };
  hostels: HostelSummary[];
}

export interface BedDetail {
  id: string;
  label: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  isAccessible: boolean;
  occupant?: {
    id: string;
    fullName: string;
    rollNumber?: string;
    programme?: string;
    yearOfStudy?: number;
    quota?: string;
    preferenceRank?: number;
    compatibilityScore?: number;
    rationale?: string;
  };
}

export interface RoomDetail {
  id: string;
  roomNumber: string;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  capacity: number;
  genderDesignation: string;
  isAccessible: boolean;
  beds: BedDetail[];
}

export interface AllocationRunItem {
  id: string;
  cycleId?: string;
  academicYear: string;
  seed: string;
  status: 'COMPLETED' | 'RUNNING' | 'FAILED';
  totalAssigned: number;
  totalWaitlist: number;
  firstChoicePercentage: number;
  averageCompatibilityScore?: number;
  executionTimeMs: number;
  inputSnapshotHash: string;
  outputHash: string;
  createdAt: string;
}

/**
 * Generic API request wrapper with auth token handling
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('hostel_token') : null;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `Request failed with status ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`[API] ${endpoint} request failed:`, err.message);
    throw err;
  }
}

/**
 * Fetch campus occupancy statistics (Zero-PII endpoint)
 */
export async function fetchCampusOccupancy(): Promise<OccupancyResponse> {
  const res = await fetch(`${API_BASE}/public/occupancy`, {
    headers: { 'x-api-key': 'hostel-p04-occupancy-api-key-secret' },
  });
  if (!res.ok) throw new Error('Failed to fetch occupancy');
  return res.json();
}

/**
 * Fallback static hostel metadata if backend is offline or waking up
 */
export const DEFAULT_HOSTELS: HostelSummary[] = [
  {
    hostelCode: 'GB',
    hostelName: 'Gargi Bhawan',
    genderDesignation: 'FEMALE',
    totalCapacity: 1629,
    currentOccupancy: 0,
    availableBeds: 1629,
    accessibleBeds: 43,
    occupancyPercentage: 0,
  },
  {
    hostelCode: 'SB',
    hostelName: 'Sarojini Bhawan',
    genderDesignation: 'FEMALE',
    totalCapacity: 1612,
    currentOccupancy: 0,
    availableBeds: 1612,
    accessibleBeds: 42,
    occupancyPercentage: 0,
  },
  {
    hostelCode: 'TB',
    hostelName: 'Tagore Bhawan',
    genderDesignation: 'MALE',
    totalCapacity: 1605,
    currentOccupancy: 0,
    availableBeds: 1605,
    accessibleBeds: 45,
    occupancyPercentage: 0,
  },
  {
    hostelCode: 'AB',
    hostelName: 'Aryabhatta Bhawan',
    genderDesignation: 'MALE',
    totalCapacity: 1581,
    currentOccupancy: 0,
    availableBeds: 1581,
    accessibleBeds: 44,
    occupancyPercentage: 0,
  },
  {
    hostelCode: 'KB',
    hostelName: 'Kalam International House',
    genderDesignation: 'COED',
    totalCapacity: 1588,
    currentOccupancy: 0,
    availableBeds: 1588,
    accessibleBeds: 41,
    occupancyPercentage: 0,
  },
];
