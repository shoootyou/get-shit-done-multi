# Function Dependency Graph

**Phase 5.2 - Stage 1: Function-level Inventory**

**Generated:** 2026-01-25T18:59:45.504Z

**Total functions:** 92

## ⚠️  Important Constraint

**Dependencies tracked: DIRECT CALLS ONLY** (Stage 1)

Per resolved research Question 4: This graph shows only immediate dependencies (one level deep).
Transitive call analysis is deferred to Stage 2 (Phase 5.3).

## Statistics

- Functions with dependencies: 87
- Functions with callers: 64
- Isolated functions: 4
- Low confidence (<100%): 92

## High-Dependency Functions

Functions called by 3+ other functions (direct calls only):

- **getConfigPaths** (called by 10 functions)
- **visit** (called by 8 functions)
- **render** (called by 6 functions)
- **buildContext** (called by 5 functions)
- **getTargetDirs** (called by 5 functions)
- **getTargetDirs** (called by 5 functions)
- **getTargetDirs** (called by 5 functions)
- **generateAgentsFromSpecs** (called by 4 functions)
- **generateSkillsFromSpecs** (called by 4 functions)
- **generateFromTemplate** (called by 4 functions)
- **replaceClaudePaths** (called by 4 functions)
- **preserveUserData** (called by 4 functions)
- **detectInstalledCLIs** (called by 3 functions)
- **validate** (called by 3 functions)
- **generateAgent** (called by 3 functions)
- **install** (called by 3 functions)
- **installCodex** (called by 3 functions)
- **installCopilot** (called by 3 functions)

## Complex Functions

Functions with cyclomatic complexity >= 10 (per Question 1 threshold):

- **oldInstallationLogic** (complexity 247)
- **generateFromSpec** (complexity 58)
- **install** (complexity 51)
- **generateAgent** (complexity 50)
- **validateClaudeSpec** (complexity 33)
- **installCodex** (complexity 32)
- **installCopilot** (complexity 26)
- **validateCopilotSpec** (complexity 26)
- **calculateComplexity** (complexity 24)
- **detectIOSideEffects** (complexity 24)
- **visit** (complexity 24)
- **copyCopilotAgents** (complexity 20)
- **main** (complexity 20)
- **validateCodexSpec** (complexity 20)
- **validateToolList** (complexity 20)
- **generateAnalysisDocument** (complexity 19)
- **generateReport** (complexity 19)
- **installAll** (complexity 19)
- **extractFunctions** (complexity 18)
- **getRecommendations** (complexity 17)
- **detectCLI** (complexity 16)
- **migrateAllAgents** (complexity 16)
- **generateMatrixData** (complexity 15)
- **parseFlags** (complexity 15)
- **runEquivalenceTests** (complexity 15)
- **validatePath** (complexity 15)
- **render** (complexity 14)
- **extractDependencies** (complexity 13)
- **generateMigrationReport** (complexity 13)
- **runOrchestrationValidation** (complexity 13)
- **testEquivalence** (complexity 13)
- **buildContext** (complexity 12)
- **generateSkillsFromSpecs** (complexity 12)
- **mapTools** (complexity 12)
- **serializeFrontmatter** (complexity 12)
- **transformFields** (complexity 12)
- **validateParallelSpawning** (complexity 12)
- **generateAgentsFromSpecs** (complexity 11)
- **formatValue** (complexity 10)
- **promptLocation** (complexity 10)
- **warnAndConfirmCodexLocal** (complexity 10)

## Function Dependencies by File

### add-version-stamps.js

#### `getGSDVersion()`

*Confidence: 85%*

**Depends on (direct):**
- `join()`
- `readFile()`
- `parse()`
- `warn()`

**Called by (direct):**
- `stampAllDocs()`

### agent-converter.js

#### `convertAgentToSpec()`

*Confidence: 85%*

**Depends on (direct):**
- `existsSync()`
- `readFileSync()`
- `matter()`
- `keys()`
- `push()`
- `convertFrontmatter()`
- `assembleSpec()`

**Called by (direct):**
- `migrateAllAgents()`

#### `formatValue()`

*Confidence: 70%*

**Depends on (direct):**
- `includes()`
- `String()`
- `isArray()`
- `join()`
- `map()`
- `formatValue()`
- `stringify()`

**Called by (direct):**
- `convertFrontmatter()`
- `formatValue()`

### agent-invoker.js

#### `invokeAgent()`

*Confidence: 65%*

**Depends on (direct):**
- `withLock()`
- `now()`
- `detectCLI()`
- `startAgent()`
- `replace()`
- `getAgent()`
- `require()`
- `endAgent()`
- `toISOString()`
- `invokeAgent()`
- `trackUsage()`

**Called by (direct):**
- `invokeAgent()`
- `testEquivalence()`

### ast-parser.js

#### `parseFile()`

*Confidence: 95%*

**Depends on (direct):**
- `readFileSync()`
- `parse()`

**Called by (direct):**
- `extractFunctions()`

#### `extractFunctions()`

*Confidence: 70%*

**Depends on (direct):**
- `parseFile()`
- `push()`
- `isArray()`
- `forEach()`
- `visit()`

### backup-handler.js

#### `createBackup()`

*Confidence: 85%*

**Depends on (direct):**
- `split()`
- `toISOString()`
- `join()`
- `cwd()`
- `pathExists()`
- `remove()`
- `copy()`
- `countFiles()`

**Called by (direct):**
- `runMigration()`

### capability-matrix.js

#### `generateCapabilityMatrix()`

*Confidence: 95%*

**Depends on (direct):**
- `keys()`
- `map()`
- `forEach()`

**Called by (direct):**
- `generateCapabilityDocs()`
- `generateComparison()`

### classifier.js

#### `classifyFunction()`

*Confidence: 95%*

*Isolated function (no dependencies or callers)*

### claude.js

#### `getTargetDirs()`

*Confidence: 95%*

**Depends on (direct):**
- `getConfigPaths()`
- `join()`

**Called by (direct):**
- `oldInstallationLogic()`
- `install()`
- `installCopilot()`
- `installCodex()`
- `installAll()`

### cli-invoker.js

#### `invokeClaude()`

*Confidence: 85%*

**Depends on (direct):**
- `now()`
- `unshift()`
- `spawn()`
- `on()`
- `toString()`
- `resolve()`
- `reject()`
- `setTimeout()`
- `terminate()`

### codex-warning.js

#### `getBoxen()`

*Confidence: 75%*

**Depends on (direct):**
- `require()`

**Called by (direct):**
- `warnAndConfirmCodexLocal()`

#### `warnAndConfirmCodexLocal()`

*Confidence: 70%*

**Depends on (direct):**
- `includes()`
- `getBoxen()`
- `log()`
- `forEach()`
- `toUpperCase()`
- `charAt()`
- `slice()`
- `prompts()`

**Called by (direct):**
- `main()`

### codex.js

#### `getTargetDirs()`

*Confidence: 95%*

**Depends on (direct):**
- `getConfigPaths()`
- `join()`

**Called by (direct):**
- `oldInstallationLogic()`
- `install()`
- `installCopilot()`
- `installCodex()`
- `installAll()`

### complexity.js

#### `calculateComplexity()`

*Confidence: 70%*

**Depends on (direct):**
- `includes()`
- `max()`
- `isArray()`
- `forEach()`
- `visit()`

#### `classifyComplexity()`

*Confidence: 95%*

*Isolated function (no dependencies or callers)*

### confidence.js

#### `calculateConfidence()`

*Confidence: 85%*

**Depends on (direct):**
- `hasDynamicRequires()`
- `push()`
- `hasUnclearNaming()`
- `hasJSDoc()`
- `isComplexWithoutDocs()`
- `hasUnclearDependencies()`
- `max()`

### conflict-resolver.js

#### `isGSDContent()`

*Confidence: 95%*

**Depends on (direct):**
- `relative()`
- `split()`
- `includes()`

### context-builder.js

#### `buildContext()`

*Confidence: 70%*

**Depends on (direct):**
- `includes()`
- `join()`
- `getConfigPaths()`
- `getAgentsPath()`
- `getSkillsPath()`
- `getGsdPath()`
- `getGsdPathRef()`
- `cwd()`
- `getPlatformCapabilities()`
- `getCommandPrefix()`

**Called by (direct):**
- `oldInstallationLogic()`
- `copyWithPathReplacement()`
- `generateAgent()`
- `generateFromSpec()`
- `generateFromTemplate()`

#### `getAgentsPath()`

*Confidence: 95%*

**Depends on (direct):**
- `join()`

**Called by (direct):**
- `buildContext()`

### copilot.js

#### `getTargetDirs()`

*Confidence: 95%*

**Depends on (direct):**
- `getConfigPaths()`
- `join()`

**Called by (direct):**
- `oldInstallationLogic()`
- `install()`
- `installCopilot()`
- `installCodex()`
- `installAll()`

### detect-old-structure.js

#### `detectOldStructure()`

*Confidence: 95%*

**Depends on (direct):**
- `pathExists()`
- `catch()`
- `readdir()`

**Called by (direct):**
- `detectAllPlatforms()`

### detect.js

#### `detectInstalledCLIs()`

*Confidence: 95%*

**Depends on (direct):**
- `getConfigPaths()`
- `existsSync()`

**Called by (direct):**
- `oldInstallationLogic()`
- `installAll()`
- `detectCLI()`

#### `detectCLI()`

*Confidence: 70%*

**Depends on (direct):**
- `detectInstalledCLIs()`
- `cwd()`
- `includes()`
- `filter()`
- `values()`

**Called by (direct):**
- `invokeAgent()`

### doc-generator.js

#### `sanitizeFunctionName()`

*Confidence: 95%*

**Depends on (direct):**
- `replace()`

**Called by (direct):**
- `generateAnalysisDocument()`

#### `generateAnalysisDocument()`

*Confidence: 70%*

**Depends on (direct):**
- `basename()`
- `toISOString()`
- `push()`
- `forEach()`
- `classifyComplexityLevel()`
- `join()`
- `stringify()`
- `sanitizeFunctionName()`
- `existsSync()`
- `readFileSync()`
- `writeFileSync()`

### engine.js

#### `validate()`

*Confidence: 95%*

**Depends on (direct):**
- `load()`

**Called by (direct):**
- `renderAndValidate()`
- `generateAgent()`
- `generateFromSpec()`

#### `render()`

*Confidence: 70%*

**Depends on (direct):**
- `replace()`
- `toString()`
- `stringify()`
- `String()`

**Called by (direct):**
- `oldInstallationLogic()`
- `copyWithPathReplacement()`
- `renderAndValidate()`
- `generateAgent()`
- `generateFromSpec()`
- `generateFromTemplate()`

### equivalence-test.js

#### `runEquivalenceTests()`

*Confidence: 60%*

**Depends on (direct):**
- `log()`
- `repeat()`
- `execFileAsync()`
- `push()`
- `join()`
- `testEquivalence()`
- `forEach()`

#### `testEquivalence()`

*Confidence: 60%*

**Depends on (direct):**
- `log()`
- `substring()`
- `join()`
- `invokeAgent()`
- `filter()`
- `entries()`
- `push()`
- `map()`
- `stringify()`
- `trim()`
- `replace()`
- `parse()`
- `sort()`
- `keys()`

**Called by (direct):**
- `runEquivalenceTests()`

### extract-capabilities.js

#### `extractAgentCapabilities()`

*Confidence: 65%*

**Depends on (direct):**
- `join()`
- `require()`
- `entries()`
- `getAgentDescription()`
- `push()`

**Called by (direct):**
- `extractCapabilities()`

### extract-comments.js

#### `extractDocComments()`

*Confidence: 85%*

**Depends on (direct):**
- `readFile()`
- `exec()`
- `filter()`
- `map()`
- `split()`
- `trim()`
- `replace()`
- `startsWith()`
- `push()`
- `parseJSDocTags()`
- `join()`
- `error()`

**Called by (direct):**
- `extractFromDirectory()`
- `scan()`

### field-transformer.js

#### `validateFieldSupport()`

*Confidence: 95%*

*Isolated function (no dependencies or callers)*

#### `transformFields()`

*Confidence: 80%*

**Depends on (direct):**
- `entries()`
- `push()`

**Called by (direct):**
- `generateAgent()`
- `generateFromSpec()`

### flag-parser.js

#### `parseFlags()`

*Confidence: 70%*

**Depends on (direct):**
- `exitOverride()`
- `allowUnknownOption()`
- `option()`
- `version()`
- `description()`
- `name()`
- `parse()`
- `opts()`
- `log()`
- `push()`

**Called by (direct):**
- `main()`

### flag-validator.js

#### `validateFlags()`

*Confidence: 95%*

**Depends on (direct):**
- `includes()`
- `error()`
- `exit()`

**Called by (direct):**
- `main()`

### format-converter.js

#### `agentToSkill()`

*Confidence: 85%*

**Depends on (direct):**
- `match()`
- `trim()`
- `slice()`
- `split()`
- `indexOf()`
- `join()`
- `map()`
- `entries()`

**Called by (direct):**
- `convertContent()`

### formatter.js

#### `indent()`

*Confidence: 85%*

**Depends on (direct):**
- `repeat()`
- `join()`
- `map()`
- `split()`

### generate-capability-docs.js

#### `generateCapabilityDocs()`

*Confidence: 65%*

**Depends on (direct):**
- `generateCapabilityMatrix()`
- `split()`
- `toISOString()`
- `forEach()`
- `entries()`
- `join()`
- `map()`
- `toUpperCase()`
- `charAt()`
- `slice()`
- `require()`
- `dirname()`
- `mkdir()`
- `writeFile()`
- `log()`

### generate-comparison.js

#### `formatSupportLevel()`

*Confidence: 95%*

**Called by (direct):**
- `generateComparison()`

### generate-matrix.js

#### `transformCapabilityToJSON()`

*Confidence: 95%*

*Isolated function (no dependencies or callers)*

#### `generateMatrixData()`

*Confidence: 50%*

**Depends on (direct):**
- `join()`
- `require()`
- `entries()`
- `push()`
- `addMetadata()`
- `writeFile()`
- `stringify()`
- `log()`
- `error()`

### generator.js

#### `generateAgent()`

*Confidence: 50%*

**Depends on (direct):**
- `require()`
- `cwd()`
- `isAbsolute()`
- `resolve()`
- `existsSync()`
- `readFileSync()`
- `buildContext()`
- `render()`
- `parseSpecString()`
- `dump()`
- `validate()`
- `map()`
- `filter()`
- `split()`
- `trim()`
- `isArray()`
- `validateToolList()`
- `forEach()`
- `match()`
- `push()`
- `mapTools()`
- `transformFields()`
- `addPlatformMetadata()`
- `String()`
- `validateSpec()`
- `serializeFrontmatter()`
- `checkPromptLength()`

**Called by (direct):**
- `oldInstallationLogic()`
- `generateAgentsFromSpecs()`
- `generateSkillsFromSpecs()`

#### `generateFromSpec()`

*Confidence: 70%*

**Depends on (direct):**
- `dump()`
- `validate()`
- `map()`
- `buildContext()`
- `cwd()`
- `isArray()`
- `validateToolList()`
- `forEach()`
- `match()`
- `log()`
- `push()`
- `mapTools()`
- `render()`
- `load()`
- `transformFields()`
- `addPlatformMetadata()`
- `String()`
- `serializeFrontmatter()`
- `validateSpec()`
- `checkPromptLength()`

#### `generateFromTemplate()`

*Confidence: 95%*

**Depends on (direct):**
- `buildContext()`
- `render()`

**Called by (direct):**
- `oldInstallationLogic()`
- `install()`
- `installCopilot()`
- `installCodex()`

#### `serializeFrontmatter()`

*Confidence: 70%*

**Depends on (direct):**
- `parse()`
- `stringify()`
- `isArray()`
- `join()`
- `dump()`
- `entries()`
- `includes()`
- `test()`

**Called by (direct):**
- `generateAgent()`
- `generateFromSpec()`

### install.js

#### `copyCopilotAgents()`

*Confidence: 70%*

**Depends on (direct):**
- `join()`
- `existsSync()`
- `mkdirSync()`
- `readdirSync()`
- `startsWith()`
- `endsWith()`
- `unlinkSync()`
- `generateAgentsFromSpecs()`
- `replace()`
- `renameSync()`
- `isFile()`
- `readFileSync()`
- `parseFrontMatter()`
- `getFrontMatterValue()`
- `trimStart()`
- `replaceClaudePaths()`
- `yamlEscape()`
- `writeFileSync()`

**Called by (direct):**
- `oldInstallationLogic()`
- `installCopilot()`

#### `generateAgentsFromSpecs()`

*Confidence: 70%*

**Depends on (direct):**
- `mkdirSync()`
- `filter()`
- `readdirSync()`
- `endsWith()`
- `join()`
- `generateAgent()`
- `writeFileSync()`
- `forEach()`
- `log()`
- `map()`
- `push()`
- `error()`

**Called by (direct):**
- `oldInstallationLogic()`
- `copyCopilotAgents()`
- `install()`
- `installCodex()`

#### `generateSkillsFromSpecs()`

*Confidence: 70%*

**Depends on (direct):**
- `mkdirSync()`
- `filter()`
- `readdirSync()`
- `join()`
- `isDirectory()`
- `statSync()`
- `startsWith()`
- `existsSync()`
- `log()`
- `generateAgent()`
- `writeFileSync()`
- `forEach()`
- `map()`
- `push()`
- `error()`

**Called by (direct):**
- `oldInstallationLogic()`
- `install()`
- `installCopilot()`
- `installCodex()`

#### `parseConfigDirArg()`

*Confidence: 85%*

**Depends on (direct):**
- `findIndex()`
- `startsWith()`
- `error()`
- `exit()`
- `find()`
- `split()`

#### `install()`

*Confidence: 50%*

**Depends on (direct):**
- `join()`
- `getTargetDirs()`
- `getConfigPaths()`
- `replace()`
- `homedir()`
- `cwd()`
- `log()`
- `preserveUserData()`
- `cleanupOrphanedFiles()`
- `mkdirSync()`
- `existsSync()`
- `copyWithPathReplacement()`
- `readdirSync()`
- `push()`
- `startsWith()`
- `endsWith()`
- `unlinkSync()`
- `generateAgentsFromSpecs()`
- `generateSkillsFromSpecs()`
- `forEach()`
- `filter()`
- `isDirectory()`
- `statSync()`
- `toFixed()`
- `isFile()`
- `readFileSync()`
- `convertContent()`
- `writeFileSync()`
- `verifyInstalled()`
- `require()`
- `generateFromTemplate()`
- `verifyFileInstalled()`
- `copyFileSync()`
- `verify()`
- `error()`
- `exit()`
- `cleanupOrphanedHooks()`
- `readSettings()`
- `some()`
- `includes()`
- `keys()`
- `restoreUserData()`

**Called by (direct):**
- `oldInstallationLogic()`
- `installAll()`
- `promptLocation()`

#### `installAll()`

*Confidence: 70%*

**Depends on (direct):**
- `detectInstalledCLIs()`
- `map()`
- `filter()`
- `entries()`
- `log()`
- `exit()`
- `install()`
- `finishInstall()`
- `getTargetDirs()`
- `verify()`
- `readdirSync()`
- `endsWith()`
- `push()`
- `error()`
- `cwd()`
- `installCopilot()`
- `installCodex()`
- `isDirectory()`
- `statSync()`
- `join()`
- `forEach()`

**Called by (direct):**
- `oldInstallationLogic()`

#### `installCodex()`

*Confidence: 50%*

**Depends on (direct):**
- `join()`
- `getTargetDirs()`
- `getConfigPaths()`
- `replace()`
- `homedir()`
- `cwd()`
- `log()`
- `preserveUserData()`
- `mkdirSync()`
- `existsSync()`
- `copyWithPathReplacement()`
- `readdirSync()`
- `push()`
- `readFileSync()`
- `require()`
- `generateFromTemplate()`
- `writeFileSync()`
- `copyFileSync()`
- `verifyFileInstalled()`
- `generateAgentsFromSpecs()`
- `filter()`
- `endsWith()`
- `convertContent()`
- `rmSync()`
- `verifyInstalled()`
- `generateSkillsFromSpecs()`
- `startsWith()`
- `isDirectory()`
- `statSync()`
- `forEach()`
- `toFixed()`
- `verify()`
- `error()`
- `exit()`
- `keys()`
- `restoreUserData()`

**Called by (direct):**
- `oldInstallationLogic()`
- `installAll()`
- `promptLocation()`

#### `installCopilot()`

*Confidence: 50%*

**Depends on (direct):**
- `join()`
- `getTargetDirs()`
- `log()`
- `preserveUserData()`
- `mkdirSync()`
- `existsSync()`
- `copyWithPathReplacement()`
- `readdirSync()`
- `push()`
- `readFileSync()`
- `require()`
- `generateFromTemplate()`
- `writeFileSync()`
- `verifyFileInstalled()`
- `copyFileSync()`
- `copyCopilotAgents()`
- `verifyInstalled()`
- `generateSkillsFromSpecs()`
- `filter()`
- `startsWith()`
- `isDirectory()`
- `statSync()`
- `forEach()`
- `toFixed()`
- `installIssueTemplates()`
- `verify()`
- `endsWith()`
- `error()`
- `exit()`
- `keys()`
- `restoreUserData()`

**Called by (direct):**
- `oldInstallationLogic()`
- `installAll()`
- `promptLocation()`

#### `oldInstallationLogic()`

*Confidence: 50%*

**Depends on (direct):**
- `runMigration()`
- `error()`
- `exit()`
- `log()`
- `installAll()`
- `detectInstalledCLIs()`
- `map()`
- `filter()`
- `entries()`
- `getRecommendations()`
- `platform()`
- `join()`
- `startsWith()`
- `homedir()`
- `slice()`
- `existsSync()`
- `parse()`
- `readFileSync()`
- `writeFileSync()`
- `stringify()`
- `rmSync()`
- `mkdirSync()`
- `readdirSync()`
- `match()`
- `isDirectory()`
- `copyWithPathReplacement()`
- `endsWith()`
- `buildContext()`
- `render()`
- `convertContent()`
- `copyFileSync()`
- `generateAgent()`
- `forEach()`
- `push()`
- `statSync()`
- `unlinkSync()`
- `keys()`
- `isArray()`
- `some()`
- `includes()`
- `isFile()`
- `replace()`
- `String()`
- `trim()`
- `generateAgentsFromSpecs()`
- `renameSync()`
- `parseFrontMatter()`
- `getFrontMatterValue()`
- `trimStart()`
- `replaceClaudePaths()`
- `yamlEscape()`
- `getTargetDirs()`
- `getConfigPaths()`
- `cwd()`
- `preserveUserData()`
- `cleanupOrphanedFiles()`
- `generateSkillsFromSpecs()`
- `toFixed()`
- `verifyInstalled()`
- `require()`
- `generateFromTemplate()`
- `verifyFileInstalled()`
- `verify()`
- `cleanupOrphanedHooks()`
- `readSettings()`
- `restoreUserData()`
- `copyCopilotAgents()`
- `installIssueTemplates()`
- `writeSettings()`
- `install()`
- `finishInstall()`
- `installCopilot()`
- `installCodex()`
- `callback()`
- `createInterface()`
- `question()`
- `close()`
- `handleStatusline()`
- `on()`
- `expandTilde()`
- `promptLocation()`

#### `promptLocation()`

*Confidence: 70%*

**Depends on (direct):**
- `log()`
- `install()`
- `handleStatusline()`
- `finishInstall()`
- `createInterface()`
- `on()`
- `close()`
- `exit()`
- `expandTilde()`
- `join()`
- `homedir()`
- `replace()`
- `question()`
- `trim()`
- `installCopilot()`
- `cwd()`
- `installCodex()`

**Called by (direct):**
- `oldInstallationLogic()`

### interactive-menu.js

#### `showInteractiveMenu()`

*Confidence: 85%*

**Depends on (direct):**
- `push()`
- `prompts()`
- `log()`
- `exit()`
- `includes()`

**Called by (direct):**
- `main()`

### migrate-agents.js

#### `generateMigrationReport()`

*Confidence: 80%*

**Depends on (direct):**
- `push()`
- `forEach()`
- `join()`

#### `validateMigration()`

*Confidence: 85%*

**Depends on (direct):**
- `existsSync()`
- `push()`
- `filter()`
- `readdirSync()`
- `endsWith()`
- `join()`
- `readFileSync()`
- `includes()`
- `startsWith()`

#### `migrateAllAgents()`

*Confidence: 70%*

**Depends on (direct):**
- `existsSync()`
- `push()`
- `mkdirSync()`
- `sort()`
- `filter()`
- `readdirSync()`
- `endsWith()`
- `join()`
- `convertAgentToSpec()`
- `log()`
- `writeFileSync()`
- `forEach()`

### migration-flow.js

#### `runMigration()`

*Confidence: 75%*

**Depends on (direct):**
- `log()`
- `detectAllPlatforms()`
- `confirmMigration()`
- `createBackup()`
- `push()`
- `replace()`
- `cwd()`
- `addToGitignore()`
- `createProgressBar()`
- `start()`
- `remove()`
- `update()`
- `stop()`
- `map()`
- `reduce()`

**Called by (direct):**
- `main()`
- `oldInstallationLogic()`

### migration-prompts.js

#### `confirmMigration()`

*Confidence: 85%*

**Depends on (direct):**
- `log()`
- `forEach()`
- `split()`
- `toISOString()`
- `prompts()`

**Called by (direct):**
- `runMigration()`

### old-flag-detector.js

#### `detectAndFilterOldFlags()`

*Confidence: 85%*

**Depends on (direct):**
- `some()`
- `includes()`
- `filter()`
- `warn()`
- `join()`

**Called by (direct):**
- `main()`

### orchestration-test-suite.js

#### `generateReport()`

*Confidence: 70%*

**Depends on (direct):**
- `toISOString()`
- `round()`
- `join()`
- `map()`
- `split()`
- `toUpperCase()`
- `charAt()`
- `slice()`
- `filter()`
- `includes()`

**Called by (direct):**
- `runOrchestrationValidation()`

#### `testStructuredReturn()`

*Confidence: 75%*

**Depends on (direct):**
- `trim()`
- `toUpperCase()`
- `replace()`
- `join()`
- `map()`
- `parseStructuredReturn()`
- `every()`
- `includes()`
- `filter()`

**Called by (direct):**
- `runOrchestrationValidation()`

#### `runOrchestrationValidation()`

*Confidence: 60%*

**Depends on (direct):**
- `log()`
- `existsSync()`
- `warn()`
- `parse()`
- `readFileSync()`
- `basename()`
- `now()`
- `testStructuredReturn()`
- `testParallelSpawn()`
- `testSequentialSpawn()`
- `testReferenceResolution()`
- `push()`
- `error()`
- `generateReport()`
- `dirname()`
- `mkdirSync()`
- `writeFileSync()`
- `round()`

### parallel-spawn-validator.js

#### `measureExecutionTime()`

*Confidence: 95%*

**Depends on (direct):**
- `now()`
- `fn()`

#### `validateParallelSpawning()`

*Confidence: 70%*

**Depends on (direct):**
- `now()`
- `executorFn()`
- `filter()`
- `includes()`
- `join()`
- `toFixed()`
- `trim()`

**Called by (direct):**
- `testParallelSpawn()`

### path-rewriter.js

#### `replaceClaudePaths()`

*Confidence: 85%*

**Depends on (direct):**
- `replace()`
- `endsWith()`
- `slice()`
- `includes()`

**Called by (direct):**
- `oldInstallationLogic()`
- `copyCopilotAgents()`
- `convertContent()`
- `convertContent()`

### path-validator.js

#### `isWSL()`

*Confidence: 85%*

**Depends on (direct):**
- `toLowerCase()`
- `readFileSync()`
- `includes()`
- `statSync()`

**Called by (direct):**
- `getEffectivePlatform()`

#### `validatePath()`

*Confidence: 70%*

**Depends on (direct):**
- `getEffectivePlatform()`
- `push()`
- `test()`
- `match()`
- `join()`
- `slice()`
- `split()`

**Called by (direct):**
- `main()`
- `validateAndPrepareInstall()`

### paths.js

#### `getConfigPaths()`

*Confidence: 85%*

**Depends on (direct):**
- `homedir()`
- `cwd()`
- `join()`
- `resolve()`

**Called by (direct):**
- `main()`
- `validateAndPrepareInstall()`
- `oldInstallationLogic()`
- `install()`
- `installCodex()`
- `detectInstalledCLIs()`
- `getTargetDirs()`
- `getTargetDirs()`
- `getTargetDirs()`
- `buildContext()`

### recommender.js

#### `getRecommendations()`

*Confidence: 70%*

**Depends on (direct):**
- `platform()`
- `entries()`
- `includes()`
- `push()`
- `split()`
- `join()`
- `map()`

**Called by (direct):**
- `oldInstallationLogic()`
- `analyzeSystem()`

#### `analyzeSystem()`

*Confidence: 85%*

**Depends on (direct):**
- `platform()`
- `arch()`
- `homedir()`
- `getRecommendations()`

### reference-resolver.js

#### `validateReferences()`

*Confidence: 85%*

**Depends on (direct):**
- `push()`
- `exec()`
- `startsWith()`
- `substring()`
- `join()`
- `replace()`
- `existsSync()`

**Called by (direct):**
- `testReferenceResolution()`
- `validateAndInterpolate()`

### relationships.js

#### `extractDependencies()`

*Confidence: 70%*

**Depends on (direct):**
- `push()`
- `isArray()`
- `forEach()`
- `visit()`

#### `buildCalledByMap()`

*Confidence: 85%*

**Depends on (direct):**
- `forEach()`
- `set()`
- `has()`
- `push()`
- `get()`

### reporter.js

#### `getBoxen()`

*Confidence: 75%*

**Depends on (direct):**
- `require()`

**Called by (direct):**
- `warnAndConfirmCodexLocal()`

### sequential-spawn-validator.js

#### `validateSequentialSpawning()`

*Confidence: 95%*

**Depends on (direct):**
- `push()`

**Called by (direct):**
- `testSequentialSpawn()`

### side-effects.js

#### `detectIOSideEffects()`

*Confidence: 70%*

**Depends on (direct):**
- `push()`
- `includes()`
- `isArray()`
- `forEach()`
- `visit()`

#### `visit()`

*Confidence: 70%*

**Depends on (direct):**
- `push()`
- `includes()`
- `isArray()`
- `forEach()`
- `visit()`

**Called by (direct):**
- `extractFunctions()`
- `visit()`
- `calculateComplexity()`
- `visit()`
- `extractDependencies()`
- `visit()`
- `detectIOSideEffects()`
- `visit()`

### spec-parser.js

#### `loadSharedFrontmatter()`

*Confidence: 85%*

**Depends on (direct):**
- `dirname()`
- `join()`
- `existsSync()`
- `readFileSync()`
- `load()`
- `warn()`

**Called by (direct):**
- `parseSpec()`

### structured-return-parser.js

#### `parseStructuredReturn()`

*Confidence: 85%*

**Depends on (direct):**
- `match()`
- `substring()`
- `search()`
- `trim()`

**Called by (direct):**
- `testStructuredReturn()`
- `hasStructuredReturn()`

### tool-mapper.js

#### `mapTools()`

*Confidence: 70%*

**Depends on (direct):**
- `isArray()`
- `filter()`
- `map()`
- `startsWith()`
- `includes()`
- `warn()`

**Called by (direct):**
- `generateAgent()`
- `generateFromSpec()`

#### `getToolCompatibility()`

*Confidence: 95%*

**Depends on (direct):**
- `includes()`

#### `validateToolList()`

*Confidence: 70%*

**Depends on (direct):**
- `isArray()`
- `forEach()`
- `startsWith()`
- `includes()`
- `push()`
- `toLowerCase()`

**Called by (direct):**
- `generateAgent()`
- `generateFromSpec()`

### upgrade.js

#### `preserveUserData()`

*Confidence: 85%*

**Depends on (direct):**
- `now()`
- `join()`
- `existsSync()`
- `renameSync()`
- `error()`

**Called by (direct):**
- `oldInstallationLogic()`
- `install()`
- `installCopilot()`
- `installCodex()`

### validate-planning-dir.js

#### `main()`

*Confidence: 60%*

**Depends on (direct):**
- `log()`
- `repeat()`
- `validateStructure()`
- `forEach()`
- `validateJSON()`
- `readdir()`
- `startsWith()`
- `stat()`
- `isDirectory()`
- `validateAgentOutput()`
- `exit()`

### validators.js

#### `validateClaudeSpec()`

*Confidence: 70%*

**Depends on (direct):**
- `trim()`
- `push()`
- `map()`
- `split()`
- `isArray()`
- `some()`
- `forEach()`
- `startsWith()`
- `includes()`
- `find()`
- `keys()`
- `toLowerCase()`
- `join()`

**Called by (direct):**
- `validateSpec()`

#### `validateCodexSpec()`

*Confidence: 70%*

**Depends on (direct):**
- `trim()`
- `push()`
- `map()`
- `split()`
- `isArray()`
- `forEach()`
- `startsWith()`
- `includes()`
- `find()`
- `keys()`
- `toLowerCase()`

**Called by (direct):**
- `validateSpec()`

#### `validateCopilotSpec()`

*Confidence: 70%*

**Depends on (direct):**
- `trim()`
- `push()`
- `isArray()`
- `includes()`
- `forEach()`
- `keys()`

**Called by (direct):**
- `validateSpec()`

#### `validateSpec()`

*Confidence: 95%*

**Depends on (direct):**
- `validateClaudeSpec()`
- `validateCopilotSpec()`
- `validateCodexSpec()`

**Called by (direct):**
- `generateAgent()`
- `generateFromSpec()`
