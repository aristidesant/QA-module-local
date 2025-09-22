import { create } from 'zustand';

interface ImpersonationLoadingState {
	isLoading: boolean;
	message: string;
	setLoading: (loading: boolean, message?: string) => void;
}

export const useImpersonationLoadingStore = create<ImpersonationLoadingState>(
	(set) => ({
		isLoading: false,
		message: 'Processing...',
		setLoading: (loading: boolean, message = 'Processing...') =>
			set({ isLoading: loading, message }),
	})
);
