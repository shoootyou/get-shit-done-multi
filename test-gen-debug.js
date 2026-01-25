const { generateFromSpec } = require('./bin/lib/template-system/generator');
const testSpec = {
  frontmatter: {
    name: 'test-conditional',
    description: 'Test conditional rendering',
    tools: ['view', 'edit']
  },
  body: 'Test content'
};
const result = generateFromSpec(testSpec, 'claude');
console.log('Success:', result.success);
if (!result.success) {
  console.log('Errors:', JSON.stringify(result.errors, null, 2));
} else {
  console.log('Output length:', result.output.length);
}
