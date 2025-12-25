import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignConfigurationTools from './CampaignConfigurationTools';
import renderWithProviders from '~/test-utils/renderWithProviders';

const mockSetFieldValue = vi.fn();
const mockUseToolCategories = vi.fn();
const mockUseToolsByCategory = vi.fn();

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: {
			agentConfig: {
				conversationConfig: { agent: { prompt: { toolIds: [] } } },
			},
		},
		setFieldValue: mockSetFieldValue,
	}),
}));

vi.mock('~/queries/toolCategoryQueries', () => ({
	useToolCategories: (...args: any[]) => mockUseToolCategories(...args),
}));

vi.mock('~/queries/toolQueries', () => ({
	useToolsByCategory: (...args: any[]) => mockUseToolsByCategory(...args),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Switch: ({
			checked,
			onChange,
			'aria-label': ariaLabel,
		}: {
			checked?: boolean;
			onChange?: () => void;
			'aria-label'?: string;
		}) => (
			<button
				role='switch'
				aria-label={ariaLabel}
				aria-checked={checked}
				onClick={onChange}
			>
				switch
			</button>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Text: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Stack: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

vi.mock('~/components/SectionCard', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe('CampaignConfigurationTools', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders empty state when no tools are available', () => {
		mockUseToolCategories.mockReturnValue({ data: [] });
		mockUseToolsByCategory.mockReturnValue({ data: [] });

		renderWithProviders(<CampaignConfigurationTools />);

		expect(screen.getByText('No agent tools configured.')).toBeVisible();
	});

	it('toggles tool selection and updates form values', () => {
		mockUseToolCategories.mockReturnValue({
			data: [{ id: 1, name: 'webhook' }],
		});
		mockUseToolsByCategory.mockReturnValue({
			data: [{ identifier: 'tool-1', name: 'Webhook Tool', description: '' }],
		});

		renderWithProviders(<CampaignConfigurationTools />);

		fireEvent.click(screen.getByRole('switch', { name: /Webhook Tool/i }));

		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig',
			expect.objectContaining({
				conversationConfig: expect.objectContaining({
					agent: expect.objectContaining({
						prompt: expect.objectContaining({
							toolIds: expect.arrayContaining(['tool-1']),
						}),
					}),
				}),
			})
		);
	});
});
