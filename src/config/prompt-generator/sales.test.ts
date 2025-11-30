import { describe, expect, it } from 'vitest';
import { salesForm } from './sales';

describe('salesForm', () => {
	describe('form structure', () => {
		it('should have type SALES', () => {
			expect(salesForm.type).toBe('SALES');
		});

		it('should have fields array', () => {
			expect(Array.isArray(salesForm.fields)).toBe(true);
		});

		it('should have exactly 6 fields', () => {
			expect(salesForm.fields).toHaveLength(6);
		});
	});

	describe('required fields', () => {
		it('should have agent_name as a required field', () => {
			const agentNameField = salesForm.fields.find(
				(field) => field.name === 'agent_name'
			);
			expect(agentNameField).toBeDefined();
			expect(agentNameField?.required).toBe(true);
			expect(agentNameField?.label).toBe('Agent Name');
			expect(agentNameField?.type).toBe('text');
		});

		it('should have product_type as a required field', () => {
			const productTypeField = salesForm.fields.find(
				(field) => field.name === 'product_type'
			);
			expect(productTypeField).toBeDefined();
			expect(productTypeField?.required).toBe(true);
			expect(productTypeField?.label).toBe('Product or Service Type');
			expect(productTypeField?.type).toBe('text');
		});

		it('should have target_audience as a required field', () => {
			const targetAudienceField = salesForm.fields.find(
				(field) => field.name === 'target_audience'
			);
			expect(targetAudienceField).toBeDefined();
			expect(targetAudienceField?.required).toBe(true);
			expect(targetAudienceField?.label).toBe('Target Audience');
			expect(targetAudienceField?.type).toBe('text');
		});

		it('should have sales_goal as a required field', () => {
			const salesGoalField = salesForm.fields.find(
				(field) => field.name === 'sales_goal'
			);
			expect(salesGoalField).toBeDefined();
			expect(salesGoalField?.required).toBe(true);
			expect(salesGoalField?.label).toBe('Sales Goal');
			expect(salesGoalField?.type).toBe('text');
		});
	});

	describe('optional fields', () => {
		it('should have communication_tone as an optional field', () => {
			const communicationToneField = salesForm.fields.find(
				(field) => field.name === 'communication_tone'
			);
			expect(communicationToneField).toBeDefined();
			expect(communicationToneField?.required).toBe(false);
			expect(communicationToneField?.label).toBe('Communication Tone');
			expect(communicationToneField?.type).toBe('text');
		});

		it('should have key_selling_points as an optional textarea field', () => {
			const keySellingPointsField = salesForm.fields.find(
				(field) => field.name === 'key_selling_points'
			);
			expect(keySellingPointsField).toBeDefined();
			expect(keySellingPointsField?.required).toBe(false);
			expect(keySellingPointsField?.label).toBe(
				'Key Selling Points or Restrictions'
			);
			expect(keySellingPointsField?.type).toBe('textarea');
		});
	});

	describe('field properties', () => {
		it('all fields should have label property', () => {
			salesForm.fields.forEach((field) => {
				expect(field.label).toBeDefined();
				expect(typeof field.label).toBe('string');
				expect(field.label.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have name property', () => {
			salesForm.fields.forEach((field) => {
				expect(field.name).toBeDefined();
				expect(typeof field.name).toBe('string');
				expect(field.name.length).toBeGreaterThan(0);
			});
		});

		it('all fields should have placeholder property', () => {
			salesForm.fields.forEach((field) => {
				expect(field.placeholder).toBeDefined();
				expect(typeof field.placeholder).toBe('string');
			});
		});

		it('all fields should have description property', () => {
			salesForm.fields.forEach((field) => {
				expect(field.description).toBeDefined();
				expect(typeof field.description).toBe('string');
			});
		});

		it('all fields should have type property', () => {
			salesForm.fields.forEach((field) => {
				expect(field.type).toBeDefined();
				expect(typeof field.type).toBe('string');
			});
		});

		it('all fields should have required property as boolean', () => {
			salesForm.fields.forEach((field) => {
				expect(typeof field.required).toBe('boolean');
			});
		});
	});

	describe('field names uniqueness', () => {
		it('should have unique field names', () => {
			const fieldNames = salesForm.fields.map((field) => field.name);
			const uniqueNames = new Set(fieldNames);
			expect(uniqueNames.size).toBe(fieldNames.length);
		});
	});

	describe('field types', () => {
		it('should have 5 text fields and 1 textarea field', () => {
			const textFields = salesForm.fields.filter(
				(field) => field.type === 'text'
			);
			const textareaFields = salesForm.fields.filter(
				(field) => field.type === 'textarea'
			);
			expect(textFields).toHaveLength(5);
			expect(textareaFields).toHaveLength(1);
		});
	});

	describe('required vs optional fields count', () => {
		it('should have 4 required fields and 2 optional fields', () => {
			const requiredFields = salesForm.fields.filter(
				(field) => field.required === true
			);
			const optionalFields = salesForm.fields.filter(
				(field) => field.required === false
			);
			expect(requiredFields).toHaveLength(4);
			expect(optionalFields).toHaveLength(2);
		});
	});
});
