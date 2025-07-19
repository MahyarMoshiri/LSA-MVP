# London Sole Agent MVP - Data Schema

## Overview
This document defines the data structures for the Phase 1 MVP. All data is stored in-memory for the MVP with JSON format.

## Core Data Structures

### Applicants
```json
{
  "applicant_id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "budget_min": "number",
  "budget_max": "number",
  "bedrooms": "number",
  "employment_status": "string",
  "status": "active|matched|archived",
  "created_at": "string (ISO8601)",
  "last_updated": "string (ISO8601)"
}
```

### Properties
```json
{
  "property_id": "string (UUID)",
  "address": "string",
  "postcode": "string",
  "bedrooms": "number",
  "rent": "number",
  "property_type": "string",
  "landlord_name": "string",
  "status": "available|matched|let",
  "created_at": "string (ISO8601)",
  "last_updated": "string (ISO8601)"
}
```

### Manual Matches
```json
{
  "match_id": "string (UUID)",
  "applicant_id": "string (UUID)",
  "property_id": "string (UUID)",
  "matched_at": "string (ISO8601)",
  "current_stage": "matched|viewing|offer|let_agreed|completed",
  "updated_at": "string (ISO8601)"
}
```

### Progression Stages
```json
{
  "stage_id": "string",
  "stage_name": "string",
  "stage_order": "number",
  "color": "string (hex color)"
}
```

## Default Progression Stages
1. **Matched** - Initial match created
2. **Viewing** - Viewing arranged/completed
3. **Offer** - Offer made by applicant
4. **Let Agreed** - Offer accepted, paperwork in progress
5. **Completed** - Deal closed, tenancy started

## Relationships
- Applicants and Properties are linked via Manual Matches
- Each match has a current stage for progression tracking
- All entities use UUID for unique identification
- Status fields control visibility and availability for new matches

