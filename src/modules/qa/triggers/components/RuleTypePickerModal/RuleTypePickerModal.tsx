import { Modal, SimpleGrid, Stack, Text, ThemeIcon, Paper, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RuleKind, RuleType } from '~/models/qa';
import { RULE_TYPE_META, ALERT_RULE_TYPES, RECOGNITION_RULE_TYPES } from '~/modules/qa/triggers/constants';
import classes from './RuleTypePickerModal.module.css';

interface RuleTypePickerModalProps {
	opened: boolean;
	onClose: () => void;
	kinds: RuleKind[];
	onSelect: (type: RuleType) => void;
}

export const RuleTypePickerModal = ({ opened, onClose, kinds, onSelect }: RuleTypePickerModalProps) => {
	const { t } = useTranslation('qa.triggers');

	const handleSelect = (type: RuleType) => {
		onSelect(type);
		onClose();
	};

	const handleKeyDown = (e: React.KeyboardEvent, type: RuleType) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect(type);
		}
	};

	const getTypesForKind = (kind: RuleKind): RuleType[] => {
		return kind === 'ALERT' ? ALERT_RULE_TYPES : RECOGNITION_RULE_TYPES;
	};

	return (
		<Modal opened={opened} onClose={onClose} title={t('picker.title')} size='xl'>
			<Stack gap='xl'>
				{kinds.map((kind) => {
					const types = getTypesForKind(kind);
					return (
						<Stack key={kind} gap='md'>
							<Text fw={600} size='sm'>
								{t(`picker.${kind === 'ALERT' ? 'alerts' : 'recognition'}`)}
							</Text>
							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
								{types.map((type) => {
									const meta = RULE_TYPE_META[type];
									const Icon = meta.icon;
									const example = t(`types.${type}.example`);

									return (
										<Paper
											key={type}
											withBorder
											p='md'
											radius='md'
											className={classes.card}
											role='button'
											tabIndex={0}
											onClick={() => handleSelect(type)}
											onKeyDown={(e) => handleKeyDown(e, type)}
										>
											<Group gap='md' align='flex-start' wrap='nowrap'>
												<ThemeIcon
													variant='light'
													size='lg'
													color={meta.color}
													radius='md'
												>
													<Icon size={18} />
												</ThemeIcon>
												<Stack gap={4} flex={1} style={{ minWidth: 0 }}>
													<Text fw={600} size='sm'>
														{t(`types.${type}.label`)}
													</Text>
													<Text size='sm' c='dimmed' lineClamp={2}>
														{t(`types.${type}.description`)}
													</Text>
													<Text size='xs' c='dimmed' fs='italic' lineClamp={1}>
														{t('picker.example', { example })}
													</Text>
												</Stack>
											</Group>
										</Paper>
									);
								})}
							</SimpleGrid>
						</Stack>
					);
				})}
			</Stack>
		</Modal>
	);
};

export default RuleTypePickerModal;
