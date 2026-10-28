#!/usr/bin/env node
// Writes app/selfhost-config.json from MAILSPRING_SERVER_URL and the optional
// MAILSPRING_UPDATE_TOKEN (process env or the repo root .env file) so neither is ever
// committed. Without a token the build never checks for updates.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const outPath = path.join(root, 'app', 'selfhost-config.json');

function readDotEnv(file) {
  if (!fs.existsSync(file)) return {};
  const result = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    result[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return result;
}

const dotEnv = readDotEnv(envPath);
const raw = process.env.MAILSPRING_SERVER_URL || dotEnv.MAILSPRING_SERVER_URL;
const updateToken = process.env.MAILSPRING_UPDATE_TOKEN || dotEnv.MAILSPRING_UPDATE_TOKEN || null;
if (!raw) {
  console.error('MAILSPRING_SERVER_URL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

let url;
try {
  url = new URL(raw);
} catch (err) {
  console.error(`MAILSPRING_SERVER_URL is not a valid URL: ${raw}`);
  process.exit(1);
}
if (url.protocol !== 'https:' && url.protocol !== 'http:') {
  console.error(`MAILSPRING_SERVER_URL must be http(s): ${raw}`);
  process.exit(1);
}

const serverUrl = url.origin + url.pathname.replace(/\/+$/, '');
if (updateToken && !/^[A-Za-z0-9_-]{32,128}$/.test(updateToken)) {
  console.error('MAILSPRING_UPDATE_TOKEN must be 32-128 characters of [A-Za-z0-9_-].');
  process.exit(1);
}

fs.writeFileSync(outPath, JSON.stringify({ serverUrl, updateToken }, null, 2) + '\n');
console.log(`selfhost-config: wrote ${path.relative(root, outPath)}`);
