import { ProfileService } from '../services/profileService';
import { auth } from '../lib/firebase';

export class ProfilePicture extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupUI();
  }

  private setupUI() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .profile-picture-container {
          position: relative;
          display: inline-block;
        }

        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid var(--primary-color);
          object-fit: cover;
          cursor: pointer;
        }

        .edit-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          text-align: center;
          padding: 4px;
          border-bottom-left-radius: 60px;
          border-bottom-right-radius: 60px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .profile-picture-container:hover .edit-overlay {
          opacity: 1;
        }

        input[type="file"] {
          display: none;
        }
      </style>

      <div class="profile-picture-container">
        <img id="avatar" class="profile-avatar" src="/img/default-avatar.png" alt="Profile Picture">
        <div class="edit-overlay">Edit</div>
        <input type="file" accept="image/*">
      </div>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    const container = this.shadowRoot?.querySelector('.profile-picture-container') as HTMLElement;
    const fileInput = this.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;
    const img = this.shadowRoot?.querySelector('#avatar') as HTMLImageElement;
  
    if (!container || !fileInput || !img) return;
  
    container.addEventListener('click', () => {
      fileInput.click();
    });
  
    fileInput.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file && auth.currentUser) {
        try {
          const downloadURL = await ProfileService.updateProfilePicture(
            auth.currentUser.uid, 
            file
          );
          img.src = downloadURL;
          
          // Dispatch event to notify profile page
          this.dispatchEvent(new CustomEvent('profilePictureUpdated', {
            detail: { url: downloadURL },
            bubbles: true,
            composed: true
          }));
        } catch (error) {
          console.error('Error updating profile picture:', error);
          // Handle error (show message to user)
        }
      }
    });
  }
  

  // Update the displayed image
  set imageUrl(url: string) {
    const img = this.shadowRoot?.querySelector('#avatar');
    if (img) {
      img.setAttribute('src', url);
    }
  }
}

customElements.define('profile-picture', ProfilePicture);