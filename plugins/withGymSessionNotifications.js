const fs = require('node:fs');
const path = require('node:path');
const Jimp = require('jimp-compact');
const { withEntitlementsPlist, withInfoPlist, withXcodeProject } = require('expo/config-plugins');

const TARGET_NAME = 'GymSessionActivity';

// This plugin runs in Node before Metro and cannot load app TypeScript modules.
const withGymSessionNotifications = (config) => {
    config.extra ??= {};
    config.extra.eas ??= {};
    config.extra.eas.build ??= {};
    config.extra.eas.build.experimental ??= {};
    config.extra.eas.build.experimental.ios ??= {};
    const iosBuild = config.extra.eas.build.experimental.ios;
    iosBuild.appExtensions = [
        ...(iosBuild.appExtensions ?? []).filter((extension) => extension.targetName !== TARGET_NAME),
        {
            targetName: TARGET_NAME,
            bundleIdentifier: `${config.ios.bundleIdentifier}.GymSessionActivity`,
        },
    ];

    config = withEntitlementsPlist(config, (result) => {
        // Local reminders and locally updated Live Activities do not use APNs.
        delete result.modResults['aps-environment'];
        return result;
    });

    config = withInfoPlist(config, (result) => {
        result.modResults.NSSupportsLiveActivities = true;
        return result;
    });

    return withXcodeProject(config, async (result) => {
        const { projectRoot, platformProjectRoot } = result.modRequest;
        const project = result.modResults;
        const moduleRoot = path.join(projectRoot, 'modules/gym-session-notifications');
        const targetRoot = path.join(platformProjectRoot, TARGET_NAME);
        fs.mkdirSync(targetRoot, { recursive: true });
        fs.copyFileSync(path.join(moduleRoot, 'ios/GymSessionAttributes.swift'), path.join(targetRoot, 'GymSessionAttributes.swift'));
        fs.copyFileSync(path.join(moduleRoot, 'widget/GymSessionLiveActivity.swift'), path.join(targetRoot, 'GymSessionLiveActivity.swift'));
        const logo = await Jimp.read(path.join(projectRoot, 'assets/generated/classic/notification-logo.png'));
        logo.autocrop();
        // WidgetKit needs images sized for their presentation, including compact islands.
        for (const image of [
            { name: 'ArcNotificationLogo', width: 20, height: 15 },
            { name: 'ArcNotificationIsland', width: 26, height: 20 },
            { name: 'ArcNotificationWatermark', width: 174, height: 131 },
        ]) {
            const imageRoot = path.join(targetRoot, `Assets.xcassets/${image.name}.imageset`);
            fs.mkdirSync(imageRoot, { recursive: true });
            fs.rmSync(path.join(imageRoot, 'logo.png'), { force: true });
            const images = [];
            for (const scale of [1, 2, 3]) {
                const filename = `logo@${scale}x.png`;
                await logo.clone().resize(image.width * scale, image.height * scale).writeAsync(path.join(imageRoot, filename));
                images.push({ idiom: 'universal', filename, scale: `${scale}x` });
            }
            fs.writeFileSync(path.join(imageRoot, 'Contents.json'), JSON.stringify({
                images,
                info: { author: 'xcode', version: 1 },
                properties: { 'template-rendering-intent': 'template' },
            }, null, 2));
        }
        fs.writeFileSync(path.join(targetRoot, 'Assets.xcassets/Contents.json'), JSON.stringify({ info: { author: 'xcode', version: 1 } }));
        fs.writeFileSync(path.join(targetRoot, `${TARGET_NAME}-Info.plist`), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleDisplayName</key><string>Arc Timer</string>
<key>CFBundleIdentifier</key><string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
<key>CFBundleExecutable</key><string>$(EXECUTABLE_NAME)</string>
<key>CFBundleName</key><string>$(PRODUCT_NAME)</string>
<key>CFBundlePackageType</key><string>XPC!</string>
<key>CFBundleShortVersionString</key><string>$(MARKETING_VERSION)</string>
<key>CFBundleVersion</key><string>$(CURRENT_PROJECT_VERSION)</string>
<key>NSExtension</key><dict><key>NSExtensionPointIdentifier</key><string>com.apple.widgetkit-extension</string></dict>
</dict></plist>`);

        const targets = project.pbxNativeTargetSection();
        const existing = Object.entries(targets).find(([, target]) =>
            typeof target === 'object' && target.name?.replaceAll('"', '') === TARGET_NAME
        );
        let targetId;
        if (existing) {
            targetId = existing[0];
        } else {
            const target = project.addTarget(TARGET_NAME, 'app_extension', TARGET_NAME, `${result.ios.bundleIdentifier}.GymSessionActivity`);
            targetId = target.uuid;
            project.addBuildPhase([
                `${TARGET_NAME}/GymSessionAttributes.swift`,
                `${TARGET_NAME}/GymSessionLiveActivity.swift`,
            ], 'PBXSourcesBuildPhase', 'Sources', targetId);
            project.addBuildPhase([`${TARGET_NAME}/Assets.xcassets`], 'PBXResourcesBuildPhase', 'Resources', targetId);
            project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', targetId);
        }

        const target = targets[targetId];
        const configurations = project.pbxXCConfigurationList()[target.buildConfigurationList];
        const settings = project.pbxXCBuildConfigurationSection();
        for (const configuration of configurations.buildConfigurations) {
            Object.assign(settings[configuration.value].buildSettings, {
                PRODUCT_BUNDLE_IDENTIFIER: `"${result.ios.bundleIdentifier}.GymSessionActivity"`,
                IPHONEOS_DEPLOYMENT_TARGET: '16.1',
                SWIFT_VERSION: '5.0',
                TARGETED_DEVICE_FAMILY: '1',
                APPLICATION_EXTENSION_API_ONLY: 'YES',
                CODE_SIGN_STYLE: 'Automatic',
                GENERATE_INFOPLIST_FILE: 'NO',
                MARKETING_VERSION: result.version,
                CURRENT_PROJECT_VERSION: result.ios.buildNumber || '1',
                SWIFT_EMIT_LOC_STRINGS: 'YES',
            });
            if (result.ios.appleTeamId) settings[configuration.value].buildSettings.DEVELOPMENT_TEAM = result.ios.appleTeamId;
        }
        return result;
    });
};

module.exports = withGymSessionNotifications;
