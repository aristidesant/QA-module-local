import { describe, expect, it } from 'vitest';
import { genericForm } from './generic';

describe('genericForm', () => {
	describe('form structure', () => {
		it('should have type CLIENT SUPPORT', () => {
			expect(genericForm.type).toBe('CLIENT SUPPORT');
		});

		it('should have fields array', () => {
			expect(Array.isArray(genericForm.fields)).toBe(true);
		});

		it('should have exactly 5 fields', () => {
			expect(genericForm.fields).toHaveLength(5);
		});
	});

	describe('required fields', () => {
		it('should have agentName as a required field', () => {
			const agentNameField = genericForm.fields.find(
				(field) => field.name === 'agentName'
			);
			expect(agentNameField).toBeDefined();
			expect(agentNameField?.required).toBe(true);
			expect(agentNameField?.label).toBe('Agent Name');
			expect(agentNameField?.type).toBe('text');
		});

		it('should have agentPurpose as a required field', () => {
			const agentPurposeField = genericForm.fields.find(
				(field) => field.name === 'agentPurpose'
			);
			expect(agentPurposeField).toBeDefined();
			expect(agentPurposeField?.required).toBe(true);
			expect(agentPurposeField?.label).toBe('Agent Purpose');
			expect(agentPurposeField?.type).toBe('text');
		});
	});

	describe('optional fields', () => {
		it('should have personalityTraits as an optional field', () => {
			const personalityTraitsField = genericForm.fields.find(
				(field) => field.name === 'personalityTraits'
			);
			expect(personalityTraitsField).toBeDefined();
			expect(personalityTraitsField?.required).toBe(false);
			expect(personalityTraitsField?.label).toBe('Personality Traits');
			expect(personalityTraitsField?.type).toBe('text');
		});

		it('should have responseLanguage as an optional field', () => {
			const responseLanguageField = genericForm.fields.find(
				(field) => field.name === 'responseLanguage'
			);
			expect(responseLanguageField).toBeDefined();
			expect(responseLanguageField?.required).toBe(false);
			expect(responseLanguageField?.label).toBe('Response Language');
			expect(responseLanguageField?.type).toBe('text');
		});

		it('should have specialInstructions as an optional field', () => {
			const specialInstructionsField = genericForm.fields.find(
				(field) => field.name === 'specialInstructions'
			);
			expect(specialInstructionsField).toBeDefined();
			expect(specialInstructionsField?.required).toBe(false);
			expect(specialInstructionsField?.label).toBe('Special Instructions');
			expect(specialInstructionsField?.type).toBe('text');
		});
	});

	describe('field properties', () => {
		it('all fields should have label property', () => {
			genericForm.fields.forEach((field) => {
				expect(field.label).toBeDefined();
				expect(typeof field.label).toBe('string');
				expect(field.label.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have name property', () => {
			genericForm.fields.forEach((field) => {
				expect(field.name).toBeDefined();
				expect(typeof field.name).toBe('string');
				expect(field.name.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have placeholder property', () => {
			genericForm.fields.forEach((field) => {
				expect(field.placeholder).toBeDefined();
				expect(typeof field.placeholder).toBe('string');
			});
		});

		it('all fields should have description property', () => {
			genericForm.fields.forEach((field) => {
				expect(field.description).toBeDefined();
				expect(typeof field.description).toBe('string');
			});
		});

		it('all fields should have type property', () => {
			genericForm.fields.forEach((field) => {
				expect(field.type).toBeDefined();
				expect(typeof field.type).toBe('string');
			});
		});

		it('all fields should have required property as boolean', () => {
			genericForm.fields.forEach((field) => {
				expect(typeof field.required).toBe('boolean');
			});
		});
	});

	describe('field names uniqueness', () => {
		it('should have unique field names', () => {
			const fieldNames = genericForm.fields.map((field) => field.name);
			const uniqueNames = new Set(fieldNames);
			expect(uniqueNames.size).toBe(fieldNames.length);
		});
	});

	describe('field types', () => {
		it('should have all fields as text type', () => {
			const textFields = genericForm.fields.filter(
				(field) => field.type === 'text'
			);
			expect(textFields).toHaveLength(5);
		});
	});

	describe('required vs optional fields count', () => {
		it('should have 2 required fields and 3 optional fields', () => {
			const requiredFields = genericForm.fields.filter(
				(field) => field.required === true
			);
			const optionalFields = genericForm.fields.filter(
				(field) => field.required === false
			);
			expect(requiredFields).toHaveLength(2);
			expect(optionalFields).toHaveLength(3);
		});
	});
});
