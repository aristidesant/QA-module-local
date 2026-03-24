import React, { useMemo, useState } from 'react';
import styles from './AppSegmentedControl.module.css';

type SegmentedItem =
	| string
	| {
			label: React.ReactNode;
			value: string;
			disabled?: boolean;
	  };

interface AppSegmentedControlProps extends Omit<
	React.HTMLAttributes<HTMLDivElement>,
	'onChange'
> {
	data: SegmentedItem[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	fullWidth?: boolean;
	size?: 'xs' | 'sm' | 'md';
	disabled?: boolean;
}

const AppSegmentedControl: React.FC<AppSegmentedControlProps> = ({
	data,
	value,
	defaultValue,
	onChange,
	fullWidth = false,
	size = 'sm',
	disabled = false,
	className,
	...rest
}) => {
	const items = useMemo(
		() =>
			data.map((item) =>
				typeof item === 'string' ? { label: item, value: item } : item
			),
		[data]
	);
	const [internalValue, setInternalValue] = useState<string>(
		defaultValue ?? items[0]?.value ?? ''
	);
	const selectedValue = value ?? internalValue;

	const handleChange = (nextValue: string) => {
		if (disabled) {
			return;
		}

		if (value === undefined) {
			setInternalValue(nextValue);
		}

		onChange?.(nextValue);
	};

	return (
		<div
			{...rest}
			role='radiogroup'
			className={[
				styles.root,
				fullWidth ? styles.fullWidth : styles.autoWidth,
				styles[size],
				disabled ? styles.disabled : '',
				className || '',
			]
				.filter(Boolean)
				.join(' ')}
		>
			{items.map((item) => {
				const isActive = selectedValue === item.value;
				const isDisabled = disabled || item.disabled;

				return (
					<button
						key={item.value}
						type='button'
						role='radio'
						aria-checked={isActive}
						aria-disabled={isDisabled}
						disabled={isDisabled}
						className={[
							styles.control,
							isActive ? styles.controlActive : '',
							fullWidth ? styles.controlFullWidth : '',
						]
							.filter(Boolean)
							.join(' ')}
						onClick={() => handleChange(item.value)}
					>
						<span className={styles.label}>{item.label}</span>
					</button>
				);
			})}
		</div>
	);
};

export default AppSegmentedControl;
