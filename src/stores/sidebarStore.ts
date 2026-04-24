import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
	collapsed: boolean;
	toggleCollapsed: () => void;
	setCollapsed: (collapsed: boolean) => void;
	mobileOpen: boolean;
	openMobile: () => void;
	closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
	persist(
		(set) => ({
			collapsed: false,
			toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
			setCollapsed: (collapsed: boolean) => set({ collapsed }),
			mobileOpen: false,
			openMobile: () => set({ mobileOpen: true, collapsed: false }),
			closeMobile: () => set({ mobileOpen: false }),
		}),
		{
			name: 'sidebar-collapsed',
			partialize: (state) => ({ collapsed: state.collapsed }),
		}
	)
);
