export interface User {
  id: string;
  username: string;
  reputation: number;
  rank: Rank;
  division: Division;
  rankPoints: number;
  coins: number;
  reputationRank: ReputationRank;
  createdAt: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  profilePicture: string;
  clanId?: string;
  stats: UserStats;
}

export interface UserStats {
  totalWins: number;
  totalLosses: number;
  winRate: number;
  gameStats: { [gameId: string]: GameStats };
}

export interface GameStats {
  wins: number;
  losses: number;
  winRate: number;
  lastPlayed: number;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  createdAt: number;
  founderUserId: string;
  memberCount: number;
  profilePicture: string;
  bannerPicture: string;
  members: ClanMember[];
  stats: ClanStats;
}

export interface ClanMember {
  userId: string;
  role: ClanRole;
  joinedAt: number;
  contributedWins: number;
}

export interface ClanStats {
  totalWins: number;
  totalMatches: number;
  weeklyWins: number;
  monthlyWins: number;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  status: MatchStatus;
  proofUrl?: string;
  timestamp: number;
}

export enum MatchStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled'
}

export enum Rank {
  NOVICE = 'Novice',
  ADEPT = 'Adept',
  TRAILBLAZER = 'Trailblazer',
  VANGUARD = 'Vanguard',
  LUMINARY = 'Luminary',
  PARAGON = 'Paragon',
  ETERNAL = 'Eternal'
}

export enum Division {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V'
}

export enum ReputationRank {
  UNRELIABLE = 'Unreliable',
  UNFAIR = 'Unfair',
  GOOD_PLAYER = 'Good Player',
  TRUSTWORTHY = 'Trustworthy'
}

export enum ClanRole {
  LEADER = 'leader',
  CO_LEADER = 'co-leader',
  ELDER = 'elder',
  MEMBER = 'member'
}