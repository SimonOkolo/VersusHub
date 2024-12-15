export class StatsCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
      if (!this.shadowRoot) return;
      
      this.shadowRoot.innerHTML = `
        <style>
          .stats-card {
            background: var(--card-background);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }
          
          .stat-item {
            text-align: center;
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
          }
          
          .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
          }
        </style>
        
        <div class="stats-card">
          <slot></slot>
        </div>
      `;
    }
  }
  
  customElements.define('stats-card', StatsCard);