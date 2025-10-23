import type {
	MappedResult,
	FieldMappingWithDynamicColumns,
} from '~/models/ContactFileSummary';

/**
 * Standard contact fields that should be at the root level of fieldMapping
 */
const STANDARD_CONTACT_FIELDS = [
	'firstName',
	'lastName',
	'phone',
	'phoneNumber',
	'phones',
	'email',
	'address',
	'identifier',
	'birthDate',
] as const;

/**
 * Transforms the column mappings to separate standard fields from dynamic columns.
 * Standard fields remain at the root level, while custom/dynamic fields are grouped
 * under a 'dynamicColumns' property.
 *
 * @param columnMappings - The raw column mappings from the form
 * @returns Transformed field mapping with dynamicColumns separated
 *
 * @example
 * // Input:
 * {
 *   firstName: { csvField: 'nombre' },
 *   lastName: { csvField: 'apellido' },
 *   montoDeuda: { csvField: 'montoDeuda' },
 *   tipoTarjeta: { csvField: 'tipoTarjeta' }
 * }
 *
 * // Output:
 * {
 *   fieldMapping: {
 *     firstName: { csvField: 'nombre' },
 *     lastName: { csvField: 'apellido' },
 *     dynamicColumns: {
 *       montoDeuda: { csvField: 'montoDeuda' },
 *       tipoTarjeta: { csvField: 'tipoTarjeta' }
 *     }
 *   }
 * }
 */
export function transformFieldMapping(columnMappings: MappedResult): {
	fieldMapping: FieldMappingWithDynamicColumns;
} {
	const standardFields: MappedResult = {};
	const dynamicFields: MappedResult = {};

	// Separate standard fields from dynamic fields
	for (const [fieldName, mapping] of Object.entries(columnMappings)) {
		if (STANDARD_CONTACT_FIELDS.includes(fieldName as any)) {
			standardFields[fieldName] = mapping;
		} else {
			dynamicFields[fieldName] = mapping;
		}
	}

	// Build the final field mapping structure
	const fieldMapping: FieldMappingWithDynamicColumns = {
		...standardFields,
	};

	// Only add dynamicColumns if there are dynamic fields
	if (Object.keys(dynamicFields).length > 0) {
		fieldMapping.dynamicColumns = dynamicFields;
	}

	return { fieldMapping };
}
