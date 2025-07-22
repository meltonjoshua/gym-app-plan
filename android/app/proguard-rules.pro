# FitTracker Pro - Android ProGuard Configuration
# This file contains rules for code obfuscation and optimization

# Keep application class
-keep public class com.fittrackerpro.app.MainApplication { *; }

# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.yoga.** { *; }
-keep class com.facebook.flipper.** { *; }

# Keep Expo classes
-keep class expo.** { *; }
-keep class host.exp.** { *; }

# Keep JavaScript interface classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep Google Play Billing
-keep class com.android.billingclient.api.** { *; }
-keep class com.android.vending.billing.** { *; }

# Keep fitness and health related classes
-keep class androidx.health.** { *; }
-keep class com.google.android.gms.fitness.** { *; }
-keep class com.google.android.gms.auth.** { *; }

# Keep camera and media classes
-keep class androidx.camera.** { *; }
-keep class androidx.media.** { *; }

# Keep location services
-keep class com.google.android.gms.location.** { *; }
-keep class com.google.android.gms.maps.** { *; }

# Keep networking classes
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }
-dontwarn okhttp3.**
-dontwarn retrofit2.**

# Keep JSON parsing classes
-keep class com.google.gson.** { *; }
-keep class org.json.** { *; }

# Keep subscription and payment classes
-keep class com.revenuecat.purchases.** { *; }
-dontwarn com.revenuecat.purchases.**

# Keep analytics classes
-keep class com.google.android.gms.analytics.** { *; }
-keep class com.facebook.appevents.** { *; }

# Keep push notification classes
-keep class com.google.firebase.messaging.** { *; }
-keep class expo.modules.notifications.** { *; }

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Remove debug code
-assumenosideeffects class java.io.PrintStream {
    public void println(...);
    public void print(...);
}

# Optimize for size
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Keep custom model classes (add your specific model classes here)
-keep class com.fittrackerpro.app.models.** { *; }

# Keep native library loading
-keep class com.fittrackerpro.app.** {
    native <methods>;
}

# Specific rules for fitness tracking
-keep class ** extends java.util.ListResourceBundle {
    protected java.lang.Object[][] getContents();
}

# Keep custom views and their constructors
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}

-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep custom exceptions
-keep public class * extends java.lang.Exception

# Application specific rules
-keep class com.fittrackerpro.app.BuildConfig { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Expo modules
-keep class expo.modules.** { *; }

# Final optimizations
-dontskipnonpubliclibraryclassmembers
-dontoptimize
-printmapping mapping.txt
