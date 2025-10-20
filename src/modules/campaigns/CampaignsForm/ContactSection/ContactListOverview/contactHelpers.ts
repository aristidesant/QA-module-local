import type { Contact } from '~/models/ContactsModel';

export const getStatusColor = (contact: Contact) => {
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

export const getContactStatus = (contact: Contact) => {
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

export const getInitials = (firstName: string, lastName: string) => {
	const firstInitial = firstName?.charAt(0) || '';
	const lastInitial = lastName?.charAt(0) || '';
	return `${firstInitial}${lastInitial}`.toUpperCase() || '??';
};

// Collect unique phone numbers (dedupe across both representations)
export const getUniquePhones = (contact: Contact): string[] => {
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

export const getFullName = (contact: Contact) => {
	return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
};
