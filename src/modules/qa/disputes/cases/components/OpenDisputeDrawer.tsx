import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
	Button,
	Checkbox,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import { IconFlag } from '@tabler/icons-react';
import { AppDrawer } from '~/components/AppDrawer';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { DisputeEvaluationType } from '~/models/qa/disputeCases';
import type { CallEvaluationDetail } from '~/views/Campaigns/types';
import { CALL_EVALUATION_TABS } from '~/views/Campaigns/constants';
import { AGENT_PERSONA_ID } from '~/modules/qa/team/constants';
import { useDisputesStore } from '~/stores/qa/disputesStore';
import {
	detectedSignalCount,
	headlineScore,
	listDisputableItems,
} from '../recalc';
import { MIN_AGENT_COMMENT } from '../constants';

interface OpenDisputeDrawerProps {
	opened: boolean;
	onClose: () => void;
	call: CallEvaluationDetail;
	campaignId: string;
	campaignName: string;
	initialType: DisputeEvaluationType;
}

/** Agent-facing form to contest one evaluation of a call. */
export const OpenDisputeDrawer: React.FC<OpenDisputeDrawerProps> = ({
	opened,
	onClose,
	call,
	campaignId,
	campaignName,
	initialType,
}) => {
	const { t } = useTranslation('qa.disputes');
	const navigate = useNavigate();
	const openDispute = useDisputesStore((s) => s.openDispute);

	const [type, setType] = useState<DisputeEvaluationType>(initialType);
	const [flagged, setFlagged] = useState<string[]>([]);
	const [comment, setComment] = useState('');

	// The tab the agent opened the drawer from is the one they mean to dispute.
	useEffect(() => {
		if (opened) {
			setType(initialType);
			setFlagged([]);
			setComment('');
		}
	}, [opened, initialType]);

	const items = useMemo(() => listDisputableItems(call, type), [call, type]);
	const score = headlineScore(call, type);
	const tooShort = comment.trim().length < MIN_AGENT_COMMENT;

	const handleSubmit = () => {
		const dispute = openDispute({
			callId: call.callId,
			campaignId,
			campaignName,
			agentId: AGENT_PERSONA_ID,
			evaluationType: type,
			agentComment: comment.trim(),
			flaggedItemIds: flagged,
		});
		onClose();
		notifySuccess(t('cases.open.toast'));
		navigate(`/qa/agent/disputes/${dispute.id}`);
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			icon={<IconFlag size={20} />}
			iconColor='red'
			title={t('cases.open.title')}
			description={t('cases.open.description')}
		>
			<Stack gap='lg'>
				<Select
					label={t('cases.open.type')}
					data={CALL_EVALUATION_TABS.map((tab) => ({
						value: tab.key,
						label: t(`cases.types.${tab.key}`),
					}))}
					value={type}
					onChange={(value) => value && setType(value as DisputeEvaluationType)}
					allowDeselect={false}
					comboboxProps={{ withinPortal: true }}
				/>

				<Paper withBorder p='sm' radius='md'>
					<Group justify='space-between'>
						<Text size='sm' c='dimmed'>
							{t('cases.open.score')}
						</Text>
						<Text size='sm' fw={700}>
							{score ?? `${detectedSignalCount(call)}`}
						</Text>
					</Group>
				</Paper>

				<div>
					<Text size='sm' fw={500}>
						{t('cases.open.items')}
					</Text>
					<Text size='xs' c='dimmed' mb='xs'>
						{t('cases.open.itemsHint')}
					</Text>
					{items.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('cases.open.noItems')}
						</Text>
					) : (
						<Checkbox.Group value={flagged} onChange={setFlagged}>
							<Stack gap='xs'>
								{items.map((item) => (
									<Checkbox
										key={item.id}
										value={item.id}
										label={item.label}
										description={`${item.group} · ${item.original}`}
									/>
								))}
							</Stack>
						</Checkbox.Group>
					)}
				</div>

				<Textarea
					label={t('cases.open.comment')}
					placeholder={t('cases.open.commentPlaceholder')}
					description={t('cases.open.minLength', { count: MIN_AGENT_COMMENT })}
					value={comment}
					onChange={(e) => setComment(e.currentTarget.value)}
					autosize
					minRows={4}
				/>

				<Group justify='flex-end'>
					<Button variant='subtle' onClick={onClose}>
						{t('cases.detail.back')}
					</Button>
					<Button color='red' disabled={tooShort} onClick={handleSubmit}>
						{t('cases.open.submit')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default OpenDisputeDrawer;
