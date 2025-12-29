import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CampaignConfigurationBasic from './CampaignConfigurationBasic';
import renderWithProviders from '~/test-utils/renderWithProviders';

const mockSetFieldValue = vi.fn();
const mockFormValues = {
	agentConfig: {
		conversationConfig: {
			agent: { language: 'en', firstMessage: 'Hello' },
		},
	},
};

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: mockFormValues,
		setFieldValue: mockSetFieldValue,
	}),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Select: ({
			label,
			value,
			onChange,
		}: {
			label: string;
			value?: string;
			onChange: (val: string | null) => void;
		}) => (
			<label>
				{label}
				<select
					value={value}
					onChange={(event) => onChange(event.currentTarget.value)}
				>
					<option value='en'>English</option>
					<option value='es'>Spanish</option>
				</select>
			</label>
		),
		Textarea: ({
			label,
			value,
			onChange,
		}: {
			label: string;
			value?: string;
			onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
		}) => (
			<label>
				{label}
				<textarea value={value} onChange={onChange} />
			</label>
		),
	};
});

vi.mock('~/components/SectionCard', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe('CampaignConfigurationBasic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates language when a new option is selected', () => {
		renderWithProviders(<CampaignConfigurationBasic />);

		fireEvent.change(screen.getByLabelText('Language'), {
			target: { value: 'es' },
		});

		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig.conversationConfig.agent.language',
			'es'
		);
	});

	it('updates first message when textarea changes', () => {
		renderWithProviders(<CampaignConfigurationBasic />);

		fireEvent.change(screen.getByLabelText('Agent First Message'), {
			target: { value: 'New message' },
		});

		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig.conversationConfig.agent.firstMessage',
			'New message'
		);
	});
});
