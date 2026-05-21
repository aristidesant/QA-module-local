import { Button, TextInput } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import styles from './CampaignConvaiWidget.module.css';

export interface ConvaiMessageInputLabels {
	inputLabel: string;
	inputPlaceholder: string;
	send: string;
}

export interface ConvaiMessageInputProps {
	value: string;
	onChange: (value: string) => void;
	onSend: () => void;
	disabled: boolean;
	labels: ConvaiMessageInputLabels;
}

const ConvaiMessageInput = ({
	value,
	onChange,
	onSend,
	disabled,
	labels,
}: ConvaiMessageInputProps) => {
	return (
		<div className={styles.inputArea}>
			<TextInput
				className={styles.messageInput}
				size='sm'
				label={labels.inputLabel}
				placeholder={labels.inputPlaceholder}
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						onSend();
					}
				}}
				disabled={disabled}
			/>
			<Button
				size='sm'
				color='green'
				leftSection={<IconSend size={15} />}
				onClick={onSend}
				disabled={disabled || !value.trim()}
			>
				{labels.send}
			</Button>
		</div>
	);
};

export default ConvaiMessageInput;
