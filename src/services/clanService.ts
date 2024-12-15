import { db } from '../lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment 
} from 'firebase/firestore';
import { Clan, ClanMember, ClanRole } from '../types';

export class ClanService {
  static async createClan(
    name: string, 
    tag: string, 
    founderUserId: string, 
    description: string,
    profilePicture: string
  ): Promise<string> {
    // Validate clan tag
    if (!/^[A-Z0-9]{2,4}$/.test(tag)) {
      throw new Error('Invalid clan tag format');
    }

    // Check if clan tag is unique
    const existingClan = await this.getClanByTag(tag);
    if (existingClan) {
      throw new Error('Clan tag already exists');
    }

    const clan: Omit<Clan, 'id'> = {
      name,
      tag,
      description,
      createdAt: Date.now(),
      founderUserId,
      memberCount: 1,
      profilePicture,
      bannerPicture: '', // Default banner
      members: [{
        userId: founderUserId,
        role: ClanRole.LEADER,
        joinedAt: Date.now(),
        contributedWins: 0
      }],
      stats: {
        totalWins: 0,
        totalMatches: 0,
        weeklyWins: 0,
        monthlyWins: 0
      }
    };

    // Create clan document
    const clanRef = doc(collection(db, 'clans'));
    await setDoc(clanRef, clan);

    // Update user's clan ID
    const userRef = doc(db, 'users', founderUserId);
    await updateDoc(userRef, { clanId: clanRef.id });

    return clanRef.id;
  }

  static async getClan(clanId: string): Promise<Clan | null> {
    const clanDoc = await getDoc(doc(db, 'clans', clanId));
    return clanDoc.exists() ? { id: clanDoc.id, ...clanDoc.data() } as Clan : null;
  }

  static async getClanByTag(tag: string): Promise<Clan | null> {
    const clansRef = collection(db, 'clans');
    const q = query(clansRef, where('tag', '==', tag));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty ? null : 
      { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Clan;
  }

  // Add this method to the ClanService class
  static async getUserClan(userId: string): Promise<Clan | null> {
    try {
      // Get user document to get clanId
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      if (!userData.clanId) {
        return null;
      }

      // Get clan using clanId
      return await this.getClan(userData.clanId);
    } catch (error) {
      console.error('Error getting user clan:', error);
      return null;
    }
  }

  static async joinClan(clanId: string, userId: string): Promise<void> {
    const clan = await this.getClan(clanId);
    if (!clan) throw new Error('Clan not found');

    const newMember: ClanMember = {
      userId,
      role: ClanRole.MEMBER,
      joinedAt: Date.now(),
      contributedWins: 0
    };

    // Update clan document
    const clanRef = doc(db, 'clans', clanId);
    await updateDoc(clanRef, {
      members: [...clan.members, newMember],
      memberCount: increment(1)
    });

    // Update user's clan ID
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { clanId });
  }

  static async leaveClan(clanId: string, userId: string): Promise<void> {
    const clan = await this.getClan(clanId);
    if (!clan) throw new Error('Clan not found');

    // Remove member from clan
    const updatedMembers = clan.members.filter(member => member.userId !== userId);
    
    // Update clan document
    const clanRef = doc(db, 'clans', clanId);
    await updateDoc(clanRef, {
      members: updatedMembers,
      memberCount: increment(-1)
    });

    // Remove clan ID from user
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { clanId: null });
  }

  static async updateClanStats(clanId: string, wins: number): Promise<void> {
    const clanRef = doc(db, 'clans', clanId);
    await updateDoc(clanRef, {
      'stats.totalWins': increment(wins),
      'stats.totalMatches': increment(1),
      'stats.weeklyWins': increment(wins),
      'stats.monthlyWins': increment(wins)
    });
  }
}