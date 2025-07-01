# Campaign Form Data Persistence Plan

## Overview

This document outlines all the fields currently being collected in the CampaignsForm that need to be persisted to the API. Many fields are currently placeholders and not being saved to the campaign object.

## Current Campaign Model Analysis

### Already Persisted Fields ✅

- `name`: Campaign name (string)
- `description`: Campaign description (string)
- `budget`: Campaign budget (number)
- `spent`: Amount spent (number)
- `type`: "OUTBOUND" | "INBOUND"
- `status`: "ACTIVE" | "INACTIVE" | "PAUSED" | "COMPLETED"
- `userId`: User ID (number)
- `clientId`: Client ID (number)
- `promptId`: Prompt template ID (number, optional)
- `tags`: Array of strings (optional)
- `workingHours`: Working hours configuration (optional)

### Missing Fields That Need API Support 🔧

## Section 1: General Section

**File**: `app/modules/campaigns/CampaignsForm/GeneralSection/GeneralSection.tsx`

### Fields to Add:

1. **`active`** (boolean)
   - Currently: Form field exists but not in Campaign model
   - Action: Add to Campaign interface and API
   - Usage: Switch component for campaign active state

## Section 2: Agent Configuration

**File**: `app/modules/agent/AgentConfiguration/AgentConfiguration.tsx`

### Fields to Add:

2. **`agentConfig`** (AgentConfigModel)
   - Currently: Complete AgentConfiguration component data not persisted
   - Action: Add agentConfig field to Campaign model
   - Usage: Store complete agent configuration as embedded object
   - Includes:
     - Voice settings (voiceId, stability, speed, similarityBoost, optimizeStreamingLatency)
     - Basic configuration (language, firstMessage)
     - AI personality (prompt)
     - Knowledge base items
     - Conversation configuration
     - Platform settings
     - Privacy settings
     - Call limits
     - Evaluation criteria

### Specific Agent Sub-fields:

3. **Voice Configuration**:

   - `voiceId`: Selected voice ID
   - `stability`: Voice stability setting (0-1)
   - `speed`: Voice speed setting (0.25-4.0)
   - `similarityBoost`: Voice similarity boost (0-1)
   - `optimizeStreamingLatency`: Latency optimization (0-4)

4. **Basic Agent Settings**:

   - `language`: Agent language ("en", "es", etc.)
   - `firstMessage`: Initial greeting message

5. **AI Personality**:

   - `prompt`: Custom agent prompt/personality

6. **Knowledge Base**:
   - `knowledgeBaseItems`: Array of knowledge base entries
   - Each item: { id, type: "file"|"url"|"api", label, path? }

## Section 3: Contact Configuration

**File**: `app/modules/campaigns/CampaignsForm/ContactSection/ContactSection.tsx`

### Fields to Add:

7. **`selectedContactList`** (string)

   - Currently: Component prop, not persisted
   - Action: Add contactListId to Campaign model
   - Usage: ID of the selected contact list

8. **`contactListConfig`** (object)
   - Currently: ActiveContactList component selections not saved
   - Action: Add contactListConfig to Campaign model
   - Fields:
     - `contactListId`: Selected contact list ID
     - `contactListName`: Display name
     - `lastUpdated`: When list was last modified
     - `totalContacts`: Number of contacts in list

## Section 4: Parameters Section

**File**: `app/modules/campaigns/CampaignsForm/ParametersSection/ParametersSection.tsx`

### Already Handled ✅:

- `workingHours`: Already in Campaign model and being persisted

## API Schema Updates Required

### 1. Update Campaign Interface

```typescript
// Add to app/models/CampaignsModel.ts

export interface Campaign {
  // ... existing fields ...

  // New fields to add:
  active?: boolean;
  agentConfig?: AgentConfigModel;
  contactListId?: string;
  contactListConfig?: {
    contactListId: string;
    contactListName: string;
    lastUpdated?: string;
    totalContacts?: number;
  };
}
```

### 2. Backend API Updates

The following endpoints need to support the new fields:

- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `GET /api/campaigns/:id` - Get campaign details

## Implementation Steps

### Phase 1: Campaign Model Updates

1. **Update CampaignsModel.ts**

   - Add `active` boolean field
   - Add `agentConfig` field of type `AgentConfigModel`
   - Add `contactListId` string field
   - Add `contactListConfig` object field

2. **Update campaignFormFunctions.tsx**
   - Add new fields to form initial values
   - Add validation rules for new fields

### Phase 2: Form Integration

3. **Update GeneralSection.tsx**

   - Fix the `active` field binding to properly use form state
   - Remove hardcoded onChange, use form.getInputProps()

4. **Update CampaignsForm.tsx**

   - Add agentConfig state management
   - Pass agentConfig updates to form
   - Store complete AgentConfiguration state in campaign

5. **Update ContactSection.tsx**
   - Bind selectedContactList to form state
   - Update form when contact list changes
   - Store contact list metadata

### Phase 3: Agent Configuration Integration

6. **Update AgentConfiguration.tsx**

   - Accept campaign form context
   - Update campaign agentConfig when agent data changes
   - Ensure all agent sub-components update the campaign state

7. **Update AgentVoices.tsx**

   - Connect voice selection to campaign agentConfig
   - Update campaign form when voice settings change

8. **Update AgentSettings components**
   - Connect BasicConfiguration to campaign agentConfig
   - Connect AIPersonality to campaign agentConfig
   - Connect AgentKnowledgeBase to campaign agentConfig

### Phase 4: API Integration

9. **Update Campaign API calls**

   - Modify createCampaign to send all new fields
   - Modify updateCampaign to send all new fields
   - Ensure backend validation handles new fields

10. **Update Backend Models**
    - Add new fields to Campaign entity/model
    - Update database schema if needed
    - Add validation for new fields

### Phase 5: Data Loading

11. **Update Campaign Loading**
    - When editing existing campaign, populate agentConfig
    - Restore voice settings, personality, knowledge base
    - Restore contact list selection
    - Restore active state

### Phase 6: Validation & Testing

12. **Add Form Validation**

    - Validate agentConfig completeness
    - Validate contact list selection
    - Validate voice configuration

13. **Test Data Persistence**
    - Test create campaign with all fields
    - Test update campaign with all fields
    - Test campaign loading with all fields
    - Test form state management

## Data Flow Summary

```
Form State (CampaignsForm)
├── General Section
│   ├── name ✅
│   ├── description ✅
│   └── active 🔧 (needs API support)
├── Agent Configuration
│   ├── agentConfig 🔧 (needs API support)
│   │   ├── Voice Settings
│   │   ├── Basic Configuration
│   │   ├── AI Personality
│   │   └── Knowledge Base
├── Contact Section
│   ├── contactListId 🔧 (needs API support)
│   └── contactListConfig 🔧 (needs API support)
└── Parameters Section
    └── workingHours ✅

API Payload (Campaign Object)
├── All existing fields ✅
├── active 🔧
├── agentConfig 🔧
├── contactListId 🔧
└── contactListConfig 🔧
```

## Priority Order

1. **High Priority**:

   - `active` field (simple boolean)
   - `contactListId` (string field)

2. **Medium Priority**:

   - `contactListConfig` object
   - Basic `agentConfig` fields (voice, language, firstMessage)

3. **Low Priority**:
   - Complete `agentConfig` with all nested settings
   - Knowledge base integration
   - Advanced agent settings

This plan ensures all form data is properly persisted and the campaign object contains complete configuration information for agents and contacts.
