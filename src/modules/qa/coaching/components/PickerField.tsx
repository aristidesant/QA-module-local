import type { ReactNode } from 'react';
import { Input, InputBase } from '@mantine/core';
import { IconSelector } from '@tabler/icons-react';

interface PickerFieldProps {
	label: string;
	/** Shown dimmed while nothing is chosen. */
	placeholder: string;
	/** What is chosen, as a short line; null while nothing is. */
	summary: string | null;
	error?: ReactNode;
	onOpen: () => void;
}

/**
 * A field that reads like an input but opens a picker dialog instead of a dropdown.
 * Built on InputBase so height, theming and the error state match every other input.
 */
export function PickerField({
	label,
	placeholder,
	summary,
	error,
	onOpen,
}: PickerFieldProps) {
	return (
		<InputBase
			component='button'
			type='button'
			pointer
			label={label}
			error={error}
			aria-haspopup='dialog'
			rightSection={<IconSelector size={16} aria-hidden />}
			rightSectionPointerEvents='none'
			onClick={onOpen}
		>
			{summary ?? <Input.Placeholder>{placeholder}</Input.Placeholder>}
		</InputBase>
	);
}

export default PickerField;
