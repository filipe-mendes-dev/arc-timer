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

  var body: some View {
    let accent = Color(hex: content.accentColor)
    let foreground = Color(hex: content.textColor)
    let secondary = Color(hex: content.secondaryTextColor)
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
        DynamicIslandExpandedRegion(.bottom) {
          VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 8) {
              HStack(spacing: 5) {
                ArcLogo(assetName: "ArcNotificationIsland")
                  .foregroundStyle(Color(hex: context.state.accentColor)).frame(width: 18, height: 14)
                Text(context.state.title).font(.system(size: 13, weight: .semibold))
                  .lineLimit(1).minimumScaleFactor(0.85)
              }
              Spacer(minLength: 0)
              HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(context.attributes.startedAt, style: .timer).monospacedDigit()
                  .font(.system(size: 22, weight: .bold)).lineLimit(1).minimumScaleFactor(0.7)
                  .multilineTextAlignment(.trailing).frame(width: 90, alignment: .trailing)
                Text(context.state.elapsedLabel).font(.system(size: 10)).lineLimit(1)
                  .foregroundStyle(.white.opacity(0.7))
              }
            }
            if context.state.planName != context.state.title {
              Text(context.state.planName).font(.system(size: 13)).lineLimit(1)
            }
            HStack(spacing: 8) {
              Text(context.state.startedAtLabel).font(.system(size: 11)).lineLimit(1)
                .minimumScaleFactor(0.85).foregroundStyle(.white.opacity(0.7))
              Spacer(minLength: 0)
              if let url = URL(string: context.state.endUrl) {
                Link(destination: url) {
                  Text(context.state.endLabel).font(.system(size: 13, weight: .semibold)).lineLimit(1)
                    .padding(.horizontal, 12).padding(.vertical, 9).frame(minHeight: 42)
                    .foregroundStyle(Color(hex: context.state.buttonTextColor))
                    .background(Color(hex: context.state.accentColor), in: Capsule())
                }.fixedSize(horizontal: true, vertical: false)
              }
            }.padding(.top, 4)
          }
          .foregroundStyle(.white)
          .background(alignment: .bottomTrailing) {
            ArcLogo(assetName: "ArcNotificationWatermark")
              .foregroundStyle(Color(hex: context.state.accentColor)).opacity(0.14)
              .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
          }
          .clipped()
          .padding(4)
        }
      } compactLeading: {
        ArcLogo(assetName: "ArcNotificationIsland").foregroundStyle(Color(hex: context.state.accentColor)).frame(width: 18, height: 14)
      } compactTrailing: {
        Text(context.attributes.startedAt, style: .timer).monospacedDigit()
          .font(.system(size: 12, weight: .semibold))
          .foregroundStyle(Color(hex: context.state.accentColor)).lineLimit(1).minimumScaleFactor(0.7)
          .multilineTextAlignment(.trailing).frame(width: 36, alignment: .trailing)
      } minimal: {
        ArcLogo(assetName: "ArcNotificationIsland").foregroundStyle(Color(hex: context.state.accentColor)).frame(width: 22, height: 18)
      }
      .widgetURL(URL(string: context.state.openUrl))
      .contentMargins(.leading, 12, for: .compactLeading)
      .contentMargins(.trailing, 4, for: .compactLeading)
      .contentMargins(.leading, 4, for: .compactTrailing)
      .contentMargins(.trailing, 12, for: .compactTrailing)
      .keylineTint(Color(hex: context.state.accentColor))
    }
  }
}

@main
struct GymSessionWidgets: WidgetBundle {
  var body: some Widget { GymSessionLiveActivity() }
}
