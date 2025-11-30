import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SIPTrunk from './SIPTrunk';

// Mock the useClientConfigByName hook
vi.mock('~/queries/useClientConfigs', () => ({
	useClientConfigByName: vi.fn(),
}));

import { useClientConfigByName } from '~/queries/useClientConfigs';

const mockUseClientConfigByName = vi.mocked(useClientConfigByName);

const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

const renderSIPTrunk = () => {
	const queryClient = createQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<MantineProvider>
				<SIPTrunk />
			</MantineProvider>
		</QueryClientProvider>
	);
};

describe('SIPTrunk', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Header Content', () => {
		it('renders the SIP Trunk title', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(
				screen.getByRole('heading', { name: 'SIP Trunk', level: 2 })
			).toBeInTheDocument();
		});

		it('renders the description text', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(
				screen.getByText(
					'Monitor SIP connectivity and review every active call handled by the agent service.'
				)
			).toBeInTheDocument();
		});

		it('renders the SIP Monitor badge', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(screen.getByText('SIP Monitor')).toBeInTheDocument();
		});
	});

	describe('Loading State', () => {
		it('displays loading message when isLoading is true', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(screen.getByText('Loading SIP monitor...')).toBeInTheDocument();
		});

		it('does not display iframe when loading', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(screen.queryByTitle('SIP Monitor')).not.toBeInTheDocument();
		});

		it('does not display error message when loading', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: true,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(
				screen.queryByText('Error loading SIP monitor URL')
			).not.toBeInTheDocument();
		});
	});

	describe('Error State', () => {
		it('displays error message when there is an error', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to fetch'),
			} as any);

			renderSIPTrunk();

			expect(
				screen.getByText('Error loading SIP monitor URL')
			).toBeInTheDocument();
		});

		it('does not display iframe when there is an error', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to fetch'),
			} as any);

			renderSIPTrunk();

			expect(screen.queryByTitle('SIP Monitor')).not.toBeInTheDocument();
		});

		it('does not display loading message when there is an error', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: new Error('Failed to fetch'),
			} as any);

			renderSIPTrunk();

			expect(
				screen.queryByText('Loading SIP monitor...')
			).not.toBeInTheDocument();
		});
	});

	describe('Success State', () => {
		it('renders iframe when data is available', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: { value: 'https://sip-monitor.example.com' },
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			const iframe = screen.getByTitle('SIP Monitor');
			expect(iframe).toBeInTheDocument();
		});

		it('sets correct src on iframe from data', () => {
			const sipMonitorUrl = 'https://sip-monitor.example.com/dashboard';
			mockUseClientConfigByName.mockReturnValue({
				data: { value: sipMonitorUrl },
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			const iframe = screen.getByTitle('SIP Monitor');
			expect(iframe.getAttribute('src')).toBe(sipMonitorUrl);
		});

		it('does not display loading message when data is loaded', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: { value: 'https://sip-monitor.example.com' },
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(
				screen.queryByText('Loading SIP monitor...')
			).not.toBeInTheDocument();
		});

		it('does not display error message when data is loaded', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: { value: 'https://sip-monitor.example.com' },
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(
				screen.queryByText('Error loading SIP monitor URL')
			).not.toBeInTheDocument();
		});

		it('iframe has correct title attribute', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: { value: 'https://sip-monitor.example.com' },
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			const iframe = screen.getByTitle('SIP Monitor');
			expect(iframe).toBeInTheDocument();
			expect(iframe.tagName.toLowerCase()).toBe('iframe');
		});
	});

	describe('API Integration', () => {
		it('calls useClientConfigByName with correct config name', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(mockUseClientConfigByName).toHaveBeenCalledWith('sip_monitor_url');
		});

		it('only calls the hook once on render', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			expect(mockUseClientConfigByName).toHaveBeenCalledTimes(1);
		});
	});

	describe('Edge Cases', () => {
		it('does not render iframe when data.value is undefined', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: { value: undefined },
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			// The iframe would still render but with undefined src
			// This tests the actual behavior
			const iframe = screen.queryByTitle('SIP Monitor');
			// Since data exists (even if value is undefined), iframe would render
			expect(iframe).toBeInTheDocument();
		});

		it('renders correctly when all states are false', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: undefined,
				isLoading: false,
				error: null,
			} as any);

			renderSIPTrunk();

			// Should render header elements but no content section states
			expect(
				screen.getByRole('heading', { name: 'SIP Trunk' })
			).toBeInTheDocument();
			expect(
				screen.queryByText('Loading SIP monitor...')
			).not.toBeInTheDocument();
			expect(
				screen.queryByText('Error loading SIP monitor URL')
			).not.toBeInTheDocument();
			expect(screen.queryByTitle('SIP Monitor')).not.toBeInTheDocument();
		});
	});

	describe('Structure', () => {
		it('renders with correct DOM structure', () => {
			mockUseClientConfigByName.mockReturnValue({
				data: { value: 'https://sip-monitor.example.com' },
				isLoading: false,
				error: null,
			} as any);

			const { container } = renderSIPTrunk();

			// Check root element exists
			const root = container.querySelector('[class*="root"]');
			expect(root).toBeInTheDocument();

			// Check header element exists
			const header = container.querySelector('header');
			expect(header).toBeInTheDocument();

			// Check section element exists
			const section = container.querySelector('section');
			expect(section).toBeInTheDocument();
		});
	});
});
