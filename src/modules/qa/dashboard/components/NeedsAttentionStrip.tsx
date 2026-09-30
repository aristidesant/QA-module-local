import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import styles from '../Dashboard.module.css';

export interface NeedsAttentionItem {
	id: string;
	label: string;
	value: number;
	/** Secondary line: what a click does, or how long the oldest item has waited. */
	hint: string;
	/** Destination when the tile is opened. Tiles with a zero value stay inert. */
	onOpen: () => void;
}

interface NeedsAttentionStripProps {
	items: NeedsAttentionItem[];
}

/** Role-specific action list shown above the scores: what needs a decision before the numbers do. */
export const NeedsAttentionStrip: React.FC<NeedsAttentionStripProps> = ({
	items,
}) => {
	const { t } = useTranslation('qa.dashboard');

	return (
		<SectionCard
			title={t('roleDashboard.attention.title')}
			description={t('roleDashboard.attention.description')}
		>
			<SimpleGrid cols={{ base: 1, sm: items.length }} spacing='md'>
				{items.map((item) => {
					const active = item.value > 0;
					const body = (
						<Stack gap={4}>
							<Group justify='space-between' wrap='nowrap'>
								<Text size='xl' fw={700} c={active ? 'red' : undefined}>
									{item.value}
								</Text>
								{active && <IconChevronRight size={16} />}
							</Group>
							<Text size='sm' fw={500}>
								{item.label}
							</Text>
							<Text size='sm' c='dimmed'>
								{item.hint}
							</Text>
						</Stack>
					);
					return active ? (
						<UnstyledButton
							key={item.id}
							className={styles.attentionTile}
							onClick={item.onOpen}
						>
							{body}
						</UnstyledButton>
					) : (
						<div key={item.id} className={styles.attentionTile}>
							{body}
						</div>
					);
				})}
			</SimpleGrid>
		</SectionCard>
	);
};

export default NeedsAttentionStrip;
