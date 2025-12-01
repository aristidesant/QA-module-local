import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignConfigurationTemperatureControl from './CampaignConfigurationTemperatureControl';

const mockSetFieldValue = vi.fn();

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: {
			agentConfig: {
				conversationConfig: { agent: { prompt: { temperature: 0.5 } } },
			},
		},
		setFieldValue: mockSetFieldValue,
	}),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Slider: ({
			value,
			onChange,
		}: {
			value: number;
			onChange: (val: number) => void;
		}) => (
			<input
				type='range'
				aria-label='temperature-slider'
				value={value}
				onChange={(event) => onChange(Number(event.currentTarget.value))}
			/>
		),
		Button: ({
			children,
			onClick,
			variant,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
			variant?: string;
		}) => (
			<button data-variant={variant} onClick={onClick}>
				{children}
			</button>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Text: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

vi.mock('~/components/SectionCard', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe('CampaignConfigurationTemperatureControl', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates form value when slider changes', () => {
		render(<CampaignConfigurationTemperatureControl />);

		fireEvent.change(screen.getByLabelText('temperature-slider'), {
			target: { value: '1' },
		});

		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig.conversationConfig.agent.prompt.temperature',
			1
		);
	});

	it('applies preset buttons', () => {
		render(<CampaignConfigurationTemperatureControl />);

		fireEvent.click(screen.getByText(/Deterministic/i));
		expect(mockSetFieldValue).toHaveBeenCalledWith(
			'agentConfig.conversationConfig.agent.prompt.temperature',
			0
		);
	});
});
