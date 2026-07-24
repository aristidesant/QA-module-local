import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PreviewRole } from '~/constants/previewRole';

interface RoleMockState {
	previewRole: PreviewRole | null;
	setPreviewRole: (role: PreviewRole | null) => void;
	clearPreviewRole: () => void;
}

export const useRoleMockStore = create<RoleMockState>()(
	persist(
		(set) => ({
			previewRole: null,
			setPreviewRole: (previewRole: PreviewRole | null) => set({ previewRole }),
			clearPreviewRole: () => set({ previewRole: null }),
		}),
		{
			name: 'role-preview',
		}
	)
);
