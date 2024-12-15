import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export class Header {
    private profilePicture!: HTMLImageElement;
    private dropdown!: HTMLDivElement;

    constructor() {
        this.initializeElements();
        this.setupEventListeners();
    }

    private initializeElements() {
        const header = document.createElement('header');
        header.className = 'header';
    
        // Logo container with a clickable link
        const logoLink = document.createElement('a');
        logoLink.href = '/src/pages/dashboard/';
    
        // Logo
        const logo = document.createElement('img');
        logo.src = '/img/VsHubLogo.png';
        logo.alt = 'VersusHub Logo';
        logo.className = 'logo-small';
    
        logoLink.appendChild(logo); // Append the logo to the anchor tag
    
        // Profile container
        const profileContainer = document.createElement('div');
        profileContainer.className = 'profile-container';
    
        // Profile picture
        this.profilePicture = document.createElement('img');
        this.profilePicture.alt = 'PFP';
        this.profilePicture.className = 'profile-picture';
    
        // Dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'dropdown';
        this.dropdown.innerHTML = `
            <a href="/src/pages/profile/" class="dropdown-item">
                <span>Profile</span>
            </a>
            <a href="/src/pages/clans/" class="dropdown-item">
                <span>Clans</span>
            </a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" id="logoutBtn" style="cursor: pointer;">
                <span>Logout</span>
            </div>
        `;
    
        profileContainer.appendChild(this.profilePicture);
        profileContainer.appendChild(this.dropdown);
    
        // Append the clickable logo to the header
        header.appendChild(logoLink);
    
        header.appendChild(profileContainer);
    
        document.body.insertBefore(header, document.body.firstChild);
    }
    

    private setupEventListeners() {
        // Toggle dropdown when profile picture is clicked
        this.profilePicture.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        // Prevent dropdown from closing when clicked inside
        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
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

    private toggleDropdown() {
        this.dropdown.classList.toggle('active');
    }

    private closeDropdown() {
        this.dropdown.classList.remove('active');
    }

    updateProfilePicture(pictureUrl: string) {
        if (pictureUrl) {
            this.profilePicture.src = pictureUrl;
        }
    }
}
