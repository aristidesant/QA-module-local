import {
	IconClock,
	IconPhoneOff,
	IconPhonePause,
	IconPhoneX,
} from '@tabler/icons-react';
import { Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import styles from './OutcomeNodeFlags.module.css';

interface OutcomeNodeFlagsProps {
	node: DispositionNode;
	size?: number;
}

const OutcomeNodeFlags: React.FC<OutcomeNodeFlagsProps> = ({
	node,
	size = 14,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const isDoNotCall = Boolean(node.doNotCall ?? node.do_not_call);

	return (
		<div className={styles.flags}>
			{isDoNotCall && (
				<Tooltip withArrow label={t('disposition.nodeEditor.doNotCall')}>
					<span className={styles.flag} data-tone='danger'>
						<IconPhoneX size={size} aria-hidden='true' />
					</span>
				</Tooltip>
			)}
			{node.isAbandoned && (
				<Tooltip withArrow label={t('disposition.nodeEditor.abandoned')}>
					<span className={styles.flag} data-tone='warning'>
						<IconPhonePause size={size} aria-hidden='true' />
					</span>
				</Tooltip>
			)}
			{node.isInvalidatesNumber && (
				<Tooltip
					withArrow
					label={t('disposition.nodeEditor.invalidatesNumber')}
				>
					<span className={styles.flag} data-tone='danger'>
						<IconPhoneOff size={size} aria-hidden='true' />
					</span>
				</Tooltip>
			)}
			{node.requiresReschedule && (
				<Tooltip
					withArrow
					label={t('disposition.nodeEditor.requiresReschedule')}
				>
					<span className={styles.flag} data-tone='warning'>
						<IconClock size={size} aria-hidden='true' />
					</span>
				</Tooltip>
			)}
		</div>
	);
};

export default OutcomeNodeFlags;
