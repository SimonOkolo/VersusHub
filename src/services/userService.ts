import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User, Rank, Division, ReputationRank } from '../types';
import { AvatarService } from './avatarService';

export class UserService {
  static async initializeUser(userId: string, username: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    // Only initialize if user doesn't exist
    if (!userDoc.exists()) {
      // Get random avatar URL
      const profilePicture = await AvatarService.getRandomDefaultAvatar();

      const userData: User = {
        id: userId,
        username: username,
        reputation: 0,
        rank: Rank.NOVICE,
        division: Division.I,
        rankPoints: 0,
        coins: 100, // Starting coins
        reputationRank: ReputationRank.GOOD_PLAYER,
        createdAt: Date.now(),
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        profilePicture,
        stats: {
          totalWins: 0,
          totalLosses: 0,
          winRate: 0,
          gameStats: {}
        }
      };

      await setDoc(userRef, userData);
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      
      // Ensure stats object exists with default values
      const stats = userData.stats || {
        totalWins: userData.matchesWon || 0,
        totalLosses: userData.matchesLost || 0,
        winRate: userData.matchesPlayed > 0 
          ? Math.round((userData.matchesWon / userData.matchesPlayed) * 100) 
          : 0,
        gameStats: {}
      };

      // Return user data with guaranteed stats structure
      return {
        ...userData,
        stats,
        matchesWon: userData.matchesWon || 0,
        matchesLost: userData.matchesLost || 0,
        matchesPlayed: userData.matchesPlayed || 0
      } as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  static async updateUserStats(userId: string, gameId: string, won: boolean): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;
    const stats = userData.stats || {
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      gameStats: {}
    };

    // Update total stats
    stats.totalWins += won ? 1 : 0;
    stats.totalLosses += won ? 0 : 1;
    const totalGames = stats.totalWins + stats.totalLosses;
    stats.winRate = totalGames > 0 ? Math.round((stats.totalWins / totalGames) * 100) : 0;

    // Update game-specific stats
    const gameStats = stats.gameStats[gameId] || {
      wins: 0,
      losses: 0,
      winRate: 0,
      lastPlayed: Date.now()
    };

    gameStats.wins += won ? 1 : 0;
    gameStats.losses += won ? 0 : 1;
    const totalGameSpecificMatches = gameStats.wins + gameStats.losses;
    gameStats.winRate = totalGameSpecificMatches > 0 
      ? Math.round((gameStats.wins / totalGameSpecificMatches) * 100) 
      : 0;
    gameStats.lastPlayed = Date.now();

    stats.gameStats[gameId] = gameStats;

    // Update user document
    await setDoc(userRef, {
      ...userData,
      stats,
      matchesPlayed: (userData.matchesPlayed || 0) + 1,
      matchesWon: (userData.matchesWon || 0) + (won ? 1 : 0),
      matchesLost: (userData.matchesLost || 0) + (won ? 0 : 1)
    }, { merge: true });
  }
}