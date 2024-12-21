import { Clan } from '../../types';

export class ClanSettings extends HTMLElement {
  private clan: Clan | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set clanData(clan: Clan) {
    this.clan = clan;
    this.render();
  }

  render() {
    if (!this.shadowRoot || !this.clan) return;

    this.shadowRoot.innerHTML = `
      <style>
        .settings-form {
          background: var(--card-background);
          border-radius: var(--border-radius);
          padding: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
        
        input, textarea {
          width: 100%;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.1);
          color: var(--text-color);
        }
        
        .profile-picture {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
      </style>

      <form class="settings-form">
        <div class="form-group">
          <img class="profile-picture" src="${this.clan.profilePicture}" alt="Clan profile">
          <input type="file" accept="image/*" id="profilePicture">
        </div>

        <div class="form-group">
          <label for="name">Clan Name</label>
          <input type="text" id="name" value="${this.clan.name}" required>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" rows="4">${this.clan.description}</textarea>
        </div>

        <button type="submit">Save Changes</button>
      </form>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    const form = this.shadowRoot?.querySelector('form');
    const fileInput = this.shadowRoot?.querySelector('#profilePicture') as HTMLInputElement;

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = this.shadowRoot?.querySelector('#name') as HTMLInputElement;
      const descriptionInput = this.shadowRoot?.querySelector('#description') as HTMLTextAreaElement;
      
      const updates = {
        name: nameInput.value,
        description: descriptionInput.value
      };

      const profilePicture = fileInput.files?.[0];

      this.dispatchEvent(new CustomEvent('saveSettings', {
        detail: { updates, profilePicture },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('clan-settings', ClanSettings);