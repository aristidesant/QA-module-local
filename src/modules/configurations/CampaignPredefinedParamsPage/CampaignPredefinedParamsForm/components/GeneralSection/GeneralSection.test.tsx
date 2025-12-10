import { screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import GeneralSection from './GeneralSection';
import CampaignPredefinedFormProvider from '../../CampaignPredefinedFormProvider';

describe('GeneralSection', () => {
	const createForm = () => {
		const form: any = {
			values: { name: 'My Param' },
			getInputProps: (field: string) => ({
				value: form.values[field],
				onChange: (value: any) => (form.values[field] = value),
			}),
		};
		return form as any;
	};

	it('renders input and description for non edit mode', () => {
		const fakeForm = createForm();
		renderWithProviders(
			<CampaignPredefinedFormProvider form={fakeForm} isEditMode={false}>
				<GeneralSection />
			</CampaignPredefinedFormProvider>
		);

		expect(screen.getByText('Parameter Name')).toBeInTheDocument();
		expect(
			screen.getByText('Unique identifier for this configuration')
		).toBeInTheDocument();
	});

	it('renders a different description in edit mode', () => {
		const fakeForm = createForm();
		renderWithProviders(
			<CampaignPredefinedFormProvider form={fakeForm} isEditMode={true}>
				<GeneralSection />
			</CampaignPredefinedFormProvider>
		);

		expect(
			screen.getByText('Changing the name will create a new parameter')
		).toBeInTheDocument();
	});
});

export {};
