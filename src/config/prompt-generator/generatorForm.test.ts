import { describe, expect, it } from 'vitest';
import type {
	PromptGeneratorForm,
	PromptGeneratorFormField,
} from './generatorForm';

describe('generatorForm types', () => {
	describe('PromptGeneratorFormField type', () => {
		it('should allow creating a valid form field object', () => {
			const field: PromptGeneratorFormField = {
				label: 'Test Label',
				name: 'testName',
				placeholder: 'Test placeholder',
				required: true,
				description: 'Test description',
				type: 'text',
			};

			expect(field.label).toBe('Test Label');
			expect(field.name).toBe('testName');
			expect(field.placeholder).toBe('Test placeholder');
			expect(field.required).toBe(true);
			expect(field.description).toBe('Test description');
			expect(field.type).toBe('text');
		});

		it('should allow creating a field with required set to false', () => {
			const field: PromptGeneratorFormField = {
				label: 'Optional Field',
				name: 'optionalField',
				placeholder: 'Optional placeholder',
				required: false,
				description: 'Optional description',
				type: 'textarea',
			};

			expect(field.required).toBe(false);
			expect(field.type).toBe('textarea');
		});
	});

	describe('PromptGeneratorForm type', () => {
		it('should allow creating a valid form object with FINANCE type', () => {
			const form: PromptGeneratorForm = {
				type: 'FINANCE',
				fields: [
					{
						label: 'Test',
						name: 'test',
						placeholder: 'Test',
						required: true,
						description: 'Test',
						type: 'text',
					},
				],
			};

			expect(form.type).toBe('FINANCE');
			expect(form.fields).toHaveLength(1);
		});

		it('should allow creating a valid form object with EDUCATION type', () => {
			const form: PromptGeneratorForm = {
				type: 'EDUCATION',
				fields: [],
			};

			expect(form.type).toBe('EDUCATION');
			expect(form.fields).toHaveLength(0);
		});

		it('should allow creating a valid form object with SALES type', () => {
			const form: PromptGeneratorForm = {
				type: 'SALES',
				fields: [
					{
						label: 'Field 1',
						name: 'field1',
						placeholder: 'Placeholder 1',
						required: true,
						description: 'Description 1',
						type: 'text',
					},
					{
						label: 'Field 2',
						name: 'field2',
						placeholder: 'Placeholder 2',
						required: false,
						description: 'Description 2',
						type: 'textarea',
					},
				],
			};

			expect(form.type).toBe('SALES');
			expect(form.fields).toHaveLength(2);
		});

		it('should allow creating a valid form object with CLIENT SUPPORT type', () => {
			const form: PromptGeneratorForm = {
				type: 'CLIENT SUPPORT',
				fields: [],
			};

			expect(form.type).toBe('CLIENT SUPPORT');
		});
	});

	describe('type structure validation', () => {
		it('PromptGeneratorFormField should have all required properties', () => {
			const field: PromptGeneratorFormField = {
				label: 'Label',
				name: 'name',
				placeholder: 'Placeholder',
				required: true,
				description: 'Description',
				type: 'text',
			};

			const requiredKeys = [
				'label',
				'name',
				'placeholder',
				'required',
				'description',
				'type',
			];
			requiredKeys.forEach((key) => {
				expect(field).toHaveProperty(key);
			});
		});

		it('PromptGeneratorForm should have type and fields properties', () => {
			const form: PromptGeneratorForm = {
				type: 'FINANCE',
				fields: [],
			};

			expect(form).toHaveProperty('type');
			expect(form).toHaveProperty('fields');
		});
	});
});
