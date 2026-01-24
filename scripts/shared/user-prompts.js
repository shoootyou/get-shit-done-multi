const prompts = require('prompts');

async function confirmAction(message, defaultValue = true) {
  const response = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message,
    initial: defaultValue
  });
  return response.confirmed;
}

async function selectOption(message, choices) {
  const response = await prompts({
    type: 'select',
    name: 'selected',
    message,
    choices
  });
  return response.selected;
}

module.exports = { confirmAction, selectOption };
