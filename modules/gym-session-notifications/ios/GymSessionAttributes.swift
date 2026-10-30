import ActivityKit
import Foundation

@available(iOS 16.1, *)
struct GymSessionAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var sessionId: String
    var startedAtMs: Double
    var title: String
    var planName: String
    var startedAtLabel: String
    var elapsedLabel: String
    var endLabel: String
    var channelName: String
    var appName: String
    var accentColor: String
    var backgroundColor: String
    var textColor: String
    var secondaryTextColor: String
    var buttonTextColor: String
    var openUrl: String
    var endUrl: String
  }

  var sessionId: String
  var startedAt: Date
}
