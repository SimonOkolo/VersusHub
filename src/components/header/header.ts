import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { UserService } from '../../services/userService';

export class Header {
    private profilePicture!: HTMLImageElement;
    private dropdown!: HTMLDivElement;

    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadUserProfilePicture();
    }

    private async loadUserProfilePicture() {
        const user = auth.currentUser;
        if (user) {
            const userData = await UserService.getUser(user.uid);
            if (userData?.profilePicture) {
                this.profilePicture.src = userData.profilePicture;
            }
        }
    }

    private initializeElements() {
        const header = document.createElement('header');
        header.className = 'header';

        // Logo
        const logo = document.createElement('img');
        logo.src = '/img/VsHubLogo.png';
        logo.alt = 'VersusHub Logo';
        logo.className = 'logo-small';

        // Profile container
        const profileContainer = document.createElement('div');
        profileContainer.className = 'profile-container';

        // Profile picture
        this.profilePicture = document.createElement('img');
        this.profilePicture.src = '/img/default-avatar.png'; // Default avatar
        this.profilePicture.alt = 'Profile Picture';
        this.profilePicture.className = 'profile-picture';

        // Dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'dropdown';
        this.dropdown.innerHTML = `
            <a href="/profile" class="dropdown-item">
                <span>Profile</span>
            </a>
            <a href="/clans" class="dropdown-item">
                <span>Clans</span>
            </a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" id="logoutBtn">
                <span>Logout</span>
            </div>
        `;

        profileContainer.appendChild(this.profilePicture);
        profileContainer.appendChild(this.dropdown);
        header.appendChild(logo);
        header.appendChild(profileContainer);

        document.body.insertBefore(header, document.body.firstChild);
    }

    private setupEventListeners() {
        // Toggle dropdown
        this.profilePicture.addEventListener('click', () => {
            this.dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.profilePicture.contains(e.target as Node) && 
                !this.dropdown.contains(e.target as Node)) {
                this.dropdown.classList.remove('active');
            }
        });

        // Logout functionality
        const logoutBtn = this.dropdown.querySelector('#logoutBtn');
        logoutBtn?.addEventListener('click', async () => {
            try {
                await signOut(auth);
                window.location.href = '../index.html';
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });
    }
}