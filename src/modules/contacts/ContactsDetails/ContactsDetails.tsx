import { Button, Group, Loader, Paper, Stack, Text } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useGetContact, useDeleteContact } from "~/queries/contactsQueries";
import classes from "./ContactsDetails.module.css";

interface ContactsDetailsProps {
	contactId: number;
	onEdit: (id: number) => void;
	onDeleted: () => void;
}

export default function ContactsDetails({
	contactId,
	onEdit,
	onDeleted,
}: ContactsDetailsProps) {
	const {
		data: contact,
		isLoading,
		isError,
	} = useGetContact(contactId.toString());
	const deleteContact = useDeleteContact();

	if (isLoading) {
		return (
			<Group justify="center" py="xl">
				<Loader />
			</Group>
		);
	}

	if (isError || !contact) {
		return (
			<Group justify="center" py="xl">
				<Text c="red">Failed to load contact details.</Text>
			</Group>
		);
	}

	const handleDelete = async () => {
		await deleteContact.mutateAsync(contactId.toString());
		onDeleted();
	};

	return (
		<Paper withBorder p="md" className={classes.detailsContainer}>
			<Stack>
				<Text fw={500} size="lg">
					{contact.firstName} {contact.lastName}
				</Text>
				<Text>Email: {contact.emails?.[0]}</Text>
				<Text>Phone: {contact.phone}</Text>
				<Text>Identifier: {contact.identifier}</Text>
				<Text>Identifier Type: {contact.identifierType}</Text>
				<Text>Birth Date: {contact.birthDate}</Text>
				<Text>Address: {contact.address}</Text>
				<Group mt="md">
					<Button
						leftSection={<IconEdit size={16} />}
						onClick={() => onEdit(contact.id)}
						size="xs"
					>
						Edit
					</Button>
					<Button
						leftSection={<IconTrash size={16} />}
						color="red"
						onClick={handleDelete}
						size="xs"
						loading={deleteContact.isPending}
					>
						Delete
					</Button>
				</Group>
			</Stack>
		</Paper>
	);
}
