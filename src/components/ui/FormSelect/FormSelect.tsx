import type { FC, ReactNode } from 'react';
import { Select } from '@mantine/core';
import classes from './FormSelect.module.css';

interface FormSelectProps {
	label?: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string | null) => void;
	data: Array<{ value: string; label: string }>;
	clearable?: boolean;
	disabled?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	error?: ReactNode;
	required?: boolean;
	description?: ReactNode;
}

export const FormSelect: FC<FormSelectProps> = ({
	label,
	placeholder,
	value,
	onChange,
	data,
	clearable = true,
	disabled = false,
	size = 'sm',
	className,
	error,
	required,
	description,
}) => {
	return (
		<Select
			label={label}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			data={data}
			clearable={clearable}
			disabled={disabled}
			size={size}
			error={error}
			required={required}
			description={description}
			className={`${classes.select} ${className || ''}`}
		/>
	);
};

export default FormSelect;
