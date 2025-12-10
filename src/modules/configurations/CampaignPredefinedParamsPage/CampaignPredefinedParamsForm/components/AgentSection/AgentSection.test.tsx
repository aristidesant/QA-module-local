import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AgentSection from './AgentSection';
import CampaignPredefinedFormProvider from '../../CampaignPredefinedFormProvider';

describe('AgentSection', () => {
	const fakeValues: Record<string, any> = {
		agentPromptLlm: 'gpt-4',
		agentPromptTemperature: 0.7,
	};

	const fakeForm = {
		values: fakeValues,
		getInputProps: (field: string) => ({
			value: (fakeValues as any)[field],
			onChange: (v: any) => ((fakeValues as any)[field] = v),
		}),
		setFieldValue: (name: string, value: any) =>
			((fakeValues as any)[name] = value),
	} as any;

	it('renders LLM select and temperature slider label/value', () => {
		renderWithProviders(
			<CampaignPredefinedFormProvider form={fakeForm} isEditMode={false}>
				<AgentSection />
			</CampaignPredefinedFormProvider>
		);

		expect(screen.getByText('LLM Model')).toBeInTheDocument();
		expect(screen.getByText('Temperature')).toBeInTheDocument();
		expect(
			screen.getByText(fakeValues.agentPromptTemperature.toFixed(2))
		).toBeInTheDocument();
	});
});

export {};
