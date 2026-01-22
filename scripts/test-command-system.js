#!/usr/bin/env node
/**
 * Automated Test Suite for Command System
 * Tests registry, parser, loader, error handler, and verifier
 */

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test runner helper
 * @param {string} name - Test name
 * @param {Function} testFn - Async test function
 */
async function test(name, testFn) {
  try {
    await testFn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Assertion helper
 * @param {boolean} condition - Condition to assert
 * @param {string} message - Error message if assertion fails
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Run all tests
(async () => {
  console.log('\n🧪 Running Command System Tests\n');

  // ==================================================
  // TEST SUITE 1: Command Registry
  // ==================================================
  console.log('📦 Command Registry Tests\n');

  const { CommandRegistry } = await import('./lib/command-system/registry.js');
  
  await test('Registry: Create and register command', async () => {
    const registry = new CommandRegistry();
    const metadata = { name: 'test:cmd', description: 'Test command' };
    const handler = async () => ({ success: true });
    
    registry.register('test:cmd', metadata, handler);
    assert(registry.has('test:cmd'), 'Command should be registered');
  });

  await test('Registry: Retrieve registered command', async () => {
    const registry = new CommandRegistry();
    const metadata = { name: 'test:retrieve', description: 'Test' };
    const handler = async () => ({ success: true });
    
    registry.register('test:retrieve', metadata, handler);
    const cmd = registry.get('test:retrieve');
    
    assert(cmd !== null, 'Command should be retrievable');
    assert(cmd.metadata.name === 'test:retrieve', 'Metadata should match');
    assert(typeof cmd.handler === 'function', 'Handler should be a function');
  });

  await test('Registry: List all commands', async () => {
    const registry = new CommandRegistry();
    registry.register('cmd1', {}, async () => {});
    registry.register('cmd2', {}, async () => {});
    registry.register('cmd3', {}, async () => {});
    
    const list = registry.list();
    assert(list.length === 3, 'Should list 3 commands');
    assert(list.includes('cmd1'), 'Should include cmd1');
    assert(list.includes('cmd2'), 'Should include cmd2');
    assert(list.includes('cmd3'), 'Should include cmd3');
  });

  await test('Registry: Check command existence', async () => {
    const registry = new CommandRegistry();
    registry.register('exists', {}, async () => {});
    
    assert(registry.has('exists'), 'Should return true for existing command');
    assert(!registry.has('nonexistent'), 'Should return false for non-existing command');
  });

  // ==================================================
  // TEST SUITE 2: Argument Parser
  // ==================================================
  console.log('\n⚙️  Argument Parser Tests\n');

  const { parseCommandArgs } = await import('./lib/command-system/parser.js');

  await test('Parser: Parse positionals only', async () => {
    const result = parseCommandArgs(['3'], {});
    assert(result.positionals.length === 1, 'Should have 1 positional');
    assert(result.positionals[0] === '3', 'Positional should be "3"');
    assert(result.error === null, 'Should have no error');
  });

  await test('Parser: Parse boolean flag', async () => {
    const result = parseCommandArgs(['--verbose'], {
      verbose: { type: 'boolean' }
    });
    assert(result.values.verbose === true, 'Verbose should be true');
    assert(result.error === null, 'Should have no error');
  });

  await test('Parser: Parse combined positionals and flags', async () => {
    const result = parseCommandArgs(['3', '--verbose', '--force'], {
      verbose: { type: 'boolean' },
      force: { type: 'boolean' }
    });
    assert(result.positionals.length === 1, 'Should have 1 positional');
    assert(result.positionals[0] === '3', 'Positional should be "3"');
    assert(result.values.verbose === true, 'Verbose should be true');
    assert(result.values.force === true, 'Force should be true');
    assert(result.error === null, 'Should have no error');
  });

  await test('Parser: Handle parse errors gracefully', async () => {
    // This will cause an error if we use strict: true, but we use strict: false
    // so it should handle unknown options gracefully
    const result = parseCommandArgs(['--unknown-flag'], {
      verbose: { type: 'boolean' }
    });
    // With strict: false, unknown options are treated as positionals
    assert(result.error === null, 'Should not error with strict: false');
  });

  // ==================================================
  // TEST SUITE 3: Command Loader
  // ==================================================
  console.log('\n📂 Command Loader Tests\n');

  const { loadCommands, parseCommandFile } = await import('./lib/command-system/loader.js');

  await test('Loader: Parse command file with frontmatter', async () => {
    const content = `---
name: test:command
description: A test command
---

This is the command prompt content.`;
    
    const { metadata, prompt } = parseCommandFile(content);
    assert(metadata.name === 'test:command', 'Should parse name');
    assert(metadata.description === 'A test command', 'Should parse description');
    assert(prompt.includes('command prompt content'), 'Should extract prompt');
  });

  await test('Loader: Parse command file without frontmatter', async () => {
    const content = 'Just prompt content, no frontmatter';
    const { metadata, prompt } = parseCommandFile(content);
    
    assert(Object.keys(metadata).length === 0, 'Metadata should be empty');
    assert(prompt === content, 'Should return whole content as prompt');
  });

  await test('Loader: Load commands from directory', async () => {
    const count = await loadCommands('commands/gsd');
    assert(count === 24, `Should load 24 commands, loaded ${count}`);
  });

  await test('Loader: Verify sample commands exist', async () => {
    const { registry } = await import('./lib/command-system/registry.js');
    
    assert(registry.has('gsd:help'), 'Should have gsd:help command');
    assert(registry.has('gsd:execute-phase'), 'Should have gsd:execute-phase command');
    assert(registry.has('gsd:new-project'), 'Should have gsd:new-project command');
  });

  // ==================================================
  // TEST SUITE 4: Error Handler
  // ==================================================
  console.log('\n🚨 Error Handler Tests\n');

  const { CommandError, formatError, degradeGracefully } = await import('./lib/command-system/error-handler.js');

  await test('Error: Create CommandError with suggestions', async () => {
    const error = new CommandError(
      'Command not found',
      'COMMAND_NOT_FOUND',
      ['Check spelling', 'Run /gsd:help']
    );
    
    assert(error.message === 'Command not found', 'Should have message');
    assert(error.code === 'COMMAND_NOT_FOUND', 'Should have code');
    assert(error.suggestions.length === 2, 'Should have 2 suggestions');
  });

  await test('Error: Format CommandError with suggestions', async () => {
    const error = new CommandError(
      'Invalid arguments',
      'INVALID_ARGS',
      ['Check command syntax', 'Use --help flag']
    );
    
    const formatted = formatError(error, 'test:cmd');
    assert(formatted.includes('❌'), 'Should include error emoji');
    assert(formatted.includes('Invalid arguments'), 'Should include message');
    assert(formatted.includes('Suggestions:'), 'Should include suggestions header');
    assert(formatted.includes('Check command syntax'), 'Should include suggestion 1');
  });

  await test('Error: Format generic error', async () => {
    const error = new Error('Something went wrong');
    const formatted = formatError(error, 'test:cmd');
    
    assert(formatted.includes('❌'), 'Should include error emoji');
    assert(formatted.includes('test:cmd'), 'Should include command name');
    assert(formatted.includes('Something went wrong'), 'Should include message');
    assert(formatted.includes('Suggestions:'), 'Should include suggestions');
  });

  await test('Error: Generate graceful degradation message', async () => {
    const message = degradeGracefully('agent delegation', 'codex-cli');
    
    assert(message.includes('⚠️'), 'Should include warning emoji');
    assert(message.includes('agent delegation'), 'Should include feature name');
    assert(message.includes('codex-cli'), 'Should include CLI name');
    assert(message.includes('limited functionality'), 'Should mention limitation');
  });

  // ==================================================
  // TEST SUITE 5: Command Verifier
  // ==================================================
  console.log('\n✅ Command Verifier Tests\n');

  const { verifyCommands } = await import('./lib/command-system/verifier.js');

  await test('Verifier: Verify all commands loaded', async () => {
    const result = await verifyCommands();
    
    assert(result.success === true, `Verification should pass: ${result.issues.join(', ')}`);
    assert(result.commandCount === 24, `Should find 24 commands, found ${result.commandCount}`);
    assert(result.issues.length === 0, `Should have no issues, found: ${result.issues.join(', ')}`);
  });

  // ==================================================
  // TEST RESULTS
  // ==================================================
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed\n`);
  
  if (testsFailed === 0) {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
})();
