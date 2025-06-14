const fs = require("fs");
const path = require("path");

global.plugins = [];

const loadPlugins = (sock) => {
  global.plugins = [];

  const pluginPath = path.join(__dirname, "plugins");
  const files = fs.readdirSync(pluginPath).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    try {
      const plugin = require(path.join(pluginPath, file));
      if (typeof plugin === "function") {
        global.plugins.push(plugin);
        console.log(`✅ Loaded plugin: ${file}`);
      }
    } catch (e) {
      console.error(`❌ Error in ${file}:`, e);
    }
  }
};

module.exports = loadPlugins;
