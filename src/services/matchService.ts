import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { Match, MatchStatus } from '../types';

export class MatchService {
  static async createMatch(player1Id: string, player2Id: string): Promise<string> {
    const match: Omit<Match, 'id'> = {
      player1Id,
      player2Id,
      status: MatchStatus.PENDING,
      timestamp: Date.now()
    };

    const docRef = await addDoc(collection(db, 'matches'), match);
    return docRef.id;
  }

  static async submitResult(matchId: string, winnerId: string, proofUrl?: string) {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);

    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }

    const match = matchDoc.data() as Match;
    if (match.status !== MatchStatus.PENDING) {
      throw new Error('Match is not pending');
    }

    await updateDoc(matchRef, {
      winnerId,
      proofUrl,
      status: MatchStatus.COMPLETED
    });
  }

  static async disputeMatch(matchId: string) {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      status: MatchStatus.DISPUTED
    });
  }
}