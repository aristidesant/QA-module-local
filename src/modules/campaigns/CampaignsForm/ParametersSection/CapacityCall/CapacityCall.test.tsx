import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import {
	SchedulerFormProvider,
	useSchedulerForm,
} from '../SchedulerCard/schedulerFormProvider';
import CapacityCall from './CapacityCall';
import { useEffect } from 'react';

const renderComponent = () => {
	const formRef: { current: ReturnType<typeof useSchedulerForm> | null } = {
		current: null,
	};

	const Wrapper = () => {
		const form = useSchedulerForm({
			initialValues: {
				humanEquivalent: 1,
				dayConfigs: [],
			},
		});

		useEffect(() => {
			formRef.current = form;
		}, [form]);

		return (
			<SchedulerFormProvider form={form}>
				<CapacityCall />
			</SchedulerFormProvider>
		);
	};

	return {
		user: userEvent.setup(),
		formRef,
		...renderWithProviders(<Wrapper />),
	};
};

describe('CapacityCall', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders header, slider and metrics', async () => {
		renderComponent();

		expect(screen.getByText(/capacity/i)).toBeInTheDocument();
		expect(
			screen.getByText(/human equivalent \(agents\)/i)
		).toBeInTheDocument();
		// With no active dayConfigs, scheduled should show 0h - check within the Scheduled metric
		const scheduledLabel = screen.getByText(/scheduled/i);
		expect(
			scheduledLabel.parentElement &&
				within(scheduledLabel.parentElement).getByText('0h')
		).toBeInTheDocument();
		expect(screen.getByText(/scheduled/i)).toBeInTheDocument();
		expect(screen.getByText(/^Schedule$/i)).toBeInTheDocument();
	});
});

export {};
