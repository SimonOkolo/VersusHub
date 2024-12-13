import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Rank, Division } from '../types';

export class RankService {
  static async updateRankPoints(userId: string, points: number) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const currentPoints = userData.rankPoints || 0;
    const newPoints = currentPoints + points;

    const { rank, division } = this.calculateRank(newPoints);

    await updateDoc(userRef, {
      rankPoints: newPoints,
      rank,
      division
    });
  }

  private static calculateRank(points: number): { rank: Rank; division: Division } {
    // Simplified rank calculation logic
    if (points < 100) return { rank: Rank.NOVICE, division: Division.I };
    if (points < 200) return { rank: Rank.NOVICE, division: Division.II };
    // Add more rank thresholds as needed
    return { rank: Rank.ETERNAL, division: Division.I };
  }

  static calculateMatchPoints(winnerRank: Rank, loserRank: Rank): number {
    const rankDiff = Object.values(Rank).indexOf(winnerRank) - 
                    Object.values(Rank).indexOf(loserRank);
    
    // Base points for a win
    const basePoints = 20;

    // Adjust points based on rank difference
    if (rankDiff < 0) return basePoints + 10; // Beating a higher ranked player
    if (rankDiff > 0) return basePoints - 5; // Beating a lower ranked player
    return basePoints; // Same rank
  }
}