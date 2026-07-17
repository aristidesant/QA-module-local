import type { ReactNode } from 'react';

export interface ErrorTypeSelectProps {
	description?: ReactNode;
	error?: ReactNode;
	label: ReactNode;
	onChange: (value: string | null) => void;
	value: string | null;
}
