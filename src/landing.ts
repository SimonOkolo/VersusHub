import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

class VersusHubLanding {
    private features: FeatureData[] = [
        {
            id: 'fairplay',
            icon: '/img/handshakeascii.png',
            title: 'Fair Play',
            description: 'Our advanced reputation system rewards honesty and penalizes unfair behavior, creating a community of trustworthy players.'
        },
        {
            id: 'ranked',
            icon: '/img/trophyascii.png',
            title: 'Ranked Matches',
            description: 'Climb the leaderboard, earn exclusive rewards, and showcase your skills in competitive ranked matches.'
        },
        {
            id: 'secure',
            icon: '/img/lockascii.png',
            title: 'Secure Results',
            description: 'Disputes are a thing of the past with our innovative video proof and result verification system.'
        }
    ];

    private getStartedBtn: HTMLButtonElement | null = null;

    constructor() {
        this.initializeEventListeners();
        this.renderFeatures();
        this.setupAuthStateListener();
    }

    private initializeEventListeners(): void {
        this.addButtonInteractions();
        this.addFeatureHoverEffects();
        this.addNavigationHandlers();
    }

    private setupAuthStateListener(): void {
        // Get started button
        this.getStartedBtn = document.getElementById('getStarted') as HTMLButtonElement;
        if (this.getStartedBtn) {
            this.getStartedBtn.addEventListener('click', this.handleGetStarted.bind(this));
        }

        // Firebase auth state listener
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, redirect to dashboard
                window.location.href = '/src/pages/dashboard/';
            }
        });
    }

    private handleGetStarted(): void {
        // Redirect to auth page
        window.location.href = '/src/pages/auth/';
    }

    // ... rest of the previous implementation remains the same
    
    private addButtonInteractions(): void {
        const buttons = document.querySelectorAll('.btn-retro, .btn-retro-large');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                (button as HTMLElement).style.transform = 'scale(1.05)';
            });

            button.addEventListener('mouseleave', () => {
                (button as HTMLElement).style.transform = 'scale(1)';
            });
        });
    }

    private addFeatureHoverEffects(): void {
        const featureElements = document.querySelectorAll('.feature');
        
        featureElements.forEach(feature => {
            feature.addEventListener('mouseenter', () => {
                featureElements.forEach(f => f.classList.remove('feature-active'));
                feature.classList.add('feature-active');
            });

            feature.addEventListener('mouseleave', () => {
                feature.classList.remove('feature-active');
            });
        });
    }

    private addNavigationHandlers(): void {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', this.handleLogin.bind(this));
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', this.handleSignup.bind(this));
        }
    }

    private renderFeatures(): void {
        const featuresContainer = document.querySelector('.features');
        
        if (!featuresContainer) return;

        featuresContainer.innerHTML = this.features.map(feature => `
            <div class="feature" data-feature="${feature.id}">
                <div class="feature-icon ${feature.id}" style="background-image: url('${feature.icon}')"></div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');
    }

    private handleLogin(): void {
        window.location.href = '/src/pages/auth/';
    }

    private handleSignup(): void {
        window.location.href = '/src/pages/auth/';
    }

    

    // Removed showModal method as it's no longer needed
}

// Initialize the landing page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new VersusHubLanding();
});


// Interface from previous implementation
interface FeatureData {
    id: string;
    icon: string;
    title: string;
    description: string;
}