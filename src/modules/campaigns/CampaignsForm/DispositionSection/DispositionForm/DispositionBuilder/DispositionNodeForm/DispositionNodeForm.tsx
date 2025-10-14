import React from 'react';
import { useForm } from '@mantine/form';
import {
	TextInput,
	Group,
	Button,
	Box,
	Switch,
	Text,
	Textarea,
	Stack,
	Badge,
	Center,
	Divider,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import styles from './DispositionNodeForm.module.css';
import { useDispositionLabel } from '~/hooks/useDispositionLabel';
import { useDispositionBuilderStore } from '../../../dispositionStore';

export type DispositionNodeFormProps = {
	node: DispositionNode;
	parentNode?: DispositionNode | null;
	onCancel?: () => void;
	onSubmit?: () => void;
};

const DispositionNodeForm: React.FC<DispositionNodeFormProps> = ({
	node,
	parentNode,
	onCancel,
	onSubmit,
}) => {
	const form = useForm<DispositionNode>({
		initialValues: node,
		mode: 'uncontrolled',
	});

	const updateNode = useDispositionBuilderStore((state) => state.updateNode);
	const dispositionLabel = useDispositionLabel();

	return (
		<Box className={styles.formContainer}>
			<Text className={styles.sectionTitle}>
				{dispositionLabel('Outcome parameters')}
			</Text>

			<form
				onSubmit={form.onSubmit((values) => {
					updateNode(values);
					onSubmit?.();
				})}
			>
				<Stack>
					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel}>Name</Text>
						<TextInput value={node.name} readOnly disabled />
					</div>

					<Center>
						<Badge
							size='lg'
							color='red'
							className={styles.statusBadge}
							variant='dot'
						>
							{parentNode?.name}
						</Badge>
					</Center>

					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel}>Description</Text>
						<Textarea value={node.description} readOnly disabled />
					</div>

					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel}>Defines Number</Text>
						<div className={styles.subSwitchRow}>
							<Text className={styles.fieldSubtext}>
								{dispositionLabel(
									'Indicates whether this outcome invalidates the phone number'
								)}
							</Text>
							<div className={styles.switchContainer}>
								<Switch
									key={form.key('isInvalidatesNumber')}
									{...form.getInputProps('isInvalidatesNumber', {
										type: 'checkbox',
									})}
									size='md'
									color='blue'
								/>
							</div>
						</div>
					</div>

					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel}>Requires Reschedule</Text>
						<div className={styles.subSwitchRow}>
							<Text className={styles.fieldSubtext}>
								{dispositionLabel(
									'Indicates whether this outcome invalidates the phone number'
								)}
							</Text>
							<div className={styles.switchContainer}>
								<Switch
									key={form.key('requiresReschedule')}
									{...form.getInputProps('requiresReschedule', {
										type: 'checkbox',
									})}
									size='md'
									color='blue'
								/>
							</div>
						</div>
					</div>
					<Divider />

					<Group justify='flex-end' grow className={styles.actionGroup}>
						<Button variant='default' onClick={onCancel} type='button'>
							Cancel
						</Button>
						<Button type='submit' variant='filled' color='blue'>
							Save
						</Button>
					</Group>

					<Button
						leftSection={<IconTrash size={22} />}
						className={styles.deleteButton}
						variant='subtle'
						color='red'
						type='button'
					>
						{dispositionLabel('Delete outcome')}
					</Button>
				</Stack>
			</form>
		</Box>
	);
};

export default DispositionNodeForm;
