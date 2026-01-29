# Function Usage Audit Report

**Generated:** 2026-01-29T15:51:28.773Z

**Analysis Scope:**
- Functions analyzed: `bin/**/*.js`
- Usage searched in: Entire project

## Summary

| Category | Count | Percentage |
|----------|-------|------------|
| **Total Functions** | 205 | 100% |
| Unused (0 calls) | 15 | 7.3% |
| Low Usage (1-5 calls) | 124 | 60.5% |
| Potential Inline (1 call) | 55 | 26.8% |
| Normal Usage (>5 calls) | 66 | 32.2% |

---

## ❌ Unused Functions (15)

Functions that are **not called anywhere** in the codebase.

| Function Name | Type | File | Line | Exported |
|---------------|------|------|------|----------|
| `completeProgress` | function | `bin/lib/cli/progress.js` | 44 | ✅ |
| `createProgressBar` | function | `bin/lib/cli/progress.js` | 27 | ✅ |
| `getAvailableSpace` | function | `bin/lib/io/file-operations.js` | 123 | ✅ |
| `getFieldDefinitions` | function | `bin/lib/manifests/schema.js` | 176 | ✅ |
| `getHomeDirectory` | function | `bin/lib/io/file-operations.js` | 138 | ✅ |
| `getInstalledPlatforms` | function | `bin/lib/platforms/detector.js` | 43 | ✅ |
| `getInstalledVersion` | function | `bin/lib/platforms/detector.js` | 61 | ✅ |
| `getRecommendedPlatforms` | function | `bin/lib/platforms/binary-detector.js` | 42 | ✅ |
| `header` | function | `bin/lib/cli/logger.js` | 143 | ✅ |
| `sectionTitle` | function | `bin/lib/cli/logger.js` | 238 | ✅ |
| `showCheckUpdatesSummary` | function | `bin/lib/updater/update-messages.js` | 85 | ✅ |
| `showUpdateAvailableMessage` | function | `bin/lib/updater/update-messages.js` | 68 | ✅ |
| `simpleTitle` | function | `bin/lib/cli/logger.js` | 248 | ✅ |
| `stopAllProgress` | function | `bin/lib/cli/progress.js` | 52 | ✅ |
| `updateProgress` | function | `bin/lib/cli/progress.js` | 36 | ✅ |

---

## ⚠️ Low Usage Functions (124)

Functions called **1-5 times**. Consider if they're truly needed.

| Function Name | Type | File | Line | Calls | Call Locations |
|---------------|------|------|------|-------|----------------|
| `showTemplatePath` | function | `bin/lib/cli/banner-manager.js` | 34 | **1** | `bin/install.js:112` |
| `parsePlatformFlags` | function | `bin/lib/cli/flag-parser.js` | 14 | **1** | `bin/install.js:78` |
| `parseScope` | function | `bin/lib/cli/flag-parser.js` | 54 | **1** | `bin/install.js:134` |
| `installPlatforms` | function | `bin/lib/cli/installation-core.js` | 28 | **1** | `bin/lib/cli/install-loop.js:51` |
| `getScriptDir` | function | `bin/lib/cli/installation-core.js` | 126 | **1** | `bin/lib/cli/interactive.js:40` |
| `runInteractive` | function | `bin/lib/cli/interactive.js` | 20 | **1** | `bin/install.js:119` |
| `showGlobalDetectionWarning` | function | `bin/lib/cli/interactive.js` | 65 | **1** | `bin/lib/cli/interactive.js:33` |
| `promptSelections` | function | `bin/lib/cli/interactive.js` | 139 | **1** | `bin/lib/cli/interactive.js:37` |
| `errorSubtitle` | function | `bin/lib/cli/logger.js` | 304 | **1** | `bin/lib/errors/directory-error.js:5` |
| `infoSubtitle` | function | `bin/lib/cli/logger.js` | 326 | **1** | `bin/lib/installer/orchestrator.js:144` |
| `shouldUseInteractiveMode` | function | `bin/lib/cli/mode-detector.js` | 11 | **1** | `bin/install.js:115` |
| `showNextSteps` | function | `bin/lib/cli/next-steps.js` | 17 | **1** | `bin/install.js:142` |
| `createMultiBar` | function | `bin/lib/cli/progress.js` | 10 | **1** | `bin/lib/cli/installation-core.js:38` |
| `showUsageError` | function | `bin/lib/cli/usage.js` | 10 | **1** | `bin/install.js:129` |
| `multipleDirectoryErrors` | function | `bin/lib/errors/directory-error.js` | 4 | **1** | `bin/install.js:73` |
| `missingTemplates` | function | `bin/lib/errors/install-error.js` | 37 | **1** | `bin/lib/preflight/pre-flight-validator.js:139` |
| `processDirectoryRecursively` | function | `bin/lib/installer/install-shared.js` | 43 | **1** | `bin/lib/installer/install-shared.js:21` |
| `checkSymlinkAndConfirm` | function | `bin/lib/installer/orchestrator.js` | 203 | **1** | `bin/lib/installer/orchestrator.js:70` |
| `validateVersionBeforeInstall` | function | `bin/lib/installer/orchestrator.js` | 243 | **1** | `bin/lib/installer/orchestrator.js:101` |
| `collectInstalledFiles` | function | `bin/lib/manifests/writer.js` | 53 | **1** | `bin/lib/manifests/writer.js:19` |
| `promptMigration` | function | `bin/lib/migration/migration-manager.js` | 19 | **1** | `bin/lib/migration/migration-manager.js:100` |
| `showBackupSuccess` | function | `bin/lib/migration/migration-manager.js` | 50 | **1** | `bin/lib/migration/migration-manager.js:111` |
| `checkAndMigrateOldVersions` | function | `bin/lib/migration/migration-orchestrator.js` | 20 | **1** | `bin/install.js:98` |
| `joinPaths` | function | `bin/lib/paths/path-resolver.js` | 62 | **1** | `tests/unit/path-resolver.test.js:48` |
| `extractSkillReferences` | method | `bin/lib/platforms/claude-adapter.js` | 93 | **1** | `bin/lib/platforms/claude-adapter.js:73` |
| `isGSDInstalled` | function | `bin/lib/platforms/detector.js` | 34 | **1** | `bin/lib/platforms/detector.js:18` |
| `getCliName` | function | `bin/lib/platforms/platform-names.js` | 27 | **1** | `bin/lib/cli/next-steps.js:24` |
| `getInstallPath` | function | `bin/lib/platforms/platform-paths.js` | 42 | **1** | `bin/lib/platforms/platform-paths.js:55` |
| `getAllGlobalPaths` | function | `bin/lib/platforms/platform-paths.js` | 62 | **1** | `bin/lib/version/installation-finder.js:59` |
| `getAllLocalPaths` | function | `bin/lib/platforms/platform-paths.js` | 72 | **1** | `bin/lib/version/installation-finder.js:61` |
| `groupErrorsByCategory` | function | `bin/lib/preflight/error-formatter.js` | 51 | **1** | `bin/lib/preflight/error-formatter.js:26` |
| `getGenericFix` | function | `bin/lib/preflight/error-formatter.js` | 138 | **1** | `bin/lib/preflight/error-formatter.js:126` |
| `validateBeforeInstall` | function | `bin/lib/preflight/pre-flight-validator.js` | 40 | **1** | `bin/lib/cli/install-loop.js:25` |
| `calculateTemplateSize` | function | `bin/lib/preflight/pre-flight-validator.js` | 283 | **1** | `bin/lib/preflight/pre-flight-validator.js:79` |
| `collectTemplatePaths` | function | `bin/lib/preflight/pre-flight-validator.js` | 332 | **1** | `bin/lib/preflight/pre-flight-validator.js:171` |
| `cleanFrontmatter` | function | `bin/lib/rendering/frontmatter-cleaner.js` | 12 | **1** | `bin/lib/installer/install-skills.js:76` |
| `formatArray` | function | `bin/lib/rendering/frontmatter-serializer.js` | 78 | **1** | `bin/lib/rendering/frontmatter-serializer.js:57` |
| `formatObject` | function | `bin/lib/rendering/frontmatter-serializer.js` | 101 | **1** | `bin/lib/rendering/frontmatter-serializer.js:59` |
| `formatScalar` | function | `bin/lib/rendering/frontmatter-serializer.js` | 134 | **1** | `bin/lib/rendering/frontmatter-serializer.js:61` |
| `checkCustomPath` | function | `bin/lib/updater/check-custom-path.js` | 17 | **1** | `bin/lib/updater/check-update.js:37` |
| `checkGlobalInstallations` | function | `bin/lib/updater/check-global.js` | 15 | **1** | `bin/lib/updater/check-update.js:42` |
| `checkLocalInstallations` | function | `bin/lib/updater/check-local.js` | 15 | **1** | `bin/lib/updater/check-update.js:44` |
| `handleCheckUpdates` | function | `bin/lib/updater/check-update.js` | 17 | **1** | `bin/install.js:90` |
| `formatStatusLine` | function | `bin/lib/updater/format-status.js` | 12 | **1** | `bin/lib/updater/check-custom-path.js:50` |
| `showOldVersionMessage` | function | `bin/lib/updater/update-messages.js` | 10 | **1** | `bin/lib/updater/check-update.js:29` |
| `showNoInstallationMessage` | function | `bin/lib/updater/update-messages.js` | 38 | **1** | `bin/lib/updater/check-custom-path.js:39` |
| `logInstallationError` | function | `bin/lib/validation/error-logger.js` | 33 | **1** | `bin/lib/cli/installation-core.js:75` |
| `formatErrorLog` | function | `bin/lib/validation/error-logger.js` | 49 | **1** | `bin/lib/validation/error-logger.js:35` |
| `formatRuntimeError` | function | `bin/lib/validation/error-logger.js` | 138 | **1** | `bin/lib/cli/installation-core.js:89` |
| `getManifestPaths` | function | `bin/lib/version/installation-finder.js` | 52 | **1** | `bin/lib/version/installation-finder.js:8` |
| `deriveScope` | function | `bin/lib/version/installation-finder.js` | 65 | **1** | `bin/lib/version/installation-finder.js:43` |
| `readOldVersion` | function | `bin/lib/version/old-version-detector.js` | 76 | **1** | `bin/lib/version/old-version-detector.js:58` |
| `getPlatformDisplayName` | function | `bin/lib/version/version-checker.js` | 85 | **1** | `bin/lib/version/version-checker.js:64` |
| `findVersionFiles` | function | `bin/lib/version/version-detector.js` | 75 | **1** | `bin/lib/version/version-detector.js:26` |
| `extractVersion` | function | `bin/lib/version/version-detector.js` | 140 | **1** | `bin/lib/version/version-detector.js:40` |
| `executeInstallationLoop` | function | `bin/lib/cli/install-loop.js` | 20 | **2** | `bin/install.js:135`<br>`bin/lib/cli/interactive.js:48` |
| `discoverInstallationsWithStatus` | function | `bin/lib/cli/interactive.js` | 98 | **2** | `bin/lib/cli/interactive.js:145`<br>`bin/lib/cli/interactive.js:186` |
| `summary` | function | `bin/lib/cli/logger.js` | 226 | **2** | `node_modules/commander/lib/command.js:2234`<br>`node_modules/commander/lib/help.js:315` |
| `isValidTTY` | function | `bin/lib/cli/mode-detector.js` | 19 | **2** | `bin/install.js:115`<br>`bin/install.js:128` |
| `invalidArgs` | function | `bin/lib/errors/install-error.js` | 33 | **2** | `bin/lib/paths/path-resolver.js:33`<br>`bin/lib/paths/path-resolver.js:41` |
| `installAgents` | function | `bin/lib/installer/install-agents.js` | 10 | **2** | `bin/lib/installer/orchestrator.js:164`<br>`bin/lib/installer/orchestrator.js:181` |
| `installShared` | function | `bin/lib/installer/install-shared.js` | 11 | **2** | `bin/lib/installer/orchestrator.js:168`<br>`bin/lib/installer/orchestrator.js:185` |
| `installSkills` | function | `bin/lib/installer/install-skills.js` | 11 | **2** | `bin/lib/installer/orchestrator.js:160`<br>`bin/lib/installer/orchestrator.js:177` |
| `processTemplateFile` | function | `bin/lib/installer/install-skills.js` | 63 | **2** | `bin/lib/installer/install-skills.js:37`<br>`bin/lib/installer/install-skills.js:51` |
| `validateManifest` | function | `bin/lib/manifests/schema.js` | 144 | **2** | `bin/lib/manifests/reader.js:27`<br>`bin/lib/manifests/schema.js:139` |
| `walkDirectory` | function | `bin/lib/manifests/writer.js` | 56 | **2** | `bin/lib/manifests/writer.js:64`<br>`bin/lib/manifests/writer.js:71` |
| `resolveTargetDirectory` | function | `bin/lib/paths/path-resolver.js` | 13 | **2** | `tests/unit/path-resolver.test.js:11`<br>`tests/unit/path-resolver.test.js:16` |
| `getTemplatesDirectory` | function | `bin/lib/paths/path-resolver.js` | 71 | **2** | `bin/lib/cli/banner-manager.js:38`<br>`bin/lib/installer/orchestrator.js:67` |
| `commandExists` | function | `bin/lib/platforms/binary-detector.js` | 13 | **2** | `bin/lib/platforms/binary-detector.js:32`<br>`bin/lib/platforms/binary-detector.js:34` |
| `detectBinaries` | function | `bin/lib/platforms/binary-detector.js` | 30 | **2** | `bin/lib/cli/interactive.js:28`<br>`bin/lib/platforms/binary-detector.js:43` |
| `detectInstallations` | function | `bin/lib/platforms/detector.js` | 9 | **2** | `bin/lib/platforms/detector.js:44`<br>`bin/lib/platforms/detector.js:62` |
| `derivePlatformFromPath` | function | `bin/lib/platforms/platform-paths.js` | 93 | **2** | `bin/lib/manifests/repair.js:22`<br>`bin/lib/version/installation-finder.js:44` |
| `_initialize` | method | `bin/lib/platforms/registry.js` | 19 | **2** | `bin/lib/platforms/registry.js:12`<br>`node_modules/vitest/dist/chunks/coverage.AVPTjMgw.js:2876` |
| `formatPreflightReport` | function | `bin/lib/preflight/error-formatter.js` | 17 | **2** | `bin/lib/preflight/pre-flight-validator.js:61`<br>`bin/lib/preflight/pre-flight-validator.js:239` |
| `collectPathsRecursive` | function | `bin/lib/preflight/pre-flight-validator.js` | 349 | **2** | `bin/lib/preflight/pre-flight-validator.js:339`<br>`bin/lib/preflight/pre-flight-validator.js:360` |
| `formatValidationError` | function | `bin/lib/validation/error-logger.js` | 92 | **2** | `bin/lib/cli/installation-core.js:86`<br>`bin/lib/validation/error-logger.js:11` |
| `checkDiskSpace` | function | `bin/lib/validation/pre-install-checks.js` | 52 | **2** | `bin/lib/validation/pre-install-checks.js:36`<br>`tests/validation/pre-install-checks.test.js:30` |
| `indentMultiline` | arrow | `bin/lib/cli/logger.js` | 26 | **3** | `bin/lib/cli/logger.js:37`<br>`bin/lib/cli/logger.js:44`<br>`bin/lib/cli/logger.js:50` |
| `displayCompletionLine` | function | `bin/lib/cli/progress.js` | 62 | **3** | `bin/lib/installer/orchestrator.js:161`<br>`bin/lib/installer/orchestrator.js:165`<br>`bin/lib/installer/orchestrator.js:169` |
| `insufficientSpace` | function | `bin/lib/errors/install-error.js` | 45 | **3** | `bin/lib/io/file-operations.js:29`<br>`bin/lib/migration/backup-manager.js:100`<br>`bin/lib/validation/pre-install-checks.js:67` |
| `validateBackupSpace` | function | `bin/lib/migration/backup-manager.js` | 78 | **3** | `bin/lib/migration/backup-manager.js:171`<br>`tests/unit/migration-manager.test.js:79`<br>`tests/unit/migration-manager.test.js:91` |
| `showBackupFailure` | function | `bin/lib/migration/migration-manager.js` | 63 | **3** | `bin/lib/migration/migration-manager.js:127`<br>`bin/lib/migration/migration-manager.js:133`<br>`bin/lib/migration/migration-manager.js:138` |
| `getSupportedPlatforms` | method | `bin/lib/platforms/registry.js` | 64 | **3** | `bin/lib/cli/flag-parser.js:25`<br>`bin/lib/cli/flag-parser.js:35`<br>`bin/lib/platforms/registry.js:45` |
| `determineRequiredTemplates` | function | `bin/lib/preflight/pre-flight-validator.js` | 263 | **3** | `bin/lib/preflight/pre-flight-validator.js:125`<br>`bin/lib/preflight/pre-flight-validator.js:284`<br>`bin/lib/preflight/pre-flight-validator.js:334` |
| `findUnknownVariables` | function | `bin/lib/rendering/template-renderer.js` | 43 | **3** | `bin/lib/installer/install-skills.js:67`<br>`tests/unit/template-renderer.test.js:54`<br>`tests/unit/template-renderer.test.js:62` |
| `validateInstallation` | function | `bin/lib/updater/validator.js` | 15 | **3** | `bin/lib/updater/check-custom-path.js:47`<br>`bin/lib/updater/check-global.js:35`<br>`bin/lib/updater/check-local.js:35` |
| `validateCustomPathWithPlatforms` | function | `bin/lib/validation/cli-validator.js` | 25 | **3** | `bin/install.js:82`<br>`bin/lib/validation/cli-validator.js:20`<br>`bin/lib/validation/cli-validator.js:23` |
| `main` | function | `bin/install.js` | 35 | **4** | `bin/install.js:146`<br>`node_modules/semver/bin/semver.js:191`<br>`scripts/audit-functions.js:374`<br>`scripts/audit-functions.js:408` |
| `banner` | function | `bin/lib/cli/banner-manager.js` | 12 | **4** | `bin/install.js:95`<br>`bin/lib/updater/check-update.js:21`<br>`node_modules/rollup/dist/es/shared/node-entry.js:17806`<br>`node_modules/rollup/dist/shared/rollup.js:19409` |
| `subtitle` | function | `bin/lib/cli/logger.js` | 262 | **4** | `bin/lib/cli/logger.js:305`<br>`bin/lib/cli/logger.js:316`<br>`bin/lib/cli/logger.js:327`<br>`bin/lib/cli/logger.js:337` |
| `warnSubtitle` | function | `bin/lib/cli/logger.js` | 315 | **4** | `bin/lib/installer/orchestrator.js:138`<br>`bin/lib/migration/migration-manager.js:22`<br>`bin/lib/migration/migration-orchestrator.js:38`<br>`bin/lib/updater/update-messages.js:12` |
| `permissionDenied` | function | `bin/lib/errors/install-error.js` | 41 | **4** | `bin/lib/io/file-operations.js:26`<br>`bin/lib/io/file-operations.js:45`<br>`bin/lib/io/file-operations.js:94`<br>`bin/lib/validation/pre-install-checks.js:109` |
| `copyDirectory` | function | `bin/lib/io/file-operations.js` | 16 | **4** | `bin/lib/installer/install-shared.js:18`<br>`bin/lib/installer/install-skills.js:33`<br>`bin/lib/installer/install-skills.js:48`<br>`bin/lib/migration/backup-manager.js:129` |
| `copyWithRetry` | function | `bin/lib/migration/backup-manager.js` | 124 | **4** | `bin/lib/migration/backup-manager.js:187`<br>`tests/unit/migration-manager.test.js:99`<br>`tests/unit/migration-manager.test.js:108`<br>`tests/unit/migration-manager.test.js:122` |
| `isSymlink` | function | `bin/lib/paths/symlink-resolver.js` | 85 | **4** | `bin/lib/installer/orchestrator.js:204`<br>`tests/unit/symlink-resolver.test.js:107`<br>`tests/unit/symlink-resolver.test.js:117`<br>`tests/unit/symlink-resolver.test.js:123` |
| `getPlatformDir` | function | `bin/lib/platforms/platform-paths.js` | 28 | **4** | `bin/lib/platforms/claude-adapter.js:32`<br>`bin/lib/platforms/codex-adapter.js:51`<br>`bin/lib/platforms/copilot-adapter.js:44`<br>`bin/lib/platforms/platform-paths.js:43` |
| `renderTemplate` | function | `bin/lib/rendering/template-renderer.js` | 16 | **4** | `tests/unit/template-renderer.test.js:9`<br>`tests/unit/template-renderer.test.js:14`<br>`tests/unit/template-renderer.test.js:22`<br>`tests/unit/template-renderer.test.js:30` |
| `validateAllPaths` | function | `bin/lib/validation/path-validator.js` | 156 | **4** | `bin/lib/preflight/pre-flight-validator.js:175`<br>`bin/lib/validation/path-validator.js:16`<br>`bin/lib/validation/path-validator.js:32`<br>`tests/unit/path-validator.test.js:102` |
| `getVersionFromFile` | function | `bin/lib/version/version-detector.js` | 170 | **4** | `tests/version/version-detector.test.js:132`<br>`tests/version/version-detector.test.js:146`<br>`tests/version/version-detector.test.js:152`<br>`tests/version/version-detector.test.js:161` |
| `verboseComplete` | function | `bin/lib/cli/logger.js` | 134 | **5** | `bin/lib/installer/install-agents.js:43`<br>`bin/lib/installer/install-agents.js:55`<br>`bin/lib/installer/install-shared.js:23`<br>`bin/lib/installer/install-skills.js:40`<br>`bin/lib/installer/install-skills.js:54` |
| `isRepairableError` | function | `bin/lib/manifests/schema.js` | 84 | **5** | `bin/lib/cli/interactive.js:108`<br>`bin/lib/installer/orchestrator.js:251`<br>`bin/lib/manifests/schema.js:47`<br>`bin/lib/manifests/schema.js:80`<br>`bin/lib/updater/validator.js:19` |
| `createManifest` | function | `bin/lib/manifests/schema.js` | 110 | **5** | `bin/lib/manifests/repair.js:44`<br>`bin/lib/manifests/repair.js:49`<br>`bin/lib/manifests/schema.js:102`<br>`bin/lib/manifests/writer.js:22`<br>`bin/lib/manifests/writer.js:27` |
| `writeManifest` | function | `bin/lib/manifests/writer.js` | 37 | **5** | `bin/lib/installer/orchestrator.js:191`<br>`bin/lib/manifests/writer.js:9`<br>`tests/validation/manifest-generator.test.js:82`<br>`tests/validation/manifest-generator.test.js:102`<br>`tests/validation/manifest-generator.test.js:106` |
| `calculateDirectorySize` | function | `bin/lib/migration/backup-manager.js` | 18 | **5** | `bin/lib/migration/backup-manager.js:83`<br>`bin/lib/preflight/pre-flight-validator.js:290`<br>`bin/lib/preflight/pre-flight-validator.js:300`<br>`bin/lib/validation/pre-install-checks.js:33`<br>`bin/lib/validation/pre-install-checks.js:206` |
| `createBackup` | function | `bin/lib/migration/backup-manager.js` | 159 | **5** | `bin/lib/migration/migration-manager.js:107`<br>`tests/unit/migration-manager.test.js:129`<br>`tests/unit/migration-manager.test.js:142`<br>`tests/unit/migration-manager.test.js:159`<br>`tests/unit/migration-manager.test.js:174` |
| `getFileExtension` | method | `bin/lib/platforms/base-adapter.js` | 17 | **5** | `bin/lib/installer/install-agents.js:24`<br>`bin/lib/platforms/base-adapter.js:18`<br>`bin/lib/platforms/claude-adapter.js:22`<br>`bin/lib/platforms/codex-adapter.js:41`<br>`bin/lib/platforms/copilot-adapter.js:34` |
| `getCommandPrefix` | method | `bin/lib/platforms/base-adapter.js` | 34 | **5** | `bin/lib/installer/orchestrator.js:104`<br>`bin/lib/platforms/base-adapter.js:35`<br>`bin/lib/platforms/claude-adapter.js:40`<br>`bin/lib/platforms/codex-adapter.js:59`<br>`bin/lib/platforms/copilot-adapter.js:52` |
| `transformFrontmatter` | method | `bin/lib/platforms/base-adapter.js` | 52 | **5** | `bin/lib/installer/install-agents.js:38`<br>`bin/lib/platforms/base-adapter.js:53`<br>`bin/lib/platforms/claude-adapter.js:68`<br>`bin/lib/platforms/codex-adapter.js:93`<br>`bin/lib/platforms/copilot-adapter.js:84` |
| `getFileExtension` | method | `bin/lib/platforms/claude-adapter.js` | 22 | **5** | `bin/lib/installer/install-agents.js:24`<br>`bin/lib/platforms/base-adapter.js:17`<br>`bin/lib/platforms/base-adapter.js:18`<br>`bin/lib/platforms/codex-adapter.js:41`<br>`bin/lib/platforms/copilot-adapter.js:34` |
| `getCommandPrefix` | method | `bin/lib/platforms/claude-adapter.js` | 40 | **5** | `bin/lib/installer/orchestrator.js:104`<br>`bin/lib/platforms/base-adapter.js:34`<br>`bin/lib/platforms/base-adapter.js:35`<br>`bin/lib/platforms/codex-adapter.js:59`<br>`bin/lib/platforms/copilot-adapter.js:52` |
| `transformFrontmatter` | method | `bin/lib/platforms/claude-adapter.js` | 68 | **5** | `bin/lib/installer/install-agents.js:38`<br>`bin/lib/platforms/base-adapter.js:52`<br>`bin/lib/platforms/base-adapter.js:53`<br>`bin/lib/platforms/codex-adapter.js:93`<br>`bin/lib/platforms/copilot-adapter.js:84` |
| `getFileExtension` | method | `bin/lib/platforms/codex-adapter.js` | 41 | **5** | `bin/lib/installer/install-agents.js:24`<br>`bin/lib/platforms/base-adapter.js:17`<br>`bin/lib/platforms/base-adapter.js:18`<br>`bin/lib/platforms/claude-adapter.js:22`<br>`bin/lib/platforms/copilot-adapter.js:34` |
| `getCommandPrefix` | method | `bin/lib/platforms/codex-adapter.js` | 59 | **5** | `bin/lib/installer/orchestrator.js:104`<br>`bin/lib/platforms/base-adapter.js:34`<br>`bin/lib/platforms/base-adapter.js:35`<br>`bin/lib/platforms/claude-adapter.js:40`<br>`bin/lib/platforms/copilot-adapter.js:52` |
| `transformFrontmatter` | method | `bin/lib/platforms/codex-adapter.js` | 93 | **5** | `bin/lib/installer/install-agents.js:38`<br>`bin/lib/platforms/base-adapter.js:52`<br>`bin/lib/platforms/base-adapter.js:53`<br>`bin/lib/platforms/claude-adapter.js:68`<br>`bin/lib/platforms/copilot-adapter.js:84` |
| `getFileExtension` | method | `bin/lib/platforms/copilot-adapter.js` | 34 | **5** | `bin/lib/installer/install-agents.js:24`<br>`bin/lib/platforms/base-adapter.js:17`<br>`bin/lib/platforms/base-adapter.js:18`<br>`bin/lib/platforms/claude-adapter.js:22`<br>`bin/lib/platforms/codex-adapter.js:41` |
| `getCommandPrefix` | method | `bin/lib/platforms/copilot-adapter.js` | 52 | **5** | `bin/lib/installer/orchestrator.js:104`<br>`bin/lib/platforms/base-adapter.js:34`<br>`bin/lib/platforms/base-adapter.js:35`<br>`bin/lib/platforms/claude-adapter.js:40`<br>`bin/lib/platforms/codex-adapter.js:59` |
| `transformFrontmatter` | method | `bin/lib/platforms/copilot-adapter.js` | 84 | **5** | `bin/lib/installer/install-agents.js:38`<br>`bin/lib/platforms/base-adapter.js:52`<br>`bin/lib/platforms/base-adapter.js:53`<br>`bin/lib/platforms/claude-adapter.js:68`<br>`bin/lib/platforms/codex-adapter.js:93` |
| `getManifestPath` | function | `bin/lib/platforms/platform-paths.js` | 54 | **5** | `bin/lib/platforms/detector.js:35`<br>`bin/lib/platforms/platform-paths.js:64`<br>`bin/lib/platforms/platform-paths.js:74`<br>`bin/lib/updater/check-global.js:22`<br>`bin/lib/updater/check-local.js:22` |
| `calculateDirectorySize` | function | `bin/lib/preflight/pre-flight-validator.js` | 300 | **5** | `bin/lib/migration/backup-manager.js:18`<br>`bin/lib/migration/backup-manager.js:83`<br>`bin/lib/preflight/pre-flight-validator.js:290`<br>`bin/lib/validation/pre-install-checks.js:33`<br>`bin/lib/validation/pre-install-checks.js:206` |
| `replaceVariables` | function | `bin/lib/rendering/template-renderer.js` | 27 | **5** | `bin/lib/installer/install-agents.js:35`<br>`bin/lib/installer/install-agents.js:52`<br>`bin/lib/installer/install-shared.js:67`<br>`bin/lib/installer/install-skills.js:73`<br>`bin/lib/rendering/template-renderer.js:18` |
| `hasInstallationFiles` | function | `bin/lib/utils/file-scanner.js` | 47 | **5** | `tests/unit/file-scanner.test.js:99`<br>`tests/unit/file-scanner.test.js:107`<br>`tests/unit/file-scanner.test.js:113`<br>`tests/unit/file-scanner.test.js:119`<br>`tests/unit/file-scanner.test.js:127` |
| `checkWritePermissions` | function | `bin/lib/validation/pre-install-checks.js` | 91 | **5** | `bin/lib/preflight/pre-flight-validator.js:159`<br>`bin/lib/validation/pre-install-checks.js:40`<br>`tests/validation/pre-install-checks.test.js:43`<br>`tests/validation/pre-install-checks.test.js:51`<br>`tests/validation/pre-install-checks.test.js:58` |
| `detectExistingInstallation` | function | `bin/lib/validation/pre-install-checks.js` | 175 | **5** | `bin/lib/installer/orchestrator.js:119`<br>`bin/lib/validation/pre-install-checks.js:43`<br>`tests/validation/pre-install-checks.test.js:92`<br>`tests/validation/pre-install-checks.test.js:113`<br>`tests/validation/pre-install-checks.test.js:131` |
| `calculateDirectorySize` | function | `bin/lib/validation/pre-install-checks.js` | 206 | **5** | `bin/lib/migration/backup-manager.js:18`<br>`bin/lib/migration/backup-manager.js:83`<br>`bin/lib/preflight/pre-flight-validator.js:290`<br>`bin/lib/preflight/pre-flight-validator.js:300`<br>`bin/lib/validation/pre-install-checks.js:33` |

---

## 🔍 Potential Inline Candidates (55)

Functions called **exactly once**. Consider inlining at call site.

| Function Name | Type | File | Line | Called From |
|---------------|------|------|------|-------------|
| `calculateTemplateSize` | function | `bin/lib/preflight/pre-flight-validator.js` | 283 | `bin/lib/preflight/pre-flight-validator.js:79` |
| `checkAndMigrateOldVersions` | function | `bin/lib/migration/migration-orchestrator.js` | 20 | `bin/install.js:98` |
| `checkCustomPath` | function | `bin/lib/updater/check-custom-path.js` | 17 | `bin/lib/updater/check-update.js:37` |
| `checkGlobalInstallations` | function | `bin/lib/updater/check-global.js` | 15 | `bin/lib/updater/check-update.js:42` |
| `checkLocalInstallations` | function | `bin/lib/updater/check-local.js` | 15 | `bin/lib/updater/check-update.js:44` |
| `checkSymlinkAndConfirm` | function | `bin/lib/installer/orchestrator.js` | 203 | `bin/lib/installer/orchestrator.js:70` |
| `cleanFrontmatter` | function | `bin/lib/rendering/frontmatter-cleaner.js` | 12 | `bin/lib/installer/install-skills.js:76` |
| `collectInstalledFiles` | function | `bin/lib/manifests/writer.js` | 53 | `bin/lib/manifests/writer.js:19` |
| `collectTemplatePaths` | function | `bin/lib/preflight/pre-flight-validator.js` | 332 | `bin/lib/preflight/pre-flight-validator.js:171` |
| `createMultiBar` | function | `bin/lib/cli/progress.js` | 10 | `bin/lib/cli/installation-core.js:38` |
| `deriveScope` | function | `bin/lib/version/installation-finder.js` | 65 | `bin/lib/version/installation-finder.js:43` |
| `errorSubtitle` | function | `bin/lib/cli/logger.js` | 304 | `bin/lib/errors/directory-error.js:5` |
| `extractSkillReferences` | method | `bin/lib/platforms/claude-adapter.js` | 93 | `bin/lib/platforms/claude-adapter.js:73` |
| `extractVersion` | function | `bin/lib/version/version-detector.js` | 140 | `bin/lib/version/version-detector.js:40` |
| `findVersionFiles` | function | `bin/lib/version/version-detector.js` | 75 | `bin/lib/version/version-detector.js:26` |
| `formatArray` | function | `bin/lib/rendering/frontmatter-serializer.js` | 78 | `bin/lib/rendering/frontmatter-serializer.js:57` |
| `formatErrorLog` | function | `bin/lib/validation/error-logger.js` | 49 | `bin/lib/validation/error-logger.js:35` |
| `formatObject` | function | `bin/lib/rendering/frontmatter-serializer.js` | 101 | `bin/lib/rendering/frontmatter-serializer.js:59` |
| `formatRuntimeError` | function | `bin/lib/validation/error-logger.js` | 138 | `bin/lib/cli/installation-core.js:89` |
| `formatScalar` | function | `bin/lib/rendering/frontmatter-serializer.js` | 134 | `bin/lib/rendering/frontmatter-serializer.js:61` |
| `formatStatusLine` | function | `bin/lib/updater/format-status.js` | 12 | `bin/lib/updater/check-custom-path.js:50` |
| `getAllGlobalPaths` | function | `bin/lib/platforms/platform-paths.js` | 62 | `bin/lib/version/installation-finder.js:59` |
| `getAllLocalPaths` | function | `bin/lib/platforms/platform-paths.js` | 72 | `bin/lib/version/installation-finder.js:61` |
| `getCliName` | function | `bin/lib/platforms/platform-names.js` | 27 | `bin/lib/cli/next-steps.js:24` |
| `getGenericFix` | function | `bin/lib/preflight/error-formatter.js` | 138 | `bin/lib/preflight/error-formatter.js:126` |
| `getInstallPath` | function | `bin/lib/platforms/platform-paths.js` | 42 | `bin/lib/platforms/platform-paths.js:55` |
| `getManifestPaths` | function | `bin/lib/version/installation-finder.js` | 52 | `bin/lib/version/installation-finder.js:8` |
| `getPlatformDisplayName` | function | `bin/lib/version/version-checker.js` | 85 | `bin/lib/version/version-checker.js:64` |
| `getScriptDir` | function | `bin/lib/cli/installation-core.js` | 126 | `bin/lib/cli/interactive.js:40` |
| `groupErrorsByCategory` | function | `bin/lib/preflight/error-formatter.js` | 51 | `bin/lib/preflight/error-formatter.js:26` |
| `handleCheckUpdates` | function | `bin/lib/updater/check-update.js` | 17 | `bin/install.js:90` |
| `infoSubtitle` | function | `bin/lib/cli/logger.js` | 326 | `bin/lib/installer/orchestrator.js:144` |
| `installPlatforms` | function | `bin/lib/cli/installation-core.js` | 28 | `bin/lib/cli/install-loop.js:51` |
| `isGSDInstalled` | function | `bin/lib/platforms/detector.js` | 34 | `bin/lib/platforms/detector.js:18` |
| `joinPaths` | function | `bin/lib/paths/path-resolver.js` | 62 | `tests/unit/path-resolver.test.js:48` |
| `logInstallationError` | function | `bin/lib/validation/error-logger.js` | 33 | `bin/lib/cli/installation-core.js:75` |
| `missingTemplates` | function | `bin/lib/errors/install-error.js` | 37 | `bin/lib/preflight/pre-flight-validator.js:139` |
| `multipleDirectoryErrors` | function | `bin/lib/errors/directory-error.js` | 4 | `bin/install.js:73` |
| `parsePlatformFlags` | function | `bin/lib/cli/flag-parser.js` | 14 | `bin/install.js:78` |
| `parseScope` | function | `bin/lib/cli/flag-parser.js` | 54 | `bin/install.js:134` |
| `processDirectoryRecursively` | function | `bin/lib/installer/install-shared.js` | 43 | `bin/lib/installer/install-shared.js:21` |
| `promptMigration` | function | `bin/lib/migration/migration-manager.js` | 19 | `bin/lib/migration/migration-manager.js:100` |
| `promptSelections` | function | `bin/lib/cli/interactive.js` | 139 | `bin/lib/cli/interactive.js:37` |
| `readOldVersion` | function | `bin/lib/version/old-version-detector.js` | 76 | `bin/lib/version/old-version-detector.js:58` |
| `runInteractive` | function | `bin/lib/cli/interactive.js` | 20 | `bin/install.js:119` |
| `shouldUseInteractiveMode` | function | `bin/lib/cli/mode-detector.js` | 11 | `bin/install.js:115` |
| `showBackupSuccess` | function | `bin/lib/migration/migration-manager.js` | 50 | `bin/lib/migration/migration-manager.js:111` |
| `showGlobalDetectionWarning` | function | `bin/lib/cli/interactive.js` | 65 | `bin/lib/cli/interactive.js:33` |
| `showNextSteps` | function | `bin/lib/cli/next-steps.js` | 17 | `bin/install.js:142` |
| `showNoInstallationMessage` | function | `bin/lib/updater/update-messages.js` | 38 | `bin/lib/updater/check-custom-path.js:39` |
| `showOldVersionMessage` | function | `bin/lib/updater/update-messages.js` | 10 | `bin/lib/updater/check-update.js:29` |
| `showTemplatePath` | function | `bin/lib/cli/banner-manager.js` | 34 | `bin/install.js:112` |
| `showUsageError` | function | `bin/lib/cli/usage.js` | 10 | `bin/install.js:129` |
| `validateBeforeInstall` | function | `bin/lib/preflight/pre-flight-validator.js` | 40 | `bin/lib/cli/install-loop.js:25` |
| `validateVersionBeforeInstall` | function | `bin/lib/installer/orchestrator.js` | 243 | `bin/lib/installer/orchestrator.js:101` |

---

## ✅ Normal Usage Functions (66)

Functions called **more than 5 times**. These are likely core functionality.

*Top 10 most-used functions:*

| Function Name | Type | File | Calls |
|---------------|------|------|-------|
| `get` | method | `bin/lib/platforms/registry.js` | **985** |
| `has` | method | `bin/lib/platforms/registry.js` | **730** |
| `constructor` | method | `bin/lib/errors/install-error.js` | **593** |
| `constructor` | method | `bin/lib/platforms/base-adapter.js` | **593** |
| `constructor` | method | `bin/lib/platforms/claude-adapter.js` | **593** |
| `constructor` | method | `bin/lib/platforms/codex-adapter.js` | **593** |
| `constructor` | method | `bin/lib/platforms/copilot-adapter.js` | **593** |
| `constructor` | method | `bin/lib/platforms/registry.js` | **593** |
| `error` | function | `bin/lib/cli/logger.js` | **489** |
| `warn` | function | `bin/lib/cli/logger.js` | **171** |

---

## 📋 Recommended Action Plan

### Phase 1: Quick Wins (Low Risk)

1. **Remove unused functions** (15 functions)
   - Priority: Exported functions that are unused (dead exports)
   - Action: Delete or comment out, commit, and test
   - Risk: Low (not called anywhere)

### Phase 2: Inline Candidates (Medium Risk)

2. **Inline single-use functions** (55 functions)
   - Priority: Small utility functions (<10 lines)
   - Action: Move code to call site, remove function
   - Risk: Medium (changes code structure)

### Phase 3: Review Low Usage (Higher Risk)

3. **Review low-usage functions** (124 functions)
   - Priority: Complex functions with 2-3 calls
   - Action: Determine if abstraction is needed or can be simplified
   - Risk: Higher (may have architectural implications)

### Testing Strategy

For each phase:
1. Create isolated test directory in `/tmp`
2. Run `install.js` with all parameter combinations:
   - `--all --local`
   - `--all --global`
   - `--claude --local`
   - `--copilot --local`
   - `--codex --local`
   - Interactive mode (no flags)
3. Verify all tests pass
4. Commit changes with `chore(audit):` prefix

---

## 🤔 Next Steps

**User decision required:**

1. Review this report
2. Confirm which phase to start with
3. Approve execution of that phase
4. Run comprehensive tests
5. Proceed to next phase

*Each phase requires explicit user approval before execution.*
