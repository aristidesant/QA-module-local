import { create } from 'zustand';

interface ContactEditState {
	contactId: number | null;
	contactGroupId: number | null;
	variableData: Record<string, unknown>;
	setContext: (payload: {
		contactId: number | null;
		contactGroupId: number | null;
	}) => void;
	setInitialVariableData: (data: Record<string, unknown>) => void;
	updateVariableField: (key: string, value: unknown) => void;
	removeVariableField: (key: string) => void;
	addVariableField: (key: string, value: unknown) => void;
	clear: () => void;
}

export const useContactEditStore = create<ContactEditState>((set) => ({
	contactId: null,
	contactGroupId: null,
	variableData: {},
	setContext: ({ contactId, contactGroupId }) =>
		set((state) => {
			if (
				state.contactId === contactId &&
				state.contactGroupId === contactGroupId
			) {
				return state; // avoid unnecessary updates that could cause loops
			}
			return { contactId, contactGroupId };
		}),
	setInitialVariableData: (data) => set({ variableData: { ...data } }),
	updateVariableField: (key, value) =>
		set((state) => ({ variableData: { ...state.variableData, [key]: value } })),
	removeVariableField: (key) =>
		set((state) => {
			const next = { ...state.variableData };
			delete next[key];
			return { variableData: next };
		}),
	addVariableField: (key, value) =>
		set((state) => ({ variableData: { ...state.variableData, [key]: value } })),
	clear: () => set({ contactId: null, contactGroupId: null, variableData: {} }),
}));
