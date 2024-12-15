import { Header } from '../../components/header/header';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/userService';
import { ClanService } from '../../services/clanService';
import { User, Clan } from '../../types';
import '../../components/stats/statsCard';
import '../../components/clan/clanCard';
import '../../components/profilePicture';

export class ProfilePage {
    private user: User | null = null;
    private clan: Clan | null = null;
    private header: Header;
  
    constructor() {
      this.header = new Header();
      this.initializeAuthListener();
      this.setupProfilePictureListener();
    }
  
    private setupProfilePictureListener() {
      const profilePicture = document.querySelector('profile-picture');
      if (profilePicture) {
        profilePicture.addEventListener('profilePictureUpdated', (e: Event) => {
          const event = e as CustomEvent;
          if (this.user) {
            this.user.profilePicture = event.detail.url;
          }
        });
      }
    }
  
    private async initializeAuthListener() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await this.loadUserData(user.uid);
          if (this.user) {
            this.header.updateProfilePicture(this.user.profilePicture);
          }
        } else {
          window.location.href = '/src/pages/auth/';
        }
      });
    }
  
    private async loadUserData(userId: string) {
      try {
        this.user = await UserService.getUser(userId);
        if (this.user?.clanId) {
          this.clan = await ClanService.getUserClan(userId);
        }
        this.updateUI();
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  
    private updateUI() {
      if (!this.user) return;
  
      // Update profile header
      const usernameElement = document.getElementById('username');
      const profilePicture = document.querySelector('profile-picture');
      
      if (usernameElement) {
        usernameElement.textContent = this.user.username;
      }
      
      if (profilePicture && 'imageUrl' in profilePicture) {
        (profilePicture as any).imageUrl = this.user.profilePicture;
      }
  
      // Update stats
      const statsCard = document.querySelector('stats-card');
      if (statsCard) {
        const stats = this.user.stats;
        
        statsCard.innerHTML = `
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${this.user.coins}</div>
              <div class="stat-label">Total Coins</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.totalWins}</div>
              <div class="stat-label">Total Wins</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.totalLosses}</div>
              <div class="stat-label">Total Losses</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.winRate}%</div>
              <div class="stat-label">Win Rate</div>
            </div>
          </div>
        `;
      }
  
      // Update clan card
      const clanCard = document.querySelector('clan-card');
      if (clanCard) {
        clanCard.setAttribute('clan-data', JSON.stringify(this.clan));
      }
  
      // Update game stats
      this.updateGameStats();
    }
  
    private updateGameStats() {
      if (!this.user?.stats?.gameStats) return;
  
      const gameStatsList = document.getElementById('gameStatsList');
      if (!gameStatsList) return;
  
      const gameStatsHtml = Object.entries(this.user.stats.gameStats)
        .map(([gameId, stats]) => `
          <div class="game-stat-card">
            <h3>${gameId}</h3>
            <div class="game-stat-details">
              <div>Wins: ${stats.wins}</div>
              <div>Losses: ${stats.losses}</div>
              <div>Win Rate: ${stats.winRate}%</div>
              <div>Last Played: ${new Date(stats.lastPlayed).toLocaleDateString()}</div>
            </div>
          </div>
        `)
        .join('');
  
      gameStatsList.innerHTML = gameStatsHtml || '<p>No game statistics available yet.</p>';
    }
  }
  
  // Initialize profile page
  new ProfilePage();