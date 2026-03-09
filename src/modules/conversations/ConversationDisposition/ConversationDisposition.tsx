import { type FC, useState } from 'react';
import { IconInfoCircle, IconPhone } from '@tabler/icons-react';
import {
	useCallDispositionByConversationId,
	useCallDispositionWithAi,
} from '~/queries/callDispositionQueries';
import type { CallDispositionModel } from '~/models/CallDispositionModel';
import RightSectionCard from '~/components/RightSectionCard';
import { useTranslation } from 'react-i18next';
import ConversationDispositionContent, {
	getDispositionHeaderIcon,
	getDispositionStatusPresentation,
	normalizeDispositionStatus,
} from './ConversationDispositionContent';

type ConversationDispositionProps = {
	conversationId: string | number;
};

const ConversationDisposition: FC<ConversationDispositionProps> = ({
	conversationId,
}) => {
	const { t, i18n } = useTranslation(['conversations', 'common']);
	const { data, isLoading, isError, refetch } =
		useCallDispositionByConversationId(conversationId);

	const withAiMutation = useCallDispositionWithAi();
	const [isCallingAi, setIsCallingAi] = useState(false);

	const handleRetry = async () => {
		setIsCallingAi(true);
		try {
			// First call AI generation endpoint
			await withAiMutation.mutateAsync(Number(conversationId));
			// Then refetch the disposition data to show updated outcome
			await refetch();
		} catch (e) {
			// Let UI show the error state; no further action
		} finally {
			setIsCallingAi(false);
		}
	};

	if (isLoading) {
		return (
			<RightSectionCard
				title={t('disposition.title')}
				description={t('disposition.loading')}
				icon={IconPhone}
				iconColor='var(--mantine-color-gray-4)'
			>
				<ConversationDispositionContent isLoading />
			</RightSectionCard>
		);
	}

	if (isError) {
		return (
			<RightSectionCard
				title={t('disposition.title')}
				description={t('disposition.failed')}
				icon={IconInfoCircle}
				iconColor='var(--mantine-color-red-6)'
			>
				<ConversationDispositionContent
					isError
					isRetrying={isCallingAi}
					onRetry={handleRetry}
				/>
			</RightSectionCard>
		);
	}

	const disposition = data as CallDispositionModel | undefined;
	const status = normalizeDispositionStatus(
		disposition?.callStatus || disposition?.dispositionName
	);
	const statusView = getDispositionStatusPresentation(status, t);
	const updatedAt = disposition?.updatedAt || disposition?.createdAt;
	const timestampLabel = updatedAt
		? new Date(updatedAt).toLocaleDateString(
				i18n.language === 'es' ? 'es-ES' : 'en-US',
				{
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: '2-digit',
				}
			)
		: undefined;
	const headerIcon = getDispositionHeaderIcon(status);

	return (
		<RightSectionCard
			title={t('disposition.title')}
			description={timestampLabel || t('disposition.noUpdates')}
			icon={headerIcon.icon}
			iconColor={headerIcon.color || statusView.borderColorVar}
		>
			<ConversationDispositionContent
				disposition={disposition}
				timestampLabel={timestampLabel}
			/>
		</RightSectionCard>
	);
};

export default ConversationDisposition;
