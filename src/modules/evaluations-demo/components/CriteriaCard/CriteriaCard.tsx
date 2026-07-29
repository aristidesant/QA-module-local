import React from 'react';
import { Badge, Group, Stack, Text } from '@mantine/core';
import type { DemoCriteriaSection } from '../../mockData';
import { DEMO_PASS_FAIL_COLORS } from '../../demoBadgeColors';
import SectionCard from '~/components/SectionCard';
import styles from './CriteriaCard.module.css';

interface CriteriaCardProps {
	section: DemoCriteriaSection;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ section }) => {
	return (
		<SectionCard
			title={section.name}
			headerActions={
				<Badge variant='light' color='green' size='lg'>
					{section.score}/{section.maxScore}
				</Badge>
			}
		>
			<Stack gap={0}>
				{section.subCriteria.map((item) => (
					<div key={item.id} className={styles.row}>
						<Text size='sm' className={styles.description}>
							{item.description}
						</Text>
						<Group gap='xs' wrap='nowrap'>
							<Badge
								color={DEMO_PASS_FAIL_COLORS[item.verdict]}
								variant='light'
								size='sm'
							>
								{item.verdict === 'pass' ? 'Yes' : 'No'}
							</Badge>
							<Text size='sm' fw={600} c='dimmed'>
								{item.points}/{item.maxPoints}
							</Text>
						</Group>
					</div>
				))}
			</Stack>
		</SectionCard>
	);
};

export default CriteriaCard;
