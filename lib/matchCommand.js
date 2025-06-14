const prefixes = [".", "!", "/", ";"];

function matchCommand(text, cmd) {
  if (!text) return false;
  return prefixes.some(p => text.toLowerCase().startsWith(p + cmd));
}

module.exports = matchCommand;
