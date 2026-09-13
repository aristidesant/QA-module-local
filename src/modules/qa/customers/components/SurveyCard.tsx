import { Badge, Group, Paper, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { formatDate } from '~/modules/qa/team/helpers';
import type { SurveyResponse } from '../types';
import { npsBand } from '../helpers';

interface SurveyCardProps {
	survey: SurveyResponse;
}

export function SurveyCard({ survey }: SurveyCardProps) {
	const { t } = useTranslation('qa.customers');
	const band = npsBand(survey.type === 'NPS' ? survey.score : survey.score * 2);
	const color = survey.type === 'NPS' ? band.color : survey.score >= 4 ? 'green' : survey.score >= 3 ? 'yellow' : 'red';

	return (
		<Paper withBorder p='sm' radius='md'>
			<Group justify='space-between'>
				<Group gap='xs'>
					<Badge variant='filled' color={color}>{survey.type} {survey.score}{survey.type === 'NPS' ? '/10' : '/5'}</Badge>
					{survey.type === 'NPS' && <Text size='xs'>{t(`surveys.band.${band.label}`)}</Text>}
				</Group>
				<Text size='xs' c='dimmed'>{survey.agentName} · {formatDate(survey.date)}</Text>
			</Group>
			{survey.verbatim && <Text size='sm' fs='italic' mt='xs'>&ldquo;{survey.verbatim}&rdquo;</Text>}
		</Paper>
	);
}
