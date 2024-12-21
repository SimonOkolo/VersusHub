import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Rank, Division, ReputationRank, UserStats, GameSpecificStats } from '../types';
import { AvatarService } from './avatarService';
import { ReputationService } from './reputationService';
import { RankService } from './rankService';

export class UserService {
    private static readonly DEFAULT_INITIAL_COINS = 100;
    private static readonly DEFAULT_STATS: UserStats = {
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        gameStats: {}
    };

    private static getRequiredExperienceForLevel(level: number): number {
        return Math.round(100 * Math.pow(1.1, level - 1));
    }

    private static calculateLevelFromExperience(experience: number): number {
        let level = 1;
        while (level < 50 && experience >= UserService.getRequiredExperienceForLevel(level)) {
            level++;
        }
        return level;
    }

    private static createInitialUserData(userId: string, username: string, profilePicture: string): User {
        return {
            id: userId,
            username,
            reputation: 0,
            coins: this.DEFAULT_INITIAL_COINS,
            reputationRank: ReputationRank.GOOD_PLAYER,
            createdAt: Date.now(),
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            profilePicture,
            stats: { ...this.DEFAULT_STATS }
        };
    }

    static async initializeUser(userId: string, username: string): Promise<User> {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data() as User;
        }

        const profilePicture = await AvatarService.getRandomDefaultAvatar();
        const userData = this.createInitialUserData(userId, username, profilePicture);

        await setDoc(userRef, userData);
        return userData;
    }

    static async getUser(userId: string): Promise<User | null> {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                return null;
            }

            const userData = userDoc.data() as User;
            const normalizedStats = this.normalizeStats(userData);

            return {
                ...userData,
                stats: normalizedStats,
                reputationRank: ReputationService.calculateReputationRank(userData.reputation || 0),
                matchesWon: userData.matchesWon || 0,
                matchesLost: userData.matchesLost || 0,
                matchesPlayed: userData.matchesPlayed || 0
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    private static normalizeStats(userData: User): UserStats {
        const matchesPlayed = userData.matchesWon + userData.matchesLost;
        const gameStats: { [gameId: string]: GameSpecificStats } = {};

        for (const gameId in userData.stats?.gameStats) {
            const rawGameStats = userData.stats.gameStats[gameId];
            const totalGameMatches = rawGameStats.wins + rawGameStats.losses;
            const level = UserService.calculateLevelFromExperience(rawGameStats.experience || 0); // Calculate level here

            gameStats[gameId] = {
                wins: rawGameStats.wins || 0,
                losses: rawGameStats.losses || 0,
                winRate: totalGameMatches > 0 ? Math.round((rawGameStats.wins / totalGameMatches) * 100) : 0,
                lastPlayed: rawGameStats.lastPlayed || Date.now(),
                rankPoints: rawGameStats.rankPoints || 0,
                experience: rawGameStats.experience || 0
            };
        }

        return {
            totalWins: userData.stats?.totalWins || 0,
            totalLosses: userData.stats?.totalLosses || 0,
            winRate: matchesPlayed > 0 ? Math.round((userData.matchesWon / matchesPlayed) * 100) : 0,
            gameStats: gameStats
        };
    }

    static async updateUserStats(
        userId: string,
        gameId: string,
        won: boolean
    ): Promise<void> {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data() as User;
        const stats = userData.stats || { ...this.DEFAULT_STATS };
        const gameSpecificStats = stats.gameStats[gameId] || { wins: 0, losses: 0, winRate: 0, lastPlayed: Date.now(), rankPoints: 0, experience: 0 };

        gameSpecificStats.wins += won ? 1 : 0;
        gameSpecificStats.losses += won ? 0 : 1;
        const totalGameMatches = gameSpecificStats.wins + gameSpecificStats.losses;
        gameSpecificStats.winRate = totalGameMatches > 0 ? Math.round((gameSpecificStats.wins / totalGameMatches) * 100) : 0;
        gameSpecificStats.lastPlayed = Date.now();

        const rankPointsChange = won ? 20 : -10;
        gameSpecificStats.rankPoints += rankPointsChange;

        const experienceGain = won ? 50 : 25;
        gameSpecificStats.experience = (gameSpecificStats.experience || 0) + experienceGain;

        stats.gameStats = { ...stats.gameStats, [gameId]: gameSpecificStats };
        stats.totalWins = (stats.totalWins || 0) + (won ? 1 : 0);
        stats.totalLosses = (stats.totalLosses || 0) + (won ? 0 : 1);
        const totalMatches = stats.totalWins + stats.totalLosses;
        stats.winRate = totalMatches > 0 ? Math.round((stats.totalWins / totalMatches) * 100) : 0;

        await updateDoc(userRef, {
            stats: stats,
            matchesPlayed: (userData.matchesPlayed || 0) + 1,
            matchesWon: (userData.matchesWon || 0) + (won ? 1 : 0),
            matchesLost: (userData.matchesLost || 0) + (won ? 0 : 1)
        });
    }

    static async addGameToUser(userId: string, gameId: string): Promise<void> {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data() as User;
        const gameStats = userData.stats?.gameStats || {};

        if (gameStats[gameId]) {
            throw new Error('Game already exists for this user');
        }

        gameStats[gameId] = {
            wins: 0,
            losses: 0,
            winRate: 0,
            lastPlayed: Date.now(),
            rankPoints: 0,
            experience: 0
        };

        await updateDoc(userRef, {
            'stats.gameStats': gameStats
        });
    }
}