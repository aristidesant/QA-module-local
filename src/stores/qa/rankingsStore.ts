import { create } from 'zustand';
import type { ProgramDraft, RankingProgram } from '~/models/qa/rankingPrograms';
import type { UserReactionType } from '~/modules/qa/agent/rankings/types/leaderboard';
import {
	RANKING_PROGRAMS_SEED,
	REACTIONS_SEED,
} from '~/modules/qa/rankings/mockData';
import {
	computeStandings,
	defaultProgramFor,
	isPermanent,
	leader,
	programsSharingTeams,
} from '~/modules/qa/rankings/helpers';
import { TEAM_CALLS } from '~/modules/qa/analytics/mockData';
import { TODAY } from '~/modules/qa/analytics/constants';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { buildNotification } from '~/modules/qa/inbox/helpers';
import { useNotificationStore } from '~/stores/qa/notificationStore';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';

interface RankingsState {
	programs: RankingProgram[];
	/** programId → agentId → the reaction the current user left. */
	/** programId → target agent → reacting agent → emoji. */
	reactions: Record<string, Record<string, Record<string, UserReactionType>>>;
	createProgram: (draft: ProgramDraft) => RankingProgram;
	updateProgram: (
		id: string,
		patch: Partial<ProgramDraft>
	) => RankingProgram | null;
	/** Makes the program the team's live ranking; the one it replaces goes inactive. */
	activateProgram: (id: string) => void;
	deactivateProgram: (id: string) => void;
	/** Marks a permanent program as the one its teams fall back to. */
	setDefaultProgram: (id: string) => void;
	/** Finishes a dated ranking with a winner; the team's default one takes over. */
	endProgram: (id: string) => void;
	duplicateProgram: (id: string) => RankingProgram;
	deleteProgram: (id: string) => void;
	/** Awards the badges of every milestone reached; safe to call repeatedly. */
	syncMilestones: (id: string) => void;
	/** Sets (or clears, with `null`) one agent's reaction to another's standing. */
	setReaction: (
		programId: string,
		targetAgentId: string,
		reactorId: string,
		reaction: UserReactionType | null
	) => void;
}

export const selectPrograms = (s: RankingsState) => s.programs;
export const selectReactions = (s: RankingsState) => s.reactions;

let counter = RANKING_PROGRAMS_SEED.length;
const nextId = () => `RP-${String(++counter).padStart(3, '0')}`;
let milestoneCounter = 100;
export const nextMilestoneId = () => `RPM-${++milestoneCounter}`;

const notify = (input: Parameters<typeof buildNotification>[0]) =>
	useNotificationStore.getState().addNotification(buildNotification(input));

/** At most one active program per team: activating one deactivates the others it shares a team with. */
const withSingleActive = (
	programs: RankingProgram[],
	activeId: string
): RankingProgram[] => {
	const active = programs.find((p) => p.id === activeId);
	if (!active) return programs;
	const replaced = new Set(
		programsSharingTeams(programs, active.teams, activeId)
			.filter((p) => p.status === 'active')
			.map((p) => p.id)
	);
	return programs.map((p) =>
		replaced.has(p.id) ? { ...p, status: 'inactive', updatedAt: NOW_ISO } : p
	);
};

/** One default per team: marking a program as default clears it from the others it shares a team with. */
const withSingleDefault = (
	programs: RankingProgram[],
	defaultId: string
): RankingProgram[] => {
	const program = programs.find((p) => p.id === defaultId);
	if (!program) return programs;
	const cleared = new Set(
		programsSharingTeams(programs, program.teams, defaultId)
			.filter((p) => p.isDefault)
			.map((p) => p.id)
	);
	return programs.map((p) =>
		cleared.has(p.id) ? { ...p, isDefault: false } : p
	);
};

const agentsOf = (program: RankingProgram) =>
	TEAM_AGENTS.filter((agent) => program.teams.includes(agent.team));

/** Completed seeds carry no winner so it always matches the computed standings. */
const resolveSeedWinners = (programs: RankingProgram[]): RankingProgram[] =>
	programs.map((program) => {
		if (program.status !== 'completed' || program.winnerId) return program;
		const top = leader(
			computeStandings(program, TEAM_CALLS, program.endDate ?? TODAY)
		);
		return top
			? { ...program, winnerId: top.agentId, winnerName: top.agentName }
			: program;
	});

export const useRankingsStore = create<RankingsState>((set, get) => ({
	programs: resolveSeedWinners(RANKING_PROGRAMS_SEED),
	reactions: REACTIONS_SEED,

	createProgram: (draft) => {
		const program: RankingProgram = {
			...draft,
			status: draft.status === 'active' ? 'inactive' : draft.status,
			isDefault: draft.isDefault && draft.endDate === null,
			id: nextId(),
			winnerId: null,
			winnerName: null,
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
		};
		set((s) => ({
			programs: program.isDefault
				? withSingleDefault([program, ...s.programs], program.id)
				: [program, ...s.programs],
		}));
		if (draft.status === 'active') get().activateProgram(program.id);
		return get().programs.find((p) => p.id === program.id) ?? program;
	},

	updateProgram: (id, patch) => {
		const current = get().programs.find((p) => p.id === id);
		if (!current) return null;

		const wantsActive =
			patch.status === 'active' && current.status !== 'active';
		const merged: RankingProgram = {
			...current,
			...patch,
			status: wantsActive ? current.status : (patch.status ?? current.status),
			updatedAt: NOW_ISO,
		};
		merged.isDefault = merged.isDefault && isPermanent(merged);

		set((s) => {
			const next = s.programs.map((p) => (p.id === id ? merged : p));
			let result = merged.isDefault ? withSingleDefault(next, id) : next;
			if (merged.status === 'active') result = withSingleActive(result, id);
			return { programs: result };
		});
		if (wantsActive) get().activateProgram(id);
		return get().programs.find((p) => p.id === id) ?? merged;
	},

	activateProgram: (id) => {
		const program = get().programs.find((p) => p.id === id);
		if (
			!program ||
			program.status === 'active' ||
			program.status === 'completed'
		)
			return;

		set((s) => ({
			programs: withSingleActive(
				s.programs.map((p) =>
					p.id === id ? { ...p, status: 'active', updatedAt: NOW_ISO } : p
				),
				id
			),
		}));

		agentsOf(program).forEach((agent) =>
			notify({
				agentId: agent.id,
				recipientRole: 'AGENT',
				recipientId: agent.id,
				category: 'POSITIVE_RECOGNITION',
				priority: 'NORMAL',
				title: `New ranking: ${program.name}`,
				message: `${program.description} Prize: ${program.prize.title}.`,
				icon: 'trophy',
				sourceRole:
					program.createdByRole === 'QA_MANAGER' ? 'QA_MANAGER' : 'SUPERVISOR',
				payload: {
					kind: 'RANKING_UPDATE',
					rankingId: program.id,
					rankingName: program.name,
					event: 'STARTED',
					prizeTitle: program.prize.title,
				},
			})
		);
	},

	deactivateProgram: (id) =>
		set((s) => ({
			programs: s.programs.map((p) =>
				p.id === id && p.status === 'active'
					? { ...p, status: 'inactive', updatedAt: NOW_ISO }
					: p
			),
		})),

	setDefaultProgram: (id) =>
		set((s) => {
			const program = s.programs.find((p) => p.id === id);
			if (!program || !isPermanent(program)) return s;
			return {
				programs: withSingleDefault(
					s.programs.map((p) => (p.id === id ? { ...p, isDefault: true } : p)),
					id
				),
			};
		}),

	endProgram: (id) => {
		const program = get().programs.find((p) => p.id === id);
		if (!program || program.status === 'completed' || isPermanent(program))
			return;

		const standings = computeStandings(program, TEAM_CALLS);
		const winner = leader(standings);

		set((s) => ({
			programs: s.programs.map((p) =>
				p.id === id
					? {
							...p,
							status: 'completed',
							winnerId: winner?.agentId ?? null,
							winnerName: winner?.agentName ?? null,
							endDate: p.endDate && p.endDate > TODAY ? TODAY : p.endDate,
							updatedAt: NOW_ISO,
						}
					: p
			),
		}));

		if (winner && program.winnerBadgeId) {
			useTriggerRulesStore.getState().awardBadge(program.winnerBadgeId, {
				agentId: winner.agentId,
				agentName: winner.agentName,
				team: winner.team,
				earnedAt: NOW_ISO,
			});
		}

		standings.forEach((standing) => {
			const won = standing.agentId === winner?.agentId;
			notify({
				agentId: standing.agentId,
				recipientRole: 'AGENT',
				recipientId: standing.agentId,
				category: 'POSITIVE_RECOGNITION',
				priority: won ? 'HIGH' : 'LOW',
				title: won ? `You won ${program.name}!` : `${program.name} has ended`,
				message: won
					? `You finished first. Prize: ${program.prize.title}.`
					: `${winner?.agentName ?? '—'} finished first.`,
				icon: 'trophy',
				sourceRole: 'SYSTEM',
				payload: {
					kind: 'RANKING_UPDATE',
					rankingId: program.id,
					rankingName: program.name,
					event: won ? 'WON' : 'ENDED',
					rank: standing.rank ?? undefined,
					prizeTitle: won ? program.prize.title : undefined,
				},
			});
		});

		notify({
			agentId: winner?.agentId ?? '',
			recipientRole:
				program.createdByRole === 'QA_MANAGER' ? 'QA_MANAGER' : 'SUPERVISOR',
			recipientId:
				program.createdByRole === 'QA_MANAGER' ? 'QAM-001' : 'SUP-001',
			category: 'POSITIVE_RECOGNITION',
			priority: 'NORMAL',
			title: `${program.name} has ended`,
			message: `${winner?.agentName ?? 'Nobody'} finished first.`,
			icon: 'trophy',
			sourceRole: 'SYSTEM',
			payload: {
				kind: 'RANKING_UPDATE',
				rankingId: program.id,
				rankingName: program.name,
				event: 'ENDED',
				prizeTitle: program.prize.title,
			},
		});

		// The ranking ended, so each team falls back to its default one.
		const fallbacks = new Set(
			program.teams
				.map((team) => defaultProgramFor(get().programs, team))
				.filter((p): p is RankingProgram => p !== null && p.status !== 'active')
				.map((p) => p.id)
		);
		fallbacks.forEach((fallbackId) => get().activateProgram(fallbackId));
	},

	deleteProgram: (id) =>
		set((s) => ({ programs: s.programs.filter((p) => p.id !== id) })),

	duplicateProgram: (id) => {
		const source = get().programs.find((p) => p.id === id);
		if (!source) throw new Error(`Unknown ranking ${id}`);
		const copy: RankingProgram = {
			...source,
			id: nextId(),
			name: `${source.name} (copy)`,
			status: 'draft',
			isDefault: false,
			winnerId: null,
			winnerName: null,
			createdAt: NOW_ISO,
			updatedAt: NOW_ISO,
		};
		set((s) => ({ programs: [copy, ...s.programs] }));
		return copy;
	},

	syncMilestones: (id) => {
		const program = get().programs.find((p) => p.id === id);
		if (!program || program.milestones.length === 0) return;

		const badges = useTriggerRulesStore.getState().badges;
		const awardBadge = useTriggerRulesStore.getState().awardBadge;

		computeStandings(program, TEAM_CALLS).forEach((standing) => {
			standing.milestoneIds.forEach((milestoneId) => {
				const milestone = program.milestones.find((m) => m.id === milestoneId);
				if (!milestone) return;
				const badge = badges.find((b) => b.id === milestone.badgeId);
				if (!badge || badge.holders.some((h) => h.agentId === standing.agentId))
					return;

				awardBadge(milestone.badgeId, {
					agentId: standing.agentId,
					agentName: standing.agentName,
					team: standing.team,
					earnedAt: NOW_ISO,
				});
				notify({
					agentId: standing.agentId,
					recipientRole: 'AGENT',
					recipientId: standing.agentId,
					category: 'POSITIVE_RECOGNITION',
					priority: 'NORMAL',
					title: `Badge earned: ${badge.name}`,
					message: `${milestone.label} milestone reached in ${program.name}.`,
					icon: 'award',
					sourceRole: 'SYSTEM',
					payload: {
						kind: 'BADGE_EARNED',
						badgeId: badge.id,
						badgeName: badge.name,
						badgeIcon: badge.icon,
						badgeColor: badge.color,
						tier: badge.tier,
						reason: `${milestone.label} in ${program.name}`,
					},
				});
			});
		});
	},

	setReaction: (programId, targetAgentId, reactorId, reaction) =>
		set((s) => {
			const forProgram = { ...(s.reactions[programId] ?? {}) };
			const forTarget = { ...(forProgram[targetAgentId] ?? {}) };

			if (reaction === null) delete forTarget[reactorId];
			else forTarget[reactorId] = reaction;

			forProgram[targetAgentId] = forTarget;
			return { reactions: { ...s.reactions, [programId]: forProgram } };
		}),
}));
