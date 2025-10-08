import { useEffect } from 'react';
import {
	Group,
	Text,
	Table,
	Badge,
	Avatar,
	Stack,
	Card,
	Loader,
	Tooltip,
} from '@mantine/core';
import styles from './ContactListOverview.module.css';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactDetails } from '~/modules/campaigns/CampaignsForm/ContactSection/ContactDetails';
import { useGetCampaignContacts } from '~/queries/contactsQueries';
import { usePagination } from '~/hooks/usePagination';
import PaginationControls from '~/components/PaginationControls';
import SearchHeader from './SearchHeader';
import type { Contact } from '~/models/ContactsModel';

interface ContactListOverviewProps {}

export const ContactListOverview: React.FC<ContactListOverviewProps> = () => {
	const { selectedCampaign, setRightComponent } = useCampaignsStore();

	// Use the pagination hook for all pagination logic
	const pagination = usePagination({
		initialItemsPerPage: 10,
		searchDebounceMs: 500,
	});

	// Fetch data with server-side pagination
	const { data: campaignContacts, isLoading } = useGetCampaignContacts(
		selectedCampaign?.id as number,
		pagination.getApiParams()
	);

	// Calculate total pages from server response
	const totalPages = campaignContacts?.total
		? pagination.calculateTotalPages(campaignContacts.total)
		: 0;

	// Helper functions for contact status and display
	const getStatusColor = (contact: Contact) => {
		// Support both legacy phones:string[] and new phoneNumbers:{ phoneNumber: string }[]
		const rawPhones: string[] = [
			...(contact.phones || []),
			...(contact.phoneNumbers
				? contact.phoneNumbers.map((p) => p.phoneNumber)
				: []),
		];
		const hasPhone = rawPhones.filter(Boolean).length > 0;
		const hasEmail = contact.emails && contact.emails.length > 0;
		return hasEmail && hasPhone ? 'green' : hasPhone ? 'blue' : 'gray';
	};

	const getContactStatus = (contact: Contact) => {
		const rawPhones: string[] = [
			...(contact.phones || []),
			...(contact.phoneNumbers
				? contact.phoneNumbers.map((p) => p.phoneNumber)
				: []),
		];
		const hasPhone = rawPhones.filter(Boolean).length > 0;
		const hasEmail = contact.emails && contact.emails.length > 0;
		return hasEmail && hasPhone
			? 'Active'
			: hasPhone || hasEmail
				? 'Partial'
				: 'Inactive';
	};

	const getInitials = (firstName: string, lastName: string) => {
		const firstInitial = firstName?.charAt(0) || '';
		const lastInitial = lastName?.charAt(0) || '';
		return `${firstInitial}${lastInitial}`.toUpperCase() || '??';
	};

	// Collect unique phone numbers (dedupe across both representations)
	const getUniquePhones = (contact: Contact): string[] => {
		const numbers = [
			...(contact.phoneNumbers
				? contact.phoneNumbers.map((p) => p.phoneNumber)
				: []),
			...(contact.phones || []),
		];
		// Normalize by stripping spaces, dashes, parentheses for dedupe but keep original display of first occurrence
		const seen = new Set<string>();
		const result: string[] = [];
		numbers.forEach((n) => {
			if (!n) return;
			const norm = n.replace(/[^+0-9]/g, '');
			if (!seen.has(norm)) {
				seen.add(norm);
				result.push(n);
			}
		});
		return result;
	};

	// Handle contact click for details view
	const handleContactClick = (contact: Contact) => {
		const primaryPhone = contact.phones?.[0] || '';
		const primaryEmail = contact.emails?.[0] || '';

		const contactDetails = {
			id: contact.id.toString(),
			name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
			phone: primaryPhone,
			email: primaryEmail,
			location: contact.address || 'N/A',
			language: 'Spanish',
			initials: getInitials(contact.firstName || '', contact.lastName || ''),
			engagementLevel: 87,
			qualificationScore: 75,
			sentiment: { positive: 2113, neutral: 45, negative: 16 },
		};

		if (setRightComponent) {
			setRightComponent(<ContactDetails contact={contactDetails} />);
		}
	};

	// Handle items per page change
	const handleItemsPerPageChange = (value: string | null) => {
		if (value) {
			pagination.setItemsPerPage(parseInt(value, 10));
		}
	};

	// Clear search function
	const handleClearSearch = () => {
		pagination.setSearchValue('');
	};

	// Cleanup effect
	useEffect(() => {
		return () => {
			setRightComponent?.(null);
		};
	}, [setRightComponent]);

	return (
		<Card className={styles.card}>
			{/* Search Header */}
			<SearchHeader
				title='Contact List Overview'
				subtitle='View and filter campaign contacts to tailor your outreach.'
				searchValue={pagination.searchValue}
				onSearchChange={pagination.setSearchValue}
				onClearSearch={handleClearSearch}
				onFiltersClick={() => {
					// TODO: Implement filters modal
				}}
			/>

			{/* Data Table */}
			<Stack gap='md'>
				<div className={styles.tableContainer}>
					<Table className={styles.table}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Name</Table.Th>
								<Table.Th>Primary number</Table.Th>
								<Table.Th>Email</Table.Th>
								<Table.Th>Status</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{isLoading ? (
								<Table.Tr>
									<Table.Td colSpan={4}>
										<Group justify='center' p='lg'>
											<Loader size='sm' />
											<Text size='sm' c='dimmed'>
												Loading contacts...
											</Text>
										</Group>
									</Table.Td>
								</Table.Tr>
							) : !campaignContacts?.contacts ||
							  campaignContacts.contacts.length === 0 ? (
								<Table.Tr>
									<Table.Td colSpan={4}>
										<Text ta='center' c='dimmed' p='lg'>
											{pagination.debouncedSearch
												? `No contacts found matching "${pagination.debouncedSearch}".`
												: 'No contacts available.'}
										</Text>
									</Table.Td>
								</Table.Tr>
							) : (
								campaignContacts.contacts.map((contact: Contact) => (
									<Table.Tr
										key={contact.id}
										onClick={() => handleContactClick(contact)}
										className={styles.contactRow}
									>
										<Table.Td>
											<Group gap='sm'>
												<Avatar size='sm' color='blue' radius='sm'>
													{getInitials(
														contact.firstName || '',
														contact.lastName || ''
													)}
												</Avatar>

												<Text size='sm' fw={500}>
													{`${contact.firstName || ''} ${
														contact.lastName || ''
													}`.trim()}
												</Text>
											</Group>
										</Table.Td>
										<Table.Td>
											{/* Phone numbers: show all unique numbers; if many, compact with tooltip */}
											{(() => {
												const uniquePhones = getUniquePhones(contact);
												if (uniquePhones.length === 0) {
													return (
														<Text
															size='sm'
															className={styles.phoneText}
															c='dimmed'
														>
															N/A
														</Text>
													);
												}

												// If 3 or fewer, display inline; else display first 2 and a +N indicator with tooltip
												if (uniquePhones.length <= 3) {
													return (
														<Group gap={4} wrap='wrap'>
															{uniquePhones.map((ph) => (
																<Badge
																	key={ph}
																	variant='light'
																	size='sm'
																	radius='sm'
																>
																	{ph}
																</Badge>
															))}
														</Group>
													);
												}

												const visible = uniquePhones.slice(0, 2);
												const hidden = uniquePhones.slice(2);
												return (
													<Group gap={4} wrap='wrap'>
														{visible.map((ph) => (
															<Badge
																key={ph}
																variant='light'
																size='sm'
																radius='sm'
															>
																{ph}
															</Badge>
														))}
														<Tooltip label={hidden.join(', ')}>
															<Badge
																variant='outline'
																size='sm'
																radius='sm'
																color='gray'
															>
																+{hidden.length}
															</Badge>
														</Tooltip>
													</Group>
												);
											})()}
										</Table.Td>
										<Table.Td>
											<Text size='sm' className={styles.emailText}>
												{contact.emails?.[0] || 'N/A'}
											</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												variant='light'
												color={getStatusColor(contact)}
												size='sm'
												className={styles.statusBadge}
											>
												{getContactStatus(contact)}
											</Badge>
										</Table.Td>
									</Table.Tr>
								))
							)}
						</Table.Tbody>
					</Table>
				</div>

				{/* Pagination Controls */}
				<PaginationControls
					currentPage={pagination.currentPage}
					totalPages={totalPages}
					itemsPerPage={pagination.itemsPerPage}
					totalItems={campaignContacts?.total || 0}
					onPageChange={pagination.setCurrentPage}
					onItemsPerPageChange={handleItemsPerPageChange}
					searchTerm={pagination.debouncedSearch}
					isLoading={isLoading}
					itemLabel='contacts'
				/>
			</Stack>
		</Card>
	);
};

export default ContactListOverview;
