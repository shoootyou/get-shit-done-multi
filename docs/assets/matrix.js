/**
 * GSD Capability Matrix - Interactive UI
 * 
 * Vanilla JavaScript implementation for filtering and displaying
 * capability data across Claude Code, Copilot CLI, and Codex CLI.
 * 
 * Zero dependencies - pure browser JavaScript.
 */

class CapabilityMatrix {
  /**
   * Initialize the matrix
   * @param {string} containerId - DOM element ID to render into
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = [];
    this.filters = { 
      cli: 'all', 
      category: 'all',
      search: ''
    };
    this.init();
  }
  
  /**
   * Initialize matrix by loading data and rendering
   */
  async init() {
    try {
      await this.loadData();
      this.render();
      this.attachEvents();
    } catch (error) {
      this.showError(error);
    }
  }
  
  /**
   * Load capability data from JSON file
   */
  async loadData() {
    const response = await fetch('./capability-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    const json = await response.json();
    this.data = json.capabilities || [];
    this.metadata = json._meta || {};
    
    // Update timestamp
    if (this.metadata.generated) {
      const date = new Date(this.metadata.generated);
      document.getElementById('last-updated').textContent = 
        date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  }
  
  /**
   * Render the matrix table structure
   */
  render() {
    const html = `
      <table class="capability-matrix">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Claude Code</th>
            <th>Copilot CLI</th>
            <th>Codex CLI</th>
          </tr>
        </thead>
        <tbody id="matrix-body">
          ${this.renderRows()}
        </tbody>
      </table>
      <div id="matrix-stats" class="matrix-stats"></div>
    `;
    this.container.innerHTML = html;
    this.updateStats();
  }
  
  /**
   * Render table rows based on filtered data
   * @returns {string} HTML string for table rows
   */
  renderRows() {
    const filtered = this.filterData();
    
    if (filtered.length === 0) {
      return '<tr><td colspan="4" class="no-results">No features match your filters</td></tr>';
    }
    
    return filtered.map(row => `
      <tr class="category-${row.category}">
        <td class="feature-cell">
          <strong>${this.escapeHtml(row.feature)}</strong>
          ${row.description ? `<br><small class="feature-description">${this.escapeHtml(row.description)}</small>` : ''}
          <span class="category-badge">${row.category}</span>
        </td>
        <td class="status-${row.claude}" title="${this.escapeHtml(row.notes.claude || '')}" data-notes="${this.escapeHtml(row.notes.claude || '')}">
          ${this.formatStatus(row.claude, row.notes.claude)}
        </td>
        <td class="status-${row.copilot}" title="${this.escapeHtml(row.notes.copilot || '')}" data-notes="${this.escapeHtml(row.notes.copilot || '')}">
          ${this.formatStatus(row.copilot, row.notes.copilot)}
        </td>
        <td class="status-${row.codex}" title="${this.escapeHtml(row.notes.codex || '')}" data-notes="${this.escapeHtml(row.notes.codex || '')}">
          ${this.formatStatus(row.codex, row.notes.codex)}
        </td>
      </tr>
    `).join('');
  }
  
  /**
   * Format status cell content with icon and label
   * @param {string} status - Support level (full/partial/unsupported)
   * @param {string} notes - Optional notes for tooltip
   * @returns {string} Formatted HTML
   */
  formatStatus(status, notes) {
    const icons = { 
      full: '✓', 
      partial: '⚠', 
      unsupported: '✗',
      none: '✗'
    };
    const labels = { 
      full: 'Full', 
      partial: 'Partial', 
      unsupported: 'No',
      none: 'No'
    };
    
    const icon = icons[status] || '?';
    const label = labels[status] || status;
    
    return `<span class="status-icon">${icon}</span> <span class="status-label">${label}</span>`;
  }
  
  /**
   * Filter data based on current filters
   * @returns {Array} Filtered capability array
   */
  filterData() {
    return this.data.filter(row => {
      // Category filter
      if (this.filters.category !== 'all' && row.category !== this.filters.category) {
        return false;
      }
      
      // CLI filter - hide rows where selected CLI has no support
      if (this.filters.cli !== 'all') {
        const cliStatus = row[this.filters.cli];
        if (cliStatus === 'none' || cliStatus === 'unsupported') {
          return false;
        }
      }
      
      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        const featureMatch = row.feature.toLowerCase().includes(searchLower);
        const descMatch = row.description && row.description.toLowerCase().includes(searchLower);
        const notesMatch = Object.values(row.notes).some(note => 
          note && note.toLowerCase().includes(searchLower)
        );
        
        if (!featureMatch && !descMatch && !notesMatch) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Update statistics display
   */
  updateStats() {
    const filtered = this.filterData();
    const total = this.data.length;
    const statsEl = document.getElementById('matrix-stats');
    
    if (statsEl) {
      const byCategory = filtered.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      statsEl.innerHTML = `
        Showing ${filtered.length} of ${total} features
        ${Object.keys(byCategory).length > 0 ? 
          ` (${Object.entries(byCategory).map(([cat, count]) => `${count} ${cat}`).join(', ')})` 
          : ''}
      `;
    }
  }
  
  /**
   * Attach event listeners for filters
   */
  attachEvents() {
    // CLI filter
    const cliFilter = document.getElementById('cli-filter');
    if (cliFilter) {
      cliFilter.addEventListener('change', (e) => {
        this.filters.cli = e.target.value;
        this.updateDisplay();
      });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.updateDisplay();
      });
    }
    
    // Search filter
    const searchFilter = document.getElementById('search-filter');
    if (searchFilter) {
      searchFilter.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.updateDisplay();
      });
    }
    
    // Click on status cells to show full notes
    this.container.addEventListener('click', (e) => {
      const cell = e.target.closest('td[data-notes]');
      if (cell && cell.dataset.notes) {
        this.showNotesModal(cell.dataset.notes);
      }
    });
  }
  
  /**
   * Update display after filter change
   */
  updateDisplay() {
    const tbody = document.getElementById('matrix-body');
    if (tbody) {
      tbody.innerHTML = this.renderRows();
      this.updateStats();
    }
  }
  
  /**
   * Show notes in a modal/alert
   * @param {string} notes - Notes text to display
   */
  showNotesModal(notes) {
    if (notes && notes.trim()) {
      alert(notes);
    }
  }
  
  /**
   * Show error message
   * @param {Error} error - Error object
   */
  showError(error) {
    this.container.innerHTML = `
      <div class="error">
        <h3>Error Loading Matrix</h3>
        <p>${this.escapeHtml(error.message)}</p>
        <p>Please ensure capability-data.json is present in the docs/ directory.</p>
      </div>
    `;
  }
  
  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CapabilityMatrix('matrix-container');
});
