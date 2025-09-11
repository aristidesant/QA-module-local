import { create } from 'zustand';
import type { ReactNode } from 'react';
import AgentListObject from '~/models/AgentListObject';

export interface AgentStoreState {
	selectedElement: ReactNode | null;
	selectedAgent: AgentListObject | null;
	setSelectedAgent: (agent: AgentListObject | null) => void;
	setSelectedElement: (element: ReactNode | null) => void;
	agentConfigurationType?: 'custom' | 'campaign';
}

export const useAgentStore = create<AgentStoreState>((set) => ({
	selectedElement: null,
	selectedAgent: null,
	setSelectedAgent: (agent) => set({ selectedAgent: agent }),
	setSelectedElement: (element) => set({ selectedElement: element }),
	agentConfigurationType: 'custom',
	setAgentConfigurationType: (type: 'custom' | 'campaign') =>
		set({ agentConfigurationType: type }),
}));
