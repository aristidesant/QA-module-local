import React, { useMemo } from 'react';
import { useForm } from '@mantine/form';
import {
	Group,
	Button,
	Box,
	Switch,
	Text,
	Stack,
	Badge,
	Divider,
} from '@mantine/core';
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
		initialValues: { ...node },
	});

	const updateNode = useDispositionBuilderStore((state) => state.updateNode);

	const { isInvalidatesNumber, requiresReschedule, isFinal } = form.values;

	const statusBadges = useMemo(
		() =>
			[
				isFinal
					? {
							label: 'Final outcome',
							color: 'green',
						}
					: null,
				requiresReschedule
					? {
							label: 'Requires reschedule',
							color: 'orange',
						}
					: null,
				isInvalidatesNumber
					? {
							label: 'Do not retry',
							color: 'red',
						}
					: null,
			].filter(Boolean) as Array<{ label: string; color: string }>,
		[isFinal, isInvalidatesNumber, requiresReschedule]
	);

	const parentLabel = parentNode?.name ?? 'Root level outcome';

	return (
		<Box className={styles.formContainer}>
			<form
				className={styles.form}
				onSubmit={form.onSubmit((values) => {
					updateNode({
						...node,
						...values,
					});
					onSubmit?.();
				})}
			>
				<Stack gap='md' className={styles.formContent}>
					<div className={styles.header}>
						<div className={styles.headerDetails}>
							<Text className={styles.headerEyebrow} size='xs'>
								Editing outcome
							</Text>
							<Text className={styles.headerTitle}>{form.values.name}</Text>
						</div>
						<Badge
							variant='light'
							color='gray'
							size='sm'
							className={styles.parentBadge}
						>
							{parentLabel}
						</Badge>
					</div>

					{statusBadges.length > 0 ? (
						<Group gap='xs' className={styles.statusGroup}>
							{statusBadges.map((badge) => (
								<Badge
									key={badge.label}
									variant='light'
									color={badge.color}
									size='xs'
									className={styles.statusBadge}
								>
									{badge.label}
								</Badge>
							))}
						</Group>
					) : null}

					<div className={styles.infoCard}>
						<Text className={styles.infoLabel} size='xs'>
							Description
						</Text>
						<Text size='sm' className={styles.infoValue}>
							{form.values.description?.trim()
								? form.values.description
								: 'This outcome does not include a description yet.'}
						</Text>
					</div>

					<div className={styles.toggleSection}>
						<Text className={styles.sectionLabel} size='xs'>
							Behavior controls
						</Text>
						<div className={styles.toggleGrid}>
							<div className={styles.toggleCard}>
								<div className={styles.toggleContent}>
									<Text className={styles.toggleTitle}>Invalidates number</Text>
									<Text className={styles.toggleDescription} size='xs'>
										Prevent the dialer from retrying this phone number after the
										outcome is used.
									</Text>
								</div>
								<Switch
									key={form.key('isInvalidatesNumber')}
									{...form.getInputProps('isInvalidatesNumber', {
										type: 'checkbox',
									})}
									size='sm'
									color='blue'
								/>
							</div>

							<div className={styles.toggleCard}>
								<div className={styles.toggleContent}>
									<Text className={styles.toggleTitle}>
										Requires reschedule
									</Text>
									<Text className={styles.toggleDescription} size='xs'>
										Flag this outcome so follow-up activities can be scheduled
										for the contact.
									</Text>
								</div>
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
				</Stack>

				<Divider className={styles.divider} />

				<Group justify='flex-end' gap='xs' className={styles.actionGroup}>
					<Button variant='default' onClick={onCancel} type='button' size='xs'>
						Cancel
					</Button>
					<Button type='submit' variant='filled' color='blue' size='xs'>
						Save
					</Button>
				</Group>
			</form>
		</Box>
	);
};

export default DispositionNodeForm;
