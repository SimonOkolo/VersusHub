import { auth } from '../../lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile 
} from 'firebase/auth';
import { UserService } from '../../services/userService';

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        // Update active tab
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show correct form
        if (tab === 'login') {
            loginForm?.classList.remove('hidden');
            signupForm?.classList.add('hidden');
        } else {
            loginForm?.classList.add('hidden');
            signupForm?.classList.remove('hidden');
        }
    });
});

// Handle login
document.getElementById('login')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = '/src/pages/dashboard/';
    } catch (error) {
        console.error('Login error:', error);
        // Handle error (show message to user)
    }
});

// Handle signup
document.getElementById('signup')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = (document.getElementById('signupEmail') as HTMLInputElement).value;
    const password = (document.getElementById('signupPassword') as HTMLInputElement).value;
    const username = (document.getElementById('signupUsername') as HTMLInputElement).value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with username
        await updateProfile(userCredential.user, {
            displayName: username
        });

        // Initialize user data in Firestore
        await UserService.initializeUser(userCredential.user.uid, username);

        window.location.href = '/src/pages/dashboard/';
    } catch (error) {
        console.error('Signup error:', error);
        // Handle error (show message to user)
    }
});