package dev.arctimer.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

private const val NOTIFICATION_ID = 5701
private const val CHANNEL_ID = "gym_session_active"
private const val PREFERENCES = "arc_gym_notifications"
private const val SESSION_ID = "sessionId"
private const val DISMISSED_SESSION = "dismissedSessionId"

class GymSessionDismissReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val sessionId = intent.getStringExtra(SESSION_ID) ?: return
    context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
      .edit().putString(DISMISSED_SESSION, sessionId).apply()
  }
}

class GymSessionNotificationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("GymSessionNotifications")

    AsyncFunction("present") { serialized: String ->
      val context = requireNotNull(appContext.reactContext)
      if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return@AsyncFunction false
      val content = JSONObject(serialized)
      val sessionId = content.getString(SESSION_ID)
      val preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
      if (preferences.getString(DISMISSED_SESSION, null) == sessionId) return@AsyncFunction false

      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        manager.createNotificationChannel(NotificationChannel(
          CHANNEL_ID, content.getString("channelName"), NotificationManager.IMPORTANCE_LOW
        ).apply { setSound(null, null); enableVibration(false) })
      }

      val openIntent = openApp(context, content.getString("openUrl"), 0)
      val endIntent = openApp(context, content.getString("endUrl"), 1)
      val deleteIntent = PendingIntent.getBroadcast(
        context, 2, Intent(context, GymSessionDismissReceiver::class.java)
          .setData(Uri.parse(content.getString("openUrl"))).putExtra(SESSION_ID, sessionId),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      val collapsed = layout(context, R.layout.gym_session_notification, content)
      val expanded = layout(context, R.layout.gym_session_notification_expanded, content)
      expanded.setOnClickPendingIntent(R.id.gym_end, endIntent)
      expanded.setTextViewText(R.id.gym_end, content.getString("endLabel"))
      expanded.setTextColor(R.id.gym_end, Color.parseColor(content.getString("buttonTextColor")))
      expanded.setInt(R.id.gym_end_background, "setColorFilter", Color.parseColor(content.getString("accentColor")))
      expanded.setTextViewText(R.id.gym_started, content.getString("startedAtLabel"))
      expanded.setTextColor(R.id.gym_started, Color.parseColor(content.getString("secondaryTextColor")))

      val notification = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(R.drawable.arc_notification_logo)
        .setContentTitle(content.getString("title"))
        .setContentText(content.getString("planName"))
        .setColor(Color.parseColor(content.getString("accentColor")))
        .setContentIntent(openIntent)
        .setDeleteIntent(deleteIntent)
        .setCustomContentView(collapsed)
        .setCustomBigContentView(expanded)
        .setStyle(NotificationCompat.DecoratedCustomViewStyle())
        .setWhen(content.getDouble("startedAtMs").toLong())
        .setShowWhen(false)
        .setOnlyAlertOnce(true)
        .setOngoing(true)
        .setAutoCancel(false)
        .setSilent(true)
        .setCategory(NotificationCompat.CATEGORY_STATUS)
        .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
        .build()

      manager.notify(NOTIFICATION_ID, notification)
      true
    }

    AsyncFunction("dismiss") {
      val context = requireNotNull(appContext.reactContext)
      NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID)
      context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE).edit().clear().apply()
    }
  }

  private fun openApp(context: Context, url: String, requestCode: Int): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    return PendingIntent.getActivity(context, requestCode, intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  private fun layout(context: Context, layoutId: Int, content: JSONObject): RemoteViews {
    val accent = Color.parseColor(content.getString("accentColor"))
    val foreground = Color.parseColor(content.getString("textColor"))
    val secondary = Color.parseColor(content.getString("secondaryTextColor"))
    val elapsedMs = (System.currentTimeMillis() - content.getDouble("startedAtMs").toLong()).coerceAtLeast(0)
    return RemoteViews(context.packageName, layoutId).apply {
      setInt(R.id.gym_background, "setColorFilter", Color.parseColor(content.getString("backgroundColor")))
      setInt(R.id.gym_watermark, "setColorFilter", accent)
      setTextViewText(R.id.gym_title, content.getString("title"))
      setTextColor(R.id.gym_title, foreground)
      setTextViewText(R.id.gym_plan, content.getString("planName"))
      setViewVisibility(R.id.gym_plan, if (content.getString("planName") == content.getString("title")) View.GONE else View.VISIBLE)
      setTextColor(R.id.gym_plan, secondary)
      setTextColor(R.id.gym_timer, foreground)
      setTextViewText(R.id.gym_elapsed_label, content.getString("elapsedLabel"))
      setTextColor(R.id.gym_elapsed_label, secondary)
      setChronometer(R.id.gym_timer, SystemClock.elapsedRealtime() - elapsedMs, null, true)
    }
  }
}
