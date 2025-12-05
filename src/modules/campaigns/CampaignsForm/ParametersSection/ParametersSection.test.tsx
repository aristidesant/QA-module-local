import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import ParametersSection from './ParametersSection';
import { useCampaignSchedules } from '~/queries/schedulerQueries';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useParams } from 'react-router';

vi.mock('react-router', () => ({
	useParams: vi.fn(),
}));

vi.mock('~/queries/schedulerQueries', () => ({
	useCampaignSchedules: vi.fn(),
}));

vi.mock('./SchedulerCard', () => ({
	SchedulerCard: ({
		scheduler,
		handleReload,
	}: {
		scheduler: { id: number; name: string };
		handleReload?: () => void;
	}) => (
		<div data-testid='scheduler-card'>
			<span>{scheduler.name}</span>
			<button onClick={handleReload} type='button'>
				reload
			</button>
		</div>
	),
}));

vi.mock('./AddScheduler', () => ({
	__esModule: true,
	default: () => <div data-testid='add-scheduler'>Add Scheduler</div>,
}));

const mockUseParams = useParams as unknown as Mock;
const mockUseCampaignSchedules = useCampaignSchedules as unknown as Mock;

const baseProps = {
	workingHours: {},
	onChange: vi.fn(),
	onCopyToAll: vi.fn(),
};

describe('ParametersSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseParams.mockReturnValue({ campaignId: '99' });
		mockUseCampaignSchedules.mockReturnValue({
			data: [],
			refetch: vi.fn(),
			isLoading: false,
			isFetching: false,
		});
	});

	it('renders scheduler cards for each scheduler returned', () => {
		mockUseCampaignSchedules.mockReturnValue({
			data: [
				{ id: 1, name: 'Morning' },
				{ id: 2, name: 'Evening' },
			],
			refetch: vi.fn(),
			isLoading: false,
			isFetching: false,
		});

		renderWithProviders(<ParametersSection {...baseProps} />);

		expect(mockUseCampaignSchedules).toHaveBeenCalledWith('99');
		expect(screen.getAllByTestId('scheduler-card')).toHaveLength(2);
		expect(screen.getByTestId('add-scheduler')).toBeInTheDocument();
	});

	it('invokes refetch when a scheduler requests reload', async () => {
		const refetch = vi.fn();
		mockUseCampaignSchedules.mockReturnValue({
			data: [{ id: 1, name: 'Morning' }],
			refetch,
			isLoading: false,
			isFetching: false,
		});

		renderWithProviders(<ParametersSection {...baseProps} />);

		await userEvent.click(screen.getByText('reload'));

		expect(refetch).toHaveBeenCalled();
	});
});
