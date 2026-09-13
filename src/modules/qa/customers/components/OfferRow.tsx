import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { IconBuildingStore } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { NON_CONVERSION_REASON_LABELS } from '~/modules/qa/team/constants';
import { formatDate } from '~/modules/qa/team/helpers';
import type { OfferRecord } from '../types';
import { OFFER_RESULT_META } from '../constants';

interface OfferRowProps {
	offer: OfferRecord;
}

export function OfferRow({ offer }: OfferRowProps) {
	const { t } = useTranslation('qa.customers');
	const meta = OFFER_RESULT_META[offer.result];

	return (
		<Paper withBorder p='sm' radius='md'>
			<Group justify='space-between' wrap='nowrap'>
				<Stack gap={2}>
					<Group gap='xs'>
						<Badge color={meta.color} variant='filled'>{t(meta.labelKey)}</Badge>
						<Text fw={600} size='sm'>{offer.offer}</Text>
					</Group>
					<Text size='xs' c='dimmed'>
						{t('offers.price', { price: `$${offer.monthlyPrice}` })} · {offer.agentName} · {formatDate(offer.date)}
					</Text>
					{offer.nonConversionReason && <Text size='xs'>{NON_CONVERSION_REASON_LABELS[offer.nonConversionReason]}</Text>}
					{offer.competitorMentioned && (
						<Badge size='xs' variant='outline' color='orange' leftSection={<IconBuildingStore size={12} />}>{offer.competitorMentioned}</Badge>
					)}
					{offer.note && <Text size='xs' fs='italic'>{offer.note}</Text>}
				</Stack>
			</Group>
		</Paper>
	);
}
