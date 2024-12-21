import { ClanMessage } from '../../types';

export class ClanChat extends HTMLElement {
  private messages: ClanMessage[] = [];
  private messageContainer: HTMLDivElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set messageList(messages: ClanMessage[]) {
    this.messages = messages;
    this.render();
    this.scrollToBottom();
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 400px;
          background: var(--card-background);
          border-radius: var(--border-radius);
        }
        
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        
        .message {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          background: rgba(0, 0, 0, 0.1);
        }
        
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
          font-size: 0.8rem;
        }
        
        .chat-input {
          display: flex;
          padding: 1rem;
          gap: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        input {
          flex: 1;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.1);
          color: var(--text-color);
        }
      </style>

      <div class="chat-container">
        <div class="messages">
          ${this.renderMessages()}
        </div>
        <form class="chat-input">
          <input 
            type="text" 
            placeholder="Type your message..." 
            required
          >
          <button type="submit">Send</button>
        </form>
      </div>
    `;

    this.messageContainer = this.shadowRoot.querySelector('.messages');
    this.setupEventListeners();
  }

  private renderMessages() {
    return this.messages.map(message => `
      <div class="message">
        <div class="message-header">
          <strong>${message.authorName}</strong>
          <span>${new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <p>${message.content}</p>
      </div>
    `).join('');
  }

  private scrollToBottom() {
    if (this.messageContainer) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  }

  private setupEventListeners() {
    const form = this.shadowRoot?.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const content = input?.value.trim();

      if (content) {
        this.dispatchEvent(new CustomEvent('sendMessage', {
          detail: { content },
          bubbles: true,
          composed: true
        }));
        input!.value = '';
      }
    });
  }
}

customElements.define('clan-chat', ClanChat);