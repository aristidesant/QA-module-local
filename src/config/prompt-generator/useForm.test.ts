import { describe, expect, it } from 'vitest';
import { educationForm } from './education';
import { financeForm } from './finance';
import { genericForm } from './generic';
import { salesForm } from './sales';
import usePromptGeneratorFormDefinition from './useForm';

describe('usePromptGeneratorFormDefinition', () => {
	describe('returns correct form for each type', () => {
		it('should return financeForm for FINANCE type', () => {
			const result = usePromptGeneratorFormDefinition('FINANCE');
			expect(result).toBe(financeForm);
			expect(result.type).toBe('FINANCE');
		});

		it('should return educationForm for EDUCATION type', () => {
			const result = usePromptGeneratorFormDefinition('EDUCATION');
			expect(result).toBe(educationForm);
			expect(result.type).toBe('EDUCATION');
		});

		it('should return salesForm for SALES type', () => {
			const result = usePromptGeneratorFormDefinition('SALES');
			expect(result).toBe(salesForm);
			expect(result.type).toBe('SALES');
		});

		it('should return genericForm for CLIENT SUPPORT type', () => {
			const result = usePromptGeneratorFormDefinition('CLIENT SUPPORT');
			expect(result).toBe(genericForm);
			expect(result.type).toBe('CLIENT SUPPORT');
		});
	});

	describe('default behavior', () => {
		it('should return genericForm as the default', () => {
			const clientSupportResult =
				usePromptGeneratorFormDefinition('CLIENT SUPPORT');
			expect(clientSupportResult).toBe(genericForm);
		});
	});

	describe('form structure consistency', () => {
		const types: Array<'FINANCE' | 'EDUCATION' | 'SALES' | 'CLIENT SUPPORT'> = [
			'FINANCE',
			'EDUCATION',
			'SALES',
			'CLIENT SUPPORT',
		];

		it('all forms should have type property', () => {
			types.forEach((type) => {
				const form = usePromptGeneratorFormDefinition(type);
				expect(form.type).toBeDefined();
				expect(typeof form.type).toBe('string');
			});
		});

		it('all forms should have fields array', () => {
			types.forEach((type) => {
				const form = usePromptGeneratorFormDefinition(type);
				expect(form.fields).toBeDefined();
				expect(Array.isArray(form.fields)).toBe(true);
			});
		});

		it('all forms should have at least one field', () => {
			types.forEach((type) => {
				const form = usePromptGeneratorFormDefinition(type);
				expect(form.fields.length).toBeGreaterThan(0);
			});
		});

		it('all form fields should have required properties', () => {
			types.forEach((type) => {
				const form = usePromptGeneratorFormDefinition(type);
				form.fields.forEach((field) => {
					expect(field.label).toBeDefined();
					expect(field.name).toBeDefined();
					expect(field.placeholder).toBeDefined();
					expect(field.required).toBeDefined();
					expect(field.description).toBeDefined();
					expect(field.type).toBeDefined();
				});
			});
		});
	});

	describe('type safety', () => {
		it('FINANCE form type should match FINANCE string', () => {
			const form = usePromptGeneratorFormDefinition('FINANCE');
			expect(form.type).toBe('FINANCE');
		});

		it('EDUCATION form type should match EDUCATION string', () => {
			const form = usePromptGeneratorFormDefinition('EDUCATION');
			expect(form.type).toBe('EDUCATION');
		});

		it('SALES form type should match SALES string', () => {
			const form = usePromptGeneratorFormDefinition('SALES');
			expect(form.type).toBe('SALES');
		});

		it('CLIENT SUPPORT form type should match CLIENT SUPPORT string', () => {
			const form = usePromptGeneratorFormDefinition('CLIENT SUPPORT');
			expect(form.type).toBe('CLIENT SUPPORT');
		});
	});

	describe('form uniqueness', () => {
		it('each type should return a distinct form object', () => {
			const financeResult = usePromptGeneratorFormDefinition('FINANCE');
			const educationResult = usePromptGeneratorFormDefinition('EDUCATION');
			const salesResult = usePromptGeneratorFormDefinition('SALES');
			const clientSupportResult =
				usePromptGeneratorFormDefinition('CLIENT SUPPORT');

			expect(financeResult).not.toBe(educationResult);
			expect(financeResult).not.toBe(salesResult);
			expect(financeResult).not.toBe(clientSupportResult);
			expect(educationResult).not.toBe(salesResult);
			expect(educationResult).not.toBe(clientSupportResult);
			expect(salesResult).not.toBe(clientSupportResult);
		});
	});
});
