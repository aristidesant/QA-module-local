import { Button, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './ConversationNavigator.module.css';

interface ConversationNavigatorProps {
	currentIndex: number;
	total: number;
	onPrev: () => void;
	onNext: () => void;
}

export function ConversationNavigator({
	currentIndex,
	total,
	onPrev,
	onNext,
}: ConversationNavigatorProps) {
	const { t } = useTranslation('conversations');

	return (
		<Button.Group>
			<Tooltip label={t('navigation.previous')} withArrow>
				<Button
					size='xs'
					variant='default'
					px='xs'
					disabled={currentIndex === 0}
					onClick={onPrev}
					aria-label={t('navigation.previous')}
				>
					<IconChevronLeft size={13} />
				</Button>
			</Tooltip>

			<Button
				size='xs'
				variant='default'
				px='sm'
				tabIndex={-1}
				className={styles.counter}
			>
				{currentIndex + 1} / {total}
			</Button>

			<Tooltip label={t('navigation.next')} withArrow>
				<Button
					size='xs'
					variant='default'
					px='xs'
					disabled={currentIndex === total - 1}
					onClick={onNext}
					aria-label={t('navigation.next')}
				>
					<IconChevronRight size={13} />
				</Button>
			</Tooltip>
		</Button.Group>
	);
}

export default ConversationNavigator;
