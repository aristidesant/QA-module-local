import type { Contact } from '~/models/ContactsModel';

export const getStatusColor = (contact: Contact) => {
	const hasPhone = contact.phoneNumbers && contact.phoneNumbers.length > 0;
	const hasEmail = contact.emails && contact.emails.length > 0;
	return hasEmail && hasPhone ? 'green' : hasPhone ? 'blue' : 'gray';
};

export const getContactStatus = (contact: Contact) => {
	return contact?.status;
};

export const getInitials = (firstName: string, lastName: string) => {
	const firstInitial = firstName?.charAt(0) || '';
	const lastInitial = lastName?.charAt(0) || '';
	return `${firstInitial}${lastInitial}`.toUpperCase() || '??';
};

// Collect unique phone numbers
export const getUniquePhones = (contact: Contact): string[] => {
	const numbers = contact.phoneNumbers || [];
	// Normalize by stripping spaces, dashes, parentheses for dedupe but keep original display of first occurrence
	const seen = new Set<string>();
	const result: string[] = [];
	numbers.forEach((phoneEntry) => {
		const phone = phoneEntry.phoneNumber;
		if (!phone || typeof phone !== 'string') return;
		const norm = phone.replace(/[^+0-9]/g, '');
		if (!seen.has(norm)) {
			seen.add(norm);
			result.push(phone);
		}
	});
	return result;
};

export const getFullName = (contact: Contact) => {
	return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
};
