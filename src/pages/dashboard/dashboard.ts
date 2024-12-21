import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { UserService } from '../../services/userService';
import { User, GameSpecificStats } from '../../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RankService } from '../../services/rankService';

class Dashboard {
    private user: User | null = null;
    private availableGames: string[] = ["CS2", "COD: Warzone", "Dota 2", "Fortnite", "Rainbow Six Siege", "Valorant", "League of Legends", "Mortal Kombat 1", "Overwatch 2", "PUBG", "Rocket League", "Tekken 8"];

    constructor() {
        this.initializeAuthListener();
        this.setupEventListeners();
        this.populateTournaments();
        this.populateAvailableGamesDropdown();
    }

    private getRequiredExperienceForLevel(level: number): number {
        return Math.round(100 * Math.pow(1.1, level - 1));
    }

    private calculateLevelFromExperience(experience: number): number {
        let level = 1;
        while (level < 50 && experience >= this.getRequiredExperienceForLevel(level)) {
            level++;
        }
        return level;
    }

    private async initializeAuthListener() {
        onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                try {
                    this.user = await UserService.getUser(authUser.uid);
                    if (this.user) {
                        this.updateDashboard();
                        this.populateUserGames();
                    } else {
                        console.error('User data not found');
                        window.location.href = '/src/pages/auth/';
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    window.location.href = '/src/pages/auth/';
                }
            } else {
                window.location.href = '/src/pages/auth/';
            }
        });
    }

    private updateDashboard() {
        if (!this.user) return;

        const updateElementText = (elementId: string, text: string) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = text;
            }
        };

        updateElementText('username', this.user.username);
        const reputationElement = document.getElementById('userReputation');
        if (reputationElement) {
            reputationElement.textContent = this.user.reputationRank;
        }
        updateElementText('userCoins', this.user.coins.toString());
    }

    private populateUserGames() {
        if (!this.user || !this.user.stats?.gameStats) return;

        const userGamesList = document.getElementById('user-games-list');
        if (!userGamesList) return;
        userGamesList.innerHTML = '';

        Object.keys(this.user.stats.gameStats).forEach(gameTitle => {
            const gameStats = this.user?.stats.gameStats[gameTitle];
            const listItem = document.createElement('li');
            let displayText = `${gameTitle} `;

            if (gameStats) {
                const level = this.calculateLevelFromExperience(gameStats.experience);
                if (level < 50) {
                    displayText += `(Level ${level})`;
                } else {
                    const { rank } = RankService.calculateRank(gameStats.rankPoints);
                    displayText += gameStats.rankPoints > 0 ? `(${rank})` : '(No Rank)';
                }
            }

            listItem.textContent = displayText;
            listItem.addEventListener('click', () => this.showMatchmakeOptions(gameTitle));
            userGamesList.appendChild(listItem);
        });
    }

    private showMatchmakeOptions(gameTitle: string) {
        const matchmakeOptionsDiv = document.getElementById('matchmake-options');
        if (!matchmakeOptionsDiv) return;
        matchmakeOptionsDiv.innerHTML = '';

        const gameStats = this.user?.stats.gameStats[gameTitle];
        const canPlayRanked = gameStats && this.calculateLevelFromExperience(gameStats.experience) >= 50;

        const createButton = (text: string, onClick: () => void, disabled: boolean = false) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.disabled = disabled;
            if (!disabled) {
                button.addEventListener('click', onClick);
            }
            return button;
        };

        const rankedButton = createButton(`Ranked (${gameTitle})`, () => console.log(`Ranked ${gameTitle} clicked`), !canPlayRanked);
        const standardButton = createButton(`Standard (${gameTitle})`, () => console.log(`Standard ${gameTitle} clicked`));
        const privateButton = createButton(`Enter Match Code`, () => {
            const matchCode = prompt(`Enter ${gameTitle} match code:`);
            if (matchCode) {
                console.log(`Joining private ${gameTitle} match with code: ${matchCode}`);
                // Implement navigation to private match here
            }
        });

        matchmakeOptionsDiv.appendChild(rankedButton);
        matchmakeOptionsDiv.appendChild(standardButton);
        matchmakeOptionsDiv.appendChild(privateButton);
    }

    private async populateTournaments() {
        const tournamentList = document.getElementById('tournament-list');
        if (!tournamentList) return;
        tournamentList.innerHTML = '';

        const tournamentsRef = collection(db, 'tournaments');
        const now = new Date();
        const q = query(
            tournamentsRef,
            where('startTime', '<=', now)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const tournamentData = doc.data();
            const listItem = document.createElement('li');
            listItem.textContent = tournamentData.name;
            tournamentList.appendChild(listItem);
        });
    }

    private populateAvailableGamesDropdown() {
        const dropdown = document.getElementById('add-game-dropdown') as HTMLSelectElement;
        const addButton = document.getElementById('add-game-button') as HTMLButtonElement;

        this.availableGames.forEach(game => {
            const option = document.createElement('option');
            option.value = game;
            option.textContent = game;
            dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', () => {
            addButton.disabled = !dropdown.value;
        });

        addButton.addEventListener('click', async () => {
            const selectedGame = dropdown.value;
            if (selectedGame && this.user) {
                try {
                    await UserService.addGameToUser(this.user.id, selectedGame);
                    this.user = await UserService.getUser(this.user.id);
                    this.populateUserGames();
                    dropdown.value = '';
                    addButton.disabled = true;
                } catch (error) {
                    console.error('Error adding game:', error);
                }
            }
        });
    }

    private setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn?.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = '../index.html';
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });

        const profileBtn = document.getElementById('profile-btn');
        profileBtn?.addEventListener('click', async () => {
            try {
                console.log("Attempted to press profile");
                window.location.href = '../profile/index.html';
            } catch (error) {
                console.error('Error moving to profile page:', error);
            }
        });
    }
}

new Dashboard();