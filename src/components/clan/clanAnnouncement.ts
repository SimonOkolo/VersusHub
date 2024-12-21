import { ClanAnnouncement } from '../../types';

export class ClanAnnouncements extends HTMLElement {
  private announcements: ClanAnnouncement[] = [];
  private canPost: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set announcementList(data: { announcements: ClanAnnouncement[], canPost: boolean }) {
    this.announcements = data.announcements;
    this.canPost = data.canPost;
    this.render();
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .announcements-container {
          background: var(--card-background);
          border-radius: var(--border-radius);
          padding: 1rem;
        }
        
        .announcement {
          padding: 1rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .announcement-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .announcement-meta {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        
        .new-announcement {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        textarea {
          width: 100%;
          min-height: 100px;
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          background: rgba(0, 0, 0, 0.1);
          color: var(--text-color);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      </style>

      <div class="announcements-container">
        <h3>Clan Announcements</h3>
        ${this.renderAnnouncements()}
        ${this.canPost ? this.renderAnnouncementForm() : ''}
      </div>
    `;

    this.setupEventListeners();
  }

  private renderAnnouncements() {
    return this.announcements.length 
      ? this.announcements.map(announcement => `
          <div class="announcement">
            <div class="announcement-header">
              <strong>${announcement.authorName}</strong>
              <span class="announcement-meta">
                ${new Date(announcement.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p>${announcement.content}</p>
          </div>
        `).join('')
      : '<p>No announcements yet</p>';
  }

  private renderAnnouncementForm() {
    return `
      <div class="new-announcement">
        <h4>Post Announcement</h4>
        <form id="announcementForm">
          <textarea 
            name="content" 
            placeholder="Write your announcement here..."
            required
          ></textarea>
          <button type="submit">Post</button>
        </form>
      </div>
    `;
  }

  private setupEventListeners() {
    const form = this.shadowRoot?.querySelector('#announcementForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const content = formData.get('content') as string;

      if (content.trim()) {
        this.dispatchEvent(new CustomEvent('postAnnouncement', {
          detail: { content },
          bubbles: true,
          composed: true
        }));
        (e.target as HTMLFormElement).reset();
      }
    });
  }
}

customElements.define('clan-announcements', ClanAnnouncements);