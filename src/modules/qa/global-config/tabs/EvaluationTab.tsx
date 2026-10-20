import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Alert,
	Button,
	Group,
	SegmentedControl,
	Select,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconClipboardCheck,
	IconDeviceFloppy,
	IconHistory,
	IconInfoCircle,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import { useSettingsDraft } from '~/modules/qa/settings/useSettingsDraft';
import { useFormsStore } from '~/stores/qa/formsStore';
import {
	selectEvaluation,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { ActiveClientBanner } from '../components/ActiveClientBanner';
import { VersionHistoryDrawer } from '../components/VersionHistoryDrawer';
import { SEED_EVALUATORS } from '../seed';
import type { EvaluationFormat } from '../types';

const evaluatorLabel = (id: string) => {
	const evaluator = SEED_EVALUATORS.find((e) => e.id === id);
	return evaluator ? `${evaluator.name} [${evaluator.code}]` : id;
};

/** Which form and which evaluator agents run automatically for the active client. */
export const EvaluationTab: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const stored = useGlobalConfigStore(selectEvaluation);
	const save = useGlobalConfigStore((s) => s.saveEvaluation);
	const forms = useFormsStore((s) => s.forms);
	const { draft, setDraft, dirty } = useSettingsDraft(stored);
	const [historyOpened, setHistoryOpened] = useState(false);

	const formOptions = useMemo(
		() =>
			forms
				.filter((form) => form.modality === draft.format)
				.map((form) => ({ value: form.id, label: form.name })),
		[forms, draft.format]
	);
	const configured = Boolean(
		stored.defaultFormId &&
		stored.primaryEvaluatorId &&
		stored.fallbackEvaluatorId
	);

	const setFormat = (format: EvaluationFormat) => {
		const stillValid = forms.some(
			(form) => form.id === draft.defaultFormId && form.modality === format
		);
		setDraft({
			...draft,
			format,
			defaultFormId: stillValid ? draft.defaultFormId : null,
		});
	};

	const handleSave = () => {
		const summary =
			draft.format !== stored.format
				? t('evaluation.history.summary.format', {
						format: t(`evaluation.format.${draft.format.toLowerCase()}`),
					})
				: draft.defaultFormId !== stored.defaultFormId
					? t('evaluation.history.summary.form', {
							form:
								formOptions.find((o) => o.value === draft.defaultFormId)
									?.label ?? '—',
						})
					: t('evaluation.history.summary.evaluators');
		save(draft, summary);
	};

	return (
		<Stack gap='lg'>
			<SectionCard
				icon={IconClipboardCheck}
				title={t('evaluation.title')}
				description={t('evaluation.description')}
				headerActions={
					<Group gap='sm' wrap='nowrap'>
						<Text size='sm' c='dimmed'>
							{t('common.currentVersion', { n: stored.version })}
						</Text>
						<Button
							variant='default'
							leftSection={<IconHistory size={16} />}
							onClick={() => setHistoryOpened(true)}
						>
							{t('evaluation.history.title')}
						</Button>
					</Group>
				}
				footer={
					<Group justify='flex-end'>
						<Button
							leftSection={<IconDeviceFloppy size={16} />}
							disabled={!dirty}
							onClick={handleSave}
						>
							{t('evaluation.save')}
						</Button>
					</Group>
				}
			>
				<Stack gap='lg'>
					<ActiveClientBanner
						title={t('evaluation.banner.title')}
						description={t('evaluation.banner.description')}
						configured={configured}
					/>

					<Alert
						variant='light'
						color='blue'
						icon={<IconInfoCircle size={18} />}
					>
						{t('evaluation.requirement')}
					</Alert>

					<Stack gap={6}>
						<Text size='sm' fw={600}>
							{t('evaluation.format.label')}
						</Text>
						<SegmentedControl
							data={[
								{ value: 'STANDARD', label: t('evaluation.format.standard') },
								{ value: 'COPC', label: t('evaluation.format.copc') },
							]}
							value={draft.format}
							onChange={(value) => setFormat(value as EvaluationFormat)}
							w='fit-content'
						/>
						<Text size='xs' c='dimmed'>
							{t('evaluation.format.hint')}
						</Text>
					</Stack>

					<Select
						label={t('evaluation.form.label')}
						description={t('evaluation.form.description')}
						data={formOptions}
						value={draft.defaultFormId}
						onChange={(defaultFormId) => setDraft({ ...draft, defaultFormId })}
						placeholder={t('evaluation.form.placeholder')}
						nothingFoundMessage={t('evaluation.form.none')}
						comboboxProps={{ withinPortal: true }}
					/>

					<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
						<Select
							label={t('evaluation.primary.label')}
							description={t('evaluation.primary.description')}
							data={SEED_EVALUATORS.map((e) => ({
								value: e.id,
								label: evaluatorLabel(e.id),
							}))}
							value={draft.primaryEvaluatorId}
							onChange={(primaryEvaluatorId) =>
								setDraft({
									...draft,
									primaryEvaluatorId,
									fallbackEvaluatorId:
										draft.fallbackEvaluatorId === primaryEvaluatorId
											? null
											: draft.fallbackEvaluatorId,
								})
							}
							comboboxProps={{ withinPortal: true }}
						/>
						<Select
							label={t('evaluation.fallback.label')}
							description={t('evaluation.fallback.description')}
							data={SEED_EVALUATORS.filter(
								(e) => e.id !== draft.primaryEvaluatorId
							).map((e) => ({ value: e.id, label: evaluatorLabel(e.id) }))}
							value={draft.fallbackEvaluatorId}
							onChange={(fallbackEvaluatorId) =>
								setDraft({ ...draft, fallbackEvaluatorId })
							}
							comboboxProps={{ withinPortal: true }}
						/>
					</SimpleGrid>
				</Stack>
			</SectionCard>

			<VersionHistoryDrawer
				opened={historyOpened}
				onClose={() => setHistoryOpened(false)}
			/>
		</Stack>
	);
};

export default EvaluationTab;
