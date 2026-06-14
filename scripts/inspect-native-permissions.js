#!/usr/bin/env node
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const IOS_PERMISSION_KEYS = [
    'UIBackgroundModes',
    'NSBonjourServices',
    'NSLocalNetworkUsageDescription',
    'NSAppTransportSecurity',
    'NSMicrophoneUsageDescription',
    'NSCameraUsageDescription',
    'NSPhotoLibraryUsageDescription',
    'NSPhotoLibraryAddUsageDescription',
    'NSLocationWhenInUseUsageDescription',
    'NSLocationAlwaysAndWhenInUseUsageDescription',
    'NSCalendarsUsageDescription',
    'NSContactsUsageDescription',
    'NSRemindersUsageDescription',
    'NSBluetoothAlwaysUsageDescription',
    'NFCReaderUsageDescription',
];

const readIosPlist = (plistPath) => {
    const json = execFileSync(
        'plutil',
        ['-convert', 'json', '-o', '-', plistPath],
        { encoding: 'utf8' },
    );

    return JSON.parse(json);
};

const printValue = (value) => JSON.stringify(value, null, 2);

const inspectIos = () => {
    const plistPath = path.join(projectRoot, 'ios', 'ArcTimer', 'Info.plist');

    console.log('\niOS Info.plist permission-related keys');
    console.log('---------------------------------------');

    if (!fs.existsSync(plistPath)) {
        console.log('ios/ArcTimer/Info.plist not found. Generate native iOS first.');
        return;
    }

    const plist = readIosPlist(plistPath);
    const presentKeys = IOS_PERMISSION_KEYS.filter((key) =>
        Object.prototype.hasOwnProperty.call(plist, key),
    );
    const usageDescriptionKeys = Object.keys(plist)
        .filter((key) => key.endsWith('UsageDescription'))
        .filter((key) => !presentKeys.includes(key))
        .sort();

    const keys = [...presentKeys, ...usageDescriptionKeys];

    if (keys.length === 0) {
        console.log('No tracked permission-related plist keys found.');
        return;
    }

    for (const key of keys) {
        console.log(`${key}: ${printValue(plist[key])}`);
    }
};

const readFileIfExists = (filePath) => {
    if (!fs.existsSync(filePath)) return null;

    return fs.readFileSync(filePath, 'utf8');
};

const listManifestFiles = (root) => {
    if (!fs.existsSync(root)) return [];

    const entries = fs.readdirSync(root, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const entryPath = path.join(root, entry.name);

        if (entry.isDirectory()) {
            files.push(...listManifestFiles(entryPath));
        } else if (entry.name === 'AndroidManifest.xml') {
            files.push(entryPath);
        }
    }

    return files;
};

const extractAndroidPermissions = (contents) => {
    const permissions = new Set();
    const permissionPattern =
        /<(?:uses-permission|permission)\b[^>]*android:name=["']([^"']+)["']/g;

    for (const match of contents.matchAll(permissionPattern)) {
        permissions.add(match[1]);
    }

    return [...permissions].sort();
};

const printAndroidManifest = (label, manifestPath) => {
    const contents = readFileIfExists(manifestPath);

    if (!contents) return;

    const permissions = extractAndroidPermissions(contents);
    const relativePath = path.relative(projectRoot, manifestPath);

    console.log(`\nAndroid permissions: ${label}`);
    console.log('-'.repeat(`Android permissions: ${label}`.length));
    console.log(relativePath);

    if (permissions.length === 0) {
        console.log('No permissions found.');
        return;
    }

    for (const permission of permissions) {
        console.log(`- ${permission}`);
    }
};

const inspectAndroid = () => {
    const sourceManifestPath = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'AndroidManifest.xml',
    );
    const mergedManifestRoot = path.join(
        projectRoot,
        'android',
        'app',
        'build',
        'intermediates',
        'merged_manifest',
    );

    printAndroidManifest('source manifest', sourceManifestPath);

    const mergedManifests = listManifestFiles(mergedManifestRoot);

    for (const manifestPath of mergedManifests) {
        printAndroidManifest('merged build manifest', manifestPath);
    }

    if (!fs.existsSync(sourceManifestPath)) {
        console.log('\nAndroidManifest.xml not found. Generate native Android first.');
    }
};

inspectIos();
inspectAndroid();
