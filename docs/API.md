# REST API Reference & Specification

This document provides complete documentation for the REST API exposed by `@hostel/api`.

---

## 1. Global Conventions

- **Base URL**: `/api`
- **Content Type**: `application/json` (except `/api/reports/export` which returns `text/csv`)
- **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <JWT_TOKEN>`)
- **Correlation ID**: Every request returns a unique `x-correlation-id` response header for distributed tracing.
- **Standard Error Response**:
  ```json
  {
    "error": "Bad Request | Unauthorized | Forbidden | Not Found | Internal Server Error",
    "message": "Human-readable explanation of failure",
    "correlationId": "corr-uuid-1234",
    "details": []
  }
  ```

---

## 2. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticates a user via email and password, returning access and refresh tokens.
- **Request Body**:
  ```json
  {
    "email": "student@university.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "email": "student@university.edu",
      "fullName": "Aarav Sharma",
      "role": "STUDENT"
    }
  }
  ```

### `POST /api/auth/refresh`
Exchanges a valid refresh token for a new access token.

---

## 3. Inventory Endpoints (`/api/inventory`)

### `GET /api/inventory/hostels`
Returns a list of all active hostels on campus.
- **Access**: All authenticated users.

### `POST /api/inventory/bulk-import`
Imports hostel inventory from CSV data.
- **Access**: `ADMIN`
- **Request Body**:
  ```json
  {
    "csvData": "HostelName,HostelCode,GenderDesignation,BlockName,BlockCode,FloorNumber,FloorName,RoomNumber,RoomType,Capacity,IsAccessible,BedLabels\n...",
    "dryRun": false
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "dryRun": false,
    "validRows": 2960,
    "invalidRows": 0,
    "errors": [],
    "summary": {
      "hostelsToCreate": 5,
      "blocksToCreate": 20,
      "floorsToCreate": 80,
      "roomsToCreate": 2960,
      "bedsToCreate": 8000
    }
  }
  ```

---

## 4. Application & Eligibility Endpoints

### `GET /api/cycles`
Lists all allocation cycles (active, upcoming, past).

### `POST /api/cycles/:cycleId/applications`
Submits a student application for the specified cycle.
- **Access**: `STUDENT`

### `POST /api/eligibility/:cycleId/evaluate`
Evaluates application eligibility against declarative institutional rules.
- **Access**: `STUDENT` (own) or `ADMIN`
- **Response (200 OK)**:
  ```json
  {
    "isEligible": true,
    "evaluatedAt": "2026-09-20T10:00:00.000Z",
    "reasons": ["All academic, fee, and document requirements satisfied."],
    "failedRuleIds": []
  }
  ```

---

## 5. Preferences & Questionnaire Endpoints

### `POST /api/preferences`
Submits ranked hostel choices, room types, and mutual roommate requests.
- **Access**: `STUDENT`

### `POST /api/compatibility`
Submits encrypted lifestyle questionnaire answers.
- **Access**: `STUDENT`
- **Security**: Payload is encrypted at rest using AES-256-GCM. Raw answers are never returned.
- **Request Body**:
  ```json
  {
    "consentGiven": true,
    "sleepSchedule": "EARLY_BIRD",
    "studyHabit": "SILENT",
    "cleanliness": "VERY_NEAT",
    "dietaryPreference": "VEGETARIAN",
    "smokingAlcohol": "NEITHER"
  }
  ```

### `DELETE /api/compatibility`
Deletes questionnaire data on request (Right to be Forgotten) and creates a tombstone audit record.

---

## 6. Allocation Runs & Drafts (`/api/allocation`)

### `POST /api/allocation/runs`
Triggers an allocation engine job with seed and parameters.
- **Access**: `ADMIN`
- **Request Body**:
  ```json
  {
    "cycleId": "60d0fe4f5311236168a109ca",
    "seed": "univ-fall-2026-seed",
    "parameters": {
      "enableRoommateMatching": true,
      "maxImprovementIterations": 100
    }
  }
  ```

### `GET /api/drafts/:draftId`
Fetches draft metadata, statistics, and assignment preview.
- **Access**: `ADMIN`, `DEAN`, `CHIEF_WARDEN`, `WARDEN` (scoped)

---

## 7. Warden & Publication Endpoints (`/api/warden`)

### `GET /api/warden/bedmap/:hostelId`
Returns a floor-by-floor bed grid with student details, occupancy status, and accessibility tags.
- **Access**: `WARDEN` (hostel-scoped) or `CHIEF_WARDEN`

### `POST /api/warden/overrides`
Applies a reasoned manual override to a draft allocation.
- **Access**: `WARDEN` (hostel-scoped)
- **Invariant I5**: Requires `reasonCategory` and `reasonText` (&ge;10 chars).
- **Request Body**:
  ```json
  {
    "draftId": "60d0fe4f5311236168a109ca",
    "bedId": "60d0fe4f5311236168a109cb",
    "newStudentId": "60d0fe4f5311236168a109cc",
    "reasonCategory": "MEDICAL_ACCOMMODATION",
    "reasonText": "Student fractured leg post-allocation and urgently requires ground floor bed."
  }
  ```

### `POST /api/warden/publish`
The **sole** code path that publishes an approved draft.
- **Access**: `CHIEF_WARDEN` or `ADMIN`
- **Invariant I1**: Requires matching approval record hash.
- **Invariant I2**: Enforces immutability after publication.
- **Request Body**:
  ```json
  {
    "draftId": "60d0fe4f5311236168a109ca"
  }
  ```

---

## 8. Reports & Public Endpoints (`/api/reports`, `/api/public`)

### `GET /api/public/occupancy`
External integration endpoint for partner systems (e.g. P04).
- **Header**: `x-api-key: <P04_API_KEY>`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "timestamp": "2026-09-21T18:00:00.000Z",
    "summary": {
      "totalCampusBeds": 8000,
      "totalOccupiedBeds": 7640,
      "totalAvailableBeds": 360,
      "campusOccupancyPercentage": 95.5
    },
    "hostels": [
      {
        "hostelCode": "GB",
        "hostelName": "Gargi Bhawan",
        "genderDesignation": "FEMALE",
        "totalCapacity": 1600,
        "currentOccupancy": 1540,
        "availableBeds": 60,
        "accessibleBeds": 40,
        "occupancyPercentage": 96.3
      }
    ]
  }
  ```

### `GET /api/reports/export?type=occupancy|overrides`
Downloads a formatted CSV report for administrative reporting.
- **Access**: `ADMIN`, `DEAN`, `CHIEF_WARDEN`
