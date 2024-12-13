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
  profilePicture: string;
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