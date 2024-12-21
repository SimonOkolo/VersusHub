export interface User {
  id: string;
  username: string;
  reputation: number;
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
  gameStats: { [gameId: string]: GameSpecificStats };
}

export interface GameSpecificStats {
  wins: number;
  losses: number;
  winRate: number;
  lastPlayed: number;
  rankPoints: number;
  experience: number;
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

export interface ClanInvite {
  id: string;
  clanId: string;
  clanName: string;
  userId: string;
  inviterId: string;
  inviterName: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface ClanAnnouncement {
  id: string;
  clanId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
}

export interface ClanMessage {
  id: string;
  clanId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: number;
}

export enum ClanRole {
  LEADER = 'leader',
  CO_LEADER = 'co-leader',
  ELDER = 'elder',
  MEMBER = 'member'
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