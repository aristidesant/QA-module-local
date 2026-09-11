import { Grid, MultiSelect } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import { CAMPAIGN_TYPES, LINES_OF_BUSINESS } from '~/modules/qa/triggers/constants';
import {
	TRIGGER_AGENT_OPTIONS,
	TRIGGER_CAMPAIGNS,
	TRIGGER_SUPERVISORS,
} from '~/modules/qa/triggers/mockData';
import { type RuleFormValues } from '~/modules/qa/triggers/helpers';
import { SectionCard } from '~/components/SectionCard';

interface ScopeSectionProps {
	form: UseFormReturnType<RuleFormValues>;
	role: 'supervisor' | 'qaManager';
}

export function ScopeSection({ form, role }: ScopeSectionProps) {
	const { t } = useTranslation('qa.triggers');

	const campaignTypeOptions = CAMPAIGN_TYPES.map((ct) => ({
		label: t(`campaignTypes.${ct}`),
		value: ct,
	}));

	const lineOfBusinessOptions = LINES_OF_BUSINESS.map((lob) => ({
		label: lob,
		value: lob,
	}));

	return (
		<SectionCard
			title={t('editor.sections.scope')}
			description={t('editor.sections.scopeDescription')}
		>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<MultiSelect
						searchable
						clearable
						label={t('editor.fields.agents')}
						placeholder={t('editor.fields.agentsPlaceholder')}
						data={TRIGGER_AGENT_OPTIONS}
						value={form.values.scope.agentIds}
						onChange={(v) =>
							form.setFieldValue('scope.agentIds', v)
						}
					/>
				</Grid.Col>

				{role === 'qaManager' && (
					<Grid.Col span={{ base: 12, md: 6 }}>
						<MultiSelect
							searchable
							clearable
							label={t('editor.fields.supervisors')}
							placeholder={t('editor.fields.supervisorsPlaceholder')}
							data={TRIGGER_SUPERVISORS}
							value={form.values.scope.supervisorIds}
							onChange={(v) =>
								form.setFieldValue('scope.supervisorIds', v)
							}
						/>
					</Grid.Col>
				)}

				<Grid.Col span={{ base: 12, md: 6 }}>
					<MultiSelect
						searchable
						clearable
						label={t('editor.fields.campaigns')}
						placeholder={t('editor.fields.campaignsPlaceholder')}
						data={TRIGGER_CAMPAIGNS}
						value={form.values.scope.campaignIds}
						onChange={(v) =>
							form.setFieldValue('scope.campaignIds', v)
						}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<MultiSelect
						searchable
						clearable
						label={t('editor.fields.linesOfBusiness')}
						placeholder={t('editor.fields.linesOfBusinessPlaceholder')}
						data={lineOfBusinessOptions}
						value={form.values.scope.linesOfBusiness}
						onChange={(v) =>
							form.setFieldValue('scope.linesOfBusiness', v)
						}
					/>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<MultiSelect
						searchable
						clearable
						label={t('editor.fields.campaignTypes')}
						placeholder={t('editor.fields.campaignTypesPlaceholder')}
						data={campaignTypeOptions}
						value={form.values.scope.campaignTypes}
						onChange={(v) =>
							form.setFieldValue('scope.campaignTypes', v as any)
						}
					/>
				</Grid.Col>
			</Grid>
		</SectionCard>
	);
}
