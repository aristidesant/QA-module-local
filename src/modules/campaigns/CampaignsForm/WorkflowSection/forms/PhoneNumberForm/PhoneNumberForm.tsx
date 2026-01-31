import { Badge, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type {
	AgentWorkflow,
	PhoneNumberTransferNode,
} from '~/models/AgentWorkflowModel';
import WorkflowNodeForm from '../WorkflowNodeForm';
import styles from './PhoneNumberForm.module.css';

interface PhoneNumberFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
}

const PhoneNumberForm = ({ nodeId, workflow }: PhoneNumberFormProps) => {
	const { t } = useTranslation('campaigns');
	const node = workflow?.nodes[nodeId] as PhoneNumberTransferNode | undefined;

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.phone.title')}
				description={t('form.workflow.forms.phone.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.phone.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	const destinationLabel = (() => {
		if (!node.transferDestination) return null;
		switch (node.transferDestination.type) {
			case 'phone':
			case 'phone_dynamic_variable':
				return node.transferDestination.phoneNumber;
			case 'sip_uri':
			case 'sip_uri_dynamic_variable':
				return node.transferDestination.sipUri;
			default:
				return null;
		}
	})();

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.phone.title')}
			description={t('form.workflow.forms.phone.description')}
		>
			<Stack gap='xs'>
				<div className={styles.summaryRow}>
					<Text size='xs' className={styles.metaLabel}>
						{t('form.workflow.forms.phone.transferType')}
					</Text>
					<Badge size='sm' variant='light'>
						{node.transferType}
					</Badge>
				</div>
				<div className={styles.summaryRow}>
					<Text size='xs' className={styles.metaLabel}>
						{t('form.workflow.forms.phone.destination')}
					</Text>
					<Text size='sm' fw={500}>
						{destinationLabel ||
							t('form.workflow.forms.phone.destinationEmpty')}
					</Text>
				</div>
				{!destinationLabel && (
					<div className={styles.empty}>
						<Text size='xs' c='dimmed'>
							{t('form.workflow.forms.phone.empty')}
						</Text>
					</div>
				)}
			</Stack>
		</WorkflowNodeForm>
	);
};

export default PhoneNumberForm;
