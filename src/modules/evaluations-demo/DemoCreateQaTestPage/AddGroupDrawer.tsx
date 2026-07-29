import React, { useState } from 'react';
import { Button, Group, Stack, Textarea, TextInput } from '@mantine/core';
import AppDrawer from '~/components/AppDrawer';

interface AddGroupDrawerProps {
	opened: boolean;
	onClose: () => void;
	onAdd: (name: string, description: string) => void;
}

const AddGroupDrawer: React.FC<AddGroupDrawerProps> = ({ opened, onClose, onAdd }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const handleClose = () => {
		setName('');
		setDescription('');
		onClose();
	};

	const handleAdd = () => {
		if (!name.trim()) return;
		onAdd(name.trim(), description.trim());
		handleClose();
	};

	return (
		<AppDrawer opened={opened} onClose={handleClose} title='Add Group'>
			<Stack gap='md'>
				<TextInput
					label='Group Name'
					placeholder='e.g., Greeting & Opening'
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<Textarea
					label='Description'
					placeholder='What should be evaluated in this group?'
					minRows={3}
					value={description}
					onChange={(e) => setDescription(e.currentTarget.value)}
				/>
				<Group justify='flex-end'>
					<Button variant='default' onClick={handleClose}>
						Cancel
					</Button>
					<Button color='green' disabled={!name.trim()} onClick={handleAdd}>
						Add Group
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default AddGroupDrawer;
