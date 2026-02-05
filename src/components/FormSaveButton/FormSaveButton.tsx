import React from 'react';
import { Button } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';

interface FormSaveButtonProps {
	label: string;
	loadingLabel: string;
	isLoading: boolean;
	disabled?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	leftSection?: React.ReactNode;
}

const FormSaveButton: React.FC<FormSaveButtonProps> = ({
	label,
	loadingLabel,
	isLoading,
	disabled,
	size = 'sm',
	leftSection,
}) => {
	return (
		<Button
			type='submit'
			size={size}
			loading={isLoading}
			disabled={disabled}
			leftSection={leftSection ?? <IconDeviceFloppy size={16} />}
		>
			{isLoading ? loadingLabel : label}
		</Button>
	);
};

export default FormSaveButton;
