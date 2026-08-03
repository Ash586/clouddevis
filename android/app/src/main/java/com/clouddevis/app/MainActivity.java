package com.clouddevis.app;

import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ProgressBar progressBar;
    private Handler mainHandler;

    private static final String APP_URL = "https://clouddevis.vercel.app/app";
    private static final String APP_URL_DEV = "http://10.0.2.2:3000/app";

    private ValueCallback<Uri[]> filePathCallback;
    private ActivityResultLauncher<String> filePicker;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mainHandler = new Handler(Looper.getMainLooper());

        filePicker = registerForActivityResult(
                new ActivityResultContracts.GetContent(),
                uri -> {
                    if (filePathCallback != null) {
                        filePathCallback.onReceiveValue(uri != null ? new Uri[]{uri} : null);
                        filePathCallback = null;
                    }
                }
        );

        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        setupStatusBar();
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressbar);

        setupWebView();
        setupWindowInsetsPolyfill();
        webView.loadUrl(APP_URL);
    }

    private void setupWindowInsetsPolyfill() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            int top = systemBars.top;
            int bottom = systemBars.bottom;
            injectSafeAreaInsets(top, bottom);
            return insets;
        });
    }

    private void injectSafeAreaInsets(int topPx, int bottomPx) {
        if (webView == null) return;
        float density = getResources().getDisplayMetrics().density;
        int topDp = Math.round(topPx / density);
        int bottomDp = Math.round(bottomPx / density);
        String js = "(function(){" +
                "var s=document.documentElement.style;" +
                "s.setProperty('--sat','" + topDp + "px');" +
                "s.setProperty('--sab','" + bottomDp + "px');" +
                "})()";
        webView.evaluateJavascript(js, null);
    }

    private void setupStatusBar() {
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#F8FAFD"));
        window.setNavigationBarColor(Color.parseColor("#F8FAFD"));

        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(true);
            controller.setAppearanceLightNavigationBars(true);
        }
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSaveFormData(true);
        settings.setBlockNetworkImage(false);
        settings.setLoadsImagesAutomatically(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
        }

        webView.addJavascriptInterface(new WebAppInterface(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    if (!url.contains("clouddevis") && !url.contains("vercel.app")
                            && !url.contains("localhost")) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            startActivity(intent);
                        } catch (Exception ignored) {
                        }
                        return true;
                    }
                }
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    view.post(() -> {
                        String fallback = "<html><body style='display:flex;align-items:center;" +
                                "justify-content:center;height:100vh;font-family:system-ui;" +
                                "background:#0F2747;color:white;text-align:center;padding:20px'>" +
                                "<div><h2 style='margin:0 0 12px'> connexion Internet </h2>" +
                                "<p style='opacity:0.7;margin:0'>Vrifiez votre connexion et ressayez.</p>" +
                                "<button onclick='location.reload()' style='margin-top:16px;padding:10px 24px;" +
                                "background:#14B8A6;color:white;border:none;border-radius:8px;font-size:14px;" +
                                "cursor:pointer'>Ressayer</button></div></body></html>";
                        view.loadDataWithBaseURL(null, fallback, "text/html", "UTF-8", null);
                    });
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
                    Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                    injectSafeAreaInsets(systemBars.top, systemBars.bottom);
                    return insets;
                });
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                try {
                    filePicker.launch(params != null && params.getAcceptTypes() != null
                            && params.getAcceptTypes().length > 0
                            ? params.getAcceptTypes()[0] : "image/*");
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                return true;
            }

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript(
                "(function(){if(typeof window.__cdBackPress==='function'){window.__cdBackPress();return true;}return false;})()",
                value -> {
                    // If JS didn't handle it (returned false/undefined), use default behavior
                    if (value == null || "false".equals(value) || "null".equals(value)) {
                        mainHandler.post(() -> {
                            if (webView.canGoBack()) {
                                webView.goBack();
                            } else {
                                finishAffinity();
                                System.exit(0);
                            }
                        });
                    }
                }
        );
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        notifyAppStateChanged(true);
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
        notifyAppStateChanged(false);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_MENU) {
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private void notifyAppStateChanged(boolean isActive) {
        String js = "(function(){if(typeof window.__cdAppStateChange==='function'){window.__cdAppStateChange(" + isActive + ");}return true;})()";
        webView.evaluateJavascript(js, null);
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        NetworkCapabilities caps = cm.getNetworkCapabilities(cm.getActiveNetwork());
        return caps != null && (
                caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
                        caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
        );
    }

    // ================================================================
    // JS Bridge
    // ================================================================
    class WebAppInterface {

        @JavascriptInterface
        public void downloadFile(String base64Data, String fileName) {
            mainHandler.post(() -> {
                try {
                    byte[] decoded = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);
                    File cacheDir = new File(getCacheDir(), "downloads");
                    cacheDir.mkdirs();
                    File file = new File(cacheDir, fileName);
                    FileOutputStream fos = new FileOutputStream(file);
                    fos.write(decoded);
                    fos.flush();
                    fos.close();

                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    if (dm != null) {
                        DownloadManager.Request request = new DownloadManager.Request(Uri.fromFile(file));
                        request.setTitle(fileName);
                        request.setDescription("Telechargement en cours...");
                        request.setNotificationVisibility(
                                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(
                                android.os.Environment.DIRECTORY_DOWNLOADS, fileName);
                        dm.enqueue(request);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
        }

        @JavascriptInterface
        public void downloadFileDirect(String base64Data, String fileName, String mimeType) {
            mainHandler.post(() -> {
                try {
                    byte[] decoded = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);
                    File cacheDir = new File(getCacheDir(), "shared");
                    cacheDir.mkdirs();
                    File file = new File(cacheDir, fileName);
                    FileOutputStream fos = new FileOutputStream(file);
                    fos.write(decoded);
                    fos.flush();
                    fos.close();

                    Uri uri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getPackageName() + ".fileprovider",
                            file);

                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setDataAndType(uri, mimeType != null ? mimeType : "application/pdf");
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(intent);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        @JavascriptInterface
        public void shareFile(String base64Data, String fileName, String title) {
            mainHandler.post(() -> {
                try {
                    byte[] decoded = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);
                    File cacheDir = new File(getCacheDir(), "shared");
                    cacheDir.mkdirs();
                    File file = new File(cacheDir, fileName);
                    FileOutputStream fos = new FileOutputStream(file);
                    fos.write(decoded);
                    fos.flush();
                    fos.close();

                    Uri uri = FileProvider.getUriForFile(
                            MainActivity.this,
                            getPackageName() + ".fileprovider",
                            file);

                    Intent share = new Intent(Intent.ACTION_SEND);
                    share.setType("application/pdf");
                    share.putExtra(Intent.EXTRA_STREAM, uri);
                    if (title != null && !title.isEmpty()) {
                        share.putExtra(Intent.EXTRA_TEXT, title);
                    }
                    share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(share, "Partager"));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }

        @JavascriptInterface
        public void vibrate(int milliseconds) {
            mainHandler.post(() -> {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        VibratorManager vm = (VibratorManager) getSystemService(VIBRATOR_MANAGER_SERVICE);
                        if (vm != null) {
                            Vibrator v = vm.getDefaultVibrator();
                            v.vibrate(VibrationEffect.createOneShot(
                                    milliseconds > 0 ? milliseconds : 50,
                                    VibrationEffect.DEFAULT_AMPLITUDE));
                        }
                    } else {
                        Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                        if (v != null && v.hasVibrator()) {
                            v.vibrate(VibrationEffect.createOneShot(
                                    milliseconds > 0 ? milliseconds : 50,
                                    VibrationEffect.DEFAULT_AMPLITUDE));
                        }
                    }
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void setStatusBarColor(String color) {
            mainHandler.post(() -> {
                try {
                    getWindow().setStatusBarColor(Color.parseColor(color));
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void setNavigationBarColor(String color) {
            mainHandler.post(() -> {
                try {
                    getWindow().setNavigationBarColor(Color.parseColor(color));
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void exitApp() {
            mainHandler.post(() -> {
                finishAffinity();
                System.exit(0);
            });
        }

        @JavascriptInterface
        public void goBack() {
            mainHandler.post(() -> {
                if (webView.canGoBack()) {
                    webView.goBack();
                }
            });
        }

        @JavascriptInterface
        public boolean isOnline() {
            return isNetworkAvailable();
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "1.0.0";
            }
        }

        @JavascriptInterface
        public String getPlatform() {
            return "android";
        }

        @JavascriptInterface
        public void copyToClipboard(String text) {
            mainHandler.post(() -> {
                try {
                    android.content.ClipboardManager cm =
                            (android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                    if (cm != null) {
                        android.content.ClipData clip = android.content.ClipData.newPlainText("CloudDevis", text);
                        cm.setPrimaryClip(clip);
                    }
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void openUrl(String url) {
            mainHandler.post(() -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public void setKeepScreenOn(boolean keep) {
            mainHandler.post(() -> {
                if (keep) {
                    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                } else {
                    getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        @JavascriptInterface
        public String getDeviceInfo() {
            return "{"
                    + "\"model\":\"" + Build.MODEL + "\","
                    + "\"brand\":\"" + Build.BRAND + "\","
                    + "\"sdk\":" + Build.VERSION.SDK_INT + ","
                    + "\"release\":\"" + Build.VERSION.RELEASE + "\""
                    + "}";
        }
    }
}
