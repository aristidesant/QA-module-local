import { useTranslation } from 'react-i18next';
import NodeEdgesTab from '../../../NodeEdgesTab';
import { useAgentForm } from '../../context';

const EdgesTab = () => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const { workflow, nodeId, onWorkflowChange } = useAgentForm();

	return (
		<NodeEdgesTab
			nodeId={nodeId}
			workflow={workflow}
			onWorkflowChange={onWorkflowChange}
			title={t('form.workflow.forms.agent.tabs.edges')}
			description={t('form.workflow.forms.agent.edgesTab.description')}
			emptyMessage={t('form.workflow.forms.agent.edgesTab.empty')}
		/>
	);
};

export default EdgesTab;
