import { describe, it, expect } from 'vitest';
import {
	getContactStatus,
	getFullName,
	getInitials,
	getStatusColor,
	getUniquePhones,
} from './contactHelpers';
import type { Contact } from '~/models/ContactsModel';

const buildContact = (overrides: Partial<Contact> = {}): Contact => ({
	id: 1,
	firstName: 'John',
	lastName: 'Doe',
	status: 'ACTIVE',
	identifier: '',
	identifierType: null,
	emails: [],
	phoneNumbers: [],
	birthDate: null,
	address: '',
	clientId: 1,
	userId: 1,
	contactGroupId: 1,
	createdAt: '',
	updatedAt: '',
	...overrides,
});

describe('contactHelpers', () => {
	it('gets status color based on available channels', () => {
		// Email only returns gray (no phone)
		expect(
			getStatusColor(
				buildContact({ emails: ['john@example.com'], phoneNumbers: [] })
			)
		).toBe('gray');
		// Phone only returns blue
		expect(
			getStatusColor(
				buildContact({
					emails: [],
					phoneNumbers: [{ phoneNumber: '123', id: 1 }],
				})
			)
		).toBe('blue');
		// Both email and phone returns green
		expect(
			getStatusColor(
				buildContact({
					emails: ['john@example.com'],
					phoneNumbers: [{ phoneNumber: '123', id: 1 }],
				})
			)
		).toBe('green');
		// Neither returns gray
		expect(getStatusColor(buildContact())).toBe('gray');
	});

	it('builds initials safely', () => {
		expect(getInitials('Jane', 'Doe')).toBe('JD');
		expect(getInitials('', '')).toBe('??');
	});

	it('deduplicates phone numbers preserving first appearance', () => {
		const contact = buildContact({
			phoneNumbers: [
				{ id: 1, phoneNumber: '+1 (809) 555-1234' },
				{ id: 2, phoneNumber: '+18095551234' },
				{ id: 3, phoneNumber: '+1 809-555-9999' },
			],
		});
		expect(getUniquePhones(contact)).toEqual([
			'+1 (809) 555-1234',
			'+1 809-555-9999',
		]);
	});

	it('returns contact status and full name consistently', () => {
		const contact = buildContact({
			firstName: 'Ana',
			lastName: 'Smith',
			status: 'INACTIVE',
		});
		expect(getContactStatus(contact)).toBe('INACTIVE');
		expect(getFullName(contact)).toBe('Ana Smith');
		expect(getFullName(buildContact({ firstName: '', lastName: '' }))).toBe('');
	});
});
