package ro.calculatorsalariu.app

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.util.TypedValue
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebStorage
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams

class MainActivity : AppCompatActivity(), PurchasesUpdatedListener {

    private lateinit var rootLayout: FrameLayout
    private lateinit var webView: WebView
    private lateinit var billingClient: BillingClient
    private var adView: AdView? = null
    private var adsInitialized: Boolean = false
    private var adHiddenByPremium: Boolean = true
    private var premiumProductDetails: ProductDetails? = null
    private var billingUiState: String = "idle"
    private var currentAppUserId: String? = null
    private var currentAppUserEmail: String? = null
    private var webAppReady: Boolean = false
    private var restoreInProgress: Boolean = false
    private var hasActivePlaySubscription: Boolean = false
    private var billingStatusResolved: Boolean = false
    private val pendingJsScripts = mutableListOf<String>()
    companion object {
        private const val PREMIUM_PRODUCT_ID = "premium_monthly"
        private const val TAG = "CalcSalaryBilling"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT
        WindowInsetsControllerCompat(window, window.decorView).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }

        setupBillingClient()
        setupAds()

        rootLayout = FrameLayout(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        webView = WebView(this).apply {
            clearCache(true)
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                cacheMode = WebSettings.LOAD_NO_CACHE
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            }

            addJavascriptInterface(AndroidBillingBridge(), "AndroidBilling")
            addJavascriptInterface(AndroidDeviceBridge(), "AndroidDevice")
            addJavascriptInterface(AndroidAdsBridge(), "AndroidAds")

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean = false

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    webAppReady = true
                    flushPendingJsScripts()
                    evaluateJs("window.handleBillingState && window.handleBillingState('${billingUiState.escapeForJs()}');")
                }
            }
            webChromeClient = WebChromeClient()
        }

        rootLayout.addView(webView)
        attachBannerAdIfNeeded()
        setContentView(rootLayout)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (this@MainActivity::webView.isInitialized && webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        if (savedInstanceState != null) {
            webAppReady = false
            webView.restoreState(savedInstanceState)
        } else {
            webAppReady = false
            webView.loadUrl("file:///android_asset/app/index.html")
        }
    }

    private fun hardResetWebSessionAndReload() {
        runOnUiThread {
            try {
                CookieManager.getInstance().removeAllCookies(null)
                CookieManager.getInstance().flush()
            } catch (e: Exception) {
                Log.w(TAG, "Cookie clear failed", e)
            }
            try {
                WebStorage.getInstance().deleteAllData()
            } catch (e: Exception) {
                Log.w(TAG, "WebStorage clear failed", e)
            }
            try {
                webView.clearCache(true)
                webView.clearHistory()
                webView.clearFormData()
                webView.loadUrl("file:///android_asset/app/index.html?logoutClean=" + System.currentTimeMillis())
            } catch (e: Exception) {
                Log.w(TAG, "WebView hard reset failed", e)
            }
        }
    }

    private fun setupBillingClient() {
        updateBillingUiState("checking")
        val pendingPurchasesParams = PendingPurchasesParams.newBuilder()
            .enableOneTimeProducts()
            .enablePrepaidPlans()
            .build()

        billingClient = BillingClient.newBuilder(this)
            .setListener(this)
            .enablePendingPurchases(pendingPurchasesParams)
            .build()

        startBillingConnection()
    }

    private fun startBillingConnection(onReady: (() -> Unit)? = null) {
        updateBillingUiState("checking")
        if (billingClient.isReady) {
            queryPremiumProduct(onReady)
            return
        }

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryExistingPurchases(explicitRestore = false)
                    queryPremiumProduct { onReady?.invoke() }
                } else {
                    updateBillingUiState("unavailable")
                    sendBillingDebug("Google Play Billing nu este disponibil momentan", billingResult)
                }
            }

            override fun onBillingServiceDisconnected() {
                updateBillingUiState("unavailable")
                sendBillingMessage("Conexiunea cu Google Play a fost întreruptă. Reîncearcă peste câteva secunde.")
                Log.w(TAG, "Billing service disconnected")
            }
        })
    }

    private fun queryPremiumProduct(onReady: (() -> Unit)? = null) {
        val product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(PREMIUM_PRODUCT_ID)
            .setProductType(BillingClient.ProductType.SUBS)
            .build()

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(listOf(product))
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, result ->
            val productDetailsList = result.productDetailsList
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                premiumProductDetails = productDetailsList.firstOrNull()
                if (premiumProductDetails == null) {
                    updateBillingUiState("unavailable")
                    sendBillingDebug("Abonamentul Premium nu este găsit pentru aplicația instalată. Verifică product id, trackul de testare și propagarea Google Play", billingResult)
                } else {
                    val offersCount = premiumProductDetails?.subscriptionOfferDetails?.size ?: 0
                    Log.d(TAG, "Product loaded: $PREMIUM_PRODUCT_ID, offers=$offersCount")
                    updateBillingUiState("ready")
                    onReady?.invoke()
                }
            } else {
                updateBillingUiState("unavailable")
                sendBillingDebug("Nu s-au putut încărca detaliile abonamentului", billingResult)
            }
        }
    }

    private fun launchPremiumPurchase() {
        updateBillingUiState("processing")
        startBillingConnection {
            val details = premiumProductDetails
            if (details == null) {
                updateBillingUiState("unavailable")
                sendBillingMessage("Abonamentul Premium nu este disponibil momentan.")
                return@startBillingConnection
            }

            val availableOffers = details.subscriptionOfferDetails.orEmpty().filter { !it.offerToken.isNullOrBlank() }
            val selectedOffer = availableOffers.firstOrNull { offer ->
                offer.basePlanId == "monthly" && offer.offerId.isNullOrBlank()
            } ?: availableOffers.firstOrNull { offer ->
                offer.basePlanId == "monthly"
            } ?: availableOffers.firstOrNull()

            val offerToken = selectedOffer?.offerToken
            if (offerToken.isNullOrBlank()) {
                updateBillingUiState("unavailable")
                sendBillingMessage("Nu există încă o ofertă activă pentru acest abonament în Google Play Console. Intră la Premium Lunar → plan monthly → activează oferta/base plan și așteaptă propagarea.")
                return@startBillingConnection
            }
            val offerDebug = "product=${details.productId}, offers=${availableOffers.size}, basePlan=${selectedOffer.basePlanId}, offerId=${selectedOffer.offerId ?: "none"}, token=${if (offerToken.isBlank()) "missing" else "ok"}"
            Log.d(TAG, "Launching billing flow with $offerDebug, tags=${selectedOffer.offerTags}")
            sendBillingMessage("Diagnostic Billing: $offerDebug. Se deschide Google Play...")

            val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(details)
                .setOfferToken(offerToken)
                .build()

            val flowBuilder = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(listOf(productDetailsParams))

            currentAppUserId?.takeIf { it.isNotBlank() }?.let { uid ->
                flowBuilder.setObfuscatedAccountId(uid.take(64))
            }

            val billingFlowParams = flowBuilder.build()

            val launchResult = billingClient.launchBillingFlow(this@MainActivity, billingFlowParams)
            Log.d(TAG, "launchBillingFlow response=${launchResult.responseCode}, message=${launchResult.debugMessage}")
            if (launchResult.responseCode == BillingClient.BillingResponseCode.OK) {
                sendBillingMessage("Google Play Billing a pornit corect checkout-ul. Dacă apare eroare după acest pas, vine din Play Store/Payments, nu din buton.")
            }
            if (launchResult.responseCode != BillingClient.BillingResponseCode.OK) {
                if (launchResult.responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                    queryExistingPurchases(explicitRestore = true)
                } else {
                    updateBillingUiState("error")
                    sendBillingDebug("Nu s-a putut porni plata", launchResult)
                }
            }
        }
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        when (billingResult.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                if (purchases.isNullOrEmpty()) {
                    updateBillingUiState("ready")
                    sendBillingMessage("Google Play a întors OK, dar fără purchase. Nu activez Premium fără abonament real.")
                } else {
                    sendBillingMessage("Google Play a întors ${purchases.size} purchase-uri. Verific abonamentul premium...")
                    purchases.forEach { handlePurchase(it, grantAccess = true, source = "purchase") }
                }
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                updateBillingUiState("ready")
                sendBillingMessage("Plata a fost anulată.")
            }
            else -> {
                updateBillingUiState("error")
                sendBillingDebug("Eroare la plată", billingResult)
            }
        }
    }

    private fun queryExistingPurchases(explicitRestore: Boolean) {
        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()
        billingClient.queryPurchasesAsync(params) { billingResult, purchases ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                billingStatusResolved = true
                val validPremiumPurchases = purchases.filter { isValidPremiumSubscription(it) }

                if (validPremiumPurchases.isEmpty()) {
                    hasActivePlaySubscription = false
                    restoreInProgress = false
                    updateBillingUiState("ready")
                    notifyNoPlaySubscription()
                    if (explicitRestore) {
                        val hasCanceledOrInvalidPremium = purchases.any { it.products.contains(PREMIUM_PRODUCT_ID) }
                        val msg = if (hasCanceledOrInvalidPremium) {
                            "Am găsit un abonament Premium în Google Play, dar nu este eligibil pentru restaurare. Dacă l-ai anulat, aplicația îl păstrează FREE."
                        } else {
                            "Nu există niciun abonament Premium activ pentru acest cont Google Play."
                        }
                        sendBillingMessage(msg)
                    }
                    return@queryPurchasesAsync
                }

                validPremiumPurchases.forEach {
                    handlePurchase(it, grantAccess = true, source = if (explicitRestore) "restore" else "detected")
                }
            } else {
                billingStatusResolved = false
                restoreInProgress = false
                updateBillingUiState("ready")
                if (explicitRestore) {
                    sendBillingDebug("Nu s-a putut verifica abonamentul premium", billingResult)
                }
            }
        }
    }

    private fun isValidPremiumSubscription(purchase: Purchase): Boolean {
        val hasPremiumProduct = purchase.products.contains(PREMIUM_PRODUCT_ID)
        val isPurchased = purchase.purchaseState == Purchase.PurchaseState.PURCHASED
        val isAutoRenewing = try { purchase.isAutoRenewing } catch (_: Exception) { false }
        Log.d(TAG, "Restore check: products=${purchase.products}, state=${purchase.purchaseState}, acknowledged=${purchase.isAcknowledged}, autoRenewing=$isAutoRenewing, orderId=${purchase.orderId}")
        return hasPremiumProduct && isPurchased && isAutoRenewing
    }

    private fun restorePremiumPurchases() {
        if (restoreInProgress) {
            sendBillingMessage("Restore Premium este deja în curs.")
            return
        }
        restoreInProgress = true
        updateBillingUiState("checking")
        startBillingConnection {
            queryExistingPurchases(explicitRestore = true)
            sendBillingMessage("Se verifică abonamentul premium din Google Play…")
        }
    }

    private fun refreshDetectedPurchasesSilently() {
        if (!this::billingClient.isInitialized || !billingClient.isReady) return
        queryExistingPurchases(explicitRestore = false)
    }

    private fun handlePurchase(purchase: Purchase, grantAccess: Boolean, source: String) {
        if (!isValidPremiumSubscription(purchase)) {
            restoreInProgress = false
            hasActivePlaySubscription = false
            updateBillingUiState("ready")
            if (source == "restore") {
                sendBillingMessage("Restore refuzat: nu există un abonament Premium activ și auto-reînnoibil pentru acest cont Google Play.")
            }
            return
        }

        if (!purchase.isAcknowledged) {
            val params = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.purchaseToken)
                .build()
            billingClient.acknowledgePurchase(params) { result ->
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    dispatchPurchaseToWeb(purchase, grantAccess, source)
                } else {
                    restoreInProgress = false
                    updateBillingUiState("error")
                    sendBillingMessage("Plata a fost făcută, dar confirmarea a eșuat. Încearcă din nou.")
                }
            }
        } else {
            dispatchPurchaseToWeb(purchase, grantAccess, source)
        }
    }

    private fun dispatchPurchaseToWeb(purchase: Purchase, grantAccess: Boolean, source: String) {
        billingStatusResolved = true
        hasActivePlaySubscription = true
        val productId = purchase.products.firstOrNull().orEmpty().escapeForJs()
        val purchaseToken = purchase.purchaseToken.escapeForJs()
        if (grantAccess) {
            // Nu declarăm UI-ul final ca PREMIUM doar local.
            // Întâi trimitem purchase-ul către WebView/Firebase; UI-ul devine premium după confirmarea din Firestore.
            updateBillingUiState("processing")
            updateUserPremiumStatus(
                isPremium = true,
                plan = PREMIUM_PRODUCT_ID,
                premiumSource = "google_play"
            )
            val callback = if (source == "restore") {
                "window.handlePremiumRestored && window.handlePremiumRestored('$purchaseToken', '$productId');"
            } else {
                "window.handlePremiumActivated && window.handlePremiumActivated('$purchaseToken', '$productId');"
            }
            evaluateJs(callback)
            sendBillingMessage(if (source == "restore") "Google Play a confirmat abonamentul. Salvez Premium în Firebase..." else if (source == "detected") "Am găsit abonamentul activ în Google Play. Îl sincronizez cu Firebase..." else "Google Play a confirmat plata. Salvez Premium în Firebase...")
        } else {
            updateBillingUiState("ready")
            evaluateJs("window.handlePlaySubscriptionDetected && window.handlePlaySubscriptionDetected('$purchaseToken', '$productId');")
        }
        restoreInProgress = false
    }

    private fun notifyNoPlaySubscription() {
        // Nu mai retrogradăm automat userul în Firestore doar pentru că Play Billing nu vede un abonament.
        // Play Store poate raporta temporar gol/eroare în testing, iar asta ștergea Premium-ul corect.
        billingStatusResolved = true
        hasActivePlaySubscription = false
        evaluateJs("window.handlePlaySubscriptionCleared && window.handlePlaySubscriptionCleared();")
    }

    private fun syncBillingStatusForCurrentUser() {
        if (currentAppUserId.isNullOrBlank()) return

        if (billingStatusResolved) {
            syncPremiumStateForCurrentUser()
            return
        }

        if (this::billingClient.isInitialized && billingClient.isReady) {
            queryExistingPurchases(explicitRestore = false)
        } else {
            startBillingConnection {
                queryExistingPurchases(explicitRestore = false)
            }
        }
    }

    private fun updateUserPremiumStatus(
        isPremium: Boolean,
        plan: String = if (isPremium) PREMIUM_PRODUCT_ID else "free",
        premiumSource: String = if (isPremium) "google_play" else "none"
    ) {
        val uid = currentAppUserId?.trim().orEmpty()
        if (uid.isBlank()) return

        val email = currentAppUserEmail?.trim().orEmpty()
        val data = hashMapOf<String, Any>(
            "email" to email,
            "isPremium" to isPremium,
            "plan" to plan,
            "premiumSource" to premiumSource,
            "updatedAt" to FieldValue.serverTimestamp()
        )

        if (isPremium) {
            data["premiumSince"] = FieldValue.serverTimestamp()
        }

        FirebaseFirestore.getInstance()
            .document("users/$uid/profile/main")
            .set(data, SetOptions.merge())
            .addOnSuccessListener {
                Log.d(TAG, "Firebase premium profile updated: uid=$uid isPremium=$isPremium plan=$plan")
                if (isPremium) {
                    sendBillingMessage("Premium confirmat în Firebase pentru contul curent.")
                    evaluateJs("window.forceRefreshPremiumFromFirebase && window.forceRefreshPremiumFromFirebase('native_success');")
                }
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Firebase premium profile update failed", e)
                if (isPremium) {
                    sendBillingMessage("Google Play a confirmat Premium, dar Firebase nu a acceptat scrierea din native. Încerc sincronizarea din aplicație...")
                    evaluateJs("window.forceRefreshPremiumFromFirebase && window.forceRefreshPremiumFromFirebase('native_failed');")
                }
            }
    }

    private fun syncPremiumStateForCurrentUser() {
        if (!billingStatusResolved) return
        // IMPORTANT: nu mai scriem niciodată FREE automat din native Billing.
        // Google Play poate întoarce temporar listă goală/eroare în testing, iar asta strica profilul Firebase.
        // Scriem doar PREMIUM confirmat; retrogradarea pe FREE trebuie făcută server-side sau manual după expirare reală.
        if (hasActivePlaySubscription) {
            updateUserPremiumStatus(
                isPremium = true,
                plan = PREMIUM_PRODUCT_ID,
                premiumSource = "google_play"
            )
        }
    }


    private fun setupAds() {
        MobileAds.initialize(this) {
            adsInitialized = true
            updateAdVisibility()
        }
    }

    private fun attachBannerAdIfNeeded() {
        if (adView != null) return

        adView = AdView(this).apply {
            adUnitId = getString(R.string.admob_banner_unit_id)
            setAdSize(AdSize.BANNER)
            visibility = View.GONE
            adListener = object : AdListener() {
                override fun onAdLoaded() {
                    if (!adHiddenByPremium) {
                        this@apply.visibility = View.VISIBLE
                        updateWebViewBottomPadding(true)
                    }
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    this@apply.visibility = View.GONE
                    updateWebViewBottomPadding(false)
                }
            }
        }

        val params = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
        }

        rootLayout.addView(adView, params)
        updateAdVisibility()
    }

    private fun updateAdVisibility() {
        val banner = adView ?: return
        if (adHiddenByPremium) {
            banner.visibility = View.GONE
            updateWebViewBottomPadding(false)
            return
        }

        updateWebViewBottomPadding(true)
        banner.visibility = View.VISIBLE
        if (adsInitialized) {
            banner.loadAd(AdRequest.Builder().build())
        }
    }

    private fun setPremiumAdsDisabled(isPremium: Boolean) {
        adHiddenByPremium = isPremium
        runOnUiThread { updateAdVisibility() }
    }

    private fun updateWebViewBottomPadding(adVisible: Boolean) {
        if (!this::webView.isInitialized) return
        val bottomPadding = if (adVisible) {
            TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                142f,
                resources.displayMetrics
            ).toInt()
        } else {
            0
        }
        webView.setPadding(0, 0, 0, bottomPadding)
    }

    private fun updateBillingUiState(state: String) {
        billingUiState = state
        runOnUiThread {
            val escaped = state.escapeForJs()
            evaluateJs("window.handleBillingState && window.handleBillingState('$escaped');")
        }
    }

    private fun sendBillingMessage(message: String) {
        runOnUiThread {
            val escaped = message.escapeForJs()
            evaluateJs("window.handleBillingMessage && window.handleBillingMessage('$escaped');")
        }
    }

    private fun billingCodeName(code: Int): String = when (code) {
        BillingClient.BillingResponseCode.OK -> "OK"
        BillingClient.BillingResponseCode.USER_CANCELED -> "USER_CANCELED"
        BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE -> "SERVICE_UNAVAILABLE"
        BillingClient.BillingResponseCode.BILLING_UNAVAILABLE -> "BILLING_UNAVAILABLE"
        BillingClient.BillingResponseCode.ITEM_UNAVAILABLE -> "ITEM_UNAVAILABLE"
        BillingClient.BillingResponseCode.DEVELOPER_ERROR -> "DEVELOPER_ERROR"
        BillingClient.BillingResponseCode.ERROR -> "INTERNAL_ERROR"
        BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> "ITEM_ALREADY_OWNED"
        BillingClient.BillingResponseCode.ITEM_NOT_OWNED -> "ITEM_NOT_OWNED"
        BillingClient.BillingResponseCode.NETWORK_ERROR -> "NETWORK_ERROR"
        else -> "UNKNOWN"
    }

    private fun sendBillingDebug(prefix: String, result: BillingResult) {
        val codeName = billingCodeName(result.responseCode)
        val message = "$prefix. Cod: ${result.responseCode} ($codeName). Detalii Google Play: ${result.debugMessage.ifBlank { "fără mesaj" }}"
        Log.w(TAG, message)
        sendBillingMessage(message)
    }

    private fun evaluateJs(script: String) {
        if (!this::webView.isInitialized) return
        if (!webAppReady) {
            pendingJsScripts.add(script)
            return
        }
        webView.post(Runnable { webView.evaluateJavascript(script, null) })
    }

    private fun flushPendingJsScripts() {
        if (!this::webView.isInitialized || !webAppReady || pendingJsScripts.isEmpty()) return
        val scripts = pendingJsScripts.toList()
        pendingJsScripts.clear()
        scripts.forEach { script ->
            webView.post(Runnable { webView.evaluateJavascript(script, null) })
        }
    }

    private fun String.escapeForJs(): String = this
        .replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "")

    inner class AndroidDeviceBridge {
        @JavascriptInterface
        fun getDeviceId(): String = DeviceUtils.getDeviceId(this@MainActivity)
    }

    inner class AndroidBillingBridge {
        @JavascriptInterface
        fun startPremiumPurchase() {
            runOnUiThread { launchPremiumPurchase() }
        }

        @JavascriptInterface
        fun getBillingState(): String = billingUiState

        @JavascriptInterface
        fun restorePremiumPurchases() {
            runOnUiThread { this@MainActivity.restorePremiumPurchases() }
        }

        @JavascriptInterface
        fun setCurrentAppUser(uid: String?, email: String?) {
            currentAppUserId = uid?.trim()?.takeIf { it.isNotEmpty() }
            currentAppUserEmail = email?.trim()?.takeIf { it.isNotEmpty() }
            syncBillingStatusForCurrentUser()
        }

        @JavascriptInterface
        fun clearCurrentAppUser() {
            currentAppUserId = null
            currentAppUserEmail = null
        }

        @JavascriptInterface
        fun hardLogoutAndReload() {
            currentAppUserId = null
            currentAppUserEmail = null
            billingStatusResolved = false
            hasActivePlaySubscription = false
            hardResetWebSessionAndReload()
        }
    }

    inner class AndroidAdsBridge {
        @JavascriptInterface
        fun setPremiumStatus(isPremium: Boolean) {
            setPremiumAdsDisabled(isPremium)
        }

        @JavascriptInterface
        fun refreshBanner() {
            runOnUiThread { updateAdVisibility() }
        }
    }


    override fun onResume() {
        super.onResume()
        if (!restoreInProgress && this::billingClient.isInitialized && billingClient.isReady) {
            refreshDetectedPurchasesSilently()
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        if (this::webView.isInitialized) {
            webView.saveState(outState)
        }
    }

    override fun onDestroy() {
        if (this::billingClient.isInitialized && billingClient.isReady) {
            billingClient.endConnection()
        }
        adView?.destroy()
        adView = null
        super.onDestroy()
    }
}
