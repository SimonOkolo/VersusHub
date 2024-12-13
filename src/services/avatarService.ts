import { storage } from '../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export class AvatarService {
    private static readonly DEFAULT_AVATARS_PATH = 'default-avatars/';
    private static readonly NUM_DEFAULT_AVATARS = 6;

    static async getRandomDefaultAvatar(): Promise<string> {
        try {
            // Get a random number between 1 and NUM_DEFAULT_AVATARS
            const randomNum = Math.floor(Math.random() * this.NUM_DEFAULT_AVATARS) + 1;
            const avatarRef = ref(storage, `${this.DEFAULT_AVATARS_PATH}avatar${randomNum}.png`);
            
            // Get the download URL for the random avatar
            const avatarUrl = await getDownloadURL(avatarRef);
            return avatarUrl;
        } catch (error) {
            console.error('Error getting random avatar:', error);
            // Fallback to local default avatar if Firebase storage fails
            return '/img/default-avatar.png';
        }
    }
}