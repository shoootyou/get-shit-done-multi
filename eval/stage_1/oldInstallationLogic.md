---
subject: function
name: oldInstallationLogic
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.838Z'
complexity:
  cyclomatic: 247
  nesting_depth: 13
  parameter_count: 0
depends_on:
  - runMigration
  - error
  - exit
  - log
  - installAll
  - detectInstalledCLIs
  - map
  - filter
  - entries
  - getRecommendations
  - platform
  - join
  - startsWith
  - homedir
  - slice
  - existsSync
  - parse
  - readFileSync
  - writeFileSync
  - stringify
  - rmSync
  - mkdirSync
  - readdirSync
  - match
  - isDirectory
  - copyWithPathReplacement
  - endsWith
  - buildContext
  - render
  - convertContent
  - copyFileSync
  - generateAgent
  - forEach
  - push
  - statSync
  - unlinkSync
  - keys
  - isArray
  - some
  - includes
  - isFile
  - replace
  - String
  - trim
  - generateAgentsFromSpecs
  - renameSync
  - parseFrontMatter
  - getFrontMatterValue
  - trimStart
  - replaceClaudePaths
  - yamlEscape
  - getTargetDirs
  - getConfigPaths
  - cwd
  - preserveUserData
  - cleanupOrphanedFiles
  - generateSkillsFromSpecs
  - toFixed
  - verifyInstalled
  - require
  - generateFromTemplate
  - verifyFileInstalled
  - verify
  - cleanupOrphanedHooks
  - readSettings
  - restoreUserData
  - copyCopilotAgents
  - installIssueTemplates
  - writeSettings
  - install
  - finishInstall
  - installCopilot
  - installCodex
  - callback
  - createInterface
  - question
  - close
  - handleStatusline
  - 'on'
  - expandTilde
  - promptLocation
called_by: []
confidence: 50%
---
# Function: oldInstallationLogic

## Purpose

To be documented


## Signature

```javascript
function oldInstallationLogic()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

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


## Side Effects

- **console**: console.error (line 337)
- **console**: console.error (line 338)
- **console**: console.log (line 344)
- **console**: console.log (line 367)
- **console**: console.log (line 369)
- **console**: console.log (line 372)
- **console**: console.log (line 376)
- **console**: console.log (line 377)
- **console**: console.log (line 381)
- **console**: console.log (line 384)
- **file_system**: fs.existsSync (line 400)
- **file_system**: fs.readFileSync (line 402)
- **file_system**: fs.writeFileSync (line 414)
- **file_system**: fs.existsSync (line 424)
- **file_system**: fs.rmSync (line 425)
- **file_system**: fs.mkdirSync (line 427)
- **file_system**: fs.readdirSync (line 429)
- **file_system**: fs.readFileSync (line 443)
- **file_system**: fs.writeFileSync (line 453)
- **file_system**: fs.copyFileSync (line 455)
- **file_system**: fs.mkdirSync (line 474)
- **file_system**: fs.readdirSync (line 477)
- **file_system**: fs.writeFileSync (line 490)
- **console**: console.log (line 496)
- **console**: console.error (line 506)
- **console**: console.error (line 511)
- **console**: console.error (line 516)
- **file_system**: fs.mkdirSync (line 540)
- **file_system**: fs.readdirSync (line 543)
- **file_system**: fs.statSync (line 546)
- **file_system**: fs.existsSync (line 552)
- **console**: console.log (line 553)
- **file_system**: fs.mkdirSync (line 564)
- **file_system**: fs.writeFileSync (line 566)
- **console**: console.log (line 572)
- **console**: console.error (line 581)
- **console**: console.error (line 586)
- **console**: console.error (line 591)
- **file_system**: fs.existsSync (line 607)
- **file_system**: fs.unlinkSync (line 608)
- **console**: console.log (line 609)
- **console**: console.log (line 649)
- **file_system**: fs.existsSync (line 659)
- **console**: console.error (line 660)
- **file_system**: fs.readdirSync (line 664)
- **console**: console.error (line 666)
- **console**: console.error (line 670)
- **file_system**: fs.existsSync (line 680)
- **console**: console.error (line 681)
- **file_system**: fs.existsSync (line 689)
- **file_system**: fs.mkdirSync (line 693)
- **file_system**: fs.readdirSync (line 694)
- **file_system**: fs.copyFileSync (line 704)
- **file_system**: fs.existsSync (line 730)
- **file_system**: fs.mkdirSync (line 732)
- **file_system**: fs.readdirSync (line 733)
- **file_system**: fs.unlinkSync (line 735)
- **file_system**: fs.readdirSync (line 744)
- **file_system**: fs.renameSync (line 749)
- **file_system**: fs.existsSync (line 758)
- **file_system**: fs.mkdirSync (line 762)
- **file_system**: fs.readdirSync (line 765)
- **file_system**: fs.unlinkSync (line 767)
- **file_system**: fs.readdirSync (line 771)
- **file_system**: fs.readFileSync (line 777)
- **file_system**: fs.writeFileSync (line 794)
- **console**: console.log (line 822)
- **file_system**: fs.mkdirSync (line 837)
- **file_system**: fs.existsSync (line 842)
- **file_system**: fs.existsSync (line 847)
- **file_system**: fs.readdirSync (line 847)
- **console**: console.log (line 848)
- **file_system**: fs.existsSync (line 855)
- **file_system**: fs.mkdirSync (line 857)
- **file_system**: fs.existsSync (line 858)
- **file_system**: fs.readdirSync (line 859)
- **file_system**: fs.unlinkSync (line 861)
- **console**: console.log (line 870)
- **file_system**: fs.existsSync (line 879)
- **console**: console.log (line 883)
- **console**: console.log (line 887)
- **console**: console.log (line 892)
- **file_system**: fs.readdirSync (line 896)
- **file_system**: fs.statSync (line 899)
- **file_system**: fs.existsSync (line 904)
- **file_system**: fs.statSync (line 905)
- **console**: console.log (line 907)
- **file_system**: fs.existsSync (line 919)
- **file_system**: fs.mkdirSync (line 920)
- **file_system**: fs.readdirSync (line 923)
- **file_system**: fs.existsSync (line 928)
- **file_system**: fs.readFileSync (line 929)
- **file_system**: fs.writeFileSync (line 931)
- **console**: console.log (line 936)
- **file_system**: fs.mkdirSync (line 944)
- **file_system**: fs.existsSync (line 949)
- **file_system**: fs.readFileSync (line 950)
- **file_system**: fs.writeFileSync (line 954)
- **console**: console.log (line 956)
- **file_system**: fs.existsSync (line 967)
- **file_system**: fs.copyFileSync (line 968)
- **console**: console.log (line 970)
- **file_system**: fs.writeFileSync (line 978)
- **console**: console.log (line 980)
- **file_system**: fs.existsSync (line 987)
- **file_system**: fs.mkdirSync (line 989)
- **file_system**: fs.readdirSync (line 990)
- **file_system**: fs.copyFileSync (line 994)
- **console**: console.log (line 997)
- **file_system**: fs.readdirSync (line 1009)
- **file_system**: fs.statSync (line 1012)
- **file_system**: fs.readdirSync (line 1014)
- **console**: console.log (line 1016)
- **console**: console.error (line 1018)
- **console**: console.error (line 1019)
- **console**: console.log (line 1020)
- **console**: console.error (line 1025)
- **console**: console.error (line 1026)
- **console**: console.log (line 1062)
- **console**: console.log (line 1084)
- **file_system**: fs.mkdirSync (line 1095)
- **file_system**: fs.existsSync (line 1100)
- **file_system**: fs.existsSync (line 1105)
- **file_system**: fs.readdirSync (line 1105)
- **console**: console.log (line 1106)
- **file_system**: fs.mkdirSync (line 1112)
- **file_system**: fs.existsSync (line 1117)
- **file_system**: fs.readFileSync (line 1118)
- **file_system**: fs.writeFileSync (line 1122)
- **console**: console.log (line 1124)
- **file_system**: fs.existsSync (line 1135)
- **file_system**: fs.copyFileSync (line 1136)
- **console**: console.log (line 1138)
- **file_system**: fs.writeFileSync (line 1145)
- **console**: console.log (line 1147)
- **console**: console.log (line 1156)
- **file_system**: fs.existsSync (line 1165)
- **file_system**: fs.mkdirSync (line 1166)
- **console**: console.log (line 1171)
- **console**: console.log (line 1174)
- **file_system**: fs.readdirSync (line 1178)
- **file_system**: fs.statSync (line 1181)
- **file_system**: fs.existsSync (line 1186)
- **file_system**: fs.statSync (line 1187)
- **console**: console.log (line 1189)
- **console**: console.log (line 1193)
- **file_system**: fs.existsSync (line 1203)
- **file_system**: fs.existsSync (line 1204)
- **file_system**: fs.mkdirSync (line 1205)
- **file_system**: fs.copyFileSync (line 1206)
- **console**: console.log (line 1208)
- **console**: console.log (line 1213)
- **console**: console.log (line 1219)
- **file_system**: fs.readdirSync (line 1227)
- **file_system**: fs.readdirSync (line 1229)
- **console**: console.log (line 1231)
- **console**: console.error (line 1233)
- **console**: console.error (line 1234)
- **console**: console.log (line 1235)
- **console**: console.error (line 1239)
- **console**: console.log (line 1248)
- **console**: console.log (line 1271)
- **file_system**: fs.mkdirSync (line 1282)
- **file_system**: fs.existsSync (line 1287)
- **file_system**: fs.existsSync (line 1292)
- **file_system**: fs.readdirSync (line 1292)
- **console**: console.log (line 1293)
- **file_system**: fs.mkdirSync (line 1299)
- **file_system**: fs.existsSync (line 1304)
- **file_system**: fs.readFileSync (line 1305)
- **file_system**: fs.writeFileSync (line 1309)
- **console**: console.log (line 1310)
- **file_system**: fs.existsSync (line 1320)
- **file_system**: fs.copyFileSync (line 1321)
- **console**: console.log (line 1323)
- **file_system**: fs.writeFileSync (line 1330)
- **console**: console.log (line 1332)
- **file_system**: fs.existsSync (line 1339)
- **file_system**: fs.mkdirSync (line 1342)
- **file_system**: fs.readdirSync (line 1349)
- **file_system**: fs.readFileSync (line 1352)
- **file_system**: fs.mkdirSync (line 1357)
- **file_system**: fs.writeFileSync (line 1358)
- **file_system**: fs.rmSync (line 1362)
- **console**: console.log (line 1366)
- **file_system**: fs.existsSync (line 1375)
- **file_system**: fs.readdirSync (line 1376)
- **file_system**: fs.existsSync (line 1382)
- **file_system**: fs.readFileSync (line 1384)
- **file_system**: fs.mkdirSync (line 1387)
- **file_system**: fs.writeFileSync (line 1388)
- **console**: console.log (line 1392)
- **file_system**: fs.existsSync (line 1400)
- **file_system**: fs.mkdirSync (line 1403)
- **console**: console.log (line 1408)
- **console**: console.log (line 1411)
- **file_system**: fs.readdirSync (line 1415)
- **file_system**: fs.statSync (line 1418)
- **file_system**: fs.existsSync (line 1423)
- **file_system**: fs.statSync (line 1424)
- **console**: console.log (line 1426)
- **file_system**: fs.readdirSync (line 1438)
- **file_system**: fs.readdirSync (line 1440)
- **file_system**: fs.statSync (line 1441)
- **console**: console.log (line 1442)
- **console**: console.error (line 1444)
- **console**: console.error (line 1445)
- **console**: console.log (line 1446)
- **console**: console.error (line 1450)
- **console**: console.log (line 1459)
- **console**: console.log (line 1473)
- **console**: console.log (line 1479)
- **console**: console.log (line 1494)
- **console**: console.log (line 1495)
- **console**: console.log (line 1496)
- **console**: console.log (line 1497)
- **console**: console.log (line 1501)
- **console**: console.log (line 1507)
- **file_system**: fs.readdirSync (line 1517)
- **file_system**: fs.readdirSync (line 1519)
- **console**: console.error (line 1529)
- **console**: console.log (line 1536)
- **file_system**: fs.readdirSync (line 1545)
- **file_system**: fs.readdirSync (line 1547)
- **console**: console.error (line 1557)
- **console**: console.log (line 1564)
- **file_system**: fs.readdirSync (line 1572)
- **file_system**: fs.readdirSync (line 1574)
- **file_system**: fs.statSync (line 1574)
- **console**: console.error (line 1584)
- **console**: console.log (line 1590)
- **console**: console.log (line 1601)
- **console**: console.log (line 1605)
- **console**: console.log (line 1606)
- **console**: console.log (line 1607)
- **console**: console.log (line 1608)
- **console**: console.log (line 1609)
- **console**: console.log (line 1632)
- **console**: console.log (line 1633)
- **console**: console.log (line 1634)
- **process_io**: process.stdout (line 1644)
- **console**: console.log (line 1647)
- **console**: console.log (line 1676)
- **process_io**: process.stdout (line 1686)
- **console**: console.log (line 1695)
- **console**: console.log (line 1704)
- **console**: console.log (line 1716)
- **console**: console.error (line 1751)
- **console**: console.error (line 1754)
- **console**: console.error (line 1757)
- **console**: console.error (line 1760)
- **console**: console.error (line 1763)
- **console**: console.error (line 1766)
- **console**: console.error (line 1769)
- **console**: console.error (line 1772)


## Complexity Analysis

- Cyclomatic complexity: 247
- Nesting depth: 13
- Parameter count: 0
- Classification: Complex


## Analysis Confidence

**Confidence:** 50%

**Deductions:**

- **-20%**: Dynamic requires/imports detected
- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Dynamic requires make dependency analysis uncertain
- ❓ Missing JSDoc comments
- ❓ Complexity 247 but no documentation
- ❓ Dependencies used but purpose unclear

