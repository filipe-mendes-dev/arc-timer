import ActivityKit
import SwiftUI
import WidgetKit

private extension Color {
  init(hex: String) {
    let value = UInt64(hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")), radix: 16) ?? 0
    self.init(.sRGB, red: Double((value >> 16) & 255) / 255,
              green: Double((value >> 8) & 255) / 255, blue: Double(value & 255) / 255, opacity: 1)
  }
}

private struct ArcLogo: View {
  var assetName = "ArcNotificationLogo"

  var body: some View {
    Image(assetName).renderingMode(.template).resizable().scaledToFit()
      .accessibilityHidden(true)
  }
}

private struct GymSessionBanner: View {
  let content: GymSessionAttributes.ContentState
  let startedAt: Date
  var isDynamicIsland = false

  var body: some View {
    let accent = Color(hex: content.accentColor)
    let foreground = isDynamicIsland ? Color.white : Color(hex: content.textColor)
    let secondary = isDynamicIsland ? Color.white.opacity(0.7) : Color(hex: content.secondaryTextColor)
    VStack(alignment: .leading, spacing: 0) {
      HStack(spacing: 6) {
        ArcLogo().frame(width: 20, height: 15).foregroundStyle(accent)
        Text(content.appName).font(.system(size: 12)).lineLimit(1)
      }.foregroundStyle(secondary).padding(.bottom, 10)
      HStack(spacing: 12) {
        VStack(alignment: .leading, spacing: 4) {
          Text(content.title).font(.system(size: 15, weight: .semibold)).lineLimit(1)
          if content.planName != content.title {
            Text(content.planName).font(.system(size: 13)).lineLimit(1)
              .foregroundStyle(secondary)
          }
        }.frame(maxWidth: .infinity, alignment: .leading)
        VStack(alignment: .trailing, spacing: 0) {
          Text(startedAt, style: .timer)
            .monospacedDigit().font(.system(size: 28, weight: .semibold)).kerning(-0.8)
            .multilineTextAlignment(.trailing).lineLimit(1).minimumScaleFactor(0.7)
            .frame(width: 110)
          Text(content.elapsedLabel).font(.system(size: 11))
            .foregroundStyle(secondary)
        }
      }.frame(minHeight: 44)
      HStack(spacing: 12) {
        Text(content.startedAtLabel).font(.system(size: 12)).lineLimit(1).minimumScaleFactor(0.85)
          .foregroundStyle(secondary)
        Spacer(minLength: 0)
        if let url = URL(string: content.endUrl) {
          Link(destination: url) {
            Text(content.endLabel).font(.system(size: 13, weight: .semibold)).lineLimit(1)
              .padding(.horizontal, 16).padding(.vertical, 11).frame(minHeight: 42)
              .foregroundStyle(Color(hex: content.buttonTextColor))
              .background(accent, in: Capsule())
          }.fixedSize(horizontal: true, vertical: false)
        }
      }.padding(.top, 8)
    }
    .foregroundStyle(foreground)
    .padding(14)
    .background(alignment: .bottomTrailing) {
      ArcLogo(assetName: "ArcNotificationWatermark").foregroundStyle(accent).opacity(0.14).frame(width: 174, height: 131)
        .offset(x: 20, y: 14)
    }
    .clipped()
  }
}

struct GymSessionLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: GymSessionAttributes.self) { context in
      GymSessionBanner(content: context.state, startedAt: context.attributes.startedAt)
        .activityBackgroundTint(Color(hex: context.state.backgroundColor))
        .activitySystemActionForegroundColor(Color(hex: context.state.textColor))
        .widgetURL(URL(string: context.state.openUrl))
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          ArcLogo(assetName: "ArcNotificationIsland").foregroundStyle(Color(hex: context.state.accentColor)).frame(width: 26, height: 20)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(context.attributes.startedAt, style: .timer).monospacedDigit().frame(width: 100)
        }
        DynamicIslandExpandedRegion(.bottom) {
          GymSessionBanner(content: context.state, startedAt: context.attributes.startedAt, isDynamicIsland: true)
        }
      } compactLeading: {
        ArcLogo(assetName: "ArcNotificationIsland").foregroundStyle(Color(hex: context.state.accentColor)).frame(width: 24, height: 18)
      } compactTrailing: {
        Text(context.attributes.startedAt, style: .timer).monospacedDigit()
          .foregroundStyle(Color(hex: context.state.accentColor)).lineLimit(1).minimumScaleFactor(0.7).frame(width: 72)
      } minimal: {
        ArcLogo(assetName: "ArcNotificationIsland").foregroundStyle(Color(hex: context.state.accentColor)).frame(width: 22, height: 18)
      }
      .widgetURL(URL(string: context.state.openUrl))
      .keylineTint(Color(hex: context.state.accentColor))
    }
  }
}

@main
struct GymSessionWidgets: WidgetBundle {
  var body: some Widget { GymSessionLiveActivity() }
}
