import { ClaudeAdapter } from './claude-adapter.js';
import { CopilotAdapter } from './copilot-adapter.js';
import { CodexAdapter } from './codex-adapter.js';

/**
 * Registry for platform adapters
 * Provides singleton instance for adapter lookup
 */
class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this._initialize();
  }
  
  /**
   * Initialize registry with platform adapters
   * @private
   */
  _initialize() {
    // Register all three platform adapters
    this.register('claude', new ClaudeAdapter());
    this.register('copilot', new CopilotAdapter());
    this.register('codex', new CodexAdapter());
  }
  
  /**
   * Register a platform adapter
   * @param {string} platform - Platform name ('claude', 'copilot', 'codex')
   * @param {PlatformAdapter} adapter - Adapter instance
   */
  register(platform, adapter) {
    if (this.adapters.has(platform)) {
      throw new Error(`Platform already registered: ${platform}`);
    }
    this.adapters.set(platform, adapter);
  }
  
  /**
   * Get adapter for platform
   * @param {string} platform - Platform name
   * @returns {PlatformAdapter}
   */
  get(platform) {
    if (!this.adapters.has(platform)) {
      const supported = this.getSupportedPlatforms().join(', ');
      throw new Error(`Unknown platform: ${platform}. Supported: ${supported}`);
    }
    return this.adapters.get(platform);
  }
  
  /**
   * Check if platform is registered
   * @param {string} platform - Platform name
   * @returns {boolean}
   */
  has(platform) {
    return this.adapters.has(platform);
  }
  
  /**
   * Get all supported platform names
   * @returns {string[]}
   */
  getSupportedPlatforms() {
    return Array.from(this.adapters.keys());
  }
}

// Singleton instance
// Adapters are registered on construction (Wave 2)
// Wave 3 will use for adapter lookup during installation
export const adapterRegistry = new AdapterRegistry();
