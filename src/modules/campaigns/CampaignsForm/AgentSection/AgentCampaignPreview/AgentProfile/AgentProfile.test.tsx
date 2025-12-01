import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AgentProfile from './AgentProfile';
import type AgentListObject from '~/models/AgentListObject';

const createAgent = (
	overrides: Partial<AgentListObject> = {}
): AgentListObject =>
	({
		id: 'agent-1',
		name: 'Jane Doe',
		config: {
			conversationConfig: {
				agent: { language: 'es' },
			},
		} as any,
		type: 'OUTBOUND',
		status: 'ACTIVE',
		clientId: 1,
		userId: 1,
		language: 'es',
		createdAt: '',
		updatedAt: '',
		deletedAt: null,
		voiceId: 'voice-1',
		voice: {
			id: 'voice-1',
			name: 'Sofia',
			gender: 'FEMALE',
			description: '',
			language: 'Spanish',
			age: '30',
			previewUrl: '',
			status: 'active',
			userId: 1,
			createdAt: '',
			updatedAt: '',
			deletedAt: null,
		} as any,
		...overrides,
	}) as AgentListObject;

describe('AgentProfile', () => {
	it('renders agent details and marks online status', () => {
		renderWithProviders(<AgentProfile agent={createAgent()} size='lg' />);

		expect(screen.getByText('JD')).toBeInTheDocument();
		expect(screen.getByText('Jane Doe')).toBeVisible();
		expect(screen.getByLabelText('Online')).toBeInTheDocument();
		expect(screen.getByText(/Spanish/i)).toBeVisible();
		expect(screen.getByText('🇩🇴')).toBeInTheDocument();
	});

	it('falls back to defaults and handles click events', async () => {
		const handleClick = vi.fn();

		renderWithProviders(<AgentProfile onClick={handleClick} />);

		await userEvent.click(screen.getByText(/Unnamed agent/i));

		expect(screen.getByLabelText('Offline')).toBeInTheDocument();
		expect(screen.getByText('A')).toBeInTheDocument();
		expect(handleClick).toHaveBeenCalled();
	});
});
