import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { TranscriptEntry } from '~/models/ConversationsModels';
import TranscriptViewer from './TranscriptViewer';

// Mock usePermissions hook
vi.mock('~/hooks/usePermissions', () => ({
	usePermissions: vi.fn(() => ({
		canPerformAction: vi.fn(() => false),
	})),
}));

// Import the mocked function for configuration in tests
import { usePermissions } from '~/hooks/usePermissions';
const mockedUsePermissions = vi.mocked(usePermissions);

const createMockTranscriptEntry = (
	overrides: Partial<TranscriptEntry> = {}
): TranscriptEntry => ({
	role: 'user',
	message: 'Hello, how can I help you?',
	feedback: null,
	llm_usage: null,
	tool_calls: [],
	interrupted: false,
	llm_override: null,
	tool_results: [],
	source_medium: null,
	original_message: null,
	time_in_call_secs: 10,
	multivoice_message: null,
	rag_retrieval_info: null,
	conversation_turn_metrics: null,
	...overrides,
});

describe('TranscriptViewer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default: no MANAGE permission
		mockedUsePermissions.mockReturnValue({
			canPerformAction: vi.fn(() => false),
			canAccessModule: vi.fn(() => false),
			hasAnyPermission: vi.fn(() => false),
			hasAllPermissions: vi.fn(() => false),
			activeClientId: 1,
			permissionMap: {},
		});
	});

	describe('Empty state', () => {
		it('renders empty state when transcript is empty', () => {
			renderWithProviders(<TranscriptViewer transcript={[]} />);

			expect(
				screen.getByText('No transcript entries available')
			).toBeInTheDocument();
			expect(
				screen.getByText('Conversation data will appear here once available')
			).toBeInTheDocument();
		});

		it('renders empty state when transcript is undefined', () => {
			renderWithProviders(
				<TranscriptViewer
					transcript={undefined as unknown as TranscriptEntry[]}
				/>
			);

			expect(
				screen.getByText('No transcript entries available')
			).toBeInTheDocument();
		});

		it('filters out entries with no message and no tool calls', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'agent',
					message: null,
					tool_calls: [],
				}),
				createMockTranscriptEntry({
					role: 'user',
					message: 'Valid message',
				}),
				createMockTranscriptEntry({
					role: 'agent',
					message: '',
					tool_calls: [],
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			// Should only show the valid message
			expect(screen.getByText('Valid message')).toBeInTheDocument();
			expect(screen.getByText('User')).toBeInTheDocument();
			// Should not show Agent entries since they have no message/tool calls
			expect(screen.queryByText('Agent')).not.toBeInTheDocument();
		});

		it('shows entries with tool calls even if message is empty', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			const transcript = [
				createMockTranscriptEntry({
					role: 'agent',
					message: null,
					tool_calls: [
						{
							type: 'webhook',
							tool_name: 'test_tool',
							request_id: 'req-123',
							tool_details: null,
							params_as_json: '{}',
							tool_has_been_called: true,
						},
					],
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			// Should show the entry because it has tool calls
			expect(screen.getByText('Agent')).toBeInTheDocument();
			expect(screen.getByText('Tool calls:')).toBeInTheDocument();
			expect(screen.getByText('test_tool')).toBeInTheDocument();
		});
	});

	describe('User messages', () => {
		it('renders user message correctly', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'user',
					message: 'This is a user message',
					time_in_call_secs: 30,
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getByText('User')).toBeInTheDocument();
			expect(screen.getByText('This is a user message')).toBeInTheDocument();
			expect(screen.getByText('0:30')).toBeInTheDocument();
		});

		it('renders human role as user', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'human',
					message: 'Human message',
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getByText('User')).toBeInTheDocument();
			expect(screen.getByText('Human message')).toBeInTheDocument();
		});
	});

	describe('Agent messages', () => {
		it('renders agent message correctly', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'agent',
					message: 'This is an agent response',
					time_in_call_secs: 45,
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getByText('Agent')).toBeInTheDocument();
			expect(screen.getByText('This is an agent response')).toBeInTheDocument();
			expect(screen.getByText('0:45')).toBeInTheDocument();
		});

		it('renders interrupted indicator when message is interrupted', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'agent',
					message: 'Interrupted message',
					interrupted: true,
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getByText('Interrupted')).toBeInTheDocument();
		});
	});

	describe('System messages', () => {
		it('renders system message centered', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'system',
					message: 'Call started',
					time_in_call_secs: 0,
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getByText('Call started')).toBeInTheDocument();
			expect(screen.getByText('• 0:00')).toBeInTheDocument();
		});
	});

	describe('Time formatting', () => {
		it('formats time correctly for seconds less than 60', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'user',
					message: 'Test',
					time_in_call_secs: 45,
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getByText('0:45')).toBeInTheDocument();
		});

		it('formats time correctly for minutes and seconds', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'user',
					message: 'Test',
					time_in_call_secs: 125,
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getByText('2:05')).toBeInTheDocument();
		});
	});

	describe('Tool calls (permission-based)', () => {
		const transcriptWithToolCalls = [
			createMockTranscriptEntry({
				role: 'agent',
				message: 'Let me check that for you',
				tool_calls: [
					{
						type: 'webhook',
						tool_name: 'get_customer_info',
						request_id: 'req-123',
						tool_details: null,
						params_as_json: '{"customer_id": "12345"}',
						tool_has_been_called: true,
					},
				],
			}),
		];

		it('does NOT show tool calls when user lacks MANAGE permission', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => false),
				canAccessModule: vi.fn(() => false),
				hasAnyPermission: vi.fn(() => false),
				hasAllPermissions: vi.fn(() => false),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithToolCalls} />
			);

			expect(screen.queryByText('Tool calls:')).not.toBeInTheDocument();
			expect(screen.queryByText('get_customer_info')).not.toBeInTheDocument();
		});

		it('shows tool calls when user has MANAGE permission on SETTINGS', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithToolCalls} />
			);

			expect(screen.getByText('Tool calls:')).toBeInTheDocument();
			expect(screen.getByText('get_customer_info')).toBeInTheDocument();
		});

		it('shows tool details popover when clicking on tool badge', async () => {
			const user = userEvent.setup();

			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithToolCalls} />
			);

			const toolBadge = screen.getByText('get_customer_info');
			await user.click(toolBadge);

			// Popover should show tool details
			await waitFor(() => {
				expect(screen.getByText('Tool Name')).toBeInTheDocument();
			});
			expect(screen.getByText('Called')).toBeInTheDocument();
			expect(screen.getByText('Parameters')).toBeInTheDocument();
			expect(screen.getByText('Request ID')).toBeInTheDocument();
			expect(screen.getByText('req-123')).toBeInTheDocument();
		});

		it('shows "Pending" status for tools not yet called', async () => {
			const user = userEvent.setup();

			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			const transcriptWithPendingTool = [
				createMockTranscriptEntry({
					role: 'agent',
					message: 'Processing...',
					tool_calls: [
						{
							type: 'webhook',
							tool_name: 'pending_tool',
							request_id: 'req-456',
							tool_details: null,
							params_as_json: '{}',
							tool_has_been_called: false,
						},
					],
				}),
			];

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithPendingTool} />
			);

			await user.click(screen.getByText('pending_tool'));

			await waitFor(() => {
				expect(screen.getByText('Pending')).toBeInTheDocument();
			});
		});

		it('renders multiple tool calls correctly', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			const transcriptWithMultipleTools = [
				createMockTranscriptEntry({
					role: 'agent',
					message: 'Checking multiple systems',
					tool_calls: [
						{
							type: 'webhook',
							tool_name: 'tool_one',
							request_id: 'req-1',
							tool_details: null,
							params_as_json: '{}',
							tool_has_been_called: true,
						},
						{
							type: 'webhook',
							tool_name: 'tool_two',
							request_id: 'req-2',
							tool_details: null,
							params_as_json: '{}',
							tool_has_been_called: false,
						},
					],
				}),
			];

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithMultipleTools} />
			);

			expect(screen.getByText('tool_one')).toBeInTheDocument();
			expect(screen.getByText('tool_two')).toBeInTheDocument();
		});

		it('does NOT show tool calls section for user messages', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			const transcriptWithUserToolCalls = [
				createMockTranscriptEntry({
					role: 'user',
					message: 'User message',
					tool_calls: [
						{
							type: 'webhook',
							tool_name: 'should_not_show',
							request_id: 'req-xxx',
							tool_details: null,
							params_as_json: '{}',
							tool_has_been_called: true,
						},
					],
				}),
			];

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithUserToolCalls} />
			);

			expect(screen.queryByText('Tool calls:')).not.toBeInTheDocument();
			expect(screen.queryByText('should_not_show')).not.toBeInTheDocument();
		});
	});

	describe('Multiple messages', () => {
		it('renders conversation with multiple entries', () => {
			const transcript = [
				createMockTranscriptEntry({
					role: 'user',
					message: 'Hello agent',
					time_in_call_secs: 5,
				}),
				createMockTranscriptEntry({
					role: 'agent',
					message: 'Hello! How can I help?',
					time_in_call_secs: 8,
				}),
				createMockTranscriptEntry({
					role: 'user',
					message: 'I have a question',
					time_in_call_secs: 12,
				}),
			];

			renderWithProviders(<TranscriptViewer transcript={transcript} />);

			expect(screen.getAllByText('User')).toHaveLength(2);
			expect(screen.getByText('Agent')).toBeInTheDocument();
			expect(screen.getByText('Hello agent')).toBeInTheDocument();
			expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
			expect(screen.getByText('I have a question')).toBeInTheDocument();
		});
	});

	describe('Technical details (permission-based)', () => {
		const transcriptWithLlmUsage = [
			createMockTranscriptEntry({
				role: 'agent',
				message: 'Let me help you with that',
				llm_usage: {
					model_usage: {
						'gpt-4': {
							input: { price: 0.001, tokens: 100 },
							output_total: { price: 0.002, tokens: 50 },
							input_cache_read: { price: 0, tokens: 0 },
							input_cache_write: { price: 0, tokens: 0 },
						},
					},
				},
			}),
		];

		const transcriptWithAgentMetadata = [
			createMockTranscriptEntry({
				role: 'agent',
				message: 'Processing your request',
				agent_metadata: {
					agent_id: 'agent-123',
					branch_id: 'branch-456',
					workflow_node_id: 'node-789',
				},
			}),
		];

		const transcriptWithSourceMedium = [
			createMockTranscriptEntry({
				role: 'agent',
				message: 'Hello from voice',
				source_medium: 'voice',
			}),
		];

		it('does NOT show technical details when user lacks MANAGE permission', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => false),
				canAccessModule: vi.fn(() => false),
				hasAnyPermission: vi.fn(() => false),
				hasAllPermissions: vi.fn(() => false),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithLlmUsage} />
			);

			expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
		});

		it('shows technical details header when user has MANAGE permission and data exists', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithLlmUsage} />
			);

			expect(screen.getByText('Technical Details')).toBeInTheDocument();
		});

		it('shows LLM cost badge in technical details header', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithLlmUsage} />
			);

			expect(screen.getByText('$0.0030')).toBeInTheDocument();
		});

		it('shows technical details on hover', async () => {
			const user = userEvent.setup();

			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithLlmUsage} />
			);

			const detailsHeader = screen.getByText('Technical Details');
			await user.hover(detailsHeader);

			await waitFor(() => {
				expect(screen.getByText('LLM Usage')).toBeInTheDocument();
			});
			expect(screen.getByText('gpt-4')).toBeInTheDocument();
			expect(screen.getByText('Input Tokens')).toBeInTheDocument();
		});

		it('shows agent metadata on hover', async () => {
			const user = userEvent.setup();

			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithAgentMetadata} />
			);

			await user.hover(screen.getByText('Technical Details'));

			await waitFor(() => {
				expect(screen.getByText('Agent Metadata')).toBeInTheDocument();
			});
			expect(screen.getByText('agent-123')).toBeInTheDocument();
			expect(screen.getByText('branch-456')).toBeInTheDocument();
			expect(screen.getByText('node-789')).toBeInTheDocument();
		});

		it('shows source medium on hover', async () => {
			const user = userEvent.setup();

			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithSourceMedium} />
			);

			await user.hover(screen.getByText('Technical Details'));

			await waitFor(() => {
				expect(screen.getByText('Source Medium')).toBeInTheDocument();
			});
			expect(screen.getByText('voice')).toBeInTheDocument();
		});

		it('does NOT show technical details for user messages', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			const transcriptWithUserLlm = [
				createMockTranscriptEntry({
					role: 'user',
					message: 'User message',
					llm_usage: {
						model_usage: {
							'gpt-4': {
								input: { price: 0.001, tokens: 100 },
								output_total: { price: 0.002, tokens: 50 },
								input_cache_read: { price: 0, tokens: 0 },
								input_cache_write: { price: 0, tokens: 0 },
							},
						},
					},
				}),
			];

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithUserLlm} />
			);

			expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
		});

		it('does NOT show technical details when no technical data exists', () => {
			mockedUsePermissions.mockReturnValue({
				canPerformAction: vi.fn(() => true),
				canAccessModule: vi.fn(() => true),
				hasAnyPermission: vi.fn(() => true),
				hasAllPermissions: vi.fn(() => true),
				activeClientId: 1,
				permissionMap: {},
			});

			const transcriptWithoutTechnicalData = [
				createMockTranscriptEntry({
					role: 'agent',
					message: 'Simple agent message',
					llm_usage: null,
					source_medium: null,
					agent_metadata: undefined,
				}),
			];

			renderWithProviders(
				<TranscriptViewer transcript={transcriptWithoutTechnicalData} />
			);

			expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
		});
	});
});
