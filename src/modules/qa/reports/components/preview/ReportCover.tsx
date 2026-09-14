import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import type { ReportDefinition } from '~/models/qa/reportBuilder';
import { scopeSummary } from '../../helpers';
import styles from '../../Reports.module.css';

interface ReportCoverProps {
	definition: ReportDefinition;
	generatedAt: string;
}

const initialsOf = (value: string): string =>
	value
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase() ?? '')
		.join('');

/** Title block of the document: who it is for, what window, what scope. */
export const ReportCover: React.FC<ReportCoverProps> = ({
	definition,
	generatedAt,
}) => {
	const { t } = useTranslation('qa.reports');
	const isClient = definition.audience === 'client';
	const mark = isClient ? (definition.clientName ?? '?') : 'QA';

	return (
		<Stack gap='sm'>
			<Group gap='md' align='center' wrap='nowrap'>
				<div className={styles.coverMark} aria-hidden>
					{initialsOf(mark)}
				</div>
				<div>
					<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
						{isClient
							? t('preview.preparedFor', { client: definition.clientName })
							: t('preview.internalLabel')}
					</Text>
					<Title order={2}>{definition.name || t('preview.untitled')}</Title>
					{definition.description && (
						<Text size='sm' c='dimmed' mt={2}>
							{definition.description}
						</Text>
					)}
				</div>
			</Group>

			<Group gap='xs' wrap='wrap'>
				<Badge variant='light' color={isClient ? 'grape' : 'blue'} tt='none'>
					{t(`audience.${definition.audience}`)}
				</Badge>
				<Badge variant='outline' tt='none'>
					{t('preview.period', {
						from: dayjs(definition.period.from).format('DD MMM YYYY'),
						to: dayjs(definition.period.to).format('DD MMM YYYY'),
					})}
				</Badge>
				{definition.period.compareWithPrevious && (
					<Badge variant='outline' color='gray' tt='none'>
						{t('preview.vsPrevious')}
					</Badge>
				)}
			</Group>

			<Text size='xs' c='dimmed'>
				{t('preview.scope', {
					scope: scopeSummary(definition, t('scope.allTeams')),
				})}
				{' · '}
				{t('preview.generatedAt', {
					date: dayjs(generatedAt).format('DD MMM YYYY · HH:mm'),
				})}
			</Text>

			<Text className={styles.confidential}>
				{isClient
					? t('preview.confidential.client', {
							client: definition.clientName,
						})
					: t('preview.confidential.internal')}
			</Text>

			<hr className={styles.coverRule} />
		</Stack>
	);
};

export default ReportCover;
