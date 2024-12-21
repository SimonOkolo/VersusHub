import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Rank, Division } from '../types';

export class RankService {
  private static rankTiers: Array<{
    rank: Rank;
    divisions: Array<{
      division: Division;
      minPoints: number;
      maxPoints: number;
    }>;
  }> = [
    {
      rank: Rank.NOVICE,
      divisions: [
        { division: Division.V, minPoints: 0, maxPoints: 50 },
        { division: Division.IV, minPoints: 50, maxPoints: 100 },
        { division: Division.III, minPoints: 100, maxPoints: 150 },
        { division: Division.II, minPoints: 150, maxPoints: 200 },
        { division: Division.I, minPoints: 200, maxPoints: 250 },
      ]
    },
    {
      rank: Rank.ADEPT,
      divisions: [
        { division: Division.V, minPoints: 250, maxPoints: 350 },
        { division: Division.IV, minPoints: 350, maxPoints: 450 },
        { division: Division.III, minPoints: 450, maxPoints: 550 },
        { division: Division.II, minPoints: 550, maxPoints: 650 },
        { division: Division.I, minPoints: 650, maxPoints: 750 },
      ]
    },
    {
      rank: Rank.TRAILBLAZER,
      divisions: [
        { division: Division.V, minPoints: 750, maxPoints: 900 },
        { division: Division.IV, minPoints: 900, maxPoints: 1050 },
        { division: Division.III, minPoints: 1050, maxPoints: 1200 },
        { division: Division.II, minPoints: 1200, maxPoints: 1350 },
        { division: Division.I, minPoints: 1350, maxPoints: 1500 },
      ]
    },
    {
      rank: Rank.VANGUARD,
      divisions: [
        { division: Division.V, minPoints: 1500, maxPoints: 1700 },
        { division: Division.IV, minPoints: 1700, maxPoints: 1900 },
        { division: Division.III, minPoints: 1900, maxPoints: 2100 },
        { division: Division.II, minPoints: 2100, maxPoints: 2300 },
        { division: Division.I, minPoints: 2300, maxPoints: 2500 },
      ]
    },
    {
      rank: Rank.LUMINARY,
      divisions: [
        { division: Division.V, minPoints: 2500, maxPoints: 2750 },
        { division: Division.IV, minPoints: 2750, maxPoints: 3000 },
        { division: Division.III, minPoints: 3000, maxPoints: 3250 },
        { division: Division.II, minPoints: 3250, maxPoints: 3500 },
        { division: Division.I, minPoints: 3500, maxPoints: 3750 },
      ]
    },
    {
      rank: Rank.PARAGON,
      divisions: [
        { division: Division.V, minPoints: 3750, maxPoints: 4100 },
        { division: Division.IV, minPoints: 4100, maxPoints: 4450 },
        { division: Division.III, minPoints: 4450, maxPoints: 4800 },
        { division: Division.II, minPoints: 4800, maxPoints: 5150 },
        { division: Division.I, minPoints: 5150, maxPoints: 5500 },
      ]
    },
    {
      rank: Rank.ETERNAL,
      divisions: [
        { division: Division.V, minPoints: 5500, maxPoints: 6000 },
        { division: Division.IV, minPoints: 6000, maxPoints: 6500 },
        { division: Division.III, minPoints: 6500, maxPoints: 7000 },
        { division: Division.II, minPoints: 7000, maxPoints: 7500 },
        { division: Division.I, minPoints: 7500, maxPoints: Infinity },
      ]
    }
  ];

  static async updateRankPoints(userId: string, points: number) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    await updateDoc(userRef, {
      rankPoints: points
    });
  }

  static calculateRank(points: number): { rank: Rank; division: Division } {
    for (const tier of this.rankTiers) {
      for (const divisionTier of tier.divisions) {
        if (points >= divisionTier.minPoints && points < divisionTier.maxPoints) {
          return { rank: tier.rank, division: divisionTier.division };
        }
      }
    }

    // Fallback to highest rank if points exceed all tiers
    return { 
      rank: Rank.ETERNAL, 
      division: Division.I 
    };
  }

  static calculateMatchPoints(winnerRank: Rank, loserRank: Rank): number {
    const rankDiff = Object.values(Rank).indexOf(winnerRank) - 
                    Object.values(Rank).indexOf(loserRank);
    
    // Base points for a win
    const basePoints = 20;

    // Significant bonus for beating a higher-ranked player
    if (rankDiff < 0) return basePoints + 15; 
    
    // Smaller points for beating a lower-ranked player
    if (rankDiff > 0) return Math.max(5, basePoints - (rankDiff * 3)); 
    
    return basePoints; // Same rank
  }
}