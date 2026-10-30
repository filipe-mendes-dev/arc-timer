import ActivityKit
import ExpoModulesCore
import UIKit

public class GymSessionNotificationsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("GymSessionNotifications")

    AsyncFunction("present") { (serialized: String) async throws -> Bool in
      guard #available(iOS 16.1, *) else { return false }
      guard ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
      let content = try JSONDecoder().decode(GymSessionAttributes.ContentState.self, from: Data(serialized.utf8))
      let activities = Activity<GymSessionAttributes>.activities
      for activity in activities where activity.attributes.sessionId != content.sessionId {
        await activity.end(using: nil, dismissalPolicy: .immediate)
      }
      if let activity = activities.first(where: { $0.attributes.sessionId == content.sessionId }) {
        if activity.activityState == .dismissed || activity.activityState == .ended { return false }
        await activity.update(using: content)
        return true
      }

      // Respect dismissal and the system's activity lifetime limit for this session.
      let defaults = UserDefaults.standard
      if defaults.string(forKey: "arcGymActivitySession") == content.sessionId { return false }
      let isForeground = await MainActor.run { UIApplication.shared.applicationState == .active }
      guard isForeground else { return false }
      let attributes = GymSessionAttributes(
        sessionId: content.sessionId,
        startedAt: Date(timeIntervalSince1970: content.startedAtMs / 1000)
      )
      _ = try Activity.request(attributes: attributes, contentState: content, pushType: nil)
      defaults.set(content.sessionId, forKey: "arcGymActivitySession")
      return true
    }

    AsyncFunction("dismiss") { () async in
      if #available(iOS 16.1, *) {
        for activity in Activity<GymSessionAttributes>.activities {
          await activity.end(using: nil, dismissalPolicy: .immediate)
        }
      }
      UserDefaults.standard.removeObject(forKey: "arcGymActivitySession")
    }
  }
}
