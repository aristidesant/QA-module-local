import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import styles from './TextFilter.module.css';

interface TextFilterProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
}

export function TextFilter({
	value,
	onChange,
	placeholder = 'Search...',
	debounceMs = 300,
}: TextFilterProps) {
	const [localValue, setLocalValue] = useState(value);
	const [debouncedValue] = useDebouncedValue(localValue, debounceMs);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	useEffect(() => {
		onChange(debouncedValue);
	}, [debouncedValue, onChange]);

	return (
		<TextInput
			placeholder={placeholder}
			value={localValue}
			onChange={(event) => setLocalValue(event.currentTarget.value)}
			leftSection={<IconSearch size={16} />}
			size='sm'
			className={styles.textInput}
		/>
	);
}
