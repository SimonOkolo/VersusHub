import { Clan } from '../../types';

export class ClanCard extends HTMLElement {
  private clan: Clan | null = null;

  static get observedAttributes() {
    return ['clan-data'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'clan-data') {
      this.clan = JSON.parse(newValue);
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .clan-card {
          background: var(--card-background);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .clan-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .clan-info h3 {
          margin: 0;
          font-size: 1.2rem;
        }
        
        .clan-tag {
          color: var(--primary-color);
          font-size: 0.9rem;
        }
        
        .clan-stats {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }
      </style>
      
      <div class="clan-card">
        ${this.clan ? this.renderClan() : this.renderNoClan()}
      </div>
    `;
  }

  private renderClan() {
    if (!this.clan) return '';
    
    return `
      <img class="clan-avatar" src="${this.clan.profilePicture}" alt="${this.clan.name}">
      <div class="clan-info">
        <h3>${this.clan.name}</h3>
        <div class="clan-tag">[${this.clan.tag}]</div>
        <div class="clan-stats">
          <div>Members: ${this.clan.memberCount}</div>
          <div>Weekly Wins: ${this.clan.stats.weeklyWins}</div>
        </div>
      </div>
    `;
  }

  private renderNoClan() {
    return `
      <div class="clan-info">
        <h3>No Clan</h3>
        <p>Join a clan to compete with other teams!</p>
      </div>
    `;
  }
}

customElements.define('clan-card', ClanCard);