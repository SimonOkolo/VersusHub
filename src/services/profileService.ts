import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export class ProfileService {
  static async updateProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Create a reference to the user's profile picture
      const storageRef = ref(storage, `profile-pictures/${userId}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user document with the new profile picture URL
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profilePicture: downloadURL
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }
}