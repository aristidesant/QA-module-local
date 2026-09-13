import { Badge, Button, Group, Paper, Rating, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsAssignment, LmsContent } from '~/models/qa';
import { LMS_AREA_META, LMS_FORMAT_META } from '../constants';
import { AreaBadge, FormatBadge } from './Badges';
import classes from './Cards.module.css';

interface ContentCardProps {
	content: LmsContent;
	assignment?: LmsAssignment;
	onOpen: () => void;
	onEnrol?: () => void;
}

export function ContentCard({ content, assignment, onOpen, onEnrol }: ContentCardProps) {
	const { t } = useTranslation('qa.lms');
	const formatMeta = LMS_FORMAT_META[content.format];
	const areaMeta = LMS_AREA_META[content.area];
	const Icon = formatMeta.icon;

	return (
		<Paper withBorder p='md' radius='md' className={`${classes.areaBar} ${classes.clickable}`} data-area={content.area}>
			<Stack gap='xs'>
				<Group gap='sm' align='flex-start' wrap='nowrap'>
					<ThemeIcon variant='light' color={areaMeta.color} size='lg' radius='md'>
						<Icon size={18} />
					</ThemeIcon>
					<Stack gap={4} flex={1} miw={0}>
						<Text fw={600} size='sm' lineClamp={2}>
							{content.title}
						</Text>
						<Group gap='xs'>
							<FormatBadge format={content.format} size='xs' />
							<AreaBadge area={content.area} subItem={content.subItem} size='xs' />
						</Group>
					</Stack>
				</Group>

				<Text size='xs' c='dimmed' lineClamp={2}>
					{content.summary}
				</Text>

				<Group justify='space-between' align='center'>
					<Group gap='sm'>
						<Group gap={4}>
							<IconClock size={14} color='var(--mantine-color-dimmed)' />
							<Text size='xs' c='dimmed'>
								{t('common.minutes', { count: content.durationMin })}
							</Text>
						</Group>
						<Badge size='xs' variant='default'>
							{t(`levels.${content.level}`)}
						</Badge>
						<Rating readOnly value={content.stats.avgRating} fractions={2} size='xs' />
					</Group>

					{assignment ? (
						<Button size='xs' variant='light' onClick={onOpen}>
							{t(formatMeta.ctaKey)}
						</Button>
					) : onEnrol ? (
						<Button size='xs' variant='light' onClick={onEnrol}>
							{t('agent.catalog.enrolSelf')}
						</Button>
					) : (
						<Button size='xs' variant='light' onClick={onOpen}>
							{t(formatMeta.ctaKey)}
						</Button>
					)}
				</Group>
			</Stack>
		</Paper>
	);
}
