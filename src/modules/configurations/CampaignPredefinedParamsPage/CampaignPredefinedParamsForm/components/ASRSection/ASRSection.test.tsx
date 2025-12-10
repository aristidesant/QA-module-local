import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ASRSection from './ASRSection';
import CampaignPredefinedFormProvider from '../../CampaignPredefinedFormProvider';

describe('ASRSection', () => {
	const fakeValues: Record<string, any> = {
		asrProvider: 'provider-x',
		asrQuality: 'standard',
		asrUserInputAudioFormat: 'wav',
		asrKeywords: ['hello', 'world'],
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

	it('renders ASR selects and keywords tags input', () => {
		renderWithProviders(
			<CampaignPredefinedFormProvider form={fakeForm} isEditMode={false}>
				<ASRSection />
			</CampaignPredefinedFormProvider>
		);

		expect(screen.getByText('Provider')).toBeInTheDocument();
		expect(screen.getByText('Quality')).toBeInTheDocument();
		expect(screen.getByText('Input Audio Format')).toBeInTheDocument();
		expect(screen.getByText('Keywords')).toBeInTheDocument();
	});
});

export {};
