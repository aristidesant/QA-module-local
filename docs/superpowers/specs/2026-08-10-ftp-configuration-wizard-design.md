# FTP Configuration Wizard — Design Spec

**Date:** August 10, 2026  
**Scope:** Mockup for stakeholder presentation  
**Status:** Design phase

---

## Context

This spec defines a new multi-step wizard flow for configuring external campaign data imports via FTP/SFTP. Technical admins and integration specialists will use this wizard to set up automated file ingestion: they provide server credentials, select source directories, define file naming patterns, and configure import frequency. The wizard includes validation gates and file preview to ensure configurations are correct before saving.

**Why:** External campaigns require a flexible, self-service setup experience that prevents misconfiguration and gives admins confidence that their file imports will work.

**Success Criteria:**

- Admins can configure an FTP source in under 5 minutes
- Connection validation prevents invalid configs from being saved
- File preview confirms the pattern matching before import
- Clear error messages guide admins when configuration fails

---

## User Profile

**Primary User:** Technical admin / integration specialist

- Comfortable with FTP/SFTP concepts, credentials, file paths
- Needs to configure this once per campaign
- Wants quick validation that the setup works before proceeding
- May not be a developer, but is technically proficient

**User Goals:**

1. Connect to an external FTP server securely
2. Verify connectivity and directory access
3. Define how to recognize and parse incoming files
4. Set up automated, recurring imports
5. Get confirmation that everything is configured correctly

---

## Wizard Architecture

### Step Structure: 5-Step Condensed Flow

The wizard uses Mantine's `<Stepper>` component with 5 steps. State is managed via a Zustand store (following `campaignWizardStore` pattern) or simple React state for the mockup.

#### **Step 1: Server Setup**

**Goal:** Collect connection parameters and test connectivity.

**Form Fields:**

- `Host` (TextInput) — URL or IP address (e.g., `ftp.example.com`)
- `Port` (Number input) — Default 21 for FTP, 22 for SFTP (e.g., 2121)
- `Username` (TextInput) — FTP/SFTP username
- `Protocol` (SegmentedControl/Toggle) — FTP or SFTP choice

**Key Interaction: Connection Test**

- Inline button "Test Connection" (secondary color)
- Disabled until all fields are filled
- On click:
  - Shows loading state ("Testing...")
  - Calls mock validation
  - **Success:** "✓ Connected successfully" (green badge) + "Continue" button enabled
  - **Failure:** Error message (red) with context: "Unable to connect to `ftp.example.com:21`. Verify hostname, port, and network access." + "Test Connection" button remains enabled for retry

**Validation:**

- All fields required (enforced at form level)
- Host must be non-empty
- Port must be a valid number (1–65535)
- Username required

**Gate:** Cannot advance to Step 2 until connection test passes.

---

#### **Step 2: Authentication & Directory Selection**

**Goal:** Provide authentication method and select the directory to monitor.

**Part A: Authentication (Conditional)**

Shows different fields based on **Protocol choice from Step 1:**

- **If FTP selected:**
  - `Password` (PasswordInput) — FTP password
- **If SFTP selected:**
  - Radio toggle: "Password" or "SSH Key"
    - If "Password": Show `Password` field
    - If "SSH Key": Show file upload area (drag-drop)
      - Label: "Upload Private Key File (.pem, .key)"
      - Drag-drop zone with hint: "Drag your private key here or click to browse"
      - File validation: Accept `.pem`, `.key` files only; show size limit (e.g., "Max 10 MB")
      - Mock: Just show file name once selected, no real upload

**Part B: Directory Selection**

- `Source Directory Path` (TextInput) — Path on FTP server (e.g., `/campaigns/2026/`, `/data/calls/`)
- Helper text: "e.g., `/campaigns/` or `/data/incoming/` (leave empty for root)"
- Validation: Required; must start with `/` or be empty

**Validation Gates:**

- Auth fields required (password or SSH key, depending on protocol)
- Directory path required

**Gate:** Cannot advance until all fields valid.

---

#### **Step 3: Nomenclature & File Preview**

**Goal:** Define the file naming pattern and validate files match before proceeding.

**Part A: Nomenclature Pattern Builder**

**Mandatory Fields (always included, shown as read-only or disabled):**

- ✅ Client ID
- ✅ Date (YYYYMMDD format)
- ✅ Time (HHMMSS format)

**Optional Fields (toggles):**

- ☐ Contact Name
- **Delimiter Selection** (Dropdown):
  - Underscore `_` (default)
  - Dash `-`
  - Period `.`
  - None (no delimiter)

**Pattern Preview Display:**

- Shows a live example below the toggles:
  - Base: `ACME_20260810_143022`
  - With Contact Name + Underscore: `ACME_20260810_143022_John_Doe`
  - With Contact Name + Dash: `ACME-20260810-143022-John-Doe`
- Updates instantly as user toggles options
- Include file extension hint: `.wav` (or `.mp3`, etc., depending on import type — mock with `.wav`)

**Part B: File Preview Table**

**Purpose:** Show files from the configured directory that match the nomenclature pattern.

**Mock Data:**
Display a table with 5–10 mock files. Real implementation would fetch from the FTP directory; here we simulate matches based on pattern toggling.

| File Name                         | Size   | Last Modified     | Status     |
| --------------------------------- | ------ | ----------------- | ---------- |
| ACME_20260810_143022.wav          | 2.4 MB | Today 2:30 PM     | ✓ Matches  |
| ACME_20260810_144015_John_Doe.wav | 1.8 MB | Today 2:40 PM     | ✓ Matches  |
| ACME_20260809_090000.wav          | 3.1 MB | Yesterday 9:00 AM | ✓ Matches  |
| call_data_20260810.wav            | 2.2 MB | Today 1:50 PM     | ✗ No Match |
| archive.zip                       | 45 MB  | 3 days ago        | ✗ No Match |

**Validation & Gate:**

- If no files match pattern: Show warning banner above table
  - Message: "No files match this pattern. Check your nomenclature settings or verify the source directory."
  - Cannot advance to Step 4
- If files match: Show count at table header: "12 files matched this pattern"
- User can toggle fields to adjust pattern and see table update in real-time

---

#### **Step 4: Auto-Import Settings**

**Goal:** Configure how often the system should check for new files.

**Form Fields:**

- `Import Frequency` (Select dropdown):
  - Every 30 minutes
  - Hourly
  - Daily
  - Weekly
  - On-demand (manual trigger only)
- Helper text: "System will check for new files on this schedule and import automatically."

**Optional (Pre-checked):**

- ☑ `Delete files after successful import` — Removes imported files from FTP server to prevent re-ingestion.
- Helper text: "Files will be deleted from the server after import completes successfully."

**Validation:**

- Frequency selection required

**No validation gate here** — all options are safe to proceed with.

---

#### **Step 5: Summary & Success**

**Goal:** Display all configured settings for review and allow confirmation or editing.

**Summary Card Layout:**

```
┌─ Configuration Summary ────────────────────┐
│                                             │
│ Server Details                              │
│ • Host: ftp.example.com:2121 (SFTP)        │
│ • Username: admin_user                      │
│ • Directory: /campaigns/2026/               │
│                                             │
│ File Pattern                                │
│ • Pattern: ACME_20260810_143022_ContactName│
│ • Files to Import: 12 matched               │
│                                             │
│ Import Settings                             │
│ • Frequency: Hourly                         │
│ • Auto-Delete After Import: Yes             │
│                                             │
│ [Edit Configuration]  [Confirm & Save]     │
└─────────────────────────────────────────────┘
```

**Buttons:**

- `Edit Configuration` (secondary) — Returns to Step 1 (or a specific step selector)
- `Confirm & Save` (primary) — Saves configuration and moves to success state

**Success State (After Save):**

- Page updates to show:
  - ✓ Checkmark icon (large, green)
  - "Configuration Saved Successfully"
  - "First import scheduled for [calculated time based on frequency]"
  - Message: "Your campaign will check for new files every [frequency]. Files matching the pattern will be imported and automatically deleted after processing."
  - `Close` button or link: "Go to Campaign Management"

---

## Component Structure

**File Organization** (following existing patterns):

```
src/modules/campaigns/ExternalCampaignWizard/
├── ExternalCampaignWizard.tsx          (main Stepper, manages activeStep)
├── StepOneServerSetup.tsx              (connection form + test)
├── StepTwoAuthAndDirectory.tsx         (auth method + directory)
├── StepThreeNomenclature.tsx           (pattern toggles + preview table)
├── StepFourImportSettings.tsx          (frequency + delete checkbox)
├── StepFiveSuccess.tsx                 (summary + confirmation)
└── Components/
    ├── ConnectionTestButton.tsx        (test connection logic)
    ├── FilePreviewTable.tsx            (file list with status badges)
    ├── PatternPreviewDisplay.tsx       (shows example file name)
    └── AuthMethodSelector.tsx          (conditional FTP/SFTP auth)
```

**Reused Patterns:**

- Stepper and navigation: `src/modules/campaigns/CampaignWizard/` (reference)
- Form validation: Mantine `useForm()` hook (like `OutboundCallForm`)
- File upload: Drag-drop pattern from `src/modules/configurations/DictionaryRules/CsvUploadModal/`
- Summary card: Similar to `StepFiveSuccess.tsx`
- Notifications: `@mantine/notifications` for success toast

**State Management (for mockup):**

- Simple React `useState` for active step and form data, OR
- Zustand store (like `campaignWizardStore`) for consistency
- For presentation purposes, mock all API calls and file operations

---

## Validation & Error Handling

### Validation Gates

| Step       | Requirement                        | Error Handling                                             |
| ---------- | ---------------------------------- | ---------------------------------------------------------- |
| **Step 1** | Connection test must succeed       | Show error message, disable "Next", allow retry            |
| **Step 2** | Auth method & directory required   | Show field-level error messages; disable "Next"            |
| **Step 3** | At least 1 file must match pattern | Show warning banner; disable "Next" until pattern adjusted |
| **Step 4** | Frequency selected                 | Disable "Next" if empty                                    |

### Error Message Examples

**Connection Failed:**

```
⚠ Connection Failed
Unable to connect to ftp.example.com:2121.
Verify the hostname, port, and that your network can reach the server.
[Test Connection] (retry)
```

**No Files Match:**

```
⚠ No Files Matched
No files in /campaigns/2026/ match the pattern ACME_20260810_143022.
Try adjusting your nomenclature settings or verify the directory path.
```

**Missing Required Field:**

```
✗ Directory path is required.
```

---

## Visual & UX Principles

### Layout & Styling

- **Card-based sections:** Each form section wrapped in Mantine `Card` or `SectionCard` component
- **Stepper:** Mantine `<Stepper>` with step titles and icons
- **Spacing:** 8px grid (Mantine standard)
- **Typography:** Mantine default fonts; use semantic sizes (h3 for section titles, body for labels)

### Dark/Light Mode

- All colors use Mantine CSS variables: `var(--mantine-color-gray-*)`, `var(--mantine-color-blue-*)`
- Use `light-dark()` utility for manual color overrides
- Test both themes during implementation

### Icons & Feedback

- Success: ✓ checkmark (green)
- Error: ✗ or ⚠ (red)
- Loading: spinner during connection test
- File match status: ✓ (green) / ✗ (red) in preview table
- Use @tabler/icons-react for all icons

### Accessibility

- Form labels for all inputs (required + optional marked)
- Error messages linked to input fields (`aria-describedby`)
- Keyboard navigation: Tab through steps and form fields
- Focus management when error occurs (focus on error field)

---

## Testing & Verification (Mockup Scope)

**For presentation purposes, validate:**

1. ✓ All 5 steps render correctly in the browser
2. ✓ Form fields show/hide conditionally (e.g., auth method based on FTP vs. SFTP)
3. ✓ Connection test button shows loading state and mock success/error
4. ✓ File preview table updates when nomenclature toggles change
5. ✓ Summary step shows all configured values
6. ✓ Buttons navigate forward/backward as expected
7. ✓ Dark/light mode both look correct (no contrast issues)
8. ✓ Mobile responsive (if presenting to mobile-first org)

**Out of scope (not for this mockup):**

- Real FTP/SFTP connection
- Actual file retrieval from server
- Backend API integration
- Database persistence
- Error retry logic beyond UI feedback

---

## Next Steps

This spec defines the mockup flow. Once approved:

1. **Implementation:** Invoke `writing-plans` skill to create step-by-step build plan
2. **Build mockup:** Create components following Mantine patterns and existing code style
3. **Presentation:** Static mockup with mock data and click-through flow for stakeholders
4. **Feedback:** Collect stakeholder input on flow and visual design before handoff to engineering

---

## Questions & Decisions Logged

- **Validation approach:** Strict gates (Step 1 connection test must pass before proceeding)
- **File preview:** Integrated into Step 3 to show impact of nomenclature choices in real-time
- **Auto-delete:** Automatic after successful import (pre-checked checkbox in Step 4)
- **User type:** Technical admin (no need to oversimplify concepts)
- **Scope:** One-time setup per campaign (not editing existing configs)
