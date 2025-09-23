import { create } from 'zustand';
import type { ClientModel } from '~/models/ClientModel';

export interface ClientStoreState {
	selectedClient: ClientModel | null;
	searchQuery: string;
	setSelectedClient: (client: ClientModel | null) => void;
	setSearchQuery: (query: string) => void;
}

export const useClientStore = create<ClientStoreState>((set) => ({
	selectedClient: null,
	searchQuery: '',
	setSelectedClient: (client) => set({ selectedClient: client }),
	setSearchQuery: (query) => set({ searchQuery: query }),
}));
