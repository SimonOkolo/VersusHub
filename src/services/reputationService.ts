import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ReputationRank } from '../types';

export class ReputationService {
  static async updateReputation(userId: string, change: number) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentReputation = userDoc.data().reputation || 0;
    const newReputation = currentReputation + change;

    await updateDoc(userRef, {
      reputation: newReputation,
      reputationRank: this.calculateReputationRank(newReputation)
    });
  }

  private static calculateReputationRank(reputation: number): ReputationRank {
    if (reputation < -10) return ReputationRank.UNRELIABLE;
    if (reputation < 0) return ReputationRank.UNFAIR;
    if (reputation < 50) return ReputationRank.GOOD_PLAYER;
    return ReputationRank.TRUSTWORTHY;
  }

  static async handleMatchAbandon(userId: string) {
    await this.updateReputation(userId, -2);
  }

  static async handleFalseResult(userId: string, offenseCount: number) {
    const penalty = offenseCount === 1 ? -5 : offenseCount === 2 ? -10 : -15;
    await this.updateReputation(userId, penalty);
  }

  static async handleFairMatch(userId: string) {
    await this.updateReputation(userId, 10);
  }
}