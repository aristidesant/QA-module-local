import { useCallback, useMemo, useState } from 'react';
import { Button, Group, Select, Stack, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash, IconArrowsSort } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import {
	useGetOutboundTaskSortFields,
	useReorderOutboundTasks,
} from '~/queries/outboundQueries';
import type { SortRule } from '~/models/ContactsModel';
import { getErrorMessage } from '~/utils/httpClient';
import SectionCard from '~/components/SectionCard';
import styles from './ReorderControls.module.css';

interface ReorderControlsProps {
	campaignId: number;
	contactGroupId: number;
	availableWaves: number[];
}

const ReorderControls = ({
	campaignId,
	contactGroupId,
	availableWaves,
}: ReorderControlsProps) => {
	const { t } = useTranslation('campaign.contact-list');
	const [sortRules, setSortRules] = useState<SortRule[]>([]);
	const [scopeWave, setScopeWave] = useState<string | null>(null);

	const sortFieldsQuery = useGetOutboundTaskSortFields(campaignId);
	const reorderMutation = useReorderOutboundTasks();

	const fieldOptions = useMemo(() => {
		const data = sortFieldsQuery.data;
		if (!data) return [];
		const groups: {
			group: string;
			items: { value: string; label: string }[];
		}[] = [];
		const seen = new Set<string>();
		const dedupe = (items: { value: string; label: string }[]) =>
			items.filter((item) => {
				if (seen.has(item.value)) return false;
				seen.add(item.value);
				return true;
			});
		const staticItems = dedupe(
			(data.staticFields ?? []).map((f) => ({
				value: `static:${f.name}`,
				label: f.label,
			}))
		);
		if (staticItems.length > 0) {
			groups.push({
				group: t('queue.reorder.staticFields'),
				items: staticItems,
			});
		}
		const dynamicItems = dedupe(
			(data.dynamicFields ?? []).map((f) => ({
				value: `dynamic:${f.name}`,
				label: f.label,
			}))
		);
		if (dynamicItems.length > 0) {
			groups.push({
				group: t('queue.reorder.dynamicFields'),
				items: dynamicItems,
			});
		}
		return groups;
	}, [sortFieldsQuery.data, t]);

	const directionOptions = useMemo(
		() => [
			{ value: 'ASC', label: t('queue.reorder.ascending') },
			{ value: 'DESC', label: t('queue.reorder.descending') },
		],
		[t]
	);

	const waveOptions = useMemo(() => {
		const opts = [{ value: '', label: t('queue.reorder.allWaves') }];
		availableWaves.forEach((w) => {
			opts.push({
				value: String(w),
				label: t('queue.reorder.specificWave', { number: w }),
			});
		});
		return opts;
	}, [availableWaves, t]);

	const handleAddRule = useCallback(() => {
		setSortRules((prev) => [
			...prev,
			{ field: '', direction: 'ASC', isDynamic: false },
		]);
	}, []);

	const handleRemoveRule = useCallback((index: number) => {
		setSortRules((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleFieldChange = useCallback(
		(index: number, value: string | null) => {
			if (!value) return;
			setSortRules((prev) => {
				const next = [...prev];
				const isDynamic = value.startsWith('dynamic:');
				const fieldName = value.replace(/^(static|dynamic):/, '');
				next[index] = { ...next[index], field: fieldName, isDynamic };
				return next;
			});
		},
		[]
	);

	const handleDirectionChange = useCallback(
		(index: number, value: string | null) => {
			if (!value) return;
			setSortRules((prev) => {
				const next = [...prev];
				next[index] = {
					...next[index],
					direction: value as 'ASC' | 'DESC',
				};
				return next;
			});
		},
		[]
	);

	const handleApply = useCallback(() => {
		const validRules = sortRules.filter((r) => r.field);
		if (validRules.length === 0) {
			notifications.show({
				title: t('queue.reorder.title'),
				message: t('queue.reorder.noRules'),
				color: 'yellow',
			});
			return;
		}

		reorderMutation.mutate(
			{
				campaignId,
				contactGroupId,
				...(scopeWave ? { waveNumber: Number(scopeWave) } : {}),
				sortRules: validRules,
			},
			{
				onSuccess: (result) => {
					notifications.show({
						title: t('actions.success'),
						message: t('queue.reorder.success', {
							count: result.updatedCount,
						}),
						color: 'green',
					});
					setSortRules([]);
				},
				onError: (error) => {
					notifications.show({
						title: t('queue.reorder.error'),
						message: getErrorMessage(error),
						color: 'red',
					});
				},
			}
		);
	}, [sortRules, scopeWave, campaignId, contactGroupId, reorderMutation, t]);

	return (
		<SectionCard
			title={t('queue.reorder.title')}
			description={t('queue.reorder.description')}
		>
			<Stack gap='xs'>
				{sortRules.map((rule, index) => {
					const selectedValue = rule.field
						? `${rule.isDynamic ? 'dynamic' : 'static'}:${rule.field}`
						: null;
					return (
						<Group key={index} className={styles.ruleRow}>
							<Select
								size='sm'
								className={styles.fieldSelect}
								placeholder={t('queue.reorder.field')}
								data={fieldOptions}
								value={selectedValue}
								onChange={(v) => handleFieldChange(index, v)}
								searchable
							/>
							<Select
								size='sm'
								className={styles.directionSelect}
								data={directionOptions}
								value={rule.direction}
								onChange={(v) => handleDirectionChange(index, v)}
							/>
							<ActionIcon
								variant='subtle'
								color='red'
								size='sm'
								onClick={() => handleRemoveRule(index)}
							>
								<IconTrash size={14} />
							</ActionIcon>
						</Group>
					);
				})}

				<div className={styles.footer}>
					<Button
						size='xs'
						variant='light'
						leftSection={<IconPlus size={14} />}
						onClick={handleAddRule}
					>
						{t('queue.reorder.addRule')}
					</Button>

					<Group gap='xs'>
						{availableWaves.length > 1 && (
							<Select
								size='sm'
								label={t('queue.reorder.scope')}
								data={waveOptions}
								value={scopeWave ?? ''}
								onChange={setScopeWave}
								w={180}
							/>
						)}
						<Button
							size='xs'
							leftSection={<IconArrowsSort size={14} />}
							onClick={handleApply}
							loading={reorderMutation.isPending}
							disabled={sortRules.length === 0}
						>
							{t('queue.reorder.apply')}
						</Button>
					</Group>
				</div>
			</Stack>
		</SectionCard>
	);
};

export default ReorderControls;
