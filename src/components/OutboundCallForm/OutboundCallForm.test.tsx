import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Notifications } from '@mantine/notifications';
import { OutboundCallForm } from './OutboundCallForm';
import type AgentListObject from '~/models/AgentListObject';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock notifications
vi.mock('@mantine/notifications', async () => {
	const actual = await vi.importActual('@mantine/notifications');
	return {
		...actual,
		notifications: {
			show: vi.fn(),
		},
	};
});

// Mock useStartDemoConversation
const mockMutateAsync = vi.fn();
const mockIsPending = vi.fn();
vi.mock('~/queries/conversationsQueries', () => ({
	useStartDemoConversation: () => ({
		mutateAsync: mockMutateAsync,
		isPending: mockIsPending(),
	}),
}));

const mockAgent: AgentListObject = {
	id: 'agent-123',
	name: 'Test Agent',
	config: {} as unknown as AgentListObject['config'],
	type: 'OUTBOUND',
	status: 'ACTIVE',
	clientId: 1,
	userId: 1,
	language: 'en',
	createdAt: '2024-01-01',
	updatedAt: '2024-01-01',
	deletedAt: null,
	voiceId: null,
	voice: null,
};

const renderForm = (
	props?: Partial<React.ComponentProps<typeof OutboundCallForm>>
) => {
	const defaultProps = {
		agent: mockAgent,
		onSuccess: vi.fn(),
		onClose: vi.fn(),
	};

	return renderWithProviders(
		<>
			<Notifications />
			<OutboundCallForm {...defaultProps} {...props} />
		</>
	);
};

describe('OutboundCallForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsPending.mockReturnValue(false);
	});

	describe('Rendering', () => {
		it('renders the form with title', () => {
			renderForm();

			expect(screen.getByText('Agent Call')).toBeInTheDocument();
		});

		it('renders description text', () => {
			renderForm();

			expect(
				screen.getByText(/Experience a live call from your AI agent/i)
			).toBeInTheDocument();
		});

		it('renders phone number input', () => {
			renderForm();

			expect(screen.getByPlaceholderText('+18093336600')).toBeInTheDocument();
		});

		it('renders customer name input', () => {
			renderForm();

			expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
		});

		it('renders customer id input', () => {
			renderForm();

			expect(screen.getByLabelText(/customer id/i)).toBeInTheDocument();
		});

		it('renders submit button', () => {
			renderForm();

			expect(
				screen.getByRole('button', { name: /request demo call/i })
			).toBeInTheDocument();
		});

		it('renders cancel button', () => {
			renderForm();

			expect(
				screen.getByRole('button', { name: /cancel/i })
			).toBeInTheDocument();
		});
	});

	describe('Form Validation', () => {
		it('submit button is disabled when form is empty', () => {
			renderForm();

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			expect(submitButton).toBeDisabled();
		});

		it('validates phone number format - requires +1 prefix', async () => {
			renderForm();
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			await user.type(phoneInput, '8093336600');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			expect(submitButton).toBeDisabled();
		});

		it('validates phone number format - accepts valid Dominican numbers', async () => {
			renderForm();
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18093336600');
			await user.type(customerName, 'John Doe');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			expect(submitButton).not.toBeDisabled();
		});

		it('validates phone number - accepts 829 area code', async () => {
			renderForm();
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18291234567');
			await user.type(customerName, 'John Doe');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			expect(submitButton).not.toBeDisabled();
		});

		it('validates phone number - accepts 849 area code', async () => {
			renderForm();
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18491234567');
			await user.type(customerName, 'John Doe');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			expect(submitButton).not.toBeDisabled();
		});

		it('requires customer name', async () => {
			renderForm();
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18093336600');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			expect(submitButton).toBeDisabled();
		});

		it('requires customer id', async () => {
			renderForm();
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);

			await user.type(phoneInput, '+18093336600');
			await user.type(customerName, 'John Doe');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			expect(submitButton).toBeDisabled();
		});
	});

	describe('Form Submission', () => {
		it('calls mutation on valid submission', async () => {
			const onSuccess = vi.fn();
			mockMutateAsync.mockResolvedValue({});

			renderForm({ onSuccess });
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18093336600');
			await user.type(customerName, 'John Doe');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith({
					agentId: 'agent-123',
					phoneNumber: '+18093336600',
					dynamicVariables: {
						customerName: 'John Doe',
						customerId: '12345',
					},
				});
			});
		});

		it('calls onSuccess after successful submission', async () => {
			const onSuccess = vi.fn();
			mockMutateAsync.mockResolvedValue({});

			renderForm({ onSuccess });
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18093336600');
			await user.type(customerName, 'John Doe');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalled();
			});
		});

		it('includes campaignId when provided', async () => {
			const onSuccess = vi.fn();
			mockMutateAsync.mockResolvedValue({});

			renderForm({ onSuccess, campaignId: 456 });
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18093336600');
			await user.type(customerName, 'John Doe');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith(
					expect.objectContaining({
						campaignId: 456,
					})
				);
			});
		});
	});

	describe('Loading State', () => {
		it('shows loading state when submitting', () => {
			mockIsPending.mockReturnValue(true);
			renderForm();

			const submitButton = screen.getByRole('button', { name: /calling/i });
			expect(submitButton).toBeDisabled();
		});

		it('disables submit button when loading prop is true', () => {
			renderForm({ loading: true });

			const submitButton = screen.getByRole('button', { name: /calling/i });
			expect(submitButton).toBeDisabled();
		});
	});

	describe('Cancel Action', () => {
		it('calls onClose when cancel is clicked', async () => {
			const onClose = vi.fn();
			renderForm({ onClose });
			const user = userEvent.setup();

			const cancelButton = screen.getByRole('button', { name: /cancel/i });
			await user.click(cancelButton);

			expect(onClose).toHaveBeenCalled();
		});
	});

	describe('Error Handling', () => {
		it('handles mutation error gracefully', async () => {
			const consoleError = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			mockMutateAsync.mockRejectedValue(new Error('API Error'));

			renderForm();
			const user = userEvent.setup();

			const phoneInput = screen.getByPlaceholderText('+18093336600');
			const customerName = screen.getByLabelText(/customer name/i);
			const customerId = screen.getByLabelText(/customer id/i);

			await user.type(phoneInput, '+18093336600');
			await user.type(customerName, 'John Doe');
			await user.type(customerId, '12345');

			const submitButton = screen.getByRole('button', {
				name: /request demo call/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(consoleError).toHaveBeenCalledWith(
					'Error starting demo conversation:',
					expect.any(Error)
				);
			});

			consoleError.mockRestore();
		});
	});
});
