import { TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { useClientStore } from '~/stores/clientStore';
import classes from './ClientSearchBox.module.css';

export default function ClientSearchBox() {
	const { searchQuery, setSearchQuery } = useClientStore();

	return (
		<div className={classes.searchContainer}>
			<TextInput
				placeholder='Search client'
				value={searchQuery}
				onChange={(event) => setSearchQuery(event.currentTarget.value)}
				leftSection={<IconSearch size={16} />}
				classNames={{
					root: classes.searchRoot,
					input: classes.searchInput,
				}}
			/>
			<ActionIcon
				size='lg'
				variant='filled'
				color='blue'
				className={classes.addButton}
			>
				<IconPlus size={16} />
			</ActionIcon>
		</div>
	);
}
