import { BurnoutRiskLevel } from '~/modules/qa/dashboard/types/burnoutRisk';
import type { AgentProfile, RosterAgent, RosterSupervisor } from './types';
import {
	AVATAR_COLORS,
	buildAgentProfile,
	TEAM_SUPERVISORS,
	type Persona,
} from './mockData';
import { UNASSIGNED_SUPERVISOR, UNASSIGNED_SUPERVISOR_ID } from './constants';

/**
 * Extra teams and agents for the Operation Manager's Team configuration demo:
 * Team 2 grows to 32 agents, three more teams appear and three agents sit Unassigned.
 * Merged into the team store only, so the static mocks (analytics, coaching, LMS, customers)
 * keep the original 21-agent roster.
 */
export const TEAM_CONFIG_EXTRA_SUPERVISORS: RosterSupervisor[] = [
	{
		id: 'SUP-004',
		name: 'Rosa Lima',
		team: 'Team 4',
		email: 'rosa.lima@newtech.com',
		targetSize: 12,
	},
	{
		id: 'SUP-005',
		name: 'Daniel Ortega',
		team: 'Team 5',
		email: 'daniel.ortega@newtech.com',
		targetSize: 12,
	},
	{
		id: 'SUP-006',
		name: 'Valeria Soto',
		team: 'Team 6',
		email: 'valeria.soto@newtech.com',
		targetSize: 10,
	},
];

type Seed = [
	id: string,
	name: string,
	supervisorId: string,
	status?: RosterAgent['status'],
];

/** [id, name, supervisorId, status?]. Shift rotates by index; everything else is derived deterministically. */
const SEEDS: Seed[] = [
	// Team 2 grows from 7 to 32
	['AGT-022', 'Alejandro Peña', 'SUP-002'],
	['AGT-023', 'Beatriz Campos', 'SUP-002'],
	['AGT-024', 'Cristian Molina', 'SUP-002'],
	['AGT-025', 'Daniela Rojas', 'SUP-002', 'on-leave'],
	['AGT-026', 'Esteban Vargas', 'SUP-002'],
	['AGT-027', 'Fernanda Luna', 'SUP-002'],
	['AGT-028', 'Gabriel Soto', 'SUP-002'],
	['AGT-029', 'Helena Marín', 'SUP-002'],
	['AGT-030', 'Ignacio Reyes', 'SUP-002'],
	['AGT-031', 'Julieta Ponce', 'SUP-002'],
	['AGT-032', 'Kevin Duarte', 'SUP-002'],
	['AGT-033', 'Lorena Vidal', 'SUP-002', 'training'],
	['AGT-034', 'Martín Aguilar', 'SUP-002'],
	['AGT-035', 'Natalia Cordero', 'SUP-002'],
	['AGT-036', 'Óscar Benítez', 'SUP-002'],
	['AGT-037', 'Patricia Méndez', 'SUP-002'],
	['AGT-038', 'Ramiro Castro', 'SUP-002'],
	['AGT-039', 'Silvia Paredes', 'SUP-002'],
	['AGT-040', 'Teo Salazar', 'SUP-002'],
	['AGT-041', 'Úrsula Blanco', 'SUP-002', 'training'],
	['AGT-042', 'Víctor Lara', 'SUP-002'],
	['AGT-043', 'Ximena Prado', 'SUP-002'],
	['AGT-044', 'Yolanda Ferrer', 'SUP-002'],
	['AGT-045', 'Zoe Medina', 'SUP-002'],
	['AGT-046', 'Adrián Quiroga', 'SUP-002'],
	// Team 4
	['AGT-047', 'Brenda Ocampo', 'SUP-004'],
	['AGT-048', 'César Montes', 'SUP-004'],
	['AGT-049', 'Dalia Fuentes', 'SUP-004', 'on-leave'],
	['AGT-050', 'Emilio Cano', 'SUP-004'],
	['AGT-051', 'Florencia Ibáñez', 'SUP-004'],
	['AGT-052', 'Gonzalo Peralta', 'SUP-004'],
	['AGT-053', 'Irene Robles', 'SUP-004'],
	['AGT-054', 'Joaquín Serrano', 'SUP-004'],
	// Team 5
	['AGT-055', 'Karla Espinoza', 'SUP-005'],
	['AGT-056', 'Leandro Núñez', 'SUP-005'],
	['AGT-057', 'Marcela Gil', 'SUP-005'],
	['AGT-058', 'Nicolás Bravo', 'SUP-005', 'training'],
	['AGT-059', 'Olivia Carrasco', 'SUP-005'],
	['AGT-060', 'Pablo Ledesma', 'SUP-005'],
	// Team 6
	['AGT-061', 'Renata Villalba', 'SUP-006'],
	['AGT-062', 'Santiago Ochoa', 'SUP-006'],
	['AGT-063', 'Tamara Godoy', 'SUP-006'],
	['AGT-064', 'Ulises Farías', 'SUP-006'],
	['AGT-065', 'Vanessa Roldán', 'SUP-006'],
	// Unassigned
	['AGT-066', 'Walter Escobar', UNASSIGNED_SUPERVISOR_ID],
	['AGT-067', 'Yamila Toledo', UNASSIGNED_SUPERVISOR_ID],
	['AGT-068', 'Zacarías Bustos', UNASSIGNED_SUPERVISOR_ID],
];

const CAMPAIGNS_BY_TEAM: Record<string, string[][]> = {
	'SUP-002': [['camp-002'], ['camp-002', 'camp-004'], ['camp-004']],
	'SUP-004': [['camp-004'], ['camp-004', 'camp-001']],
	'SUP-005': [['camp-001'], ['camp-001', 'camp-003']],
	'SUP-006': [['camp-003'], ['camp-003', 'camp-002']],
	[UNASSIGNED_SUPERVISOR_ID]: [['camp-001']],
};
const SKILLS_BY_TEAM: Record<string, string[][]> = {
	'SUP-002': [
		['Sales'],
		['Sales', 'Bilingual'],
		['Tech Support'],
		['Sales', 'Retention'],
	],
	'SUP-004': [['Tech Support'], ['Tech Support', 'De-escalation']],
	'SUP-005': [['Customer Service'], ['Customer Service', 'Upsell']],
	'SUP-006': [['Collections'], ['Collections', 'Compliance']],
	[UNASSIGNED_SUPERVISOR_ID]: [['Customer Service'], ['Sales']],
};
const SHIFTS: RosterAgent['shift'][] = ['morning', 'afternoon', 'night'];
const TRACKED_SINCE = ['2025-01-13', '2025-02-10', '2025-03-03', '2025-05-05'];

/** Deterministic 0..1 from the seed index and a salt (no Math.random so the demo is stable). */
const unit = (i: number, salt: number) =>
	((i * 9301 + salt * 49297 + 233) % 233280) / 233280;

const toPersona = (
	[id, name, supervisorId, status]: Seed,
	i: number
): Persona => {
	const pick = <T>(pool: T[], salt: number): T =>
		pool[Math.floor(unit(i, salt) * pool.length)];
	return {
		id,
		name,
		supervisorId,
		campaignIds: pick(CAMPAIGNS_BY_TEAM[supervisorId], 1),
		status,
		shift: SHIFTS[i % 3],
		hireDate: `${2022 + (i % 4)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 27)).padStart(2, '0')}`,
		trackedSince: pick(TRACKED_SINCE, 2),
		base: {
			qa: 0.6 + unit(i, 3) * 0.35,
			sentiment: 0.55 + unit(i, 4) * 0.4,
			compliance: 0.65 + unit(i, 5) * 0.33,
			business: 0.5 + unit(i, 6) * 0.35,
		},
		slope: unit(i, 7) * 0.6 - 0.3,
		burnout:
			i % 13 === 5
				? BurnoutRiskLevel.HIGH
				: i % 7 === 3
					? BurnoutRiskLevel.MEDIUM
					: BurnoutRiskLevel.LOW,
		skills: pick(SKILLS_BY_TEAM[supervisorId], 8),
	};
};

const EXTRA_PERSONAS: Persona[] = SEEDS.map(toPersona);

const supervisorFor = (id: string): RosterSupervisor =>
	[...TEAM_SUPERVISORS, ...TEAM_CONFIG_EXTRA_SUPERVISORS].find(
		(s) => s.id === id
	) ?? UNASSIGNED_SUPERVISOR;

export const TEAM_CONFIG_EXTRA_AGENTS: RosterAgent[] = EXTRA_PERSONAS.map(
	(p, i) => {
		const sup = supervisorFor(p.supervisorId);
		return {
			id: p.id,
			name: p.name,
			email: `${p.name.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(' ', '.')}@newtech.com`,
			supervisorId: sup.id,
			supervisorName: sup.name,
			team: sup.team,
			campaignIds: p.campaignIds,
			status: p.status ?? 'active',
			shift: p.shift ?? SHIFTS[i % 3],
			hireDate: p.hireDate,
			trackedSince: p.trackedSince,
			skills: p.skills,
			avatarColor: AVATAR_COLORS[(i + 3) % AVATAR_COLORS.length],
		};
	}
);

/** Same two-pass ranking as mockData's buildAll, grouped by supervisor (Unassigned included). */
function buildExtraProfiles(): Record<string, AgentProfile> {
	const agentsById = Object.fromEntries(
		TEAM_CONFIG_EXTRA_AGENTS.map((a) => [a.id, a])
	);
	const provisional = EXTRA_PERSONAS.map((p) => ({
		p,
		overall: buildAgentProfile(
			p,
			{ rankInTeam: 1, teamSize: 1, percentile: 50 },
			agentsById[p.id]
		).overall.score,
	}));
	const groups = new Set(EXTRA_PERSONAS.map((p) => p.supervisorId));
	const out: Record<string, AgentProfile> = {};
	for (const supervisorId of groups) {
		const team = provisional
			.filter((x) => x.p.supervisorId === supervisorId)
			.sort((a, b) => b.overall - a.overall);
		team.forEach((x, i) => {
			const rankInTeam = i + 1;
			const percentile = Math.round(
				((team.length - rankInTeam) / Math.max(1, team.length - 1)) * 100
			);
			out[x.p.id] = buildAgentProfile(
				x.p,
				{ rankInTeam, teamSize: team.length, percentile },
				agentsById[x.p.id]
			);
		});
	}
	return out;
}

export const TEAM_CONFIG_EXTRA_PROFILES: Record<string, AgentProfile> =
	buildExtraProfiles();

/** Campaign unions for the extra teams (SUP-002 already has an entry from the base seed). */
export const TEAM_CONFIG_EXTRA_CAMPAIGN_IDS: Record<string, string[]> =
	Object.fromEntries(
		TEAM_CONFIG_EXTRA_SUPERVISORS.map((sup) => [
			sup.id,
			[
				...new Set(
					TEAM_CONFIG_EXTRA_AGENTS.filter(
						(a) => a.supervisorId === sup.id
					).flatMap((a) => a.campaignIds)
				),
			],
		])
	);
