import { useMemo } from 'react';
import { Group, TextInput, Text } from '@mantine/core';
import { useContactEditStore } from '~/stores/contactEditStore';
import styles from './VariableDataEditor.module.css';

interface VariableDataEditorProps {
	title?: string;
}

const VariableDataEditor: React.FC<VariableDataEditorProps> = ({ title }) => {
	const { variableData, updateVariableField } = useContactEditStore();
	const entries = useMemo(
		() => Object.entries(variableData || {}),
		[variableData]
	);

	return (
		<div className={styles.root}>
			{title && (
				<Text size='sm' className={styles.title}>
					{title}
				</Text>
			)}
			<div className={styles.rows}>
				{entries.length === 0 && (
					<Text size='xs' c='dimmed'>
						No dynamic variables yet.
					</Text>
				)}
				{entries.map(([key, value]) => (
					<Group key={key} gap={6} wrap='nowrap' className={styles.row}>
						<Text size='xs' className={styles.key}>
							{key}
						</Text>
						<TextInput
							value={String(value ?? '')}
							onChange={(e) => updateVariableField(key, e.currentTarget.value)}
							size='xs'
							className={styles.value}
						/>
					</Group>
				))}
			</div>
		</div>
	);
};

export default VariableDataEditor;
