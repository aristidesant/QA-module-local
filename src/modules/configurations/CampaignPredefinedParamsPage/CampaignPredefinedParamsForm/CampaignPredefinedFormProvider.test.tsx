import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignPredefinedFormProvider, {
	useFormContext,
} from './CampaignPredefinedFormProvider';

describe('CampaignPredefinedFormProvider', () => {
	it('throws when useFormContext is used outside of provider', () => {
		const Consumer = () => {
			useFormContext();
			return <div />;
		};

		expect(() => renderWithProviders(<Consumer />)).toThrow(
			'useFormContext must be used within CampaignPredefinedFormProvider'
		);
	});

	it('provides form and isEditMode to consumers', () => {
		const fakeForm = {
			values: { id: '1', name: 'Test', asrProvider: 'x' },
		} as any;

		const Consumer = () => {
			const { form, isEditMode } = useFormContext();
			return (
				<div>
					<div data-testid='isEditMode'>{String(isEditMode)}</div>
					<div data-testid='name'>{form.values.name}</div>
				</div>
			);
		};

		renderWithProviders(
			<CampaignPredefinedFormProvider form={fakeForm} isEditMode={true}>
				<Consumer />
			</CampaignPredefinedFormProvider>
		);

		expect(screen.getByTestId('isEditMode')).toHaveTextContent('true');
		expect(screen.getByTestId('name')).toHaveTextContent('Test');
	});
});

export {};
