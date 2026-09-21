# University Hostel Management System &bull; User Guide

This user guide provides step-by-step instructions for each role participating in the hostel allocation and residential management lifecycle.

---

## 1. Student Portal Guide

### 1.1 Applying for Accommodation
1. Log in with your university credentials (`@university.edu`).
2. Navigate to **Apply** (`/apply`).
3. Fill out the application form:
   - Verify personal information, academic program, and current semester.
   - Specify if you require special accessibility accommodations (e.g. wheelchair-accessible room or ground-floor placement).
   - Upload mandatory verification documents (Student ID, Fee Receipt, and Disability/Category Certificate if applicable).
4. Review your submission and click **Submit Application**.

### 1.2 Eligibility Check & Rectification
1. Navigate to **Eligibility** (`/eligibility`).
2. View your real-time eligibility evaluation.
3. If ineligible:
   - Read the structured failure reasons and remedy instructions.
   - Resolve the underlying issue (e.g., clear outstanding dues or re-upload a clear document).
   - Click **Re-check Eligibility** to re-evaluate without penalty.

### 1.3 Setting Hostel & Room Preferences
1. Navigate to **Preferences** (`/preferences`).
2. Use the drag-and-drop interface to order your preferred hostels and room types (Single, Double, Triple).
3. If you have mutually agreed on roommates, enter their University Roll Numbers. All requested roommates must mutually list each other to trigger co-assignment.
4. Click **Save Preferences**.

### 1.4 Lifestyle Questionnaire (Roommate Compatibility)
1. Navigate to **Questionnaire** (`/questionnaire`).
2. Review the Privacy Notice. Your responses are encrypted at rest using **AES-256-GCM** and are never visible to students, wardens, or administrators.
3. Complete questions regarding:
   - Sleep schedule (Early bird vs Night owl)
   - Study environment (Silent vs Group study)
   - Room cleanliness standards
   - Dietary preferences and habits
4. Click **Submit Questionnaire**. You may delete your data at any time via the **Delete My Data** button (Right to be Forgotten).

### 1.5 Viewing Results & Downloading Allotment Letter
1. Navigate to **Result** (`/result`) after the cycle has been published.
2. View your allotted hostel, block, floor, room number, bed label, and allocated roommates.
3. Click **Download Allotment Order (PDF)** to save your official document.
4. If you require a change of room due to compelling medical or personal circumstances, click **Request Room Change** to submit a reasoned request to your hostel warden.

---

## 2. Hostel Warden Portal Guide

### 2.1 Visual Bed Map & Occupancy Inspection
1. Log in with your warden account. The dashboard automatically scopes to your assigned hostel.
2. Navigate to **Bed Map** (`/bedmap`).
3. Select your block and floor to inspect the visual bed grid:
   - **Green**: Assigned / Occupied
   - **White**: Available
   - **Blue**: Accessible Bed (PWD Certified)
   - **Amber**: Maintenance / Reserved
4. Click on any bed to view the occupant's details, allocation explanation, preference rank satisfied, and roommate compatibility score.

### 2.2 Applying Manual Overrides (Invariant I5)
1. On the Bed Map, drag a student to another bed or click **Reassign Bed**.
2. An override modal will appear requiring:
   - **Override Category**: Select from Medical Accommodation, Disciplinary Separation, Administrative Rectification, etc.
   - **Justification**: Enter a detailed, factual explanation (&ge;10 characters).
3. Click **Confirm Override**. The change is cryptographically recorded in the SHA-256 hash-chained audit log.
4. If the override violates a hard constraint (e.g., room capacity or gender designation), it will be automatically routed to the **Chief Warden Escalation Queue**.

### 2.3 Approving Drafts & Room Changes
1. Once all adjustments are complete, click **Submit Hostel Draft for Approval**.
2. Review pending room change requests submitted by students in your hostel. Approve or reject with written feedback.

---

## 3. Chief Warden Portal Guide

### 3.1 Cross-Hostel Governance
1. Log in with your Chief Warden account.
2. Review drafts across all campus hostels to ensure uniform policy compliance and capacity distribution.

### 3.2 Escalation Queue (`/escalations`)
1. Navigate to **Escalations**.
2. Inspect hard-constraint overrides submitted by wardens:
   - View the affected hostel, room, student, and constraint violation warning.
   - Read the warden's justification.
   - Enter mandatory decision notes (&ge;10 characters).
   - Click **Approve Exception** or **Reject Exception**.

### 3.3 Final Publication Sign-Off
1. Once all hostel drafts and escalations are approved, click **Approve Final Campus Allocation**.
2. Click **Publish Allocation Order**. The system executes `DraftPublishService.publish()` in a database transaction, verifying approval hashes and locking all assignments as permanently immutable.

---

## 4. System Administrator Guide

### 4.1 Bulk Inventory CSV Import
1. Navigate to **Inventory** (`/inventory`).
2. Upload or paste your campus CSV file (Hostels, Blocks, Floors, Rooms, Beds).
3. Click **Run Dry-Run Validation** to detect formatting or capacity inconsistencies before writing to the database.
4. Click **Commit Import** to persist the inventory.

### 4.2 Allocation Cycle Configuration
1. Navigate to **Cycles** (`/cycles`).
2. Create a new cycle:
   - Define application start and end dates.
   - Select the active eligibility rules version.
   - Specify document requirements.

### 4.3 Running the Allocation Engine
1. Navigate to **Runs** (`/runs`).
2. Select the cycle and enter a deterministic seed string (e.g., `univ-fall-2026`).
3. Click **Execute Allocation Run**. The engine executes the deterministic multi-pass heuristic in background workers, emitting progress in real time.
4. Inspect run statistics: execution duration, 1st-choice satisfaction %, and output SHA-256 hash.

### 4.4 Document Verification Queue
1. Navigate to **Verifications** (`/verifications`).
2. Inspect uploaded disability certificates and category proofs.
3. Approve valid documents or reject with actionable feedback for the student.

---

## 5. Dean of Student Welfare Guide

### 5.1 Institutional Analytics (`/analytics`)
1. Log in with your Dean account.
2. View executive campus KPIs:
   - Total campus capacity and current occupancy percentage.
   - 1st-choice and Top-3 preference satisfaction rates.
   - 100% PWD accommodation compliance.
3. Review hostel-by-hostel capacity utilization bars.
4. Inspect override category frequencies and warden governance metrics.
5. Click **Export Occupancy CSV** or **Export Overrides Audit CSV** to download official university reports.
