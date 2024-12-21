import { ClanMember, ClanRole } from '../../types';

export class ClanMemberList extends HTMLElement {
  private members: ClanMember[] = [];
  private currentUserId: string = '';
  private userRole: ClanRole = ClanRole.MEMBER;

  static get observedAttributes() {
    return ['members', 'current-user-id', 'user-role'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    switch (name) {
      case 'members':
        this.members = JSON.parse(newValue);
        break;
      case 'current-user-id':
        this.currentUserId = newValue;
        break;
      case 'user-role':
        this.userRole = newValue as ClanRole;
        break;
    }
    this.render();
  }

  private canManageMember(memberRole: ClanRole): boolean {
    const roles = Object.values(ClanRole);
    return roles.indexOf(this.userRole) < roles.indexOf(memberRole);
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .member-list {
          display: grid;
          gap: 1rem;
        }
        
        .member-card {
          background: var(--card-background);
          border-radius: var(--border-radius);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .member-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        
        .member-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .role-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          background: var(--primary-color);
        }
      </style>

      <div class="member-list">
        ${this.members.map(member => this.renderMemberCard(member)).join('')}
      </div>
    `;

    this.setupEventListeners();
  }

  private renderMemberCard(member: ClanMember) {
    const canManage = this.canManageMember(member.role);
    
    return `
      <div class="member-card" data-user-id="${member.userId}">
        <div class="member-info">
          <img class="member-avatar" src="/img/default-avatar.png" alt="Member avatar">
          <div>
            <div>${member.userId}</div>
            <span class="role-badge">${member.role}</span>
          </div>
        </div>
        ${canManage ? this.renderMemberActions(member) : ''}
      </div>
    `;
  }

  private renderMemberActions(member: ClanMember) {
    return `
      <div class="member-actions">
        ${this.userRole === ClanRole.LEADER ? `
          <select class="role-select" data-user-id="${member.userId}">
            ${Object.values(ClanRole).map(role => `
              <option value="${role}" ${role === member.role ? 'selected' : ''}>
                ${role}
              </option>
            `).join('')}
          </select>
        ` : ''}
        <button class="remove-member" data-user-id="${member.userId}">
          Remove
        </button>
      </div>
    `;
  }

  private setupEventListeners() {
    this.shadowRoot?.querySelectorAll('.role-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const userId = target.dataset.userId;
        const newRole = target.value as ClanRole;
        
        if (userId) {
          this.dispatchEvent(new CustomEvent('roleChange', {
            detail: { userId, newRole },
            bubbles: true,
            composed: true
          }));
        }
      });
    });

    this.shadowRoot?.querySelectorAll('.remove-member').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const userId = target.dataset.userId;
        
        if (userId) {
          this.dispatchEvent(new CustomEvent('removeMember', {
            detail: { userId },
            bubbles: true,
            composed: true
          }));
        }
      });
    });
  }
}

customElements.define('clan-member-list', ClanMemberList);