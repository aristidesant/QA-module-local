import { Badge, ScrollArea, Stack, Text } from '@mantine/core';
import { IconCheck, IconMinus, IconX } from '@tabler/icons-react';
import styles from '../ToolForm.module.css';
import type {
	Section,
	SectionId,
	SectionMetaMap,
	SectionState,
} from '../toolForm.types';

interface ToolFormSectionsNavProps {
	sections: Section[];
	activeSection: SectionId;
	sectionMeta: SectionMetaMap;
	onSelectSection: (sectionId: SectionId) => void;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormSectionsNav({
	sections,
	activeSection,
	sectionMeta,
	onSelectSection,
	t,
}: ToolFormSectionsNavProps) {
	const getBadge = (state: SectionState, required: boolean) => {
		switch (state) {
			case 'complete':
				return { label: t('form.sectionStatus.configured'), color: 'green' };
			case 'error':
				return { label: t('form.sectionStatus.error'), color: 'red' };
			case 'inactive':
				return { label: t('form.sectionStatus.inactive'), color: 'gray' };
			case 'current':
				return {
					label: required
						? t('form.sectionStatus.inProgress')
						: t('form.sectionStatus.optional'),
					color: 'blue',
				};
			case 'optional':
				return { label: t('form.sectionStatus.optional'), color: 'gray' };
			default:
				return {
					label: t('form.sectionStatus.empty'),
					color: required ? 'orange' : 'gray',
				};
		}
	};

	return (
		<div className={styles.menuColumn}>
			<div className={styles.menuHeader}>
				<Text size='xs' fw={700} tt='uppercase' c='dimmed'>
					{t('form.menu.sections')}
				</Text>
				<Text size='xs' c='dimmed' fw={500}>
					{sections.length}
				</Text>
			</div>
			<ScrollArea className={styles.menuScroll} type='auto'>
				<Stack gap={2}>
					{sections.map((section, index) => {
						const meta = sectionMeta[section.id];
						const isActive = activeSection === section.id;
						const stepLabel = String(index + 1).padStart(2, '0');
						const badge = getBadge(meta.state, meta.required);

						return (
							<div
								key={section.id}
								className={styles.menuItem}
								data-active={isActive}
								data-state={meta.state}
								onClick={() => onSelectSection(section.id)}
								role='button'
								tabIndex={0}
								data-testid={`section-menu-${section.id}`}
							>
								<div className={styles.menuItemHeader}>
									<div
										className={styles.stepNumber}
										data-active={isActive}
										data-state={meta.state}
										aria-hidden='true'
									>
										{meta.state === 'complete' ? (
											<IconCheck size={10} />
										) : meta.state === 'error' ? (
											<IconX size={10} />
										) : meta.state === 'inactive' ? (
											<IconMinus size={10} />
										) : (
											stepLabel
										)}
									</div>
									<div className={styles.menuItemText}>
										<Text className={styles.menuTitle}>
											{section.label}
											{meta.required ? null : (
												<Text
													span
													size='xs'
													c='dimmed'
													className={styles.menuHint}
												>
													{' '}
													{t('form.menu.optional')}
												</Text>
											)}
										</Text>
										<Text size='xs' c='dimmed' lineClamp={1}>
											{section.description}
										</Text>
									</div>
								</div>
								<Badge
									size='xs'
									variant='light'
									color={badge.color}
									radius='sm'
									className={styles.menuBadge}
								>
									{badge.label}
								</Badge>
							</div>
						);
					})}
				</Stack>
			</ScrollArea>
		</div>
	);
}
