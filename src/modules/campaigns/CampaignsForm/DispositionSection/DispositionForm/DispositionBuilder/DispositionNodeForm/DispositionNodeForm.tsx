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
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaigns');
	const form = useForm<DispositionNode>({
		initialValues: {
			...node,
			doNotCall: node.doNotCall ?? node.do_not_call ?? false,
		},
	});

	const updateNode = useDispositionBuilderStore((state) => state.updateNode);

	const { doNotCall, isInvalidatesNumber, requiresReschedule, isFinal } =
		form.values;

	const statusBadges = useMemo(
		() =>
			[
				isFinal
					? {
							label: t('disposition.nodeForm.badges.final'),
							color: 'green',
						}
					: null,
				requiresReschedule
					? {
							label: t('disposition.nodeForm.badges.reschedule'),
							color: 'orange',
						}
					: null,
				isInvalidatesNumber
					? {
							label: t('disposition.nodeForm.badges.noRetry'),
							color: 'red',
						}
					: null,
				doNotCall
					? {
							label: t('disposition.nodeForm.badges.doNotCall'),
							color: 'red',
						}
					: null,
			].filter(Boolean) as Array<{ label: string; color: string }>,
		[doNotCall, isFinal, isInvalidatesNumber, requiresReschedule, t]
	);

	const parentLabel = parentNode?.name ?? t('disposition.nodeForm.rootLevel');

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
								{t('disposition.nodeForm.editingTitle')}
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
							{t('disposition.nodeForm.descriptionLabel')}
						</Text>
						<Text size='sm' className={styles.infoValue}>
							{form.values.description?.trim()
								? form.values.description
								: t('disposition.nodeForm.noDescription')}
						</Text>
					</div>

					<div className={styles.toggleSection}>
						<Text className={styles.sectionLabel} size='xs'>
							{t('disposition.nodeForm.behaviorControls')}
						</Text>
						<div className={styles.toggleGrid}>
							<div className={styles.toggleCard}>
								<div className={styles.toggleContent}>
									<Text className={styles.toggleTitle}>
										{t('disposition.nodeForm.invalidatesNumberTitle')}
									</Text>
									<Text className={styles.toggleDescription} size='xs'>
										{t('disposition.nodeForm.invalidatesNumberDesc')}
									</Text>
								</div>
								<Switch
									key={form.key('isInvalidatesNumber')}
									{...form.getInputProps('isInvalidatesNumber', {
										type: 'checkbox',
									})}
									aria-label={t('disposition.nodeForm.invalidatesNumberTitle')}
									size='sm'
									color='blue'
								/>
							</div>

							<div className={styles.toggleCard}>
								<div className={styles.toggleContent}>
									<Text className={styles.toggleTitle}>
										{t('disposition.nodeForm.doNotCallTitle')}
									</Text>
									<Text className={styles.toggleDescription} size='xs'>
										{t('disposition.nodeForm.doNotCallDesc')}
									</Text>
								</div>
								<Switch
									key={form.key('doNotCall')}
									{...form.getInputProps('doNotCall', {
										type: 'checkbox',
									})}
									aria-label={t('disposition.nodeForm.doNotCallTitle')}
									size='sm'
									color='blue'
								/>
							</div>

							<div className={styles.toggleCard}>
								<div className={styles.toggleContent}>
									<Text className={styles.toggleTitle}>
										{t('disposition.nodeForm.rescheduleTitle')}
									</Text>
									<Text className={styles.toggleDescription} size='xs'>
										{t('disposition.nodeForm.rescheduleDesc')}
									</Text>
								</div>
								<Switch
									key={form.key('requiresReschedule')}
									{...form.getInputProps('requiresReschedule', {
										type: 'checkbox',
									})}
									aria-label={t('disposition.nodeForm.rescheduleTitle')}
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
						{t('actions.cancel', { ns: 'common' })}
					</Button>
					<Button type='submit' variant='filled' color='blue' size='xs'>
						{t('actions.save', { ns: 'common' })}
					</Button>
				</Group>
			</form>
		</Box>
	);
};

export default DispositionNodeForm;
