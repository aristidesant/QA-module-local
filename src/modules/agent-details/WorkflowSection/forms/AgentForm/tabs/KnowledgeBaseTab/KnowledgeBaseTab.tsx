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

	const buildRefSignature = (
		refs: { id: string; name?: string; identifier?: string }[]
	) =>
		refs
			.map((ref) => `${ref.identifier ?? ref.id}:${ref.name ?? ''}`)
			.join('|');

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

	const draftKnowledgeBaseIdentifiers = useMemo(
		() => draftKnowledgeBaseRefs.map((ref) => ref.identifier ?? ref.id),
		[draftKnowledgeBaseRefs]
	);

	const selectedKnowledgeBases = useMemo(() => {
		return draftKnowledgeBaseRefs.map((ref) => {
			const matched = combinedKnowledgeBases.find((kb) => {
				if (ref.identifier && kb.identifier === ref.identifier) return true;
				return String(kb.id) === ref.id;
			});
			return {
				id: ref.id,
				name: matched?.name ?? ref.name,
				identifier: matched?.identifier ?? ref.identifier,
			};
		});
	}, [combinedKnowledgeBases, draftKnowledgeBaseRefs]);

	const availableKnowledgeBases = useMemo(() => {
		const selectedIdentifiers = new Set(
			draftKnowledgeBaseIdentifiers.map(String)
		);
		return combinedKnowledgeBases.filter(
			(kb) => !selectedIdentifiers.has(String(kb.identifier ?? kb.id))
		);
	}, [combinedKnowledgeBases, draftKnowledgeBaseIdentifiers]);

	const buildElevenLabsKnowledgeBaseEntry = (knowledgeBaseId: string) => {
		const matched = combinedKnowledgeBases.find(
			(kb) => kb.identifier === knowledgeBaseId
		);
		if (!matched?.identifier) return null;

		return {
			type: matched.type.toLowerCase(),
			id: matched.identifier,
			name: matched.file?.name ?? matched.name,
			usage_mode: 'auto' as const,
		};
	};

	const handleSubagentChange = (updates: Record<string, unknown>) => {
		const nextWorkflow = updateWorkflowNodeSubagent(workflow, nodeId, updates);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	return (
		<Stack gap='md'>
			{/* Inherit Knowledge Base */}
			<div className={mainStyles.fieldRow}>
				<Group justify='space-between' align='center'>
					<div>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.subagent.inherit_knowledge_base')}
						</Text>
						<Text size='xs' c='dimmed' className={mainStyles.fieldDescription}>
							{t('form.workflow.subagent.inherit_knowledge_base_description')}
						</Text>
					</div>
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
			</div>

			{/* Additional Knowledge Base */}
			<div className={mainStyles.fieldRow}>
				<Group justify='space-between' align='center'>
					<div>
						<Text size='sm' className={mainStyles.fieldLabel}>
							{t('form.workflow.subagent.additional_knowledge_base')}
						</Text>
						<Text size='xs' c='dimmed' className={mainStyles.fieldDescription}>
							{t(
								'form.workflow.subagent.additional_knowledge_base_description'
							)}
						</Text>
					</div>
					<Menu width={260} position='bottom-end' withinPortal closeOnItemClick>
						<Menu.Target>
							<Button
								size='xs'
								variant='light'
								leftSection={<IconWorld size={14} />}
							>
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
								<Text size='xs' c='red' px='sm' py='xs'>
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
												identifier: matched?.identifier ?? undefined,
											};
										});
										setDraftKnowledgeBaseRefs(nextRefs);
										knowledgeBaseSignatureRef.current =
											buildRefSignature(nextRefs);
										handleSubagentChange({
											knowledge_base_ids: nextRefs
												.map((ref) => buildElevenLabsKnowledgeBaseEntry(ref.id))
												.filter(
													(
														entry
													): entry is NonNullable<
														ReturnType<typeof buildElevenLabsKnowledgeBaseEntry>
													> => Boolean(entry)
												),
										});
									}}
								>
									{kb.name}
								</Menu.Item>
							))}
						</Menu.Dropdown>
					</Menu>
				</Group>
			</div>

			{/* Knowledge Base List */}
			{draftKnowledgeBaseIds.length === 0 ? (
				<div className={mainStyles.emptyState}>
					<Group gap='xs' align='center'>
						<IconWorld size={24} color='var(--mantine-color-gray-5)' />
						<Text size='sm' c='dimmed'>
							{t('form.workflow.subagent.knowledgeBaseEmpty')}
						</Text>
					</Group>
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
									<IconWorld size={16} />
								</div>
								<Text size='sm' className={mainStyles.knowledgeLabel}>
									{label}
								</Text>
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={() => {
										const nextRefs = draftKnowledgeBaseRefs.filter(
											(ref) => ref.id !== String(knowledgeBase.id)
										);
										setDraftKnowledgeBaseRefs(nextRefs);
										knowledgeBaseSignatureRef.current =
											buildRefSignature(nextRefs);
										handleSubagentChange({
											knowledge_base_ids: nextRefs
												.map((ref) => buildElevenLabsKnowledgeBaseEntry(ref.id))
												.filter(
													(
														entry
													): entry is NonNullable<
														ReturnType<typeof buildElevenLabsKnowledgeBaseEntry>
													> => Boolean(entry)
												),
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
