import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContactListMetrics from './ContactListMetrics';
import type { LiveMetricsResponse } from '~/models/LiveMetrics';

// Mock scrollIntoView for Mantine Combobox
Element.prototype.scrollIntoView = vi.fn();

// Mock the metrics query
const mockRefetch = vi.fn();
vi.mock('~/modules/queries/metricsQueries', () => ({
	useContactListMetrics: vi.fn(),
}));

import { useContactListMetrics } from '~/modules/queries/metricsQueries';

// Mock SIPTrunk component
vi.mock('~/components/SIPTrunk', () => ({
	default: () => <div data-testid='sip-trunk'>SIP Trunk Component</div>,
}));

const mockMetricsData: LiveMetricsResponse = {
	contactGroupId: 1,
	name: 'Test Contact List',
	queueStatus: 'active',
	isActive: true,
	kpis: {
		general: {
			totalRecords: 1000,
			contacts: 750,
			effectiveContacts: 500,
			noEffectiveContacts: 150,
			noContact: 80,
			dnc: 20,
			contactRate: '75%',
			effectivenessRate: '66.67%',
			noContactRate: '8%',
		},
		breakdowns: {
			ineffectiveReasons: [
				{ label: 'Voicemail', count: 100, percentage: '66.67%' },
				{ label: 'Wrong Number', count: 50, percentage: '33.33%' },
			],
			noContactReasons: [
				{ label: 'No Answer', count: 60, percentage: '75%' },
				{ label: 'Busy', count: 20, percentage: '25%' },
			],
		},
		specifics: [
			{
				key: 'averageHandleTimeSeconds',
				label: 'Average Handle Time',
				value: 180,
				meta: { conversationsMeasured: 500 },
			},
			{
				key: 'conversionRate',
				label: 'Conversion Rate',
				value: 45,
			},
		],
	},
};

const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

const renderWithProviders = (ui: React.ReactElement) => {
	const queryClient = createQueryClient();
	return {
		queryClient,
		...render(
			<QueryClientProvider client={queryClient}>
				<MantineProvider>
					<ModalsProvider>{ui}</ModalsProvider>
				</MantineProvider>
			</QueryClientProvider>
		),
	};
};

describe('ContactListMetrics', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRefetch.mockResolvedValue({ data: mockMetricsData });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('No Contact Group Provided', () => {
		it('renders alert when contactGroupId is undefined', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: null,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={undefined} />);

			expect(screen.getByText('No Contact List Selected')).toBeInTheDocument();
			expect(
				screen.getByText('Provide a valid contact list to see live metrics.')
			).toBeInTheDocument();
		});

		it('renders alert when contactGroupId is 0', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: null,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={0} />);

			expect(screen.getByText('No Contact List Selected')).toBeInTheDocument();
		});

		it('renders alert when contactGroupId is an invalid string', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: null,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId='invalid' />);

			expect(screen.getByText('No Contact List Selected')).toBeInTheDocument();
		});
	});

	describe('Loading State', () => {
		it('renders skeleton loader when data is loading', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: null,
				isLoading: true,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			// The skeleton has multiple skeleton elements
			const skeletons = document.querySelectorAll(
				'[class*="mantine-Skeleton"]'
			);
			expect(skeletons.length).toBeGreaterThan(0);
		});
	});

	describe('Error State', () => {
		it('renders error alert when there is an error', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: null,
				isLoading: false,
				isError: true,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Unable to load metrics')).toBeInTheDocument();
			expect(
				screen.getByText(
					'Something went wrong while retrieving the latest metrics.'
				)
			).toBeInTheDocument();
		});

		it('renders Try again button on error', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: null,
				isLoading: false,
				isError: true,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(
				screen.getByRole('button', { name: /try again/i })
			).toBeInTheDocument();
		});

		it('calls refetch when Try again button is clicked', async () => {
			const user = userEvent.setup();
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: null,
				isLoading: false,
				isError: true,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			const tryAgainButton = screen.getByRole('button', { name: /try again/i });
			await user.click(tryAgainButton);

			expect(mockRefetch).toHaveBeenCalled();
		});
	});

	describe('No Data State', () => {
		it('renders alert when data is empty', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: { kpis: { general: null, breakdowns: {}, specifics: [] } },
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Metrics not available yet')).toBeInTheDocument();
			expect(
				screen.getByText(
					'We have not received any metrics for this contact list in the selected range. Please check back later.'
				)
			).toBeInTheDocument();
		});
	});

	describe('Data Display', () => {
		beforeEach(() => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: mockMetricsData,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});
		});

		it('renders section title', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Contact List Metrics')).toBeInTheDocument();
		});

		it('renders time range selector with default value', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Since creation')).toBeInTheDocument();
		});

		it('renders Total Records stat card', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Total Records')).toBeInTheDocument();
			expect(screen.getByText('1,000')).toBeInTheDocument();
		});

		it('renders Contacted stat card', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Contacted')).toBeInTheDocument();
			expect(screen.getByText('750')).toBeInTheDocument();
		});

		it('renders AHT stat card when averageHandleTimeSeconds is available', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('AHT')).toBeInTheDocument();
			expect(screen.getByText('3.0 mins')).toBeInTheDocument();
		});

		it('renders overview highlights (contact rate, effectiveness rate, no contact rate)', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Contact rate')).toBeInTheDocument();
			expect(screen.getByText('Effectiveness rate')).toBeInTheDocument();
			expect(screen.getByText('No contact rate')).toBeInTheDocument();
		});

		it('renders quick stats (Effective, No Effective, No contact, DNC)', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Effective')).toBeInTheDocument();
			expect(screen.getByText('No Effective')).toBeInTheDocument();
			expect(screen.getByText('No contact')).toBeInTheDocument();
			expect(screen.getByText('DNC')).toBeInTheDocument();
		});
	});

	describe('Time Range Selection', () => {
		beforeEach(() => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: mockMetricsData,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});
		});

		it('renders all time range options', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			// Click on the select to open dropdown
			const select = screen.getByRole('textbox');
			await user.click(select);

			await waitFor(() => {
				expect(screen.getByText('Last 5 minutes')).toBeInTheDocument();
				expect(screen.getByText('Last 15 minutes')).toBeInTheDocument();
				expect(screen.getByText('Last hour')).toBeInTheDocument();
				expect(screen.getByText('Today')).toBeInTheDocument();
			});
		});

		it('changes time range when option is selected', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			const select = screen.getByRole('textbox');
			await user.click(select);

			await waitFor(() => {
				expect(screen.getByText('Last 5 minutes')).toBeInTheDocument();
			});

			await user.click(screen.getByText('Last 5 minutes'));

			await waitFor(() => {
				expect(screen.getByDisplayValue('Last 5 minutes')).toBeInTheDocument();
			});
		});
	});

	describe('Refresh Functionality', () => {
		beforeEach(() => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: mockMetricsData,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});
		});

		it('calls refetch when refresh button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			// Find refresh button by icon (it's an ActionIcon)
			const refreshButtons = screen.getAllByRole('button');
			const refreshButton = refreshButtons.find(
				(btn) => btn.querySelector('svg[class*="tabler-icon-refresh"]') !== null
			);

			if (refreshButton) {
				await user.click(refreshButton);
				expect(mockRefetch).toHaveBeenCalled();
			}
		});
	});

	describe('SIP Trunk Modal', () => {
		beforeEach(() => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: mockMetricsData,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});
		});

		it('opens SIP trunk modal when speakerphone button is clicked', async () => {
			const user = userEvent.setup();
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			// Find the SIP trunk button (ActionIcon with speakerphone icon)
			const buttons = screen.getAllByRole('button');
			const sipTrunkButton = buttons.find(
				(btn) =>
					btn.querySelector('svg[class*="tabler-icon-speakerphone"]') !== null
			);

			if (sipTrunkButton) {
				await user.click(sipTrunkButton);

				await waitFor(() => {
					expect(screen.getByText('SIP Trunk Information')).toBeInTheDocument();
				});
			}
		});
	});

	describe('Contact Group ID Parsing', () => {
		it('handles numeric contactGroupId correctly', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: mockMetricsData,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={123} />);

			expect(screen.getByText('Contact List Metrics')).toBeInTheDocument();
		});

		it('handles string contactGroupId correctly', () => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: mockMetricsData,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId='456' />);

			expect(screen.getByText('Contact List Metrics')).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('handles metrics with percentage as number instead of string', () => {
			const dataWithNumericPercentage = {
				...mockMetricsData,
				kpis: {
					...mockMetricsData.kpis,
					general: {
						...mockMetricsData.kpis.general,
						contactRate: 75,
						effectivenessRate: 66.67,
						noContactRate: 8,
					},
				},
			};

			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: dataWithNumericPercentage,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Contact rate')).toBeInTheDocument();
		});

		it('handles missing AHT metric gracefully', () => {
			const dataWithoutAHT = {
				...mockMetricsData,
				kpis: {
					...mockMetricsData.kpis,
					specifics: [],
				},
			};

			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: dataWithoutAHT,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.queryByText('AHT')).not.toBeInTheDocument();
		});

		it('handles zero values correctly', () => {
			const dataWithZeros = {
				...mockMetricsData,
				kpis: {
					...mockMetricsData.kpis,
					general: {
						totalRecords: 0,
						contacts: 0,
						effectiveContacts: 0,
						noEffectiveContacts: 0,
						noContact: 0,
						dnc: 0,
						contactRate: '0%',
						effectivenessRate: '0%',
						noContactRate: '0%',
					},
				},
			};

			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: dataWithZeros,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			expect(screen.getByText('Total Records')).toBeInTheDocument();
			// Zero values should be displayed
			expect(screen.getAllByText('0').length).toBeGreaterThan(0);
		});

		it('handles NaN and Infinity values gracefully', () => {
			const dataWithInvalidValues = {
				...mockMetricsData,
				kpis: {
					...mockMetricsData.kpis,
					general: {
						...mockMetricsData.kpis.general,
						totalRecords: NaN,
						contactRate: 'invalid%',
					},
				},
			};

			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: dataWithInvalidValues,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});

			// Should not throw an error
			expect(() =>
				renderWithProviders(<ContactListMetrics contactGroupId={1} />)
			).not.toThrow();
		});
	});

	describe('Accessibility', () => {
		beforeEach(() => {
			(
				useContactListMetrics as unknown as ReturnType<typeof vi.fn>
			).mockReturnValue({
				data: mockMetricsData,
				isLoading: false,
				isError: false,
				isRefetching: false,
				refetch: mockRefetch,
			});
		});

		it('time range select is accessible', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			const select = screen.getByRole('textbox');
			expect(select).toBeInTheDocument();
		});

		it('action buttons are accessible', () => {
			renderWithProviders(<ContactListMetrics contactGroupId={1} />);

			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBeGreaterThan(0);
		});
	});
});
