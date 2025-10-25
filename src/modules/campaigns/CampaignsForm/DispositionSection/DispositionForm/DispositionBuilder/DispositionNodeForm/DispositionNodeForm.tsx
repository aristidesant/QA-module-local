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

	return (
		<Box className={styles.formContainer}>
			<Text className={styles.sectionTitle} size='sm'>
				Outcome parameters
			</Text>

			<form
				onSubmit={form.onSubmit((values) => {
					updateNode(values);
					onSubmit?.();
				})}
			>
				<Stack gap={4}>
					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel} size='xs'>
							Name
						</Text>
						<TextInput value={node.name} readOnly disabled size='xs' />
					</div>

					<Center>
						<Badge
							size='sm'
							color='red'
							className={styles.statusBadge}
							variant='dot'
						>
							{parentNode?.name}
						</Badge>
					</Center>

					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel} size='xs'>
							Description
						</Text>
						<Textarea value={node.description} readOnly disabled size='xs' />
					</div>

					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel} size='xs'>
							Defines Number
						</Text>
						<div className={styles.subSwitchRow}>
							<Text className={styles.fieldSubtext} size='xs'>
								Indicates whether this outcome invalidates the phone number
							</Text>
							<div className={styles.switchContainer}>
								<Switch
									key={form.key('isInvalidatesNumber')}
									{...form.getInputProps('isInvalidatesNumber', {
										type: 'checkbox',
									})}
									size='sm'
									color='blue'
								/>
							</div>
						</div>
					</div>

					<div className={styles.fieldGroup}>
						<Text className={styles.fieldLabel} size='xs'>
							Requires Reschedule
						</Text>
						<div className={styles.subSwitchRow}>
							<Text className={styles.fieldSubtext} size='xs'>
								Indicates whether this outcome requires a reschedule
							</Text>
							<div className={styles.switchContainer}>
								<Switch
									key={form.key('requiresReschedule')}
									{...form.getInputProps('requiresReschedule', {
										type: 'checkbox',
									})}
									size='sm'
									color='blue'
								/>
							</div>
						</div>
					</div>
					<Divider />

					<Group justify='flex-end' grow className={styles.actionGroup}>
						<Button
							variant='default'
							onClick={onCancel}
							type='button'
							size='xs'
						>
							Cancel
						</Button>
						<Button type='submit' variant='filled' color='blue' size='xs'>
							Save
						</Button>
					</Group>

					<Button
						leftSection={<IconTrash size={14} />}
						className={styles.deleteButton}
						variant='subtle'
						color='red'
						type='button'
						size='xs'
					>
						Delete outcome
					</Button>
				</Stack>
			</form>
		</Box>
	);
};

export default DispositionNodeForm;
