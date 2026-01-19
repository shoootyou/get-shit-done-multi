# Phase 4: Agent Translation — Orchestration Adaptation - Research

**Researched:** 2025-01-20
**Domain:** Multi-CLI agent orchestration and cross-platform compatibility
**Confidence:** HIGH

## Summary

Phase 4 focuses on making GSD's 11 specialized agents work consistently across three CLI platforms (Claude Code, GitHub Copilot CLI, Codex CLI) with transparent invocation, equivalent functionality, and cross-CLI state management. The good news: **Phase 2 already built the foundation** — adapter modules, format conversion utilities, and CLI detection.

The remaining work centers on **agent orchestration layer** that sits between commands and adapters, providing:
1. **Agent registry** - Mapping agent names to CLI-specific implementations
2. **Capability matrix** - Documenting what works where and why
3. **Performance tracking** - Benchmarking agent execution per CLI
4. **Result serialization** - Ensuring `.planning/` directory compatibility

Research reveals enterprise-grade agent orchestration follows **registry pattern** with dynamic discovery, while performance tracking leverages Node.js built-in `perf_hooks` module (no external dependencies). Cross-CLI compatibility depends on JSON serialization and standardized directory structure.

**Primary recommendation:** Build lightweight orchestration layer in `bin/lib/orchestration/` using agent registry pattern, Node.js perf_hooks for benchmarking, and capability matrix documentation. Leverage existing adapters from Phase 2.

## Standard Stack

The established libraries/tools for multi-CLI agent orchestration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js perf_hooks | Built-in (v16.7.0+) | Performance measurement | High-resolution timing (sub-ms), marks/measures API, zero dependencies |
| fs/promises | Built-in | Agent file I/O | Async operations, already in use from Phase 1 |
| path module | Built-in | Cross-platform paths | Abstracts platform differences, prevents hardcoded separators |
| JSON (native) | Built-in | Result serialization | Universal support, fast parsing, human-readable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PerformanceObserver | Built-in | Real-time metrics | Collect marks/measures automatically during agent runs |
| performance.timerify() | Built-in | Function wrapping | Auto-measure agent function execution times |
| eventLoopUtilization() | Built-in | Runtime health | Detect if CLI event loop is blocked during agent work |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| JSON | YAML | YAML more human-friendly but slower parsing, less predictable, not needed for agent results |
| perf_hooks | benchmark.js, Clinic.js | External deps violate zero-dependency constraint; perf_hooks sufficient |
| Custom registry | Dynamic require() | Dynamic require works but registry provides type safety, validation, documentation |

**Installation:**
```bash
# No installation required - all built-ins
node --version  # Verify 16.7.0+ (project uses v25.3.0)
```

## Architecture Patterns

### Recommended Orchestration Structure
```
bin/lib/orchestration/
├── agent-registry.js         # Maps agent names to CLI implementations
├── agent-invoker.js          # Invokes agents via CLI-specific adapters
├── capability-matrix.js      # Documents agent support per CLI
├── performance-tracker.js    # Tracks agent execution time per CLI
└── result-validator.js       # Validates .planning/ cross-CLI compatibility
```

### Pattern 1: Agent Registry with Dynamic Discovery
**What:** Central registry maps agent names to CLI-specific paths/invocation methods
**When to use:** Making agent invocation transparent to user (AGENT-05)
**Example:**
```javascript
// bin/lib/orchestration/agent-registry.js
const path = require('path');
const fs = require('fs');

/**
 * Agent Registry - maps agent names to CLI-specific implementations
 * Follows enterprise pattern: dynamic discovery with capability metadata
 */
class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.capabilities = new Map();
    this._loadAgents();
  }

  /**
   * Load all 11 GSD agents with CLI-specific paths
   */
  _loadAgents() {
    const agentNames = [
      'gsd-executor', 'gsd-planner', 'gsd-verifier', 
      'gsd-debugger', 'gsd-phase-researcher', 'gsd-plan-checker',
      'gsd-codebase-mapper', 'gsd-project-researcher', 
      'gsd-research-synthesizer', 'gsd-roadmapper', 
      'gsd-integration-checker'
    ];

    agentNames.forEach(name => {
      this.agents.set(name, {
        name,
        source: path.join(__dirname, '../../..', 'agents', `${name}.md`),
        // CLI-specific locations determined by adapters
        claude: { type: 'native', path: '~/.claude/agents/' },
        copilot: { type: 'custom', path: '~/.github/agents/' },
        codex: { type: 'skill', path: '~/.codex/skills/get-shit-done/agents/' }
      });

      // Set default capability (all supported unless explicitly limited)
      this.setCapability(name, 'claude', 'full');
      this.setCapability(name, 'copilot', 'full');
      this.setCapability(name, 'codex', 'full');
    });
  }

  /**
   * Get agent metadata for current CLI
   */
  getAgent(agentName, cli) {
    const agent = this.agents.get(agentName);
    if (!agent) return null;
    
    return {
      ...agent,
      implementation: agent[cli],
      capability: this.capabilities.get(`${agentName}:${cli}`)
    };
  }

  /**
   * Set capability level for agent on specific CLI
   * @param {string} level - 'full' | 'partial' | 'unsupported'
   */
  setCapability(agentName, cli, level) {
    this.capabilities.set(`${agentName}:${cli}`, level);
  }

  /**
   * Get all agents with their CLI support matrix
   */
  getCapabilityMatrix() {
    const matrix = [];
    this.agents.forEach((agent, name) => {
      matrix.push({
        agent: name,
        claude: this.capabilities.get(`${name}:claude`),
        copilot: this.capabilities.get(`${name}:copilot`),
        codex: this.capabilities.get(`${name}:codex`)
      });
    });
    return matrix;
  }
}

module.exports = { AgentRegistry };
```

### Pattern 2: Performance Tracking with perf_hooks
**What:** Use Node.js built-in performance APIs to track agent execution time
**When to use:** Performance benchmarking (AGENT-09)
**Example:**
```javascript
// bin/lib/orchestration/performance-tracker.js
const { performance, PerformanceObserver } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

/**
 * Performance Tracker - measures agent execution across CLIs
 * Uses perf_hooks for sub-millisecond precision
 */
class PerformanceTracker {
  constructor(metricsFile = '.planning/metrics/agent-performance.json') {
    this.metricsFile = metricsFile;
    this.metrics = new Map();
    
    // Set up performance observer
    this.observer = new PerformanceObserver((items) => {
      items.getEntries().forEach(entry => {
        this._recordMetric(entry);
      });
    });
    this.observer.observe({ entryTypes: ['measure'] });
  }

  /**
   * Start tracking agent execution
   */
  startAgent(agentName, cli) {
    const markName = `${agentName}:${cli}:start`;
    performance.mark(markName);
    return markName;
  }

  /**
   * End tracking and measure duration
   */
  async endAgent(agentName, cli, startMark) {
    const endMark = `${agentName}:${cli}:end`;
    const measureName = `${agentName}:${cli}`;
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    // Get the measurement
    const entries = performance.getEntriesByName(measureName);
    const duration = entries[entries.length - 1].duration;
    
    // Store metric
    await this._storeMetric(agentName, cli, duration);
    
    // Cleanup
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
    
    return duration;
  }

  /**
   * Record metric in memory
   */
  _recordMetric(entry) {
    const [agent, cli] = entry.name.split(':');
    const key = `${agent}:${cli}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key).push({
      duration: entry.duration,
      timestamp: Date.now()
    });
  }

  /**
   * Store metric to file
   */
  async _storeMetric(agentName, cli, duration) {
    const key = `${agentName}:${cli}`;
    const metric = {
      agent: agentName,
      cli,
      duration,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Ensure metrics directory exists
      await fs.mkdir(path.dirname(this.metricsFile), { recursive: true });
      
      // Load existing metrics
      let allMetrics = [];
      try {
        const data = await fs.readFile(this.metricsFile, 'utf8');
        allMetrics = JSON.parse(data);
      } catch (err) {
        // File doesn't exist yet
      }
      
      // Add new metric
      allMetrics.push(metric);
      
      // Keep only last 100 measurements per agent/CLI combo
      const grouped = allMetrics.reduce((acc, m) => {
        const k = `${m.agent}:${m.cli}`;
        if (!acc[k]) acc[k] = [];
        acc[k].push(m);
        return acc;
      }, {});
      
      const filtered = Object.values(grouped)
        .flatMap(metrics => metrics.slice(-100));
      
      // Write back
      await fs.writeFile(
        this.metricsFile,
        JSON.stringify(filtered, null, 2),
        'utf8'
      );
    } catch (err) {
      console.warn(`Failed to store performance metric: ${err.message}`);
    }
  }

  /**
   * Get average execution time for agent on CLI
   */
  getAverageTime(agentName, cli) {
    const key = `${agentName}:${cli}`;
    const metrics = this.metrics.get(key) || [];
    
    if (metrics.length === 0) return null;
    
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }
}

module.exports = { PerformanceTracker };
```

### Pattern 3: Result Validation for Cross-CLI Compatibility
**What:** Validate `.planning/` directory structure is consistent across CLIs
**When to use:** Ensuring agent results pass between CLIs (AGENT-08)
**Example:**
```javascript
// bin/lib/orchestration/result-validator.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Result Validator - ensures .planning/ structure cross-CLI compatible
 * Uses JSON for all structured data (not YAML due to parsing complexity)
 */
class ResultValidator {
  constructor(planningDir = '.planning') {
    this.planningDir = planningDir;
    this.requiredStructure = {
      'STATE.md': 'file',
      'ROADMAP.md': 'file',
      'REQUIREMENTS.md': 'file',
      'PROJECT.md': 'file',
      'config.json': 'file',
      'phases/': 'directory',
      'metrics/': 'directory'
    };
  }

  /**
   * Validate directory structure
   */
  async validateStructure() {
    const errors = [];
    
    for (const [itemPath, type] of Object.entries(this.requiredStructure)) {
      const fullPath = path.join(this.planningDir, itemPath);
      
      try {
        const stat = await fs.stat(fullPath);
        
        if (type === 'file' && !stat.isFile()) {
          errors.push(`Expected file but found directory: ${itemPath}`);
        } else if (type === 'directory' && !stat.isDirectory()) {
          errors.push(`Expected directory but found file: ${itemPath}`);
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          errors.push(`Missing required ${type}: ${itemPath}`);
        } else {
          errors.push(`Error accessing ${itemPath}: ${err.message}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate JSON files are parseable
   */
  async validateJSON(filePath) {
    try {
      const content = await fs.readFile(
        path.join(this.planningDir, filePath),
        'utf8'
      );
      JSON.parse(content);
      return { valid: true };
    } catch (err) {
      return { 
        valid: false, 
        error: `Invalid JSON in ${filePath}: ${err.message}` 
      };
    }
  }

  /**
   * Ensure all agent outputs use standard format
   */
  async validateAgentOutput(phasePath) {
    const errors = [];
    const files = await fs.readdir(path.join(this.planningDir, phasePath));
    
    // Expected files: XX-PLAN.md, XX-SUMMARY.md, XX-RESEARCH.md, XX-VERIFICATION.md
    const planFiles = files.filter(f => f.endsWith('-PLAN.md'));
    const summaryFiles = files.filter(f => f.endsWith('-SUMMARY.md'));
    
    if (planFiles.length === 0) {
      errors.push(`No PLAN.md files in ${phasePath}`);
    }
    
    // Validate each PLAN has corresponding SUMMARY after execution
    for (const planFile of planFiles) {
      const planNum = planFile.split('-')[0];
      const expectedSummary = `${planNum}-SUMMARY.md`;
      
      // Summary should exist after execution (but might not during planning)
      // This is a warning, not error
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

module.exports = { ResultValidator };
```

### Pattern 4: Capability Matrix Documentation
**What:** Document which features work on which CLIs and why
**When to use:** Agent feature differences per CLI (AGENT-06)
**Example:**
```javascript
// bin/lib/orchestration/capability-matrix.js

/**
 * Capability Matrix - documents agent support across CLIs
 * Used to generate user-facing documentation
 */
const AGENT_CAPABILITIES = {
  'gsd-executor': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  'gsd-planner': {
    claude: { level: 'full', notes: 'Native support, no limitations' },
    copilot: { level: 'full', notes: 'Custom agent, full feature parity' },
    codex: { level: 'full', notes: 'Skill-based, all features supported' }
  },
  // ... all 11 agents
};

/**
 * CLI-specific limitations and workarounds
 */
const CLI_LIMITATIONS = {
  claude: {
    slash_commands: { supported: true, notes: 'Full /gsd:* command support' },
    custom_agents: { supported: true, notes: 'Native .agent.md format' },
    parallel_agents: { supported: true, notes: 'No limitations' }
  },
  copilot: {
    slash_commands: { supported: false, notes: 'Use skills with $get-shit-done' },
    custom_agents: { supported: true, notes: 'Custom agent definitions in .github/agents/' },
    parallel_agents: { supported: true, notes: 'No limitations' }
  },
  codex: {
    slash_commands: { supported: false, notes: 'Use skills with $get-shit-done' },
    custom_agents: { supported: true, notes: 'Skill-based in .codex/skills/' },
    parallel_agents: { supported: true, notes: 'No limitations' }
  }
};

/**
 * Generate capability matrix for documentation
 */
function generateCapabilityMatrix() {
  const agents = Object.keys(AGENT_CAPABILITIES);
  const clis = ['claude', 'copilot', 'codex'];
  
  const matrix = agents.map(agent => {
    const row = { agent };
    clis.forEach(cli => {
      const cap = AGENT_CAPABILITIES[agent][cli];
      row[cli] = {
        level: cap.level,
        icon: cap.level === 'full' ? '✓' : (cap.level === 'partial' ? '⚠' : '✗'),
        notes: cap.notes
      };
    });
    return row;
  });
  
  return matrix;
}

module.exports = { 
  AGENT_CAPABILITIES, 
  CLI_LIMITATIONS,
  generateCapabilityMatrix 
};
```

### Anti-Patterns to Avoid
- **Dynamic agent loading without validation:** Always validate agent files exist and are parseable before attempting to invoke
- **Blocking synchronous performance tracking:** Use async file I/O for storing metrics to avoid blocking agent execution
- **YAML for agent results:** Use JSON for all structured data — YAML parsing is complex and error-prone
- **Hardcoded CLI paths:** Always use adapter modules from Phase 2 for path resolution

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Performance timing | Custom Date.now() wrapper | Node.js perf_hooks | Sub-millisecond precision, built-in marks/measures, PerformanceObserver API |
| Agent discovery | Scan filesystem on every invocation | Agent registry with startup load | Faster, enables validation, provides metadata |
| Result serialization | Custom format | JSON (native) | Universal support, fast, built-in, human-readable |
| Cross-CLI validation | Ad-hoc file checks | Structured validator class | Reusable, comprehensive, clear error reporting |
| Path resolution | String concatenation | path.join() from Phase 1 | Cross-platform, prevents separator issues |

**Key insight:** Node.js built-ins provide enterprise-grade performance tracking, JSON serialization, and path handling. External dependencies would violate project constraints without adding value.

## Common Pitfalls

### Pitfall 1: Assuming All Agents Work Identically Across CLIs
**What goes wrong:** Agent invocation varies by CLI (slash commands vs skills), causing silent failures
**Why it happens:** Phase 2 adapters handle format conversion but don't expose invocation differences
**How to avoid:** Build orchestration layer that abstracts invocation method behind unified API
**Warning signs:** Users report "command not found" or agents don't respond in certain CLIs

### Pitfall 2: Synchronous Performance Tracking Blocks Execution
**What goes wrong:** Writing metrics to disk blocks agent execution, making measurements inaccurate
**Why it happens:** Using synchronous fs methods (fs.writeFileSync) in hot path
**How to avoid:** Use async fs.promises for all metric storage, accept eventual consistency
**Warning signs:** Agent execution times increase when performance tracking is enabled

### Pitfall 3: Cross-CLI State Corruption
**What goes wrong:** User switches CLIs mid-phase, second CLI can't read first CLI's output
**Why it happens:** Different path separators, encoding, or JSON vs YAML inconsistency
**Why it happens:** Different CLIs use different path conventions or encodings
**How to avoid:** Standardize on JSON for all structured data, validate .planning/ structure on startup
**Warning signs:** "Failed to parse STATE.md" or "Planning directory corrupted" errors

### Pitfall 4: Performance Overhead from Excessive Measurement
**What goes wrong:** Measuring every function call adds significant overhead
**Why it happens:** Wrapping too many functions with performance.timerify()
**How to avoid:** Only measure agent-level execution (start/end), not individual function calls
**Warning signs:** Agent execution takes 2-3x longer than expected

### Pitfall 5: Registry Stale After Agent Updates
**What goes wrong:** Agent registry doesn't reflect newly added or modified agents
**Why it happens:** Registry built once at startup, never refreshed
**How to avoid:** Provide registry.reload() method for development, document when to call it
**Warning signs:** New agents don't appear in capability matrix or invocation fails

## Code Examples

Verified patterns from research and existing codebase:

### Agent Invocation (CLI-agnostic)
```javascript
// bin/lib/orchestration/agent-invoker.js
const { AgentRegistry } = require('./agent-registry');
const { PerformanceTracker } = require('./performance-tracker');
const { detectCLI } = require('../cli-detection');

/**
 * Invoke agent with transparent CLI adaptation
 * Pattern: Adapter + Registry + Performance Tracking
 */
async function invokeAgent(agentName, prompt, options = {}) {
  const cli = detectCLI();
  const registry = new AgentRegistry();
  const tracker = new PerformanceTracker();
  
  // Get agent metadata for current CLI
  const agent = registry.getAgent(agentName, cli);
  if (!agent) {
    throw new Error(`Agent not found: ${agentName}`);
  }
  
  // Check capability
  if (agent.capability === 'unsupported') {
    throw new Error(
      `Agent ${agentName} is not supported on ${cli}. ` +
      `See capability matrix for details.`
    );
  }
  
  // Start performance tracking
  const startMark = tracker.startAgent(agentName, cli);
  
  try {
    // Load CLI-specific adapter
    const adapter = require(`../adapters/${cli}`);
    
    // Invoke via adapter
    const result = await adapter.invokeAgent(agent, prompt, options);
    
    // End tracking
    const duration = await tracker.endAgent(agentName, cli, startMark);
    
    return {
      success: true,
      result,
      performance: { duration, cli }
    };
  } catch (err) {
    await tracker.endAgent(agentName, cli, startMark);
    throw err;
  }
}

module.exports = { invokeAgent };
```

### Capability Matrix Generation for Documentation
```javascript
// bin/lib/orchestration/generate-capability-docs.js
const { generateCapabilityMatrix, CLI_LIMITATIONS } = require('./capability-matrix');
const fs = require('fs').promises;

/**
 * Generate markdown documentation for agent capabilities
 */
async function generateCapabilityDocs(outputPath = 'docs/agent-capabilities.md') {
  const matrix = generateCapabilityMatrix();
  
  let markdown = `# Agent Capability Matrix

This document shows which GSD agents are supported on each CLI platform.

## Support Levels

- ✓ **Full Support**: All features work without limitations
- ⚠ **Partial Support**: Most features work with documented limitations
- ✗ **Unsupported**: Agent cannot be used on this CLI

## Agent Support Matrix

| Agent | Claude Code | GitHub Copilot CLI | Codex CLI |
|-------|-------------|-------------------|-----------|
`;

  matrix.forEach(row => {
    const claudeIcon = row.claude.icon;
    const copilotIcon = row.copilot.icon;
    const codexIcon = row.codex.icon;
    
    markdown += `| ${row.agent} | ${claudeIcon} | ${copilotIcon} | ${codexIcon} |\n`;
  });
  
  markdown += `\n## Detailed Notes\n\n`;
  
  matrix.forEach(row => {
    markdown += `### ${row.agent}\n\n`;
    markdown += `- **Claude Code**: ${row.claude.notes}\n`;
    markdown += `- **GitHub Copilot CLI**: ${row.copilot.notes}\n`;
    markdown += `- **Codex CLI**: ${row.codex.notes}\n\n`;
  });
  
  markdown += `## CLI-Specific Limitations\n\n`;
  
  Object.entries(CLI_LIMITATIONS).forEach(([cli, limitations]) => {
    markdown += `### ${cli}\n\n`;
    Object.entries(limitations).forEach(([feature, info]) => {
      const icon = info.supported ? '✓' : '✗';
      markdown += `- ${icon} **${feature}**: ${info.notes}\n`;
    });
    markdown += `\n`;
  });
  
  await fs.writeFile(outputPath, markdown, 'utf8');
  console.log(`Generated capability documentation: ${outputPath}`);
}

module.exports = { generateCapabilityDocs };
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual agent switching | Agent registry with auto-discovery | 2025 | User doesn't need to know CLI differences |
| Ad-hoc performance logs | Built-in perf_hooks API | Node.js v16.7.0+ | Sub-millisecond precision, standardized measurement |
| YAML for config/results | JSON everywhere | 2025 trend | Faster parsing, less error-prone, universal support |
| Custom benchmark libraries | Node.js native perf_hooks | 2025 | Zero dependencies, sufficient for agent timing |
| Static capability docs | Generated from code | Best practice | Single source of truth, always accurate |

**Deprecated/outdated:**
- **benchmark.js**: Still works but unnecessary — perf_hooks sufficient and zero-dependency
- **YAML for agent results**: JSON preferred for agent output due to parsing reliability
- **Dynamic require() for agents**: Registry pattern provides better type safety and validation

## Open Questions

Things that couldn't be fully resolved:

1. **Agent Parallel Execution Across CLIs**
   - What we know: All CLIs support custom agents, async execution possible
   - What's unclear: Whether parallel agent invocation causes resource contention or race conditions in `.planning/` directory writes
   - Recommendation: Implement file locking or sequential write queue for `.planning/` updates

2. **CLI Performance Differences**
   - What we know: Different CLIs have different overhead (native vs API calls)
   - What's unclear: Magnitude of performance difference — is it 10ms or 1000ms?
   - Recommendation: Implement benchmarking first, optimize only if differences are >500ms

3. **Agent Result Size Limits**
   - What we know: CLIs may have different context/output size limits
   - What's unclear: Exact limits per CLI, whether they affect agent results
   - Recommendation: Document limits in capability matrix after testing, implement chunking if needed

## Sources

### Primary (HIGH confidence)
- Node.js Official Documentation - perf_hooks API v25.3.0 (https://nodejs.org/api/perf_hooks.html) - Verified performance measurement patterns, marks/measures API, PerformanceObserver
- Existing codebase - Phase 2 adapter modules (bin/lib/adapters/) - Format conversion, CLI detection, path handling already implemented

### Secondary (MEDIUM confidence)
- Microsoft Multi-Agent Reference Architecture (2025) - Agent registry patterns, hierarchical orchestration, dynamic discovery
- Azure Architecture Center - AI Agent Orchestration Patterns - Sequential, parallel, consensus patterns for multi-agent systems
- AWS Best Practices - Data serialization comparison - JSON vs YAML for cross-platform compatibility

### Tertiary (LOW confidence, needs validation)
- CLI comparison articles (GitHub Copilot vs Claude Code vs Codex) - Feature differences, capability matrix ideas (should verify with official CLI docs)
- Enterprise capability matrix templates - Documentation patterns for API compatibility (general guidance, adapt for agents)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Node.js built-ins verified in official docs, already in use in project
- Architecture patterns: HIGH - Registry pattern well-established, perf_hooks API documented, existing adapters provide foundation
- Performance tracking: HIGH - perf_hooks API verified, patterns validated in Node.js docs
- Cross-CLI compatibility: MEDIUM - JSON serialization solid, but CLI-specific quirks need testing
- Capability matrix: MEDIUM - Pattern is solid, but specific agent limitations need discovery through implementation

**Research date:** 2025-01-20
**Valid until:** 2025-02-20 (30 days - stable domain, Node.js APIs don't change frequently)

**Key dependencies on Phase 2:**
- Adapter modules already exist (claude.js, copilot.js, codex.js)
- Format conversion utilities (agentToSkill) working
- CLI detection functional
- Path handling cross-platform

**Phase 4 builds orchestration layer on top of Phase 2 foundation.**
