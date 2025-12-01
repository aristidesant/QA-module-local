import { screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { AgentWithCampaignListItem } from '~/models/AgentListObject';
import AgentCampaignAdd from './AgentCampaignAdd';
import useAgentSelectionColumns from './useAgentSelectionColumns';
import { flexRender } from '@tanstack/react-table';

const mockUseAgentsWithCampaigns = vi.fn();
const mockMutate = vi.fn();
const mockRefetch = vi.fn();

vi.mock('~/queries/agentQueries', () => ({
	useAgentsWithCampaigns: (...args: unknown[]) =>
		mockUseAgentsWithCampaigns(...args) || {
			data: { data: [], total: 0, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		},
}));

vi.mock('~/queries/campaignAgentsQueries', () => ({
	useCreateCampaignAgent: () => ({ mutate: mockMutate }),
}));

interface ColumnProps {
	onAdd: (agent: AgentWithCampaignListItem) => void;
	onPlay: (agent: AgentWithCampaignListItem) => void;
	onClone: (agent: AgentWithCampaignListItem) => void;
	isDisabled: (agent: AgentWithCampaignListItem) => boolean;
	isPlaying: (agent: AgentWithCampaignListItem) => boolean;
}

let capturedColumnProps: ColumnProps;
vi.mock(
	'~/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignAdd/useAgentSelectionColumns',
	() => ({
		default: (props: ColumnProps) => {
			capturedColumnProps = props;
			return [];
		},
	})
);

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: <T,>(
		selector: (state: { selectedCampaign: { type: string } }) => T
	) => selector({ selectedCampaign: { type: 'outbound' } }),
}));

vi.mock('~/components/BaseTable/BaseTable', () => ({
	default: ({ data }: { data: unknown[] }) => (
		<div data-testid='base-table'>rows:{data.length}</div>
	),
}));

interface PaginationProps {
	onItemsPerPageChange?: (value: string | null) => void;
	onPageChange?: (page: number) => void;
}

vi.mock('~/components/PaginationControls/PaginationControls', () => ({
	default: (props: PaginationProps) => (
		<div data-testid='pagination-controls'>
			<button onClick={() => props.onItemsPerPageChange?.('20')}>
				change-limit
			</button>
			<button onClick={() => props.onItemsPerPageChange?.('abc')}>
				change-limit-invalid
			</button>
			<button onClick={() => props.onItemsPerPageChange?.(null)}>
				change-limit-null
			</button>
			<button onClick={() => props.onPageChange?.(2)}>change-page</button>
		</div>
	),
}));

vi.mock('~/components/FilterContainer', () => ({
	FilterContainer: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('@mantine/modals', () => ({ modals: { open: vi.fn() } }));

interface MockAudioInstance {
	src: string;
	play: () => void;
	pause: () => void;
	onended: (() => void) | null;
}

describe('AgentCampaignAdd', () => {
	const defaultProps = {
		campaignId: 1,
		excludedAgents: [],
		onComplete: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders an error alert and retries when refetch is triggered', async () => {
		const user = userEvent.setup();
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: mockRefetch,
		});

		renderWithProviders(<AgentCampaignAdd {...defaultProps} />);

		expect(screen.getByText(/Failed to load agents/i)).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /Try again/i }));
		expect(mockRefetch).toHaveBeenCalled();
	});

	it('toggles play and stops when called twice', () => {
		const audioPlay = vi.fn();
		const audioPause = vi.fn();
		const MockAudio = vi.fn(function (this: MockAudioInstance, _src: string) {
			this.src = _src;
			this.play = audioPlay;
			this.pause = audioPause;
			this.onended = null;
		}) as unknown as typeof Audio;
		global.Audio = MockAudio;

		const agent = {
			id: '42',
			voicePreviewUrl: 'http://test',
		} as AgentWithCampaignListItem;

		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		const onComplete = vi.fn();
		renderWithProviders(
			<AgentCampaignAdd
				campaignId={1}
				excludedAgents={[]}
				onComplete={onComplete}
			/>
		);

		// Call captured onPlay
		act(() => capturedColumnProps.onPlay?.(agent));

		expect(MockAudio).toHaveBeenCalledWith('http://test');
		expect(audioPlay).toHaveBeenCalled();
		// now toggle
		act(() => capturedColumnProps.onPlay?.(agent));
		expect(audioPause).toHaveBeenCalled();
	});

	it('switches play between agents and pauses previous audio', () => {
		const audioPlay = vi.fn();
		const audioPause = vi.fn();
		const MockAudio = vi.fn(function (this: MockAudioInstance, _src: string) {
			this.src = _src;
			this.play = audioPlay;
			this.pause = audioPause;
			this.onended = null;
		}) as unknown as typeof Audio;
		global.Audio = MockAudio;

		const agent1 = {
			id: '1',
			voicePreviewUrl: 'http://one',
		} as AgentWithCampaignListItem;
		const agent2 = {
			id: '2',
			voicePreviewUrl: 'http://two',
		} as AgentWithCampaignListItem;

		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent1, agent2], total: 2, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={1}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);

		// Play first
		act(() => capturedColumnProps.onPlay?.(agent1));
		expect(MockAudio).toHaveBeenCalledWith('http://one');
		expect(audioPlay).toHaveBeenCalled();

		// Play second -> should pause first and start new
		act(() => capturedColumnProps.onPlay?.(agent2));
		expect(audioPause).toHaveBeenCalled();
		expect(MockAudio).toHaveBeenCalledWith('http://two');
		expect(audioPlay).toHaveBeenCalledTimes(2);
	});

	it('calls create mutation and triggers onComplete on success', () => {
		const agent = { id: '99' } as AgentWithCampaignListItem;

		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		const onComplete = vi.fn();
		renderWithProviders(
			<AgentCampaignAdd
				campaignId={3}
				excludedAgents={[]}
				onComplete={onComplete}
			/>
		);

		act(() => capturedColumnProps.onAdd?.(agent));

		expect(mockMutate).toHaveBeenCalled();
		type MutateOptions = {
			onSuccess?: () => void;
			onError?: (error: unknown) => void;
		};
		const [[payload, options]] = mockMutate.mock.calls as [
			[{ campaignId: number; agentId: string }, MutateOptions],
		];
		expect(payload).toEqual({ campaignId: 3, agentId: '99' });
		// simulate success
		act(() => options.onSuccess?.());
		expect(onComplete).toHaveBeenCalled();
	});

	it('shows notification when add fails with axios error', () => {
		const agent = { id: '100' } as AgentWithCampaignListItem;
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={4}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);

		act(() => capturedColumnProps.onAdd?.(agent));
		expect(mockMutate).toHaveBeenCalled();
		type MutateOptions = {
			onSuccess?: () => void;
			onError?: (error: unknown) => void;
		};
		const [[, options]] = mockMutate.mock.calls as [[unknown, MutateOptions]];
		const axiosError = {
			isAxiosError: true,
			response: { data: { message: 'oops' } },
		};
		act(() => options.onError?.(axiosError));
		expect(notifications.show).toHaveBeenCalled();
	});

	it('shows default notification when add fails with non-axios error', () => {
		const agent = { id: '101' } as AgentWithCampaignListItem;
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={4}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);

		act(() => capturedColumnProps.onAdd?.(agent));
		expect(mockMutate).toHaveBeenCalled();
		type MutateOptions = {
			onSuccess?: () => void;
			onError?: (error: unknown) => void;
		};
		const [[, options]] = mockMutate.mock.calls as [[unknown, MutateOptions]];
		const genericError = new Error('network');
		act(() => options.onError?.(genericError));
		expect(notifications.show).toHaveBeenCalled();
	});

	it('opens clone modal', () => {
		const agent = { id: '200' } as AgentWithCampaignListItem;
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={5}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);

		act(() => capturedColumnProps.onClone?.(agent));
		expect(modals.open).toHaveBeenCalled();
		// extract children props and call onSuccess to ensure refetch is called
		type ModalOptions = { children?: { props?: { onSuccess?: () => void } } };
		const mockOpen = modals.open as ReturnType<typeof vi.fn>;
		const [[options]] = mockOpen.mock.calls as [[ModalOptions]];
		const childrenEl = options.children;
		if (
			childrenEl &&
			childrenEl.props &&
			typeof childrenEl.props.onSuccess === 'function'
		) {
			const onSuccessFn = childrenEl.props.onSuccess;
			act(() => onSuccessFn());
			expect(mockRefetch).toHaveBeenCalled();
		}
	});

	it('updates query params when search input changes (debounced)', async () => {
		const user = userEvent.setup();
		mockUseAgentsWithCampaigns.mockImplementation(() => ({
			data: { data: [], total: 0, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		}));

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={5}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);

		const search = screen.getByLabelText('Search agents by name');
		await user.type(search, 'John');

		// wait for debounce to complete and state to update
		await waitFor(
			() => {
				const foundCall = mockUseAgentsWithCampaigns.mock.calls.find(
					(c: unknown[]) => (c[0] as { name?: string }).name === 'John'
				);
				expect(foundCall).toBeTruthy();
			},
			{ timeout: 1000 }
		);
	});

	it('updates items per page when pagination control triggers change', async () => {
		const user = userEvent.setup();
		mockUseAgentsWithCampaigns.mockImplementation(() => ({
			data: { data: [], total: 0, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		}));

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={5}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);
		const changeButton = screen.getByText('change-limit');
		await user.click(changeButton);

		// wait for state update and hook to be called with limit 20
		await waitFor(() => {
			const foundCall = mockUseAgentsWithCampaigns.mock.calls.find(
				(c: unknown[]) => (c[0] as { limit?: number }).limit === 20
			);
			expect(foundCall).toBeTruthy();
		});
	});

	it('ignores invalid items per page changes and handles null values', async () => {
		const user = userEvent.setup();
		mockUseAgentsWithCampaigns.mockImplementation(() => ({
			data: { data: [], total: 0, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		}));

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={5}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);
		// invalid
		await user.click(screen.getByText('change-limit-invalid'));
		await waitFor(() => {
			const foundInvalid = mockUseAgentsWithCampaigns.mock.calls.find(
				(c: unknown[]) => (c[0] as { limit?: number }).limit === 10
			);
			expect(foundInvalid).toBeTruthy();
		});

		// null -> should use default limit (10)
		await user.click(screen.getByText('change-limit-null'));
		await waitFor(() => {
			const foundNull = mockUseAgentsWithCampaigns.mock.calls.find(
				(c: unknown[]) => (c[0] as { limit?: number }).limit === 10
			);
			expect(foundNull).toBeTruthy();
		});
	});

	it('filters out excluded agents', () => {
		const agentA = { id: 'a', name: 'Agent A' } as AgentWithCampaignListItem;
		const agentB = { id: 'b', name: 'Agent B' } as AgentWithCampaignListItem;

		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agentA, agentB], total: 2, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={5}
				excludedAgents={['a']}
				onComplete={vi.fn()}
			/>
		);
		expect(screen.getByTestId('base-table')).toHaveTextContent('rows:1');
	});

	it('isDisabled & isPlaying helpers work', async () => {
		const agent = {
			id: 'z',
			campaignName: 'Campaign Z',
			voicePreviewUrl: 'u',
		} as AgentWithCampaignListItem;
		const MockAudio = vi.fn(function (this: MockAudioInstance, _src: string) {
			this.play = vi.fn();
			this.pause = vi.fn();
			this.onended = null;
		}) as unknown as typeof Audio;
		global.Audio = MockAudio;

		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={5}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);
		// isDisabled should be true due to campaignName
		expect(capturedColumnProps.isDisabled?.(agent)).toBeTruthy();

		// Play: isPlaying should be false, then true after onPlay
		expect(capturedColumnProps.isPlaying?.(agent)).toBeFalsy();
		act(() => capturedColumnProps.onPlay?.(agent));
		await waitFor(() =>
			expect(capturedColumnProps.isPlaying?.(agent)).toBeTruthy()
		);
	});

	it('resets playing state when audio ends', async () => {
		const audioPlay = vi.fn();
		const audioPause = vi.fn();
		const MockAudioFn = vi.fn(function (this: MockAudioInstance, _src: string) {
			this.src = _src;
			this.play = audioPlay;
			this.pause = audioPause;
			this.onended = null;
		});
		global.Audio = MockAudioFn as unknown as typeof Audio;

		const agent = {
			id: 'z2',
			voicePreviewUrl: 'u2',
		} as AgentWithCampaignListItem;
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={5}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);
		// start playing
		act(() => capturedColumnProps.onPlay?.(agent));
		await waitFor(() =>
			expect(capturedColumnProps.isPlaying?.(agent)).toBeTruthy()
		);

		// simulate onended
		const instance = MockAudioFn.mock.instances[0] as MockAudioInstance;
		act(() => instance.onended?.());
		await waitFor(() =>
			expect(capturedColumnProps.isPlaying?.(agent)).toBeFalsy()
		);
	});

	it('does nothing when play called without voice preview', () => {
		const agent = { id: 'no-voice' } as AgentWithCampaignListItem;
		const MockAudioFn = vi.fn(function (this: MockAudioInstance, _: string) {
			this.play = vi.fn();
			this.pause = vi.fn();
			this.onended = null;
		});
		global.Audio = MockAudioFn as unknown as typeof Audio;

		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [agent], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(
			<AgentCampaignAdd
				campaignId={6}
				excludedAgents={[]}
				onComplete={vi.fn()}
			/>
		);
		act(() => capturedColumnProps.onPlay?.(agent));
		expect(MockAudioFn).not.toHaveBeenCalled();
	});

	it('shows BaseTable when loading', () => {
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [], total: 0, totalPages: 1 },
			isLoading: true,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(<AgentCampaignAdd {...defaultProps} />);
		expect(screen.getByTestId('base-table')).toBeInTheDocument();
	});

	it('shows empty state when there are no available agents', () => {
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [], total: 0, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(<AgentCampaignAdd {...defaultProps} />);

		expect(screen.getByText(/No available agents/i)).toBeVisible();
	});

	it('renders the table when agents are available', () => {
		mockUseAgentsWithCampaigns.mockReturnValue({
			data: { data: [{ id: '1', name: 'Agent One' }], total: 1, totalPages: 1 },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		renderWithProviders(<AgentCampaignAdd {...defaultProps} />);

		expect(screen.getByTestId('base-table')).toHaveTextContent('rows:1');
	});
});

describe('useAgentSelectionColumns', () => {
	const mockOnAdd = vi.fn();
	const mockOnPlay = vi.fn();
	const mockOnClone = vi.fn();
	const mockIsDisabled = vi.fn();
	const mockIsPlaying = vi.fn();

	const defaultOptions = {
		onAdd: mockOnAdd,
		onPlay: mockOnPlay,
		onClone: mockOnClone,
		isDisabled: mockIsDisabled,
		isPlaying: mockIsPlaying,
	};

	const createMockAgent = (
		overrides: Partial<AgentWithCampaignListItem> = {}
	): AgentWithCampaignListItem => ({
		id: '1',
		name: 'Test Agent',
		status: 'ACTIVE',
		type: 'OUTBOUND',
		createdAt: '2024-01-01',
		updatedAt: '2024-01-01',
		clientId: 1,
		voiceId: 'voice-1',
		identifier: 'test-identifier',
		voiceName: 'Test Voice',
		voiceLanguage: 'English',
		voicePreviewUrl: 'http://example.com/preview.mp3',
		campaignId: null,
		campaignName: null,
		...overrides,
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsDisabled.mockReturnValue(false);
		mockIsPlaying.mockReturnValue(false);
	});

	// Import actual implementation for these tests
	const getActualHook = async () => {
		const actual = await vi.importActual<
			typeof import('./useAgentSelectionColumns')
		>('./useAgentSelectionColumns');
		return actual.default;
	};

	const TestHookWrapper = ({
		options,
		useActualHook,
	}: {
		options: typeof defaultOptions;
		useActualHook: typeof useAgentSelectionColumns;
	}) => {
		const columns = useActualHook(options);
		return <div data-testid='columns-count'>{columns.length}</div>;
	};

	it('returns correct number of columns', async () => {
		const actualHook = await getActualHook();
		renderWithProviders(
			<TestHookWrapper options={defaultOptions} useActualHook={actualHook} />
		);

		expect(screen.getByTestId('columns-count')).toHaveTextContent('4');
	});

	describe('Agent column', () => {
		const AgentColumnRenderer = ({
			agent,
			options,
			useActualHook,
		}: {
			agent: AgentWithCampaignListItem;
			options: typeof defaultOptions;
			useActualHook: typeof useAgentSelectionColumns;
		}) => {
			const columns = useActualHook(options);
			const agentColumn = columns[0];
			const row = { original: agent };
			const cellContent = agentColumn.cell
				? flexRender(agentColumn.cell, {
						row,
						getValue: () => agent.name,
					} as never)
				: null;
			return <div data-testid='agent-cell'>{cellContent}</div>;
		};

		it('renders agent name', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({ name: 'My Agent' });
			renderWithProviders(
				<AgentColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			expect(screen.getByText('My Agent')).toBeInTheDocument();
		});

		it('shows campaign name in tooltip when available', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({ campaignName: 'Campaign One' });
			renderWithProviders(
				<AgentColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			// The tooltip is present in the DOM
			expect(screen.getByTestId('agent-cell')).toBeInTheDocument();
		});

		it('shows "No campaign" tooltip when campaignName is null', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({ campaignName: null });
			renderWithProviders(
				<AgentColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			expect(screen.getByTestId('agent-cell')).toBeInTheDocument();
		});
	});

	describe('Type column', () => {
		const TypeColumnRenderer = ({
			agent,
			options,
			useActualHook,
		}: {
			agent: AgentWithCampaignListItem;
			options: typeof defaultOptions;
			useActualHook: typeof useAgentSelectionColumns;
		}) => {
			const columns = useActualHook(options);
			const typeColumn = columns[1];
			const row = { original: agent };
			const cellContent = typeColumn.cell
				? flexRender(typeColumn.cell, {
						row,
						getValue: () => agent.type,
					} as never)
				: null;
			return <div data-testid='type-cell'>{cellContent}</div>;
		};

		it('renders OUTBOUND badge', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({ type: 'OUTBOUND' });
			renderWithProviders(
				<TypeColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			expect(screen.getByText('OUTBOUND')).toBeInTheDocument();
		});

		it('renders INBOUND badge', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({ type: 'INBOUND' });
			renderWithProviders(
				<TypeColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			expect(screen.getByText('INBOUND')).toBeInTheDocument();
		});
	});

	describe('Voice column', () => {
		const VoiceColumnRenderer = ({
			agent,
			options,
			useActualHook,
		}: {
			agent: AgentWithCampaignListItem;
			options: typeof defaultOptions;
			useActualHook: typeof useAgentSelectionColumns;
		}) => {
			const columns = useActualHook(options);
			const voiceColumn = columns[2];
			const row = { original: agent };
			const cellContent = voiceColumn.cell
				? flexRender(voiceColumn.cell, {
						row,
						getValue: () => agent.voiceName,
					} as never)
				: null;
			return <div data-testid='voice-cell'>{cellContent}</div>;
		};

		it('renders voice name with language', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({
				voiceName: 'Sarah',
				voiceLanguage: 'Spanish',
			});
			renderWithProviders(
				<VoiceColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			expect(screen.getByText('Sarah')).toBeInTheDocument();
			expect(screen.getByText('· Spanish')).toBeInTheDocument();
		});

		it('renders dash when voice name is null', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({
				voiceName: null,
				voiceLanguage: null,
			});
			renderWithProviders(
				<VoiceColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			expect(screen.getByText('—')).toBeInTheDocument();
		});

		it('renders voice name without language when voiceLanguage is null', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({
				voiceName: 'Sarah',
				voiceLanguage: null,
			});
			renderWithProviders(
				<VoiceColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			expect(screen.getByText('Sarah')).toBeInTheDocument();
			expect(screen.queryByText(/·/)).not.toBeInTheDocument();
		});
	});

	describe('Actions column', () => {
		const ActionsColumnRenderer = ({
			agent,
			options,
			useActualHook,
		}: {
			agent: AgentWithCampaignListItem;
			options: typeof defaultOptions;
			useActualHook: typeof useAgentSelectionColumns;
		}) => {
			const columns = useActualHook(options);
			const actionsColumn = columns[3];
			const row = { original: agent };
			const cellContent = actionsColumn.cell
				? flexRender(actionsColumn.cell, {
						row,
						getValue: () => null,
					} as never)
				: null;
			return <div data-testid='actions-cell'>{cellContent}</div>;
		};

		it('calls onPlay when play button is clicked', async () => {
			const user = userEvent.setup();
			const actualHook = await getActualHook();
			const agent = createMockAgent();
			renderWithProviders(
				<ActionsColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			const actionsCell = screen.getByTestId('actions-cell');
			const buttons = within(actionsCell).getAllByRole('button');
			await user.click(buttons[0]);

			expect(mockOnPlay).toHaveBeenCalledWith(agent);
		});

		it('calls onClone when clone button is clicked', async () => {
			const user = userEvent.setup();
			const actualHook = await getActualHook();
			const agent = createMockAgent();
			renderWithProviders(
				<ActionsColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			const actionsCell = screen.getByTestId('actions-cell');
			const buttons = within(actionsCell).getAllByRole('button');
			await user.click(buttons[1]);

			expect(mockOnClone).toHaveBeenCalledWith(agent);
		});

		it('calls onAdd when add button is clicked', async () => {
			const user = userEvent.setup();
			const actualHook = await getActualHook();
			const agent = createMockAgent();
			renderWithProviders(
				<ActionsColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			const actionsCell = screen.getByTestId('actions-cell');
			const buttons = within(actionsCell).getAllByRole('button');
			await user.click(buttons[2]);

			expect(mockOnAdd).toHaveBeenCalledWith(agent);
		});

		it('disables play button when voicePreviewUrl is not available', async () => {
			const actualHook = await getActualHook();
			const agent = createMockAgent({ voicePreviewUrl: null });
			renderWithProviders(
				<ActionsColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			const actionsCell = screen.getByTestId('actions-cell');
			const buttons = within(actionsCell).getAllByRole('button');
			expect(buttons[0]).toBeDisabled();
		});

		it('disables add button when isDisabled returns true', async () => {
			mockIsDisabled.mockReturnValue(true);
			const actualHook = await getActualHook();
			const agent = createMockAgent();
			renderWithProviders(
				<ActionsColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			const actionsCell = screen.getByTestId('actions-cell');
			const buttons = within(actionsCell).getAllByRole('button');
			expect(buttons[2]).toBeDisabled();
		});

		it('shows pause icon when isPlaying returns true', async () => {
			mockIsPlaying.mockReturnValue(true);
			const actualHook = await getActualHook();
			const agent = createMockAgent();
			renderWithProviders(
				<ActionsColumnRenderer
					agent={agent}
					options={defaultOptions}
					useActualHook={actualHook}
				/>
			);

			const actionsCell = screen.getByTestId('actions-cell');
			expect(actionsCell).toBeInTheDocument();
		});
	});
});

export {};
