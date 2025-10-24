const path = require('path');
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../../');

const config = getDefaultConfig(projectRoot)

config.watchFolders = [...config.watchFolders, workspaceRoot, projectRoot];

config.resolver.nodeModulesPaths = [
	...config.resolver.nodeModulesPaths,
	path.resolve(projectRoot, 'node_modules'),
	path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.sourceExts.push('cjs');

module.exports = withNativeWind(config, { input: './global.css' })
