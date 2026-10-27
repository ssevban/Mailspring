#!/usr/bin/env node
// Writes app/selfhost-config.json from MAILSPRING_SERVER_URL (process env or the
// repo root .env file) so the self-hosted server URL is never committed.
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

const raw = process.env.MAILSPRING_SERVER_URL || readDotEnv(envPath).MAILSPRING_SERVER_URL;
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
fs.writeFileSync(outPath, JSON.stringify({ serverUrl }, null, 2) + '\n');
console.log(`selfhost-config: ${serverUrl}`);
