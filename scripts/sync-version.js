#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');
const APP_CONFIG_PATH = path.join(ROOT, 'app.config.ts');
const APP_VERSION_PATH = path.join(ROOT, 'src/utils/app-version.ts');

function parseArgs(argv) {
  const result = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--version') {
      result.version = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--build') {
      result.build = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return result;
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function replaceFirst(content, pattern, replacement, label) {
  if (!pattern.test(content)) {
    throw new Error(`Could not find ${label} in file`);
  }

  return content.replace(pattern, replacement);
}

function readCurrentVersion(appConfigContent, fallback) {
  const match = appConfigContent.match(/version:\s*'([^']*)'/);
  return match?.[1] || fallback;
}

function readCurrentBuildNumber(appConfigContent) {
  const iosMatch = appConfigContent.match(/buildNumber:\s*'([^']*)'/);
  if (iosMatch?.[1]) {
    return iosMatch[1];
  }

  const androidMatch = appConfigContent.match(/versionCode:\s*(\d+)/);
  if (androidMatch?.[1]) {
    return androidMatch[1];
  }

  return '1';
}

function buildAppConfigContent(content, version, buildNumber) {
  const nextContent = replaceFirst(
    content,
    /version:\s*'[^']*'/,
    `version: '${version}'`,
    'app version'
  );

  const withIosBuild = replaceFirst(
    nextContent,
    /buildNumber:\s*'[^']*'/,
    `buildNumber: '${buildNumber}'`,
    'iOS build number'
  );

  return replaceFirst(
    withIosBuild,
    /versionCode:\s*\d+/,
    `versionCode: ${Number(buildNumber)}`,
    'Android version code'
  );
}

function buildAppVersionContent(content, version, buildNumber) {
  let nextContent = replaceFirst(
    content,
    /export const VERSION = '[^']*';/,
    `export const VERSION = '${version}';`,
    'VERSION constant'
  );

  nextContent = replaceFirst(
    nextContent,
    /export const VERSION_PATCH = '[^']*';/,
    `export const VERSION_PATCH = '${buildNumber}';`,
    'VERSION_PATCH constant'
  );

  return nextContent;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pkg = readJSON(PACKAGE_JSON_PATH);
  const appConfigContent = fs.readFileSync(APP_CONFIG_PATH, 'utf-8');
  const appVersionContent = fs.readFileSync(APP_VERSION_PATH, 'utf-8');

  const version = args.version || readCurrentVersion(appConfigContent, pkg.version);
  const buildNumber = args.build || readCurrentBuildNumber(appConfigContent);

  if (!/^\d+$/.test(String(buildNumber))) {
    throw new Error('Build number must be a positive integer string');
  }

  pkg.version = version;
  writeJSON(PACKAGE_JSON_PATH, pkg);

  fs.writeFileSync(
    APP_CONFIG_PATH,
    buildAppConfigContent(appConfigContent, version, String(buildNumber))
  );

  fs.writeFileSync(
    APP_VERSION_PATH,
    buildAppVersionContent(appVersionContent, version, String(buildNumber))
  );

  console.log(`Synced version ${version} and build ${buildNumber}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
