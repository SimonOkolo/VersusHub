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
                profilePicture
            };

            await setDoc(userRef, userData);
        }
    }

    static async getUser(userId: string): Promise<User | null> {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data() as User;
        }

        return null;
    }
}