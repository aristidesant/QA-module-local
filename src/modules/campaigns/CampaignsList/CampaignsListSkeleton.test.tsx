import {} from /* render */ '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignsListSkeleton from './CampaignsListSkeleton';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('CampaignsListSkeleton', () => {
	it('renders correctly', () => {
		const { container } = renderWithProviders(<CampaignsListSkeleton />);
		// Check if table is rendered
		expect(container.querySelector('table')).toBeInTheDocument();
		// Check if 5 rows are rendered (plus header)
		expect(container.querySelectorAll('tr')).toHaveLength(6);
	});
});
