import { auth, db, storage } from './lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MatchService } from './services/matchService';
import { RankService } from './services/rankService';
import { ReputationService } from './services/reputationService';
import { Match, MatchStatus } from './types';

// DOM Elements
const findMatchBtn = document.getElementById('findMatch') as HTMLButtonElement;
const activeMatchSection = document.getElementById('activeMatch') as HTMLElement;
const matchInfo = document.getElementById('matchInfo') as HTMLElement;
const iWonBtn = document.getElementById('iWon') as HTMLButtonElement;
const opponentWonBtn = document.getElementById('opponentWon') as HTMLButtonElement;
const proofUpload = document.getElementById('proofUpload') as HTMLInputElement;

let currentMatch: Match | null = null;

// Event Listeners
findMatchBtn.addEventListener('click', handleFindMatch);
iWonBtn.addEventListener('click', () => handleMatchResult(true));
opponentWonBtn.addEventListener('click', () => handleMatchResult(false));

async function handleFindMatch() {
  try {
    // Simple matchmaking - in a real app, you'd want more sophisticated logic
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const matchId = await MatchService.createMatch(userId, 'opponent-id'); // Replace with real opponent
    listenToMatch(matchId);
  } catch (error) {
    console.error('Error finding match:', error);
  }
}

function listenToMatch(matchId: string) {
  const matchRef = doc(db, 'matches', matchId);
  onSnapshot(matchRef, (doc) => {
    if (doc.exists()) {
      currentMatch = { id: doc.id, ...doc.data() } as Match;
      updateMatchUI();
    }
  });
}

async function handleMatchResult(playerWon: boolean) {
  if (!currentMatch || !auth.currentUser) return;

  try {
    const proofFile = proofUpload.files?.[0];
    let proofUrl = '';

    if (proofFile) {
      const storageRef = ref(storage, `match-proofs/${currentMatch.id}`);
      await uploadBytes(storageRef, proofFile);
      proofUrl = await getDownloadURL(storageRef);
    }

    await MatchService.submitResult(
      currentMatch.id,
      playerWon ? auth.currentUser.uid : currentMatch.player2Id,
      proofUrl
    );

    // Update reputation and rank points
    if (playerWon) {
      await ReputationService.handleFairMatch(auth.currentUser.uid);
      // Add rank points calculation here
    }
  } catch (error) {
    console.error('Error submitting result:', error);
  }
}

function updateMatchUI() {
  if (!currentMatch) {
    activeMatchSection.classList.add('hidden');
    return;
  }

  activeMatchSection.classList.remove('hidden');
  matchInfo.innerHTML = `
    <h3>Match #${currentMatch.id}</h3>
    <p>Status: ${currentMatch.status}</p>
    ${currentMatch.winnerId ? `<p>Winner: ${currentMatch.winnerId}</p>` : ''}
  `;
}

// Initialize the app
auth.onAuthStateChanged((user) => {
  if (user) {
    // Listen for active matches
    const matchesQuery = query(
      collection(db, 'matches'),
      where('status', '==', MatchStatus.PENDING),
      where('player1Id', '==', user.uid)
    );

    onSnapshot(matchesQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const match = { id: change.doc.id, ...change.doc.data() } as Match;
          currentMatch = match;
          updateMatchUI();
        }
      });
    });
  }
});