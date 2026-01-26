/**
 * Registry for platform adapters
 * Provides singleton instance for adapter lookup
 */
class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
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
// Wave 2 will import and register adapters
// Wave 3 will use for adapter lookup
export const adapterRegistry = new AdapterRegistry();
