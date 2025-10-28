/**
 * Password validation utilities
 * Matches the class-validator isStrongPassword validation from the backend
 */

export interface PasswordStrengthOptions {
	minLength?: number;
	minLowercase?: number;
	minUppercase?: number;
	minNumbers?: number;
	minSymbols?: number;
}

export interface PasswordValidationResult {
	isValid: boolean;
	errors: string[];
}

const DEFAULT_OPTIONS: Required<PasswordStrengthOptions> = {
	minLength: 8,
	minLowercase: 1,
	minUppercase: 1,
	minNumbers: 1,
	minSymbols: 1,
};

/**
 * Validates if a password meets strong password requirements
 * Mirrors the class-validator isStrongPassword function used in the backend
 *
 * @param password - The password to validate
 * @param options - Optional custom requirements
 * @returns Validation result with status and error messages
 */
export function validateStrongPassword(
	password: string,
	options?: PasswordStrengthOptions
): PasswordValidationResult {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	const errors: string[] = [];

	if (!password) {
		return {
			isValid: false,
			errors: ['Password is required'],
		};
	}

	// Check minimum length
	if (password.length < opts.minLength) {
		errors.push(`Password must be at least ${opts.minLength} characters long`);
	}

	// Check for lowercase letters
	const lowercaseCount = (password.match(/[a-z]/g) || []).length;
	if (lowercaseCount < opts.minLowercase) {
		errors.push(
			`Password must contain at least ${opts.minLowercase} lowercase letter${
				opts.minLowercase > 1 ? 's' : ''
			}`
		);
	}

	// Check for uppercase letters
	const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
	if (uppercaseCount < opts.minUppercase) {
		errors.push(
			`Password must contain at least ${opts.minUppercase} uppercase letter${
				opts.minUppercase > 1 ? 's' : ''
			}`
		);
	}

	// Check for numbers
	const numberCount = (password.match(/[0-9]/g) || []).length;
	if (numberCount < opts.minNumbers) {
		errors.push(
			`Password must contain at least ${opts.minNumbers} number${
				opts.minNumbers > 1 ? 's' : ''
			}`
		);
	}

	// Check for symbols (special characters)
	// Matches common special characters used in password validation
	const symbolCount = (
		password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []
	).length;
	if (symbolCount < opts.minSymbols) {
		errors.push(
			`Password must contain at least ${opts.minSymbols} special character${
				opts.minSymbols > 1 ? 's' : ''
			}`
		);
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Simple validator function for use with Mantine forms
 * Returns null if valid, or error message if invalid
 *
 * @param password - The password to validate
 * @param options - Optional custom requirements
 * @returns Null if valid, error message string if invalid
 */
export function validatePasswordForForm(
	password: string,
	options?: PasswordStrengthOptions
): string | null {
	// Allow empty passwords (for optional fields like edit mode)
	// The form itself should handle required validation
	if (!password || password.trim().length === 0) {
		return null;
	}

	const result = validateStrongPassword(password, options);

	if (result.isValid) {
		return null;
	}

	return result.errors.join('. ');
}

/**
 * Get password strength description
 * Useful for providing user feedback
 *
 * @param password - The password to evaluate
 * @returns Description of password strength
 */
export function getPasswordStrength(password: string): {
	level: 'weak' | 'medium' | 'strong';
	score: number;
} {
	if (!password) {
		return { level: 'weak', score: 0 };
	}

	let score = 0;

	// Length score
	if (password.length >= 8) score += 1;
	if (password.length >= 12) score += 1;
	if (password.length >= 16) score += 1;

	// Character variety score
	if (/[a-z]/.test(password)) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

	let level: 'weak' | 'medium' | 'strong' = 'weak';
	if (score >= 5) {
		level = 'strong';
	} else if (score >= 3) {
		level = 'medium';
	}

	return { level, score };
}
