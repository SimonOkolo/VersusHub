import { Header } from '../../components/header/header';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/userService';
import { User } from '../../types';

// Initialize header
new Header();

// Initialize dashboard data
class Dashboard {
    private user: User | null = null;

    constructor() {
        this.initializeAuthListener();
    }

    private async initializeAuthListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Get user data from Firestore
                this.user = await UserService.getUser(user.uid);
                this.updateDashboard();
            } else {
                window.location.href = '/src/pages/auth/';
            }
        });
    }

    private updateDashboard() {
        if (!this.user) return;

        // Update username
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
            usernameElement.textContent = this.user.username;
        }

        // Update rank
        const rankElement = document.getElementById('userRank');
        const divisionElement = document.getElementById('userDivision');
        if (rankElement && divisionElement) {
            rankElement.textContent = this.user.rank;
            divisionElement.textContent = `Division ${this.user.division}`;
        }

        // Update reputation
        const reputationElement = document.getElementById('userReputation');
        const reputationProgress = document.getElementById('reputationProgress');
        if (reputationElement && reputationProgress) {
            reputationElement.textContent = this.user.reputationRank;
            // Calculate reputation progress (0-100)
            const progress = ((this.user.reputation + 50) / 100) * 100;
            reputationProgress.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }

        // Update coins
        const coinsElement = document.getElementById('userCoins');
        if (coinsElement) {
            coinsElement.textContent = this.user.coins.toString();
        }
    }
}

// Initialize dashboard
new Dashboard();