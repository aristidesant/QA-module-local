# SchedulerCard Component

## Overview

The `SchedulerCard` component is a comprehensive UI component designed to display and manage scheduler information within campaign parameters. It provides a clean interface for viewing scheduler details, editing configuration, and controlling scheduler status.

## Features

- **Status Management**: Toggle between active/inactive states with visual indicators
- **Edit Functionality**: In-place editing of scheduler name, description, and calls per hour
- **Delete Capability**: Safe deletion with confirmation modal
- **Visual Status Indicators**: Color-coded badges and card styling based on scheduler status
- **Statistics Display**: Shows key metrics like calls per hour, active days, and contact groups
- **Responsive Design**: Adapts to different screen sizes

## Usage

```tsx
import { SchedulerCard } from '~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCard';

<SchedulerCard scheduler={schedulerData} campaignId={campaignId} />;
```

## Props

| Prop           | Type                                    | Required | Description                                        |
| -------------- | --------------------------------------- | -------- | -------------------------------------------------- |
| `scheduler`    | `Scheduler`                             | Yes      | The scheduler object containing all scheduler data |
| `campaignId`   | `string \| number`                      | Yes      | ID of the campaign this scheduler belongs to       |
| `onUpdate`     | `(updatedScheduler: Scheduler) => void` | No       | Callback fired when scheduler is updated           |
| `onDelete`     | `(schedulerId: number) => void`         | No       | Callback fired when scheduler is deleted           |
| `onActivate`   | `(schedulerId: number) => void`         | No       | Callback fired when scheduler is activated         |
| `onDeactivate` | `(schedulerId: number) => void`         | No       | Callback fired when scheduler is deactivated       |

## Status Colors

- **Active**: Green badge and green-tinted card background
- **Paused**: Yellow badge and yellow-tinted card background
- **Draft**: Gray badge and gray-tinted card background
- **Completed**: Blue badge

## Integration with ParametersSection

The `SchedulerCard` is integrated into the `ParametersSection` component to display all schedulers for a campaign. The integration includes:

1. **Automatic Data Fetching**: Uses `useCampaignSchedules` to fetch scheduler data
2. **Real-time Updates**: Automatically refetches data after mutations
3. **Event Handling**: Passes through all events to parent component
4. **Visual Separation**: Uses dividers to separate scheduler section from working hours

## Mutations Used

The component leverages the following React Query mutations:

- `useUpdateSchedule`: For editing scheduler details
- `useDeleteSchedule`: For removing schedulers
- `useActivateSchedule`: For activating schedulers
- `useDeactivateSchedule`: For pausing schedulers

## Styling

The component uses CSS modules with Mantine CSS variables for consistent theming:

- `SchedulerCard.module.css`: Contains all component-specific styles
- Responsive design with mobile-friendly layouts
- Status-based styling using data attributes
- Hover effects and transitions for better UX

## Error Handling

- Loading states during mutations
- Graceful error handling with console logging
- Disabled states during pending operations
- Form validation for required fields
