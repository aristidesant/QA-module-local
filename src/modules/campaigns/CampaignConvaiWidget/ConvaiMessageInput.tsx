import { ActionIcon, TextInput } from '@mantine/core';
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
				placeholder={labels.inputPlaceholder}
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter' && !event.shiftKey) {
						event.preventDefault();
						onSend();
					}
				}}
				disabled={disabled}
				aria-label={labels.inputLabel}
			/>
			<ActionIcon
				size='lg'
				radius='xl'
				color='green'
				variant='filled'
				onClick={onSend}
				disabled={disabled || !value.trim()}
				aria-label={labels.send}
			>
				<IconSend size={18} />
			</ActionIcon>
		</div>
	);
};

export default ConvaiMessageInput;
