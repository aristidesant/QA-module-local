import type { UserModel } from '~/models/UserModels';

export function getUserDisplayName(user: UserModel | null) {
	const fullName = [user?.firstName, user?.lastName]
		.filter(
			(value): value is string =>
				typeof value === 'string' && Boolean(value.trim())
		)
		.map((value) => value.trim())
		.join(' ');

	if (fullName) {
		return fullName;
	}

	if (typeof user?.username === 'string' && user.username.trim()) {
		return user.username.trim();
	}

	if (typeof user?.email === 'string' && user.email.trim()) {
		return user.email.split('@')[0] ?? user.email.trim();
	}

	return null;
}

export function getUserDisplayEmail(user: UserModel | null) {
	if (typeof user?.email === 'string' && user.email.trim()) {
		return user.email.trim();
	}

	if (typeof user?.username === 'string' && user.username.trim()) {
		return user.username.trim();
	}

	return null;
}

export function getUserInitials(name: string) {
	const words = name.trim().split(/\s+/).filter(Boolean);

	if (words.length === 0) {
		return 'QA';
	}

	if (words.length === 1) {
		return words[0].slice(0, 2).toUpperCase();
	}

	return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
