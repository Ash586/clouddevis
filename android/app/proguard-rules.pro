# CloudDevis — ProGuard Rules

# WebView JS Interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep the WebAppInterface class
-keep class com.clouddevis.app.MainActivity$WebAppInterface { *; }

# Preserve line numbers for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
