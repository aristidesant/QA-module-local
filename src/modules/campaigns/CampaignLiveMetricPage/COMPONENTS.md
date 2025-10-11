# Campaign Live Metrics Page - Component Structure

This document outlines the components created for the Campaign Live Metrics page based on the provided design.

## Generic Components (in `/src/components`)

### 1. StatCard

**Location:** `/src/components/StatCard/`

A reusable card component for displaying statistical metrics with optional charts.

**Props:**

- `title`: string - The metric title
- `value`: string | number - The main value to display
- `subtitle?`: string - Optional subtitle/description
- `chart?`: ReactNode - Optional chart visualization (e.g., sparkline)
- `color?`: string - Optional color for the value
- `className?`: string - Additional CSS classes

**Features:**

- Clean, flat design
- Flexible layout with title, value, and optional chart
- Hover effects for better UX
- Responsive design

## Page-Specific Components (in `/src/modules/campaigns/CampaignLiveMetricPage/components`)

### 2. MetricGrid

**Location:** `/src/modules/campaigns/CampaignLiveMetricPage/components/MetricGrid/`

A responsive grid layout for displaying multiple stat cards.

**Props:**

- `children`: ReactNode - The stat cards to display

**Features:**

- Responsive columns (1 on mobile, 2 on tablet, 3 on desktop)
- Consistent spacing between items

### 3. MiniSparkline

**Location:** `/src/modules/campaigns/CampaignLiveMetricPage/components/MiniSparkline/`

A small SVG-based sparkline chart for visualizing trends.

**Props:**

- `data`: number[] - Array of data points
- `color?`: string - Line color (defaults to Mantine blue)
- `height?`: number - Chart height in pixels (default: 40)

**Features:**

- Pure SVG implementation
- Auto-scaling based on data range
- Lightweight and performant

### 4. MetricInfoCard

**Location:** `/src/modules/campaigns/CampaignLiveMetricPage/components/MetricInfoCard/`

A smaller card component for displaying individual metrics with optional tooltips.

**Props:**

- `label`: string - The metric label
- `value`: string | number - The metric value
- `tooltip?`: string - Optional tooltip text

**Features:**

- Compact design for dense information display
- Info icon with tooltip support
- Gray background to differentiate from main stat cards

### 5. ActiveCallsTable

**Location:** `/src/modules/campaigns/CampaignLiveMetricPage/components/ActiveCallsTable/`

A table component for displaying active call information.

**Props:**

- `calls`: ActiveCall[] - Array of active call data

**ActiveCall Interface:**

- `station`: string
- `user`: string
- `sessionId`: string
- `status`: string
- `pause`: string
- `mmss`: string (time format)
- `campaign`: string
- `calls`: number
- `hold`: string
- `inGroup`: string

**Features:**

- Striped rows for better readability
- Status badges with color coding (green for INCALL, etc.)
- Horizontal scroll for smaller screens
- Empty state message when no calls exist

### 6. AgentStatusLegend

**Location:** `/src/modules/campaigns/CampaignLiveMetricPage/components/AgentStatusLegend/`

A legend component showing color-coded agent statuses.

**Props:**

- `items`: LegendItem[] - Array of legend items

**LegendItem Interface:**

- `label`: string - The status description
- `color`: string - The color associated with this status

**Features:**

- Flexible wrapping layout
- Color indicator boxes
- Uses Mantine color variables for consistency

## Main Page Component

### CampaignLiveMetricPage

**Location:** `/src/modules/campaigns/CampaignLiveMetricPage/CampaignLiveMetricPage.tsx`

The main page component that brings all sub-components together.

**Features:**

- Date display for filtering
- Status dropdown filter
- Three main sections:
  1. **Top Metrics** - Dropped percent, Calls today, Dropped/Answered ratio
  2. **Campaign Metrics** - Current call status and agent information
  3. **Active Calls Table** - Real-time call information with agent status legend
  4. **Lead Metrics** - Dialable leads, hopper settings, and dialing metrics

**Mock Data:**
Currently uses mock data that should be replaced with actual API calls:

- `mockSparklineData` - Sample data for sparkline charts
- `mockActiveCalls` - Sample active call records
- `agentStatusLegend` - Agent status color coding

## Design Principles Applied

1. **Component Isolation**: Each component is in its own folder with:
   - Main component file (`.tsx`)
   - Styles file (`.module.css`)
   - Index file for exports

2. **Flat Design**:
   - No shadows or gradients
   - Clean borders with subtle hover effects
   - Color highlights for visual hierarchy

3. **Reusability**:
   - Generic components (like `StatCard`) are placed in `/src/components`
   - Page-specific components stay within the page folder

4. **TypeScript**:
   - Proper type definitions for all props
   - Exported interfaces for external use

5. **Mantine Integration**:
   - Uses Mantine CSS variables (`var(--mantine-xxx)`)
   - Leverages Mantine components (Card, Table, Badge, etc.)
   - Follows Mantine theming conventions

## Next Steps

1. **Connect to API**: Replace mock data with actual API calls using Tanstack Query
2. **Add Real-time Updates**: Implement WebSocket or polling for live metrics
3. **Add Filters**: Make the date picker and status dropdown functional
4. **Add Charts**: Consider adding more detailed charts using a library like Recharts
5. **Add Actions**: Implement click handlers for interactive elements
6. **Add Tests**: Write unit tests for each component

## File Structure

```
src/
├── components/
│   └── StatCard/
│       ├── StatCard.tsx
│       ├── StatCard.module.css
│       └── index.ts
└── modules/
    └── campaigns/
        └── CampaignLiveMetricPage/
            ├── CampaignLiveMetricPage.tsx
            ├── CampaignLiveMetricPage.module.css
            ├── index.ts
            └── components/
                ├── MetricGrid/
                │   ├── MetricGrid.tsx
                │   ├── MetricGrid.module.css
                │   └── index.ts
                ├── MiniSparkline/
                │   ├── MiniSparkline.tsx
                │   ├── MiniSparkline.module.css
                │   └── index.ts
                ├── MetricInfoCard/
                │   ├── MetricInfoCard.tsx
                │   ├── MetricInfoCard.module.css
                │   └── index.ts
                ├── ActiveCallsTable/
                │   ├── ActiveCallsTable.tsx
                │   ├── ActiveCallsTable.module.css
                │   └── index.ts
                └── AgentStatusLegend/
                    ├── AgentStatusLegend.tsx
                    ├── AgentStatusLegend.module.css
                    └── index.ts
```
