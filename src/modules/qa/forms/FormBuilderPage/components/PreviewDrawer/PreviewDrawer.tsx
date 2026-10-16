import { Badge, Group, Radio, Stack, Text, Textarea } from '@mantine/core';
import { IconAlertTriangle, IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import AppDrawer from '~/components/AppDrawer';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { MODALITY_COLORS } from '~/modules/qa/forms/constants';
import type { BuilderForm, BuilderQuestion } from '~/modules/qa/forms/types';

export interface PreviewDrawerProps {
	opened: boolean;
	onClose: () => void;
	form: BuilderForm;
}

function PreviewControl({ question }: { question: BuilderQuestion }) {
	const { t } = useTranslation('qa.forms');

	if (question.modality === 'STANDARD') {
		return question.answerType === 'OPEN' ? (
			<Textarea
				disabled
				minRows={2}
				placeholder={t('question.answerTypes.OPEN')}
				size='sm'
			/>
		) : (
			<Radio.Group>
				<Stack gap={6}>
					{question.options.map((option) => (
						<Radio
							disabled
							key={option.id}
							label={`${option.label} (${option.score})`}
							value={option.id}
						/>
					))}
				</Stack>
			</Radio.Group>
		);
	}

	return (
		<Stack gap={6}>
			<Radio.Group>
				<Group>
					<Radio disabled label={t('question.yes')} value='YES' />
					<Radio disabled label={t('question.no')} value='NO' />
				</Group>
			</Radio.Group>
			<Group gap={6}>
				<Text c='dimmed' size='xs'>
					{t('preview.favorable', {
						answer: t(`question.${question.favorableAnswer.toLowerCase()}`),
					})}
				</Text>
				<Badge color='violet' size='xs' variant='light'>
					{question.errorCode ?? '—'}
				</Badge>
				<Badge color='gray' size='xs' variant='outline'>
					{t(`question.campaignTypes.${question.campaignType}`)}
				</Badge>
			</Group>
		</Stack>
	);
}

export default function PreviewDrawer({
	opened,
	onClose,
	form,
}: PreviewDrawerProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<AppDrawer
			description={form.description || t('preview.description')}
			headerActions={
				<Badge color={MODALITY_COLORS[form.modality]} variant='light'>
					{t(`modality.${form.modality.toLowerCase()}`)}
				</Badge>
			}
			icon={<IconEye size={18} />}
			onClose={onClose}
			opened={opened}
			size='lg'
			title={form.name || t('preview.title')}
		>
			<Stack gap='md' mt='md'>
				{form.sections.length === 0 ? (
					<EmptyState
						icon={<IconEye size={32} />}
						message={t('preview.empty')}
					/>
				) : null}

				{form.sections.map((section, sectionIndex) => (
					<SectionCard
						description={section.guidance || undefined}
						key={section.id}
						padding='md'
						title={`${sectionIndex + 1}. ${section.name || t('section.namePlaceholder')}`}
					>
						<Stack gap='md'>
							{section.questions
								.filter((question) => question.isActive)
								.map((question, questionIndex) => (
									<Stack gap={6} key={question.id}>
										<Group gap='xs' wrap='nowrap'>
											<Text fw={600} size='sm'>
												{`${sectionIndex + 1}.${questionIndex + 1} ${question.text}`}
											</Text>
											{question.notApplicable ? (
												<Badge color='gray' size='xs' variant='light'>
													{t('preview.na')}
												</Badge>
											) : null}
											{question.autoFail !== 'NONE' ? (
												<IconAlertTriangle
													color='var(--mantine-color-red-6)'
													size={14}
												/>
											) : null}
										</Group>
										{question.guidance ? (
											<Text c='dimmed' fs='italic' size='xs'>
												{question.guidance}
											</Text>
										) : null}
										<PreviewControl question={question} />
									</Stack>
								))}
						</Stack>
					</SectionCard>
				))}
			</Stack>
		</AppDrawer>
	);
}
