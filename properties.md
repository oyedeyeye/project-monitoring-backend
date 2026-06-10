# Property Casing Mapping Reference

This document maps the previous frontend `snake_case` properties (and corresponding database columns) to the new `camelCase` properties returned by the backend API and used by the frontend client.

## 1. Project Model

| Old `snake_case` / DB Column | New `camelCase` Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `project_id` | `projectId` | `string` | Unique identifier for the project (UUID) |
| `mda_id` | `mdaId` | `string` | Associated MDA identifier (UUID) |
| `senatorial_district` | `senatorialDistrict` | `string` | Senatorial district of the project |
| `location_text` | `locationText` | `string` | Text description of project location |
| `start_date` | `startDate` | `string` | Project start date (ISO date string) |
| `end_date` | `endDate` | `string` | Project target end date (ISO date string) |
| `approved_budget` | `approvedBudget` | `number \| string` | Total approved budget |
| `funding_source` | `fundingSource` | `string` | Source of funding (e.g. Capital, Grant) |
| `created_at` | `createdAt` | `string` | Creation timestamp |

*Unchanged fields:* `id`, `title`, `sector`, `lga`, `contractor`, `status`, `mda`.

---

## 2. ProgressUpdate Model

| Old `snake_case` / DB Column | New `camelCase` Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `project_id` | `projectId` | `string` | Parent project identifier (UUID) |
| `report_date` | `reportDate` | `string` | Date of the update report |
| `physical_progress_pct` | `physicalProgressPct` | `number` | Physical completion percentage |
| `milestone_status` | `milestoneStatus` | `string` | Status of the milestone (e.g., 'Approved') |
| `key_update` | `keyUpdate` | `string` | Key notes or details about progress |
| `issue_flag` | `issueFlag` | `string \| null` | Indicator if a blocker/issue exists |
| `evidence_link` | `evidenceLink` | `string \| null` | Link to supporting documents or media |
| `created_at` | `createdAt` | `string` | Creation timestamp |

*Unchanged fields:* `id`, `stage`.

---

## 3. UserProfile Model

| Old `snake_case` / DB Column | New `camelCase` Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `mda_id` | `mdaId` | `string \| null` | Associated MDA identifier (UUID) |
| `full_name` | `fullName` | `string` | Full name of the user |

*Unchanged fields:* `id`, `role`.

---

## 4. FinanceRecord Model

| Old `snake_case` / DB Column | New `camelCase` Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `project_id` | `projectId` | `string` | Parent project identifier (UUID) |
| `budget_year` | `budgetYear` | `number` | Year the budget allocation applies to |
| `release_to_date` | `releaseToDate` | `number \| string` | Funds released up to current date |
| `payments_to_date` | `paymentsToDate` | `number \| string` | Payments made to contractor to date |

*Unchanged fields:* `id`.

---

## 5. Issue Model

| Old `snake_case` / DB Column | New `camelCase` Property | Type | Description |
| :--- | :--- | :--- | :--- |
| `project_id` | `projectId` | `string` | Parent project identifier (UUID) |
| `log_date` | `logDate` | `string` | Date the issue was logged |
| `issue_category` | `issueCategory` | `string` | Category of the issue (e.g., Procurement) |
| `issue_item` | `issueItem` | `string` | Specific item/blocker under category |
| `due_date` | `dueDate` | `string` | Estimated deadline to resolve |
| `follow_up` | `followUp` | `string \| null` | Follow-up action notes |

*Unchanged fields:* `id`, `severity`, `owner`, `status`, `notes`.
