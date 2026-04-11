import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ColorSchemePreference = 'light' | 'dark' | 'auto';

interface ColorSchemeState {
	preference: ColorSchemePreference;
	setPreference: (preference: ColorSchemePreference) => void;
	togglePreference: () => void;
}

const cycleOrder: ColorSchemePreference[] = ['light', 'dark', 'auto'];

export const useColorSchemeStore = create<ColorSchemeState>()(
	persist(
		(set) => ({
			preference: 'auto' as ColorSchemePreference,
			setPreference: (preference: ColorSchemePreference) => set({ preference }),
			togglePreference: () =>
				set((state) => {
					const currentIndex = cycleOrder.indexOf(state.preference);
					const nextIndex = (currentIndex + 1) % cycleOrder.length;
					return { preference: cycleOrder[nextIndex] };
				}),
		}),
		{
			name: 'color-scheme',
		}
	)
);
