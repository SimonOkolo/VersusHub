import { auth } from '../../lib/firebase';
import { ClanInvite } from '../../types';

export class ClanInvites extends HTMLElement {
  private invites: ClanInvite[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set inviteList(invites: ClanInvite[]) {
    this.invites = invites;
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .invites-container {
          background: var(--card-background);
          border-radius: var(--border-radius);
          padding: 1rem;
        }
        
        .invite-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .invite-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        button {
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius);
          border: none;
          cursor: pointer;
        }
        
        .accept { background: var(--success-color); }
        .decline { background: var(--danger-color); }
      </style>

      <div class="invites-container">
        <h3>Clan Invites</h3>
        ${this.invites.length ? this.renderInvites() : '<p>No pending invites</p>'}
      </div>
    `;

    this.setupEventListeners();
  }

  private renderInvites() {
    return this.invites.map(invite => `
      <div class="invite-card" data-invite-id="${invite.id}">
        <div class="invite-info">
          <p>Invited to join ${invite.clanName}</p>
          <small>Invited by: ${invite.inviterName}</small>
        </div>
        <div class="invite-actions">
          <button class="accept" data-action="accept">Accept</button>
          <button class="decline" data-action="decline">Decline</button>
        </div>
      </div>
    `).join('');
  }

  private setupEventListeners() {
    this.shadowRoot?.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const action = target.getAttribute('data-action');
        const inviteCard = target.closest('.invite-card') as HTMLElement;
        const inviteId = inviteCard?.getAttribute('data-invite-id');

        if (inviteId && action) {
          this.dispatchEvent(new CustomEvent('inviteAction', {
            detail: { action, inviteId },
            bubbles: true,
            composed: true
          }));
        }
      });
    });
  }
}

customElements.define('clan-invites', ClanInvites);