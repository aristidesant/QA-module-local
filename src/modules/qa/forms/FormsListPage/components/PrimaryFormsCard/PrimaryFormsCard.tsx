import { Badge, Group, Select, SimpleGrid, Text } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import { MODALITY_COLORS } from '~/modules/qa/forms/constants';
import type {
	BuilderForm,
	FormModality,
	PrimaryFormIds,
} from '~/modules/qa/forms/types';

export interface PrimaryFormsCardProps {
	forms: BuilderForm[];
	primaryFormIds: PrimaryFormIds;
	onChange: (modality: FormModality, formId: string | null) => void;
}

/** COPC first: it is the stricter modality and the one stakeholders ask about. */
const MODALITY_ORDER: FormModality[] = ['COPC', 'STANDARD'];

export default function PrimaryFormsCard({
	forms,
	primaryFormIds,
	onChange,
}: PrimaryFormsCardProps) {
	const { t } = useTranslation('qa.forms');
	const formsById = new Map(forms.map((form) => [form.id, form]));

	// Any form in the table can be the primary one of either category.
	const data = forms.map((form) => ({
		value: form.id,
		label: form.isActive ? form.name : `${form.name} (${t('status.inactive')})`,
	}));

	return (
		<SectionCard
			description={t('primary.description')}
			icon={IconStar}
			title={t('primary.title')}
		>
			<SimpleGrid cols={{ base: 1, sm: 2 }} maw={640} spacing='md'>
				{MODALITY_ORDER.map((modality) => {
					const key = modality.toLowerCase();

					return (
						<Select
							clearable
							data={data}
							key={modality}
							label={
								<Group gap='xs'>
									<Text fw={500} size='sm'>
										{t(`primary.${key}`)}
									</Text>
									<Badge
										color={MODALITY_COLORS[modality]}
										size='xs'
										variant='light'
									>
										{t(`modality.${key}`)}
									</Badge>
								</Group>
							}
							onChange={(value) => onChange(modality, value)}
							placeholder={t('primary.none')}
							renderOption={({ option }) => {
								const form = formsById.get(option.value);
								return (
									<Group
										gap='xs'
										justify='space-between'
										w='100%'
										wrap='nowrap'
									>
										<Text size='sm'>{option.label}</Text>
										{form ? (
											<Badge
												color={MODALITY_COLORS[form.modality]}
												size='xs'
												variant='light'
											>
												{t(`modality.${form.modality.toLowerCase()}`)}
											</Badge>
										) : null}
									</Group>
								);
							}}
							searchable
							size='sm'
							value={primaryFormIds[modality]}
						/>
					);
				})}
			</SimpleGrid>
		</SectionCard>
	);
}
