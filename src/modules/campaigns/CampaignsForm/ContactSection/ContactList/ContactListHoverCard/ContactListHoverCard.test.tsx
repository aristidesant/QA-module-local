import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ContactListHoverCard } from './ContactListHoverCard';
import type ContactGroup from '~/models/ContactGroup';

const mockContactGroup: ContactGroup = {
	id: 1,
	name: 'Test Contact Group',
	description: 'This is a test description',
	campaignId: 1,
	createdAt: '2023-01-01T00:00:00Z',
	scheduleId: 1,
	queueStatus: 'Active',
	isActive: true,
	currentWave: 2,
	maxWaves: 5,
	lastWaveStartedAt: null,
	lastWaveCompletedAt: null,
	contactCount: 100,
	expirationDate: '2023-12-31T00:00:00Z',
	maxCallsPerContact: 3,
	maxCallsPerList: 10,
	humanEquivalent: 1,
};

describe('ContactListHoverCard', () => {
	it('renders the info icon', () => {
		renderWithProviders(
			<ContactListHoverCard contactGroup={mockContactGroup} />
		);

		// Check that the IconInfoCircle is rendered
		const icon = document.querySelector('.tabler-icon-info-circle');
		expect(icon).toBeInTheDocument();
	});

	it('renders without crashing with valid props', () => {
		expect(() =>
			renderWithProviders(
				<ContactListHoverCard contactGroup={mockContactGroup} />
			)
		).not.toThrow();
	});

	it('renders without crashing when description is undefined', () => {
		const noDescGroup = { ...mockContactGroup, description: undefined };
		expect(() =>
			renderWithProviders(<ContactListHoverCard contactGroup={noDescGroup} />)
		).not.toThrow();
	});

	it('renders without crashing when maxWaves is undefined', () => {
		const noWavesGroup = { ...mockContactGroup, maxWaves: undefined };
		expect(() =>
			renderWithProviders(<ContactListHoverCard contactGroup={noWavesGroup} />)
		).not.toThrow();
	});

	it('renders without crashing when isActive is false', () => {
		const inactiveGroup = { ...mockContactGroup, isActive: false };
		expect(() =>
			renderWithProviders(<ContactListHoverCard contactGroup={inactiveGroup} />)
		).not.toThrow();
	});
});
