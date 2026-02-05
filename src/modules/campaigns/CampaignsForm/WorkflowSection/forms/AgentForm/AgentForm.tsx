import { Stack, Tabs, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import type { AgentConfigModel } from '~/models/AgentListObject';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { updateWorkflowNode } from '../nodeFormUtils';
import { AgentFormProvider } from './context';
import {
	GeneralTab,
	KnowledgeBaseTab,
	ToolsTab,
	EdgesTab,
	TestsTab,
} from './tabs';
import styles from './AgentForm.module.css';

interface AgentFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
	campaignAgentConfig?: Partial<AgentConfigModel>;
}

const AgentFormContent = ({
	nodeId,
	workflow,
	onWorkflowChange,
}: AgentFormProps) => {
	const { t } = useTranslation('campaigns');

	const currentNode = workflow?.nodes[nodeId];
	const isSubagentNode = currentNode && 'subagent' in currentNode;

	if (!currentNode || !isSubagentNode) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.agent.title')}
				description={t('form.workflow.forms.agent.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.agent.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.agent.title')}
			description={t('form.workflow.forms.agent.description')}
		>
			<Stack gap='xs' mb='md'>
				<TextInput
					label={t('form.workflow.forms.agent.general.nodeName.label')}
					placeholder={t(
						'form.workflow.forms.agent.general.nodeName.placeholder'
					)}
					value={currentNode.label ?? ''}
					onChange={(event) => {
						const nextWorkflow = updateWorkflowNode(workflow, nodeId, {
							label: event.currentTarget.value,
						});
						if (nextWorkflow) {
							onWorkflowChange(nextWorkflow);
						}
					}}
					size='sm'
				/>
			</Stack>
			<Tabs
				defaultValue='general'
				classNames={{
					root: styles.tabs,
					list: styles.tabList,
					tab: styles.tab,
					panel: styles.tabPanel,
				}}
			>
				<Tabs.List>
					<Tabs.Tab value='general'>
						{t('form.workflow.forms.agent.tabs.general')}
					</Tabs.Tab>
					<Tabs.Tab value='knowledge'>
						{t('form.workflow.forms.agent.tabs.knowledgeBase')}
					</Tabs.Tab>
					<Tabs.Tab value='tools'>
						{t('form.workflow.forms.agent.tabs.tools')}
					</Tabs.Tab>
					<Tabs.Tab value='tests'>
						{t('form.workflow.forms.agent.tabs.tests')}
					</Tabs.Tab>
					<Tabs.Tab value='edges'>
						{t('form.workflow.forms.agent.tabs.edges')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='general'>
					<GeneralTab />
				</Tabs.Panel>
				<Tabs.Panel value='knowledge'>
					<KnowledgeBaseTab />
				</Tabs.Panel>
				<Tabs.Panel value='tools'>
					<ToolsTab />
				</Tabs.Panel>
				<Tabs.Panel value='tests'>
					<TestsTab />
				</Tabs.Panel>
				<Tabs.Panel value='edges'>
					<EdgesTab />
				</Tabs.Panel>
			</Tabs>
		</WorkflowNodeForm>
	);
};

const AgentForm = ({
	nodeId,
	workflow,
	onWorkflowChange,
	campaignAgentConfig,
}: AgentFormProps) => {
	return (
		<AgentFormProvider
			nodeId={nodeId}
			workflow={workflow}
			onWorkflowChange={onWorkflowChange}
			campaignAgentConfig={campaignAgentConfig}
		>
			<AgentFormContent
				nodeId={nodeId}
				workflow={workflow}
				onWorkflowChange={onWorkflowChange}
				campaignAgentConfig={campaignAgentConfig}
			/>
		</AgentFormProvider>
	);
};

export default AgentForm;
