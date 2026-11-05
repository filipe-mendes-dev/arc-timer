#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { getConfig } = require('expo/config');

const BASE_ID = 'dev.filipemendes.arctimer';
const VARIANTS = {
  production:  { id: BASE_ID,                regenCmd: 'npm run native:generate' },
  development: { id: `${BASE_ID}.dev`,       regenCmd: 'npm run native:generate:dev' },
  preview:     { id: `${BASE_ID}.preview`,   regenCmd: 'npm run native:generate:preview' },
  screenshots: { id: `${BASE_ID}.screenshots`, regenCmd: 'npm run native:generate:screenshots' },
};

const target = process.argv[2] ?? 'production';
if (!VARIANTS[target]) {
  console.error(`[guard] Unknown variant "${target}". Expected: ${Object.keys(VARIANTS).join(', ')}.`);
  process.exit(2);
}
const { id: EXPECTED_ID, regenCmd } = VARIANTS[target];
const errors = [];
const projectRoot = path.join(__dirname, '..');

try {
  const { exp } = getConfig(projectRoot);
  if (exp.extra?.appVariant !== target) {
    errors.push(
      `Expo app variant is "${exp.extra?.appVariant}" (expected "${target}"). Set APP_VARIANT=${target} for this command.`
    );
  }
  if (exp.ios?.bundleIdentifier !== EXPECTED_ID || exp.android?.package !== EXPECTED_ID) {
    errors.push(`Expo bundle/package identifiers must both be "${EXPECTED_ID}". Check app.config.ts.`);
  }
} catch (error) {
  errors.push(`Could not resolve Expo config: ${error instanceof Error ? error.message : String(error)}`);
}

const iosDir = path.join(projectRoot, 'ios');
if (fs.existsSync(iosDir)) {
  const pbxFiles = fs.readdirSync(iosDir)
    .filter((f) => f.endsWith('.xcodeproj'))
    .map((f) => path.join(iosDir, f, 'project.pbxproj'));
  for (const pbx of pbxFiles) {
    const content = fs.readFileSync(pbx, 'utf8');
    const ids = [...content.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)]
      .map((m) => m[1].trim().replace(/^"|"$/g, ''));
    // The Live Activity extension has its own bundle ID within the same variant.
    const bad = ids.filter((id) =>
      id && id !== EXPECTED_ID && id !== `${EXPECTED_ID}.GymSessionActivity`
    );
    if (bad.length) {
      errors.push(
        `iOS bundle id is "${bad[0]}" (expected "${EXPECTED_ID}"). Run: ${regenCmd}`
      );
    }
  }
}

const gradle = path.join(projectRoot, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradle)) {
  const content = fs.readFileSync(gradle, 'utf8');
  const m = content.match(/applicationId\s+['"]([^'"]+)['"]/);
  if (m && m[1] !== EXPECTED_ID) {
    errors.push(
      `Android applicationId is "${m[1]}" (expected "${EXPECTED_ID}"). Run: ${regenCmd}`
    );
  }
}

if (errors.length) {
  console.error(
    `\n[guard:${target}-variant] FAILED:\n` +
      errors.map((e) => '  • ' + e).join('\n') +
      '\n'
  );
  process.exit(1);
}
console.log(`[guard:${target}-variant] OK — Expo config and native projects match the ${target} variant.`);
