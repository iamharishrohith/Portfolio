const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for spawn UNKNOWN on Windows / Node 23+
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: "./global.css" });
