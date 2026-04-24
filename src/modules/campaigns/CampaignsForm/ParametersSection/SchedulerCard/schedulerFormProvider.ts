import { createFormContext } from '@mantine/form';
import type { Scheduler } from '~/models/SchedulerModel';

// Create the form context
export const [
	SchedulerFormProvider,
	useSchedulerFormContext,
	useSchedulerForm,
] = createFormContext<Partial<Scheduler>>();
