import React, { useState } from 'react';
import { Tabs } from '@mantine/core';
import { IconForms, IconSettings, IconHistory } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { PromptGeneratorContent } from '../PromptGeneratorContent';
import { PromptFormContent } from '../PromptFormContent';

import usePromptFormStore from '~/modules/prompt-form/usePromptFormStore';
import { usePromptGeneratorStore } from '~/modules/prompt-generator/usePromptGeneratorStore';
import styles from './PrompterPage.module.css';
import { PromptHistoryContainer } from '../PromptHistoryContainer';

export const PrompterPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState<string | null>('generator');

	// Get right components from both stores
	const promptFormRightComponent = usePromptFormStore(
		(state) => state.rightComponent
	);
	const promptGeneratorRightComponent = usePromptGeneratorStore(
		(state) => state.rightComponent
	);

	// Determine which right component to show based on active tab
	const getRightComponent = () => {
		switch (activeTab) {
			case 'forms':
				return promptFormRightComponent;
			case 'generator':
				return promptGeneratorRightComponent;
			case 'history':
				return null; // History doesn't need a right panel
			default:
				return null;
		}
	};

	return (
		<ContentContainer
			title='Prompter'
			description='Create, manage, and track all your prompt-related activities in one place'
			rightSection={getRightComponent() || <></>}
		>
			<Tabs
				value={activeTab}
				onChange={setActiveTab}
				className={styles.tabs}
				keepMounted={false}
				variant='default'
			>
				<Tabs.List className={styles.tabsList} grow>
					<Tabs.Tab
						value='generator'
						leftSection={<IconForms size={18} />}
						className={styles.tab}
					>
						Prompt Generator
					</Tabs.Tab>
					<Tabs.Tab
						value='forms'
						leftSection={<IconSettings size={18} />}
						className={styles.tab}
					>
						Prompt Forms
					</Tabs.Tab>
					<Tabs.Tab
						value='history'
						leftSection={<IconHistory size={18} />}
						className={styles.tab}
					>
						Prompt History
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='generator' className={styles.tabPanel}>
					<PromptGeneratorContent />
				</Tabs.Panel>

				<Tabs.Panel value='forms' className={styles.tabPanel}>
					<PromptFormContent />
				</Tabs.Panel>

				<Tabs.Panel value='history' className={styles.tabPanel}>
					<PromptHistoryContainer />
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
};
