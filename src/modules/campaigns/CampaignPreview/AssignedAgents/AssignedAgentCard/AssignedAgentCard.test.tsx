import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import AssignedAgentCard from './AssignedAgentCard';
import type { CampaignAgent } from '~/models/CampaignAgentModel';

describe('AssignedAgentCard', () => {
	it('renders active agent with correct details', () => {
		const mockAgent: CampaignAgent = {
			id: 1,
			campaignId: 1,
			agentId: 'agent-1',
			userId: 1,
			clientId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			agent: {
				id: 'agent-1',
				name: 'Jane Smith',
				config: {} as any,
				type: 'OUTBOUND',
				status: 'ACTIVE',
				clientId: 1,
				userId: 1,
				language: 'es',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
				voiceId: null,
				voice: null,
			},
		};

		renderWithProviders(<AssignedAgentCard agent={mockAgent} />);

		// Name and Active badge
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('Active')).toBeInTheDocument();

		// Language code and corresponding flag emoji
		expect(screen.getByText('ES')).toBeInTheDocument();
		expect(screen.getByText('🇪🇸')).toBeInTheDocument();
	});

	it('renders inactive agent with default flag and inactive badge', () => {
		const mockAgent: CampaignAgent = {
			id: 2,
			campaignId: 1,
			agentId: 'agent-2',
			userId: 1,
			clientId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			agent: {
				id: 'agent-2',
				name: 'John Doe',
				config: {} as any,
				type: 'INBOUND',
				status: 'INACTIVE',
				clientId: 1,
				userId: 1,
				language: 'xx',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
				voiceId: null,
				voice: null,
			},
		};

		renderWithProviders(<AssignedAgentCard agent={mockAgent} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Inactive')).toBeInTheDocument();

		// Unknown language code falls back to globe emoji
		expect(screen.getByText('XX')).toBeInTheDocument();
		expect(screen.getByText('🌐')).toBeInTheDocument();
	});
});

export {};
