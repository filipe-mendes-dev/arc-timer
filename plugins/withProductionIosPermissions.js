const { withInfoPlist } = require('expo/config-plugins');

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withProductionIosPermissions = (config) => withInfoPlist(config, (result) => {
    const plist = result.modResults;
    const bonjourServices = plist.NSBonjourServices?.filter(
        (service) => service.toLowerCase().replace(/\.$/, '') !== '_expo._tcp',
    );

    if (bonjourServices?.length) {
        plist.NSBonjourServices = bonjourServices;
    } else {
        delete plist.NSBonjourServices;
    }

    if (plist.NSLocalNetworkUsageDescription?.startsWith('Expo Dev Launcher')) {
        delete plist.NSLocalNetworkUsageDescription;
    }

    delete plist.NSAppTransportSecurity?.NSAllowsLocalNetworking;
    return result;
});

module.exports = withProductionIosPermissions;
