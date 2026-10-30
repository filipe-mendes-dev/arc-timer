Pod::Spec.new do |s|
  s.name = 'GymSessionNotifications'
  s.version = '1.0.0'
  s.summary = 'Native active gym session presentations for Arc Timer'
  s.description = s.summary
  s.license = 'MIT'
  s.author = 'Arc Timer'
  s.homepage = 'https://expo.dev'
  s.platform = :ios, '15.1'
  s.swift_version = '5.9'
  s.source = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '*.{swift,h,m}'
  s.resource_bundles = { 'GymSessionNotifications_privacy' => ['PrivacyInfo.xcprivacy'] }
  s.frameworks = 'UIKit'
  s.weak_frameworks = 'ActivityKit'
end
