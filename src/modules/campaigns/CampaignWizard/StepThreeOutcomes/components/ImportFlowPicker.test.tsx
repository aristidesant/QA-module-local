import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ImportFlowPicker } from './ImportFlowPicker';
import type { CampaignWithDispositionFlow } from '~/api/dispositionFlowApi';

const campaigns: CampaignWithDispositionFlow[] = [
	{
		id: 10,
		name: 'Campaign with Flow',
		description: '',
		status: 'ACTIVE',
		clientId: 1,
		userId: 1,
		flowId: 50,
		dispositionFlow: {
			id: 50,
			name: 'Flow',
			description: '',
			campaignId: 10,
			isActive: true,
			createdAt: '',
			updatedAt: '',
		},
		dispositionCatalog: null,
		createdAt: '',
		updatedAt: '',
	},
];

describe('ImportFlowPicker', () => {
	it('renders and calls callbacks', () => {
		const onSearchQueryChange = vi.fn();
		const onRefresh = vi.fn();
		const onPreview = vi.fn();
		const onUseFlow = vi.fn();

		renderWithProviders(
			<ImportFlowPicker
				campaignsWithFlows={campaigns}
				isLoading={false}
				isFetching={false}
				searchQuery=''
				onSearchQueryChange={onSearchQueryChange}
				onRefresh={onRefresh}
				copyingFlowId={null}
				onPreview={onPreview}
				onUseFlow={onUseFlow}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText('Search campaigns...'), {
			target: { value: 'abc' },
		});
		expect(onSearchQueryChange).toHaveBeenCalledWith('abc');

		fireEvent.click(screen.getByText('Refresh'));
		expect(onRefresh).toHaveBeenCalled();

		fireEvent.click(screen.getByLabelText('Preview flow'));
		expect(onPreview).toHaveBeenCalledWith(50, 'Campaign with Flow');

		fireEvent.click(screen.getByText('Use flow'));
		expect(onUseFlow).toHaveBeenCalledWith(50, 'Campaign with Flow');
	});
});
