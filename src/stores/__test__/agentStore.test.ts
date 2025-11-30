import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAgentStore } from '../agentStore';
import type AgentListObject from '~/models/AgentListObject';

describe('useAgentStore', () => {
	beforeEach(() => {
		act(() => {
			useAgentStore.setState({
				selectedElement: null,
				selectedAgent: null,
				agentConfigurationType: 'custom',
			});
		});
	});

	it('should have initial state', () => {
		const state = useAgentStore.getState();
		expect(state.selectedElement).toBeNull();
		expect(state.selectedAgent).toBeNull();
		expect(state.agentConfigurationType).toBe('custom');
	});

	it('should set selected agent', () => {
		const mockAgent = {
			id: 1,
			name: 'Test Agent',
		} as unknown as AgentListObject;
		act(() => {
			useAgentStore.getState().setSelectedAgent(mockAgent);
		});
		expect(useAgentStore.getState().selectedAgent).toEqual(mockAgent);
	});

	it('should set selected element', () => {
		const mockElement = 'Test Element';
		act(() => {
			useAgentStore.getState().setSelectedElement(mockElement);
		});
		expect(useAgentStore.getState().selectedElement).toBe(mockElement);
	});

	it('should set agent configuration type', () => {
		act(() => {
			// @ts-expect-error - setAgentConfigurationType is missing in the interface but present in implementation
			useAgentStore.getState().setAgentConfigurationType('campaign');
		});
		expect(useAgentStore.getState().agentConfigurationType).toBe('campaign');
	});
});
