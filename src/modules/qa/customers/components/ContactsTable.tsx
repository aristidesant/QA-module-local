import { createColumnHelper } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Text } from '@mantine/core';
import { IconExternalLink, IconPhoneIncoming, IconPhoneOutgoing } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import BaseTable from '~/components/BaseTable/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable/BaseTable';
import { EMOTION_META, SENTIMENT_CATEGORY_META } from '~/modules/qa/team/constants';
import { formatDateTime, formatSeconds, sentimentColor } from '~/modules/qa/team/helpers';
import type { ContactRecord, OfferRecord } from '../types';
import { CHANNEL_META, OFFER_RESULT_META, OUTCOME_META } from '../constants';

const helper = createColumnHelper<ContactRecord>();

interface ContactsTableProps {
	contacts: ContactRecord[];
	offers: OfferRecord[];
	compact?: boolean;
}

export function ContactsTable({ contacts, offers, compact }: ContactsTableProps) {
	const { t } = useTranslation('qa.customers');
	const navigate = useNavigate();

	const columns: BaseTableColumnDef<ContactRecord>[] = [
		helper.accessor('date', {
			header: t('contacts.columns.date'),
			cell: (info) => <Text size='sm'>{formatDateTime(info.getValue())}</Text>,
		}) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('direction', {
			header: t('contacts.columns.direction'),
			cell: (info) => (
				<Badge variant='outline' leftSection={info.getValue() === 'inbound' ? <IconPhoneIncoming size={12} /> : <IconPhoneOutgoing size={12} />}>
					{info.getValue() === 'inbound' ? t('contacts.inbound') : t('contacts.outbound')}
				</Badge>
			),
		}) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('channel', {
			header: t('contacts.columns.channel'),
			cell: (info) => <Text size='sm'>{t(CHANNEL_META[info.getValue()].labelKey)}</Text>,
		}) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('agentName', { header: t('contacts.columns.agent') }) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('campaignName', { header: t('contacts.columns.campaign') }) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('outcome', {
			header: t('contacts.columns.outcome'),
			cell: (info) => <Badge color={OUTCOME_META[info.getValue()].color}>{t(OUTCOME_META[info.getValue()].labelKey)}</Badge>,
		}) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('durationSeconds', {
			header: t('contacts.columns.duration'),
			cell: (info) => <Text size='sm'>{info.getValue() > 0 ? formatSeconds(info.getValue()) : '—'}</Text>,
		}) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('customerSentiment', {
			header: t('contacts.columns.sentiment'),
			cell: (info) => {
				const value = info.getValue();
				const category = info.row.original.customerCategory;
				if (value === undefined || !category) return <Text size='sm' c='dimmed'>—</Text>;
				return (
					<Group gap={4} wrap='nowrap'>
						<Text size='sm' c={sentimentColor(value)} fw={600}>{value.toFixed(1)}</Text>
						<Badge size='xs' variant='light' color={SENTIMENT_CATEGORY_META[category].color}>{SENTIMENT_CATEGORY_META[category].label}</Badge>
					</Group>
				);
			},
		}) as BaseTableColumnDef<ContactRecord>,
		helper.accessor('dominantEmotion', {
			header: t('contacts.columns.emotion'),
			cell: (info) => {
				const emotion = info.getValue();
				return emotion ? <Badge size='xs' variant='light' color={EMOTION_META[emotion].color}>{EMOTION_META[emotion].label}</Badge> : <Text size='sm' c='dimmed'>—</Text>;
			},
		}) as BaseTableColumnDef<ContactRecord>,
		helper.display({
			id: 'offer',
			header: t('contacts.columns.offer'),
			cell: (info) => {
				const offer = offers.find((o) => o.id === info.row.original.offerId);
				if (!offer) return <Text size='sm' c='dimmed'>—</Text>;
				return (
					<Group gap={4} wrap='nowrap'>
						<Badge color={OFFER_RESULT_META[offer.result].color} variant='filled'>{t(OFFER_RESULT_META[offer.result].labelKey)}</Badge>
						<Text size='xs'>{offer.offer}</Text>
					</Group>
				);
			},
		}) as BaseTableColumnDef<ContactRecord>,
		helper.display({
			id: 'open',
			header: t('contacts.columns.open'),
			cell: (info) => (info.row.original.outcome === 'answered' ? (
				<ActionIcon variant='subtle' onClick={() => navigate(`/qa/campaigns/1/calls/${info.row.original.callId}`)}>
					<IconExternalLink size={16} />
				</ActionIcon>
			) : null),
		}) as BaseTableColumnDef<ContactRecord>,
	];

	return (
		<BaseTable<ContactRecord>
			data={contacts}
			columns={columns}
			getRowId={(r) => r.id}
			enablePagination
			pageSize={compact ? 5 : 10}
			density='compact'
			enableExpanding
			renderExpandedRow={(row) => <Text size='sm' p='sm'>{row.summary}</Text>}
		/>
	);
}
