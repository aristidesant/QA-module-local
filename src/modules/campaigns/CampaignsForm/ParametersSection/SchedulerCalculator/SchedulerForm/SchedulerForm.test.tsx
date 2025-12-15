import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SchedulerForm from './SchedulerForm';
import { useSchedulerCalculatorStore } from '~/stores/schedulerCalculatorStore';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock store
vi.mock('~/stores/schedulerCalculatorStore', () => ({
	useSchedulerCalculatorStore: vi.fn(),
}));

describe('SchedulerForm', () => {
	it('renders correctly with default values', () => {
		(useSchedulerCalculatorStore as any).mockReturnValue({
			mode: 'resources',
			setMode: vi.fn(),
			setFormValues: vi.fn(),
			calculate: vi.fn(),
		});

		renderWithProviders(<SchedulerForm />);
		expect(screen.getByText('Scheduler calculator')).toBeInTheDocument();
	});
});
