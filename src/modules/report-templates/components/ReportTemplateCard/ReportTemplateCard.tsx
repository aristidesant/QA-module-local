import { useTranslation } from 'react-i18next';
import { ActionIcon, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { IconEdit, IconTrash, IconFileExport } from '@tabler/icons-react';
import type { ReportTemplate } from '~/models/ReportValue';
import styles from './ReportTemplateCard.module.css';

interface ReportTemplateCardProps {
	template: ReportTemplate;
	columnsCount?: number;
	onEdit: () => void;
	onDelete: () => void;
	onExport: () => void;
}

const ReportTemplateCard = ({
	template,
	columnsCount = 0,
	onEdit,
	onDelete,
	onExport,
}: ReportTemplateCardProps) => {
	const { t } = useTranslation('report-templates');

	return (
		<Card withBorder radius='md' className={styles.card}>
			<Stack gap='sm'>
				<Group justify='space-between' align='flex-start'>
					<Stack gap={2} className={styles.content}>
						<Text fw={600} size='lg' className={styles.title}>
							{template.name}
						</Text>
						{template.description && (
							<Text size='sm' c='dimmed' lineClamp={2}>
								{template.description}
							</Text>
						)}
					</Stack>
					<Group gap='xs'>
						<ActionIcon
							variant='default'
							size='sm'
							onClick={onEdit}
							aria-label={t('actions.edit')}
						>
							<IconEdit size={16} />
						</ActionIcon>
						<ActionIcon
							variant='default'
							size='sm'
							onClick={onExport}
							aria-label={t('actions.export')}
						>
							<IconFileExport size={16} />
						</ActionIcon>
						<ActionIcon
							variant='default'
							size='sm'
							color='red'
							onClick={onDelete}
							aria-label={t('actions.delete')}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Group>
				</Group>

				<Group gap='xs' wrap='wrap'>
					{template.schemaId && (
						<Badge variant='light' size='sm'>
							{t('list.columns.schema')}: #{template.schemaId}
						</Badge>
					)}
					<Badge variant='light' size='sm'>
						{t('list.columns.columnsCount')}: {columnsCount}
					</Badge>
				</Group>

				<Text size='xs' c='dimmed'>
					{t('list.columns.createdAt')}:{' '}
					{new Date(template.createdAt).toLocaleDateString()}
				</Text>
			</Stack>
		</Card>
	);
};

export default ReportTemplateCard;
