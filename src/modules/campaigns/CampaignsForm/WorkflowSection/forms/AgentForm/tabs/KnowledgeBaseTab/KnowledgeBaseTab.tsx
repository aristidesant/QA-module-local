import {
	ActionIcon,
	Button,
	Group,
	Menu,
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import { IconTrash, IconWorld } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	updateWorkflowNodeSubagent,
	resolveNodeLabel,
} from '../../../nodeFormUtils';
import { useAgentForm } from '../../context';
import { useKnowledgeBasesLogic } from '../../hooks';
import mainStyles from '../../AgentForm.module.css';

const KnowledgeBaseTab = () => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const {
		workflow,
		nodeId,
		onWorkflowChange,
		draftKnowledgeBaseRefs,
		setDraftKnowledgeBaseRefs,
		knowledgeBaseSignatureRef,
	} = useAgentForm();

	const currentNode = workflow?.nodes[nodeId];
	const subagent =
		currentNode && 'subagent' in currentNode ? currentNode.subagent : undefined;

	const legacyKnowledgeBaseIds =
		currentNode && 'additional_knowledge_base' in currentNode
			? (currentNode.additional_knowledge_base ?? [])
			: [];

	const mergedKnowledgeBaseItems = [
		...legacyKnowledgeBaseIds,
		...(subagent?.knowledge_base_ids ?? []),
	];

	const inheritsKnowledgeBase = subagent?.inherit_knowledge_base ?? false;

	const {
		mergedKnowledgeBaseRefs,
		combinedKnowledgeBases,
		isKnowledgeBasesLoading,
		isKnowledgeBasesError,
	} = useKnowledgeBasesLogic(mergedKnowledgeBaseItems);

	const buildRefSignature = (refs: { id: string; name?: string }[]) =>
		refs.map((ref) => `${ref.id}:${ref.name ?? ''}`).join('|');

	useEffect(() => {
		const nextSignature = buildRefSignature(mergedKnowledgeBaseRefs);
		if (knowledgeBaseSignatureRef.current !== nextSignature) {
			setDraftKnowledgeBaseRefs(mergedKnowledgeBaseRefs);
			knowledgeBaseSignatureRef.current = nextSignature;
		}
	}, [mergedKnowledgeBaseRefs]);

	const draftKnowledgeBaseIds = useMemo(
		() => draftKnowledgeBaseRefs.map((ref) => ref.id),
		[draftKnowledgeBaseRefs]
	);

	const selectedKnowledgeBases = useMemo(() => {
		return draftKnowledgeBaseRefs.map((ref) => {
			const matched = combinedKnowledgeBases.find(
				(kb) => String(kb.id) === ref.id
			);
			return {
				id: ref.id,
				name: matched?.name ?? ref.name,
			};
		});
	}, [combinedKnowledgeBases, draftKnowledgeBaseRefs]);

	const availableKnowledgeBases = useMemo(() => {
		const selectedIds = new Set(draftKnowledgeBaseIds.map(String));
		return combinedKnowledgeBases.filter(
			(kb) => !selectedIds.has(String(kb.id))
		);
	}, [combinedKnowledgeBases, draftKnowledgeBaseIds]);

	const handleSubagentChange = (updates: Record<string, unknown>) => {
		const nextWorkflow = updateWorkflowNodeSubagent(workflow, nodeId, updates);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	return (
		<Stack gap='xs'>
			<Group justify='space-between' align='center'>
				<Text size='sm' className={mainStyles.fieldLabel}>
					{t('form.workflow.subagent.inherit_knowledge_base')}
				</Text>
				<Switch
					checked={inheritsKnowledgeBase}
					onChange={(event) =>
						handleSubagentChange({
							inherit_knowledge_base: event.currentTarget.checked,
						})
					}
					size='sm'
					aria-label={t('form.workflow.subagent.inherit_knowledge_base')}
				/>
			</Group>
			<Group justify='space-between' align='center'>
				<Text size='sm' className={mainStyles.fieldLabel}>
					{t('form.workflow.subagent.additional_knowledge_base')}
				</Text>
				<Menu width={260} position='bottom-end' withinPortal closeOnItemClick>
					<Menu.Target>
						<Button size='xs' variant='default'>
							{t('form.workflow.subagent.addDocument')}
						</Button>
					</Menu.Target>
					<Menu.Dropdown>
						{isKnowledgeBasesLoading && (
							<Text size='xs' c='dimmed' px='sm' py='xs'>
								{t('form.workflow.subagent.knowledgeBaseLoading')}
							</Text>
						)}
						{isKnowledgeBasesError && (
							<Text size='xs' c='dimmed' px='sm' py='xs'>
								{t('form.workflow.subagent.knowledgeBaseError')}
							</Text>
						)}
						{!isKnowledgeBasesLoading &&
							!isKnowledgeBasesError &&
							availableKnowledgeBases.length === 0 && (
								<Text size='xs' c='dimmed' px='sm' py='xs'>
									{t('form.workflow.subagent.knowledgeBaseEmpty')}
								</Text>
							)}
						{availableKnowledgeBases.map((kb) => (
							<Menu.Item
								key={kb.id}
								onClick={() => {
									const nextKnowledgeBaseIds = Array.from(
										new Set([...draftKnowledgeBaseIds, String(kb.id)])
									);
									const nextRefs = nextKnowledgeBaseIds.map((id) => {
										const matched = combinedKnowledgeBases.find(
											(kb) => String(kb.id) === id
										);
										return {
											id,
											name: matched?.name,
										};
									});
									setDraftKnowledgeBaseRefs(nextRefs);
									knowledgeBaseSignatureRef.current =
										buildRefSignature(nextRefs);
									handleSubagentChange({
										knowledge_base_ids: nextKnowledgeBaseIds,
									});
								}}
							>
								{kb.name}
							</Menu.Item>
						))}
					</Menu.Dropdown>
				</Menu>
			</Group>
			{draftKnowledgeBaseIds.length === 0 ? (
				<div className={mainStyles.emptyState}>
					<Text size='xs' c='dimmed'>
						{t('form.workflow.subagent.knowledgeBaseEmpty')}
					</Text>
				</div>
			) : (
				<div className={mainStyles.knowledgeList}>
					{selectedKnowledgeBases.map((knowledgeBase) => {
						const label = resolveNodeLabel(
							knowledgeBase.name,
							t('form.workflow.subagent.knowledgeBaseId', {
								id: knowledgeBase.id,
							})
						);
						return (
							<div key={knowledgeBase.id} className={mainStyles.knowledgeItem}>
								<div className={mainStyles.knowledgeIcon}>
									<IconWorld size={14} />
								</div>
								<Text size='sm' className={mainStyles.knowledgeLabel}>
									{label}
								</Text>
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={() => {
										const nextKnowledgeBaseIds = draftKnowledgeBaseIds.filter(
											(id) => String(id) !== String(knowledgeBase.id)
										);
										const nextRefs = draftKnowledgeBaseRefs.filter(
											(ref) => ref.id !== String(knowledgeBase.id)
										);
										setDraftKnowledgeBaseRefs(nextRefs);
										knowledgeBaseSignatureRef.current =
											buildRefSignature(nextRefs);
										handleSubagentChange({
											knowledge_base_ids: nextKnowledgeBaseIds,
										});
									}}
									aria-label={t('form.workflow.subagent.removeKnowledgeBase', {
										name: label,
									})}
								>
									<IconTrash size={14} />
								</ActionIcon>
							</div>
						);
					})}
				</div>
			)}
		</Stack>
	);
};

export default KnowledgeBaseTab;
