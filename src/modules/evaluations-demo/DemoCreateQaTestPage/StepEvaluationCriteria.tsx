import React, { useState } from 'react';
import { Alert, Anchor, Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconCheck, IconInfoCircle, IconPlus } from '@tabler/icons-react';
import GroupCard from './GroupCard';
import AddGroupDrawer from './AddGroupDrawer';
import AddItemDrawer from './AddItemDrawer';
import { WizardFooter, wizardKitStyles } from '../components/DemoWizardKit';
import type { CriteriaMode, EvaluationGroup, EvaluationItem } from './types';
import styles from './DemoCreateQaTestPage.module.css';

function groupTotal(group: EvaluationGroup) {
	return group.items.reduce((sum, item) => sum + item.yesPoints, 0);
}

interface StepEvaluationCriteriaProps {
	mode: CriteriaMode;
	onModeChange: (mode: CriteriaMode) => void;
	groups: EvaluationGroup[];
	onChange: (groups: EvaluationGroup[]) => void;
	onBack: () => void;
	onCancel: () => void;
	onSaveDraft: () => void;
	onNext: () => void;
}

const StepEvaluationCriteria: React.FC<StepEvaluationCriteriaProps> = ({
	mode,
	onModeChange,
	groups,
	onChange,
	onBack,
	onCancel,
	onSaveDraft,
	onNext,
}) => {
	const [addGroupOpened, setAddGroupOpened] = useState(false);
	const [addItemGroupId, setAddItemGroupId] = useState<string | null>(null);

	const grandTotal = groups.reduce((sum, g) => sum + groupTotal(g), 0);
	const isComplete = grandTotal === 100;
	const canReview = groups.some((g) => g.items.length > 0);

	const handleAddGroup = (name: string, description: string) => {
		onChange([...groups, { id: `group-${Date.now()}`, name, description, items: [] }]);
	};

	const handleDeleteGroup = (groupId: string) => {
		onChange(groups.filter((g) => g.id !== groupId));
	};

	const handleAddItem = (item: Omit<EvaluationItem, 'id'>) => {
		if (!addItemGroupId) return;
		onChange(
			groups.map((g) =>
				g.id === addItemGroupId
					? { ...g, items: [...g.items, { ...item, id: `item-${Date.now()}` }] }
					: g
			)
		);
	};

	const handleDeleteItem = (groupId: string, itemId: string) => {
		onChange(
			groups.map((g) =>
				g.id === groupId
					? { ...g, items: g.items.filter((i) => i.id !== itemId) }
					: g
			)
		);
	};

	const startFromTemplate = () => {
		onModeChange('template');
		onChange([
			{
				id: `group-${Date.now()}`,
				name: 'Greeting & Opening',
				description: 'How the agent opens the conversation',
				items: [],
			},
		]);
	};

	return (
		<Stack gap='md'>
			{mode === null ? (
				<div className={wizardKitStyles.stepCard}>
					<Text fw={700} mb='md'>
						How would you like to create evaluation criteria?
					</Text>
					<Group grow align='stretch'>
						<div className={styles.optionCard}>
							<Text fw={600}>Create from Template</Text>
							<Text size='sm' c='dimmed' mb='sm'>
								Start with a pre-built template
							</Text>
							<Button
								variant='light'
								color='green'
								fullWidth
								onClick={startFromTemplate}
							>
								Choose Template
							</Button>
						</div>
						<div className={styles.optionCard}>
							<Text fw={600}>Create from Scratch</Text>
							<Text size='sm' c='dimmed' mb='sm'>
								Build custom criteria
							</Text>
							<Button
								variant='light'
								color='green'
								fullWidth
								onClick={() => onModeChange('scratch')}
							>
								Start Blank
							</Button>
						</div>
					</Group>
				</div>
			) : (
				<div className={wizardKitStyles.stepCard}>
					<Group justify='space-between' mb='md'>
						<Group gap='xs'>
							<Badge color='blue' variant='light'>
								{mode === 'template' ? 'From Template' : 'From Scratch'}
							</Badge>
							<Anchor size='sm' fw={600} onClick={() => onModeChange(null)}>
								Change
							</Anchor>
						</Group>
						<Group gap='sm'>
							<Badge color={isComplete ? 'green' : 'red'} variant='light'>
								Total Points: {grandTotal}/100
							</Badge>
							<Button
								color='green'
								leftSection={<IconPlus size={16} />}
								onClick={() => setAddGroupOpened(true)}
							>
								New Group
							</Button>
						</Group>
					</Group>

					<Text fw={700} size='sm'>
						Groups & Items
					</Text>
					<Text size='xs' c='dimmed' mb='md'>
						Define the evaluation criteria
					</Text>

					{groups.length === 0 ? (
						<Text size='sm' c='dimmed'>
							No groups added yet — click "New Group" to get started.
						</Text>
					) : (
						<Stack gap='md'>
							{groups.map((group) => (
								<GroupCard
									key={group.id}
									group={group}
									totalPoints={groupTotal(group)}
									onDeleteGroup={() => handleDeleteGroup(group.id)}
									onAddItem={() => setAddItemGroupId(group.id)}
									onDeleteItem={(itemId) => handleDeleteItem(group.id, itemId)}
								/>
							))}
						</Stack>
					)}
				</div>
			)}

			{mode !== null && (
				<Alert
					color={isComplete ? 'green' : 'yellow'}
					variant='light'
					icon={isComplete ? <IconCheck size={16} /> : <IconInfoCircle size={16} />}
					title={isComplete ? 'Total Points Complete' : 'Total Points Not Complete'}
				>
					{isComplete
						? `Current total: ${grandTotal}/100. You're ready to publish this test.`
						: `Current total: ${grandTotal}/100. You can save as draft and continue later, or adjust points to reach 100 to publish.`}
				</Alert>
			)}

			<div className={wizardKitStyles.footerSpacer} />

			<WizardFooter>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				<Group gap='sm'>
					<Button variant='default' onClick={onCancel}>
						Cancel
					</Button>
					<Button variant='light' color='green' onClick={onSaveDraft}>
						Save as Draft
					</Button>
					<Button color='green' disabled={!canReview} onClick={onNext}>
						Review Test
					</Button>
				</Group>
			</WizardFooter>

			<AddGroupDrawer
				opened={addGroupOpened}
				onClose={() => setAddGroupOpened(false)}
				onAdd={handleAddGroup}
			/>
			<AddItemDrawer
				opened={addItemGroupId !== null}
				onClose={() => setAddItemGroupId(null)}
				onAdd={handleAddItem}
			/>
		</Stack>
	);
};

export default StepEvaluationCriteria;
