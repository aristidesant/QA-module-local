import {
	ActionIcon,
	Button,
	Group,
	Menu,
	Stack,
	Switch,
	Text,
	Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	IconCode,
	IconLayoutGrid,
	IconSeparatorHorizontal,
	IconSeparatorVertical,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { WorkflowLayoutDirection } from '../WorkflowSection.types';
import { useWorkflowState } from '../WorkflowStateContext';
import styles from './WorkflowHeader.module.css';
import WorkflowJsonModal from '../WorkflowJsonPreview/WorkflowJsonModal';

const WorkflowHeader = () => {
	const { t } = useTranslation('campaigns');
	const [jsonModalOpened, { open: openJsonModal, close: closeJsonModal }] =
		useDisclosure(false);

	const {
		preventSubagentLoops,
		onPreventSubagentLoopsChange,
		onLayoutDirectionChange,
		organizeLayout,
	} = useWorkflowState();

	const handleOrganize = (direction: WorkflowLayoutDirection) => {
		onLayoutDirectionChange(direction);
		// Small delay to ensure state update if needed, though organizeLayout should handle it
		setTimeout(() => {
			organizeLayout();
		}, 0);
	};

	return (
		<>
			<Group
				justify='space-between'
				align='center'
				gap='xs'
				className={styles.header}
			>
				<Stack gap='xs'>
					<Text size='sm' fw={600}>
						{t('form.workflow.header.title')}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('form.workflow.header.description')}
					</Text>
				</Stack>
				<Group gap='md' className={styles.controls}>
					<Switch
						size='sm'
						label={t('form.workflow.header.preventLoops')}
						checked={preventSubagentLoops}
						onChange={(event) =>
							onPreventSubagentLoopsChange(event.currentTarget.checked)
						}
					/>

					<Tooltip
						label={t('form.workflow.json.tooltip', {
							defaultValue: 'Preview JSON',
						})}
					>
						<ActionIcon
							variant='light'
							color='gray'
							size='lg'
							onClick={openJsonModal}
						>
							<IconCode size={18} />
						</ActionIcon>
					</Tooltip>

					<Menu shadow='md' width={200} position='bottom-end' withinPortal>
						<Menu.Target>
							<Button
								size='sm'
								variant='light'
								leftSection={<IconLayoutGrid size={16} />}
							>
								{t('form.workflow.layout.organize')}
							</Button>
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Label>{t('form.workflow.layout.label')}</Menu.Label>
							<Menu.Item
								leftSection={<IconSeparatorHorizontal size={14} />}
								onClick={() => handleOrganize('horizontal')}
							>
								{t('form.workflow.layout.horizontal')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconSeparatorVertical size={14} />}
								onClick={() => handleOrganize('vertical')}
							>
								{t('form.workflow.layout.vertical')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Group>

			<WorkflowJsonModal opened={jsonModalOpened} onClose={closeJsonModal} />
		</>
	);
};

export default WorkflowHeader;
