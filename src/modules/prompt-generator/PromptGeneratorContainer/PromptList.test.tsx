import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PromptList } from './PromptList';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock react-router's useFetcher
vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useFetcher: vi.fn(),
	};
});

const { useFetcher } = await import('react-router');

describe('PromptList', () => {
	const mockUseFetcher = vi.mocked(useFetcher);

	beforeEach(() => {
		mockUseFetcher.mockReturnValue({
			state: 'idle',
			Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
		} as any);
	});

	it('renders title and no prompts message when prompts array is empty', () => {
		renderWithProviders(<PromptList prompts={[]} />);

		expect(screen.getByText('Saved Prompts')).toBeInTheDocument();
		expect(screen.getByText('No prompts found.')).toBeInTheDocument();
	});

	it('renders list of prompts with context, toneStyle, and status', () => {
		const prompts = [
			{ id: 1, context: 'Test context', toneStyle: 'Formal', status: 'Active' },
			{
				id: 2,
				productDescription: 'Test product',
				toneStyle: 'Casual',
				status: 'Draft',
			},
		];

		renderWithProviders(<PromptList prompts={prompts} />);

		expect(screen.getByText('Saved Prompts')).toBeInTheDocument();
		expect(screen.getByText('Test context')).toBeInTheDocument();
		expect(screen.getByText('Formal | Active')).toBeInTheDocument();
		expect(screen.getByText('Test product')).toBeInTheDocument();
		expect(screen.getByText('Casual | Draft')).toBeInTheDocument();
	});

	it('renders delete button for each prompt with hidden inputs', () => {
		const prompts = [
			{ id: 1, context: 'Test', toneStyle: 'Formal', status: 'Active' },
		];

		renderWithProviders(<PromptList prompts={prompts} />);

		const deleteButton = screen.getByRole('button', { name: /delete/i });
		expect(deleteButton).toBeInTheDocument();

		// Check hidden inputs are present
		const form = deleteButton.closest('form');
		expect(form).toBeInTheDocument();
		expect(
			form?.querySelector('input[name="intent"][value="delete"]')
		).toBeInTheDocument();
		expect(
			form?.querySelector('input[name="id"][value="1"]')
		).toBeInTheDocument();
	});

	it('shows loading state on delete button when fetcher is submitting', () => {
		mockUseFetcher.mockReturnValue({
			state: 'submitting',
			Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
		} as any);

		const prompts = [
			{ id: 1, context: 'Test', toneStyle: 'Formal', status: 'Active' },
		];

		renderWithProviders(<PromptList prompts={prompts} />);

		const deleteButton = screen.getByRole('button', { name: /delete/i });
		expect(deleteButton).toHaveAttribute('data-loading', 'true');
	});
});
