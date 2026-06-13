# CloudDevis — ProGuard Rules for Capacitor

# ── Capacitor Core ──────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep class com.capacitor.** { *; }
-keep class com.capacitor.plugins.** { *; }

# ── Capacitor Community Plugins ─────────────────────────────
-keep class com.capacitor.community.** { *; }

# ── Cordova Plugins ────────────────────────────────────────
-keep class org.apache.cordova.** { *; }
-keep class org.apache.cordova.** { *; }
-keepattributes *Annotation*

# ── WebView JS Interface ───────────────────────────────────
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Preserve line numbers for crash reports ────────────────
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Prevent stripping of Capacitor plugin registration ────
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.PluginMethod { *; }
