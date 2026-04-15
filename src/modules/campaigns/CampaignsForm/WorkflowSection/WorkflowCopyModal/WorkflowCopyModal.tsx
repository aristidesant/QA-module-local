import { useState } from 'react';
import { Button, Checkbox, Modal, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { NodeGroups, NodeStyles } from '~/models/CampaignsModel';
import { serializeWorkflowEnvelope } from '../utils/workflowClipboard';
import styles from './WorkflowCopyModal.module.css';

interface WorkflowCopyModalProps {
	opened: boolean;
	onClose: () => void;
	workflow: AgentWorkflow;
	nodeStyles?: NodeStyles;
	nodeGroups?: NodeGroups;
}

const hasNonEmptyStyles = (nodeStyles?: NodeStyles): boolean =>
	!!nodeStyles &&
	Object.values(nodeStyles).some(
		(style) => style?.backgroundColor || style?.iconName
	);

const hasNonEmptyGroups = (nodeGroups?: NodeGroups): boolean =>
	!!nodeGroups && Object.keys(nodeGroups).length > 0;

const WorkflowCopyModal = ({
	opened,
	onClose,
	workflow,
	nodeStyles,
	nodeGroups,
}: WorkflowCopyModalProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);

	const stylesAvailable = hasNonEmptyStyles(nodeStyles);
	const groupsAvailable = hasNonEmptyGroups(nodeGroups);

	const [includeStyles, setIncludeStyles] = useState(true);
	const [includeGroups, setIncludeGroups] = useState(true);

	const handleCopy = async () => {
		try {
			const serialized = serializeWorkflowEnvelope({
				workflow,
				includeNodeStyles: includeStyles && stylesAvailable,
				includeNodeGroups: includeGroups && groupsAvailable,
				nodeStyles,
				nodeGroups,
			});

			await navigator.clipboard.writeText(serialized);

			notifications.show({
				color: 'teal',
				title: t('form.workflow.clipboard.notifications.copySuccessTitle'),
				message: t('form.workflow.clipboard.notifications.copySuccessMessage'),
			});
			onClose();
		} catch {
			notifications.show({
				color: 'red',
				title: t('form.workflow.clipboard.notifications.copyErrorTitle'),
				message: t('form.workflow.clipboard.notifications.copyErrorMessage'),
			});
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.workflow.clipboard.copy.title')}
			size='sm'
			centered
		>
			<Stack gap='sm'>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.clipboard.copy.description')}
				</Text>

				<Stack gap='xs' className={styles.optionsGroup}>
					<Checkbox
						size='sm'
						label={t('form.workflow.clipboard.copy.includeStyles', {
							count: stylesAvailable
								? Object.values(nodeStyles!).filter(
										(s) => s?.backgroundColor || s?.iconName
									).length
								: 0,
						})}
						checked={includeStyles && stylesAvailable}
						onChange={(event) => setIncludeStyles(event.currentTarget.checked)}
						disabled={!stylesAvailable}
					/>
					<Checkbox
						size='sm'
						label={t('form.workflow.clipboard.copy.includeGroups', {
							count: groupsAvailable ? Object.keys(nodeGroups!).length : 0,
						})}
						checked={includeGroups && groupsAvailable}
						onChange={(event) => setIncludeGroups(event.currentTarget.checked)}
						disabled={!groupsAvailable}
					/>
				</Stack>

				<div className={styles.footer}>
					<Button variant='default' size='sm' onClick={onClose}>
						{t('common:actions.cancel')}
					</Button>
					<Button size='sm' onClick={handleCopy}>
						{t('form.workflow.clipboard.copy.confirm')}
					</Button>
				</div>
			</Stack>
		</Modal>
	);
};

export default WorkflowCopyModal;
