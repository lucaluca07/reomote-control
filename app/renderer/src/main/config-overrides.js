const { override } = require("customize-cra");

const overrideConfig = (config) => ({
  ...config,
  target: "electron-renderer",
});

module.exports = override(overrideConfig);
