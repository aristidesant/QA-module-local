import { describe, expect, it } from 'vitest';
import { educationForm } from './education';

describe('educationForm', () => {
	describe('form structure', () => {
		it('should have type EDUCATION', () => {
			expect(educationForm.type).toBe('EDUCATION');
		});

		it('should have fields array', () => {
			expect(Array.isArray(educationForm.fields)).toBe(true);
		});

		it('should have exactly 6 fields', () => {
			expect(educationForm.fields).toHaveLength(6);
		});
	});

	describe('required fields', () => {
		it('should have context as a required field', () => {
			const contextField = educationForm.fields.find(
				(field) => field.name === 'context'
			);
			expect(contextField).toBeDefined();
			expect(contextField?.required).toBe(true);
			expect(contextField?.label).toBe('Context');
			expect(contextField?.type).toBe('text');
		});

		it('should have questionType as a required field', () => {
			const questionTypeField = educationForm.fields.find(
				(field) => field.name === 'questionType'
			);
			expect(questionTypeField).toBeDefined();
			expect(questionTypeField?.required).toBe(true);
			expect(questionTypeField?.label).toBe('Question Type');
			expect(questionTypeField?.type).toBe('text');
		});

		it('should have studentProfile as a required field', () => {
			const studentProfileField = educationForm.fields.find(
				(field) => field.name === 'studentProfile'
			);
			expect(studentProfileField).toBeDefined();
			expect(studentProfileField?.required).toBe(true);
			expect(studentProfileField?.label).toBe('Student Profile');
			expect(studentProfileField?.type).toBe('text');
		});

		it('should have informationNeeded as a required field', () => {
			const informationNeededField = educationForm.fields.find(
				(field) => field.name === 'informationNeeded'
			);
			expect(informationNeededField).toBeDefined();
			expect(informationNeededField?.required).toBe(true);
			expect(informationNeededField?.label).toBe('Information Needed');
			expect(informationNeededField?.type).toBe('text');
		});

		it('should have toneFormality as a required field', () => {
			const toneFormalityField = educationForm.fields.find(
				(field) => field.name === 'toneFormality'
			);
			expect(toneFormalityField).toBeDefined();
			expect(toneFormalityField?.required).toBe(true);
			expect(toneFormalityField?.label).toBe('Tone and Formality');
			expect(toneFormalityField?.type).toBe('text');
		});
	});

	describe('optional fields', () => {
		it('should have additionalNotes as an optional field', () => {
			const additionalNotesField = educationForm.fields.find(
				(field) => field.name === 'additionalNotes'
			);
			expect(additionalNotesField).toBeDefined();
			expect(additionalNotesField?.required).toBe(false);
			expect(additionalNotesField?.label).toBe('Additional Notes');
			expect(additionalNotesField?.type).toBe('text');
		});
	});

	describe('field properties', () => {
		it('all fields should have label property', () => {
			educationForm.fields.forEach((field) => {
				expect(field.label).toBeDefined();
				expect(typeof field.label).toBe('string');
				expect(field.label.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have name property', () => {
			educationForm.fields.forEach((field) => {
				expect(field.name).toBeDefined();
				expect(typeof field.name).toBe('string');
				expect(field.name.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have placeholder property', () => {
			educationForm.fields.forEach((field) => {
				expect(field.placeholder).toBeDefined();
				expect(typeof field.placeholder).toBe('string');
			});
		});

		it('all fields should have description property', () => {
			educationForm.fields.forEach((field) => {
				expect(field.description).toBeDefined();
				expect(typeof field.description).toBe('string');
			});
		});

		it('all fields should have type property', () => {
			educationForm.fields.forEach((field) => {
				expect(field.type).toBeDefined();
				expect(typeof field.type).toBe('string');
			});
		});

		it('all fields should have required property as boolean', () => {
			educationForm.fields.forEach((field) => {
				expect(typeof field.required).toBe('boolean');
			});
		});
	});

	describe('field names uniqueness', () => {
		it('should have unique field names', () => {
			const fieldNames = educationForm.fields.map((field) => field.name);
			const uniqueNames = new Set(fieldNames);
			expect(uniqueNames.size).toBe(fieldNames.length);
		});
	});
});
