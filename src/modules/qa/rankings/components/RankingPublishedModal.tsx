import { Button, Modal, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RankingProgram } from '~/models/qa/rankingPrograms';
import { BloomIllustration } from './BloomIllustration';
import styles from './RankingPublishedModal.module.css';

interface RankingPublishedModalProps {
	program: RankingProgram | null;
	/** Closing, by the button or otherwise, takes the manager to the ranking. */
	onClose: () => void;
}

/** A small moment after a new ranking goes live: a flower opens, two hands clap, one line of credit. */
export function RankingPublishedModal({
	program,
	onClose,
}: RankingPublishedModalProps) {
	const { t } = useTranslation('qa.rankings');

	return (
		<Modal
			opened={program !== null}
			onClose={onClose}
			size='sm'
			centered
			radius='lg'
			withCloseButton={false}
			aria-label={t('published.title')}
			overlayProps={{ backgroundOpacity: 0.45, blur: 2 }}
		>
			<Stack gap='sm' align='center' className={styles.body} py='md'>
				<BloomIllustration />
				<Title order={3}>{t('published.title')}</Title>
				<Text size='sm' c='dimmed' maw={300}>
					{t('published.line')}
				</Text>
				{program && (
					<Text size='xs' c='dimmed'>
						{t('published.detail', {
							name: program.name,
							count: program.teams.length,
						})}
					</Text>
				)}
				<Button mt='sm' onClick={onClose} data-autofocus>
					{t('published.cta')}
				</Button>
			</Stack>
		</Modal>
	);
}

export default RankingPublishedModal;
