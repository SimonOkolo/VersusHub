import { db, storage } from '../lib/firebase';

import { 
  collection, doc, getDoc, getDocs, query, 
  where, addDoc, updateDoc, arrayUnion, arrayRemove 
} from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Clan, ClanRole, ClanInvite, ClanMessage } from '../types';



export class ClanChatService {
  private static readonly MESSAGES_COLLECTION = 'clan_messages';
  private static listeners = new Map<string, () => void>();

  static async sendMessage(clanId: string, authorData: { id: string, name: string }, content: string): Promise<void> {
    const message: Omit<ClanMessage, 'id'> = {
      clanId,
      authorId: authorData.id,
      authorName: authorData.name,
      content,
      timestamp: Date.now()
    };

    await addDoc(collection(db, this.MESSAGES_COLLECTION), message);
  }

  static subscribeToMessages(clanId: string, callback: (messages: ClanMessage[]) => void): () => void {
    // Unsubscribe from existing listener if any
    this.unsubscribeFromMessages(clanId);

    const messagesQuery = query(
      collection(db, this.MESSAGES_COLLECTION),
      where('clanId', '==', clanId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClanMessage));
      
      callback(messages.reverse());
    });

    this.listeners.set(clanId, unsubscribe);
    return unsubscribe;
  }

  static unsubscribeFromMessages(clanId: string): void {
    const unsubscribe = this.listeners.get(clanId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(clanId);
    }
  }
}

export class ClanInviteService {
  private static readonly INVITES_COLLECTION = 'clan_invites';

  static async sendInvite(clanId: string, userId: string, inviterData: { id: string, name: string }): Promise<void> {
    const invite: Omit<ClanInvite, 'id'> = {
      clanId,
      userId,
      inviterId: inviterData.id,
      inviterName: inviterData.name,
      timestamp: Date.now(),
      status: 'pending'
    };

    await addDoc(collection(db, this.INVITES_COLLECTION), invite);
  }

  static async getPendingInvites(userId: string): Promise<ClanInvite[]> {
    const invitesQuery = query(
      collection(db, this.INVITES_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(invitesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClanInvite));
  }

  static async handleInvite(inviteId: string, status: 'accepted' | 'declined'): Promise<void> {
    const inviteRef = doc(db, this.INVITES_COLLECTION, inviteId);
    await updateDoc(inviteRef, { status });
  }
}
export class ClanService {
  private static readonly CLANS_COLLECTION = 'clans';
  private static readonly CLAN_IMAGES_PATH = 'clan-images/';

  static async createClan(
    name: string, 
    tag: string, 
    description: string, 
    founderUserId: string,
    profilePicture?: File
  ): Promise<string> {
    // Validate clan name and tag
    if (!this.isValidClanName(name) || !this.isValidClanTag(tag)) {
      throw new Error('Invalid clan name or tag');
    }

    // Check if clan tag is unique
    const existingClan = await this.getClanByTag(tag);
    if (existingClan) {
      throw new Error('Clan tag already exists');
    }

    let profilePictureUrl = '';
    if (profilePicture) {
      profilePictureUrl = await this.uploadClanImage(profilePicture);
    }

    const clan: Omit<Clan, 'id'> = {
      name,
      tag,
      description,
      createdAt: Date.now(),
      founderUserId,
      memberCount: 1,
      profilePicture: profilePictureUrl,
      bannerPicture: '',
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

    const docRef = await addDoc(collection(db, this.CLANS_COLLECTION), clan);
    
    // Update user's clanId
    const userRef = doc(db, 'users', founderUserId);
    await updateDoc(userRef, { clanId: docRef.id });

    return docRef.id;
  }

  static async getClan(clanId: string): Promise<Clan | null> {
    const docRef = doc(db, this.CLANS_COLLECTION, clanId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Clan;
  }

  static async getClanByTag(tag: string): Promise<Clan | null> {
    const q = query(
      collection(db, this.CLANS_COLLECTION), 
      where('tag', '==', tag)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Clan;
  }

  static async updateClanProfile(
    clanId: string, 
    updates: Partial<Pick<Clan, 'name' | 'description' | 'profilePicture'>>,
    profilePicture?: File
  ) {
    const clanRef = doc(db, this.CLANS_COLLECTION, clanId);
    const updatedFields = { ...updates };
    
    if (profilePicture) {
      const profilePictureUrl = await this.uploadClanImage(profilePicture);
      updatedFields.profilePicture = profilePictureUrl;
    }

    await updateDoc(clanRef, updatedFields);
  }

  static async addMember(clanId: string, userId: string) {
    const clanRef = doc(db, this.CLANS_COLLECTION, clanId);
    const clan = await this.getClan(clanId);

    if (!clan) {
      throw new Error('Clan not found');
    }

    if (clan.memberCount >= 50) { // Maximum clan size
      throw new Error('Clan is full');
    }

    const newMember = {
      userId,
      role: ClanRole.MEMBER,
      joinedAt: Date.now(),
      contributedWins: 0
    };

    await updateDoc(clanRef, {
      members: arrayUnion(newMember),
      memberCount: clan.memberCount + 1
    });

    // Update user's clanId
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { clanId });
  }

  static async removeMember(clanId: string, userId: string, removedByUserId: string) {
    const clan = await this.getClan(clanId);
    if (!clan) {
      throw new Error('Clan not found');
    }

    const remover = clan.members.find(m => m.userId === removedByUserId);
    const memberToRemove = clan.members.find(m => m.userId === userId);

    if (!remover || !memberToRemove) {
      throw new Error('Member not found');
    }

    // Check permissions
    if (!this.canRemoveMember(remover.role, memberToRemove.role)) {
      throw new Error('Insufficient permissions');
    }

    const clanRef = doc(db, this.CLANS_COLLECTION, clanId);
    await updateDoc(clanRef, {
      members: arrayRemove(memberToRemove),
      memberCount: clan.memberCount - 1
    });

    // Remove clanId from user
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { clanId: null });
  }

  static async updateMemberRole(
    clanId: string, 
    userId: string, 
    newRole: ClanRole, 
    updatedByUserId: string
  ) {
    const clan = await this.getClan(clanId);
    if (!clan) {
      throw new Error('Clan not found');
    }

    const updater = clan.members.find(m => m.userId === updatedByUserId);
    const memberToUpdate = clan.members.find(m => m.userId === userId);

    if (!updater || !memberToUpdate) {
      throw new Error('Member not found');
    }

    // Check permissions
    if (!this.canUpdateRole(updater.role, memberToUpdate.role, newRole)) {
      throw new Error('Insufficient permissions');
    }

    const updatedMembers = clan.members.map(member => 
      member.userId === userId ? { ...member, role: newRole } : member
    );

    const clanRef = doc(db, this.CLANS_COLLECTION, clanId);
    await updateDoc(clanRef, { members: updatedMembers });
  }

  private static async uploadClanImage(file: File): Promise<string> {
    const imageRef = ref(storage, `${this.CLAN_IMAGES_PATH}${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  }

  private static isValidClanName(name: string): boolean {
    return name.length >= 3 && name.length <= 32;
  }

  private static isValidClanTag(tag: string): boolean {
    return /^[A-Z0-9]{2,8}$/.test(tag);
  }

  private static canRemoveMember(removerRole: ClanRole, targetRole: ClanRole): boolean {
    const roles = Object.values(ClanRole);
    const removerRank = roles.indexOf(removerRole);
    const targetRank = roles.indexOf(targetRole);
    return removerRank < targetRank; // Lower index = higher rank
  }

  private static canUpdateRole(
    updaterRole: ClanRole, 
    currentRole: ClanRole, 
    newRole: ClanRole
  ): boolean {
    const roles = Object.values(ClanRole);
    const updaterRank = roles.indexOf(updaterRole);
    const currentRank = roles.indexOf(currentRole);
    const newRank = roles.indexOf(newRole);
    
    return updaterRank < currentRank && updaterRank < newRank;
  }
}