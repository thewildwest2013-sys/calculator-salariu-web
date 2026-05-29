
    const firebaseConfig = {
      apiKey: "AIzaSyBXPDyeKhybf7mPqPU3rSQQ5G2pIPgZHYg",
      authDomain: "calculator-salariu-60957.firebaseapp.com",
      projectId: "calculator-salariu-60957",
      storageBucket: "calculator-salariu-60957.firebasestorage.app",
      messagingSenderId: "60185089263",
      appId: "1:60185089263:android:a2eac09d3ccefa8113f71a"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    try {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (e) {
      console.warn('Nu am putut seta persistența locală Firebase Auth:', e);
    }
    const db = firebase.firestore();

    // ── FREE USAGE TRACKING (mirrors web logic) ──────────────────
    const USAGE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

    async function readUsage(uid) {
      try {
        const doc = await db.collection('users').doc(uid).collection('usage').doc('main').get();
        if (!doc.exists) return { count: 0, windowStart: Date.now() };
        const d = doc.data();
        return { count: typeof d.count === 'number' ? d.count : 0, windowStart: typeof d.windowStart === 'number' ? d.windowStart : Date.now() };
      } catch(e) { return { count: 0, windowStart: Date.now() }; }
    }

    async function writeUsage(uid, data) {
      await db.collection('users').doc(uid).collection('usage').doc('main').set(data, { merge: true });
    }

    function normalizeUsageWindow(data) {
      const now = Date.now();
      if (!data.windowStart || now - data.windowStart >= USAGE_MONTH_MS) {
        return { count: 0, windowStart: now };
      }
      return data;
    }

    async function consumeUsage(uid, isPremium) {
      if (isPremium) return { allowed: true, remaining: 999999, shouldShowAd: false };
      const raw = await readUsage(uid);
      const data = normalizeUsageWindow(raw);
      const limit = 15;
      if (data.count >= limit) {
        return { allowed: false, remaining: 0, shouldShowAd: false, used: data.count };
      }
      data.count += 1;
      await writeUsage(uid, data);
      const shouldShowAd = data.count % 3 === 0;
      return { allowed: true, remaining: Math.max(0, limit - data.count), shouldShowAd, used: data.count };
    }

    async function getUsageStatus(uid, isPremium) {
      if (isPremium) return { allowed: true, remaining: 999999, shouldShowAd: false };
      const raw = await readUsage(uid);
      const data = normalizeUsageWindow(raw);
      const limit = 15;
      return {
        allowed: data.count < limit,
        remaining: Math.max(0, limit - data.count),
        shouldShowAd: false,
        used: data.count
      };
    }

    function showAdIfNeeded(shouldShowAd) {
      if (!shouldShowAd) return;
      try {
        if (window.AndroidAds?.showInterstitial) {
          window.AndroidAds.showInterstitial();
        }
      } catch(e) { console.log('Ad not available yet:', e); }
    }

    function updateUsageBadge(remaining, isPremium) {
      const badge = document.getElementById('usageBadge');
      if (!badge) return;
      if (isPremium) { badge.style.display = 'none'; return; }
      badge.style.display = 'flex';
      badge.textContent = translateDynamic('Calcule rămase:') + ' ' + remaining + '/15';
      badge.style.color = remaining <= 3 ? '#fda4af' : remaining <= 7 ? '#fbbf24' : '#94a3b8';
    }

    function canUseCalculator() {
      return !!state.currentUser && !!state.appUnlocked;
    }
    // ─────────────────────────────────────────────────────────────


    async function ensureUserProfile(uid, email) {
      try {
        const ref = db.collection('users').doc(uid).collection('profile').doc('main');
        const doc = await ref.get();
        if (!doc.exists) {
          await ref.set({
            email: email || '',
            isPremium: false,
            plan: 'free',
            premiumSource: null,
            premiumSince: null,
            premiumExpiry: null,
            playPurchaseTokenHash: null,
            premiumLinkedUid: null,
            lastLoginAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }, { merge: true });
        } else if (email && doc.data()?.email !== email) {
          await ref.set({ email, lastLoginAt: new Date().toISOString() }, { merge: true });
        }
      } catch (e) {
        console.error('Eroare profil user:', e);
      }
    }

    async function getUserProfile(uid) {
      try {
        const doc = await db.collection('users').doc(uid).collection('profile').doc('main').get();
        if (!doc.exists) return null;
        return doc.data() || null;
      } catch (e) {
        console.error('Eroare profil:', e);
        return null;
      }
    }

    async function checkPremium(uid) {
      const profile = await getUserProfile(uid);
      return profile?.isPremium === true;
    }

    async function loadHolidaysFromFirestore(year) {
      const holidaysMap = new Map();
      try {
        const snapshot = await db.collection('holidays').get();
        snapshot.forEach(doc => {
          const data = doc.data();
          const date = doc.id;
          if (date.startsWith(year) && data.active === true) {
            holidaysMap.set(date, data.name);
          }
        });
      } catch (e) {
        console.error('Eroare la citire holidays:', e);
      }
      return holidaysMap;
    }

    const LANG_STORAGE_KEY = "salary_lang";
    const SUPPORTED_LANGS = ["ro", "en"];
    function detectLanguage() {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
      const navLang = String(navigator.language || navigator.userLanguage || "ro").toLowerCase();
      return navLang.startsWith("en") ? "en" : "ro";
    }
    let currentLang = detectLanguage();
    document.documentElement.lang = currentLang;

    const I18N = {
      en: {
        "Calculator salariu în ture": "Salary Shift Calculator",
        "Calculator Salariu": "Salary Calculator",
        "Autentificare securizată": "Secure authentication",
        "Intră în cont sau creează unul nou ca să folosești aplicația. Datele tale sunt salvate în cloud pe contul tău.": "Sign in or create a new account to use the app. Your data is safely stored in the cloud on your account.",
        "Înregistrare": "Register",
        "Login": "Login",
        "Email": "Email",
        "Parolă": "Password",
        "minimum 6 caractere": "minimum 6 characters",
        "parola": "password",
        "Creează cont": "Create account",
        "Intră în cont": "Sign in",
        "Ai schimbat telefonul? Poți muta accesul pe acest dispozitiv după ce confirmi parola.": "Changed your phone? You can move access to this device after confirming your password.",
        "Mută contul pe acest dispozitiv": "Move account to this device",
        "Plata pentru Premium este procesată securizat prin Google Play. Abonamentul tău poate fi restaurat pe același cont.": "Premium payments are securely processed through Google Play. Your subscription can be restored on the same account.",
        "Forgot password": "Forgot password",
        "Premium": "Premium",
        "Se verifică Google Play Billing...": "Checking Google Play Billing...",
        "Se verifică...": "Checking...",
        "Activează Premium": "Activate Premium",
        "Contul tău este pe plan free. Pentru acces complet la calculator și sincronizare avansată, ai nevoie de Premium.": "Your account is currently on the free plan. For full calculator access and advanced sync, you need Premium.",
        "✔ acces complet la calculator": "✔ full calculator access",
        "✔ salvare date în cloud": "✔ cloud data backup",
        "✔ actualizări și funcții noi": "✔ updates and new features",
        "Plan curent": "Current plan",
        "Cont": "Account",
        "Restore Premium": "Restore Premium",
        "Înapoi în aplicație": "Back to app",
        "Logout": "Logout",
        "Abonamentul premium se verifică automat din Google Play pe acest cont. Dacă schimbi telefonul sau reinstalezi aplicația, folosește butonul Restore Premium.": "Your premium subscription is automatically verified through Google Play on this account. If you change your phone or reinstall the app, use Restore Premium.",
        "Plata abonamentului este procesată securizat prin Google Play. Poți restaura premium oricând pe același cont Google Play.": "Subscription payments are securely processed through Google Play. You can restore premium anytime on the same Google Play account.",
        "Calendar": "Calendar",
        "Estimare": "Estimate",
        "Reguli": "Rules",
        "Detalii": "Details",
        "Sărbători": "Holidays",
        "Logică": "Logic",
        "Cont Free: 15 calcule/lună": "Free account: preview mode is active",
        "Poți edita și calcula. La fiecare 3 calcule apare o reclamă. Premium elimină limita și reclamele.": "You can preview the calculator, but editing and real calculations are available only in Premium.",
        "Vezi Premium": "View Premium",
        "Plan": "Plan",
        "Calculator Salariu": "Salary Calculator",
        "Calendar rapid": "Quick calendar",
        "Azi": "Today",
        "Reset": "Reset",
        "Tutorial": "Tutorial",
        "Sărbătoare": "Holiday",
        "Zi lucrătoare": "Work day",
        "Liber": "Off",
        "Concediu odihnă": "Vacation leave",
        "Concediu medical": "Medical leave",
        "Morning": "Morning",
        "After": "Afternoon",
        "Night": "Night",
        "Salvează setările": "Save settings",
        "Setări personale": "Personal settings",
        "Estimare lunară": "Monthly estimate",
        "Reguli salariale": "Salary rules",
        "Cum calculează aplicația": "How the app calculates",
        "Logica implementată": "Implemented logic",
        "Sărbători automate": "Automatic holidays",
        "Încarcă exemplu": "Load example",
        "Închide": "Close",
        "Verificare rapidă": "Quick check",
        "Google Play Billing este pregătit.": "Google Play Billing is ready.",
        "Se pregătește plata...": "Preparing payment...",
        "Se deschide Google Play...": "Opening Google Play...",
        "Premium este activ.": "Premium is active.",
        "Premium activ": "Premium active",
        "Google Play Billing nu este disponibil momentan.": "Google Play Billing is currently unavailable.",
        "Indisponibil momentan": "Temporarily unavailable",
        "A apărut o problemă la plată.": "A payment problem occurred.",
        "Încearcă din nou": "Try again",
        "Stare inițială.": "Initial state.",
        "Plata nu este disponibilă încă.": "Payment is not available yet.",
        "Premium activat cu succes.": "Premium activated successfully.",
        "Nu s-a putut activa Premium.": "Premium could not be activated.",
        "Email de resetare trimis.": "Password reset email sent.",
        "Nu s-a putut trimite emailul.": "The email could not be sent.",
        "Completează emailul și parola.": "Enter your email and password.",
        "Cont creat cu succes.": "Account created successfully.",
        "Nu s-a putut crea contul.": "The account could not be created.",
        "Login nereușit.": "Login failed.",
        "Ai schimbat telefonul? Confirmă parola și apasă butonul de mai jos ca să muți contul pe acest dispozitiv.": "Changed your phone? Confirm your password and tap the button below to move the account to this device.",
        "Ai schimbat telefonul? Poți încerca din nou după ce confirmi parola.": "Changed your phone? You can try again after confirming your password.",
        "Introdu emailul și parola ca să muți contul pe acest telefon.": "Enter your email and password to move the account to this phone.",
        "Contul este deja asociat cu alt dispozitiv. Acces blocat pe acest telefon.": "This account is already associated with another device. Access is blocked on this phone.",
        "Nu am putut muta contul pe acest dispozitiv.": "We could not move the account to this device.",
        "Nu s-a putut muta contul pe acest dispozitiv.": "The account could not be moved to this device.",
        "Introdu emailul mai întâi.": "Enter your email first.",
        "Luna anterioară": "Previous month",
        "Luna următoare": "Next month",
        "Notiță": "Note",
        "Notiță": "Note for this day",
        "Ex: schimb cu colegul, tură specială, observații...": "Ex: shift swap, special shift, notes...",
        "Alege rapid Liber, Morning, After sau Night din primul rând de butoane.": "Quickly choose Off, Morning, Afternoon or Night from the first row of buttons.",
        "Atinge o zi din calendar ca să o editezi.": "Tap a day in the calendar to edit it.",
        "Poți adăuga ore suplimentare și o notiță scurtă direct în pop-up-ul zilei.": "You can add overtime and a short note directly from the day pop-up.",
        "Ore lucrate": "Actual worked hours",
        "Ore nelucrate / undertime": "Undertime / missing hours",
        "Zile cu tură setată": "Scheduled shift days",
        "Zile lucrate efectiv": "Actually worked days",
        "Detaliul calculului, logica și regulile salariale se deschid din săgețile de sus când ai nevoie.": "The calculation details, logic and salary rules open from the arrows above whenever you need them.",
        "Weekendul și sărbătorile se detectează automat din calendar, fără bife separate.": "Weekends and holidays are detected automatically from the calendar, without separate checkboxes.",
        "Weekendul și sărbătorile se detectează automat din calendar. Tura Night se alege direct sus, fără bifă separată.": "Weekends and holidays are detected automatically from the calendar. The Night shift is selected directly above, without a separate checkbox.",
        "alegi tura direct din pop-up-ul zilei; Night aplică automat sporul de noapte": "choose the shift directly from the day pop-up; Night automatically applies the night bonus",
        "poți marca separat dacă overtime-ul a fost de noapte, în weekend sau de sărbătoare": "you can separately mark whether overtime happened at night, on a weekend or on a holiday",
        "sâmbăta și duminica sunt detectate automat din calendar, fără bifă separată": "Saturday and Sunday are detected automatically from the calendar, without a separate checkbox",
        "zilele legale sunt marcate în calendar și primesc automat sporul de sărbătoare": "public holidays are marked in the calendar and automatically receive the holiday bonus",
        "Bază orară": "Hourly base",
        "Bon masă / zi": "Meal voucher / day",
        "Bonuri de masă": "Meal vouchers",
        "CM plătit": "Paid sick leave",
        "CO plătit": "Paid vacation leave",
        "OT sărbătoare": "Holiday OT",
        "Ore / tură": "Hours / shift",
        "Ore night": "Night hours",
        "Ore normale": "Regular hours",
        "Ore suplimentare": "Overtime hours",
        "Ore sărbători": "Holiday hours",
        "Ore weekend": "Weekend hours",
        "Referință anuală": "Annual reference",
        "Salariu brut de referință": "Reference gross salary",
        "Spor noapte": "Night bonus",
        "Spor noapte (%)": "Night bonus (%)",
        "Spor overtime": "Overtime bonus",
        "Spor overtime (%)": "Overtime bonus (%)",
        "Spor sărbătoare (%)": "Holiday bonus (%)",
        "Spor sărbători": "Holiday bonus",
        "Spor weekend": "Weekend bonus",
        "Spor weekend (%)": "Weekend bonus (%)",
        "Tichete masă": "Meal vouchers",
        "Total încasat": "Total earned",
        "Zile CM neplătite / lună": "Unpaid sick-leave days / month",
        "Anul Nou": "New Year's Day",
        "A doua zi de Anul Nou": "Second day of New Year",
        "Boboteaza": "Epiphany",
        "Sf. Ioan": "St. John",
        "Ziua Unirii": "Union Day",
        "Vinerea Mare": "Good Friday",
        "Paște": "Easter",
        "A doua zi de Paște": "Easter Monday",
        "Ziua Muncii": "Labour Day",
        "Ziua Copilului": "Children's Day",
        "Rusalii": "Pentecost",
        "A doua zi de Rusalii": "Whit Monday",
        "Adormirea Maicii Domnului": "Dormition of the Theotokos",
        "Sf. Andrei": "St. Andrew",
        "Ziua Națională": "National Day",
        "Crăciun": "Christmas Day",
        "A doua zi de Crăciun": "Second day of Christmas",
        "Ianuarie": "January",
        "Februarie": "February",
        "Martie": "March",
        "Aprilie": "April",
        "Mai": "May",
        "Iunie": "June",
        "Iulie": "July",
        "August": "August",
        "Septembrie": "September",
        "Octombrie": "October",
        "Noiembrie": "November",
        "Decembrie": "December",
        "Lun": "Mon",
        "Mar": "Tue",
        "Mie": "Wed",
        "Joi": "Thu",
        "Vin": "Fri",
        "Sâm": "Sat",
        "Dum": "Sun",

        "Salvează calcul": "Save calculation",
        "Calcul salvat cu succes": "Calculation saved successfully",
        "Eroare la salvarea calculului": "Error saving calculation",
        "Trebuie să fii autentificat": "You must be signed in",
        "Calculează mai întâi salariul": "Calculate your salary first",

        "Brut estimat": "Gross estimate",
        "Bază orară brută": "Gross hourly base",
        "Bază impozabilă": "Taxable base",
        "Impozit": "Income tax",
        "Total brut": "Total gross",
        "Tarif orar": "Hourly rate",

        "History calcule": "Calculation history",
        "Istoricul calculelor": "Calculation history",
        "Calcule salvate": "Saved calculations",
        "Total net estimat": "Estimated net total",
        "Se încarcă istoricul...": "Loading history...",
        "Se încarcă...": "Loading...",
        "Nu ai calcule salvate încă.": "No saved calculations yet.",
        "Autentifică-te și activează Premium pentru a vedea istoricul.": "Log in and activate Premium to view history.",
        "Eroare la încărcare.": "Loading error.",
        "Eroare la ștergere.": "Delete error.",
        "Sigur vrei să ștergi acest calcul?": "Are you sure you want to delete this calculation?",
        "Calcul șters cu succes.": "Calculation deleted successfully.",
        "Brut": "Gross",
        "Tichete": "Meal tickets",
        "Total": "Total",
        "Impozit": "Income tax",
        "Reîncarcă": "Refresh",
        "Istoric": "History",
        "Istoric calcule": "Calculation history",
        "Salariu net": "Net salary",
        "Total estimat": "Total estimated",
        "Sporuri + overtime": "Bonuses + overtime",
        "Ture": "Shifts",
        "Preview": "Preview",
        "Detaliu calcul": "Calculation detail",
        "Mai departe": "Next",
        "Bine ai venit": "Welcome",
        "Programul tău lunar": "Your monthly schedule",
        "Rezumat rapid": "Quick summary",
        "Export PDF": "Export PDF",
        "Folosește Print / Save as PDF din browser.": "Use Print / Save as PDF from your browser.",
        "Folosește Print / Save as PDF pentru export.": "Use Print / Save as PDF to export.",
        "Raport calcul salariu · Salary Helper": "Salary calculation report · Salary Helper",
        "Salary Helper · raport lunar": "Salary Helper · monthly report",
        "Weekend": "Weekend",
        "Weekend automat": "Auto weekend",
        "✨ Tutorial rapid": "✨ Quick tutorial",
        "⭐ Premium": "⭐ Premium",
        "📄 Export PDF": "📄 Export PDF",
        "📅 Zi selectată": "📅 Selected day",
        "📝 Notiță": "📝 Note",
        "🔄 Reîncarcă": "🔄 Refresh",
        "🔒 Autentificare securizată": "🔒 Secure authentication",
        "Restore Premium este deja în curs. Așteaptă câteva secunde.": "Restore Premium is already in progress. Please wait a few seconds.",
        "Premium este deja activ pe acest cont. Nu este nevoie să folosești Restore Premium.": "Premium is already active on this account. No need to use Restore Premium.",
        "Restore Premium este dezactivat temporar pentru a evita închiderea aplicației. Dacă ai deja un abonament, folosește același cont Google Play și contactează suportul dacă problema persistă.": "Restore Premium is temporarily disabled to prevent app closure. If you already have a subscription, use the same Google Play account and contact support if the issue persists.",
        "Autentifică-te mai întâi ca să legi abonamentul de contul tău.": "Sign in first to link the subscription to your account.",
        "Autentifică-te mai întâi, apoi încearcă din nou Restore Premium.": "Sign in first, then try Restore Premium again.",
        "Acest abonament Google Play este deja asociat cu alt cont din aplicație și nu poate fi folosit aici.": "This Google Play subscription is already linked to another account and cannot be used here.",
        "OT noapte": "Night OT",
        "OT weekend": "Weekend OT",
        "OT sărbătoare": "Holiday OT",
        "Alege tura, orele lucrate și opțional overtime/notiță.": "Choose the shift above, set how many hours you actually worked that day, then add overtime and a note.",
        "Pentru plecat mai devreme, treci orele reale lucrate.": "For early leave: choose or type the actual hours worked. 0h = you didn't work the shift at all.",
        "Zi lucrătoare": "Work day",
        "h lucrate": "h worked",
        "calcule rămase luna asta": "calculations left this month",
        "Limita lunară atinsă": "Monthly limit reached",
        "Ai atins limita de 15 calcule pe lună. Activează Premium pentru acces nelimitat.": "You have reached the 15 calculations per month limit. Activate Premium for unlimited access.",
        "Calcule rămase:": "Remaining calculations:",
        "HISTORY PERSONAL": "PERSONAL HISTORY",
        "CALCULE SALVATE": "SAVED CALCULATIONS",
        "TOTAL ESTIMAT SALVAT": "SAVED ESTIMATED TOTAL",

        "Plan lunar": "Monthly plan",
        "Anulezi oricând": "Cancel anytime",
        "Ce primești": "What you get",
        "Salvare calcule în cloud și istoric personal": "Cloud saving and personal calculation history",
        "Experiență mai curată pe telefon și desktop": "Cleaner experience on phone and desktop",

        "Politica de confidențialitate": "Privacy Policy",
        "Termeni și condiții": "Terms and Conditions",
        "Servicii utilizate": "Services used",
        "Cookie-uri și publicitate": "Cookies and advertising",
        "Date salariale": "Salary data",
        "Ștergerea datelor": "Data deletion",
        "Responsabilitatea utilizatorului": "User responsibility",
        "Plan Free și Premium": "Free and Premium plans",
        "Limitarea răspunderii": "Limitation of liability",
        "Timp de răspuns": "Response time",
        "Ce poți trimite": "What you can send",
        "Ce date se șterg": "What data is deleted",
        "Important despre abonamente": "Important subscription note",
        "Confirmare ștergere automată": "Automatic deletion confirmation",
        "Scrie STERGERE pentru confirmare": "Type DELETE to confirm",
        "Șterge contul și datele": "Delete account and data",
        "Se șterge...": "Deleting...",
        "Dacă ștergerea automată nu funcționează": "If automatic deletion does not work",
        "Trimite un email la": "Send an email to",

        "Sistem online": "System online",
        "Înapoi": "Back",
        "Înapoi la Home": "Back to Home",
        "Înapoi la calculator": "Back to calculator",
        "Brut estimat": "Gross estimate",
        "Bază orară brută": "Gross hourly base",
        "Bază impozabilă": "Taxable base",
        "Impozit": "Income tax",
        "Tarif orar": "Hourly rate",
        "Total brut": "Total gross"
      }
    };

    function translateDynamic(value) {
      if (typeof value !== 'string' || currentLang !== 'en') return value;
      let out = I18N.en[value] || value;
      out = out.replace(/Dispozitivul poate fi schimbat din nou peste aproximativ\s+(\d+)h\./g, 'The device can be changed again in about $1h.');
      return out;
    }

    function translateTree(root = document.body) {
      if (currentLang !== 'en' || !root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) textNodes.push(node);
      textNodes.forEach((textNode) => {
        const raw = textNode.nodeValue;
        const trimmed = raw && raw.trim();
        if (!trimmed) return;
        const translated = translateDynamic(trimmed);
        if (translated !== trimmed) textNode.nodeValue = raw.replace(trimmed, translated);
      });
      root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach((el) => {
        ['placeholder','title','aria-label'].forEach((attr) => {
          const val = el.getAttribute(attr);
          if (!val) return;
          const translated = translateDynamic(val);
          if (translated !== val) el.setAttribute(attr, translated);
        });
      });
      document.title = translateDynamic(document.title);
      document.documentElement.lang = currentLang;
    }

    function updateLanguageButtons() {
      document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
      });
      // Translate data-ro/data-en buttons
      document.querySelectorAll('.tkey-btn').forEach(btn => {
        btn.textContent = currentLang === 'en' ? (btn.dataset.en || btn.textContent) : (btn.dataset.ro || btn.textContent);
      });
    }

    function setLanguage(lang, options = {}) {
      const nextLang = SUPPORTED_LANGS.includes(lang) ? lang : 'ro';
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
      currentLang = nextLang;
      updateLanguageButtons();
      // V18: schimbarea limbii NU mai reîncarcă aplicația și NU mai pierde sesiunea.
      translateTree(document.body);
      if (state.currentUser && document.getElementById('appScreen')?.style.display !== 'none') {
        document.getElementById('currentUserEmail').textContent = state.currentUser.email || '-';
      }
    }

    document.addEventListener('click', (event) => {
      const btn = event.target.closest('.lang-btn');
      if (!btn) return;
      setLanguage(btn.dataset.lang, { reload: false });
    });

    const translationObserver = new MutationObserver((mutations) => {
      if (currentLang !== 'en') return;
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' && mutation.target?.parentElement) {
          translateTree(mutation.target.parentElement);
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) translateTree(node);
          });
        }
      });
    });

    document.addEventListener('DOMContentLoaded', () => {
      updateLanguageButtons();
      translateTree(document.body);
      translationObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
    });

    const MONTHS = currentLang === 'en'
      ? ["January","February","March","April","May","June","July","August","September","October","November","December"]
      : ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
    const SHIFT_OPTIONS = [
      {code:'OFF', label:'Liber'},
      {code:'M', label:'Morning'},
      {code:'A', label:'After'},
      {code:'N', label:'Night'},
      {code:'CO', label:'Concediu odihnă'},
      {code:'CM', label:'Concediu medical'}
    ];
    const defaultSettings = { baseSalary:0, nightRate:0.25, overtimeRate:0.75, weekendRate:0.10, holidayRate:1, mealValue:40, casRate:0.25, cassRate:0.10, taxRate:0.10, shiftHours:8, unpaidMedicalDays:1 };
    let state = {
      settings: load('salary_settings', defaultSettings),
      currentUser: null,
      entries: {},
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      billingState: 'checking',
      isPremium: false,
      appUnlocked: true,
      selectedDayIso: null,
      playSubscription: null,
      restoreInProgress: false,
      bulkMode: false,
      bulkSelected: []
    };
    let pendingDeviceTransfer = false;

    function load(k, fallback){ try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } }


    function getAndroidBridge() {
      return window.AndroidBilling || null;
    }


    function syncAndroidBillingUser() {
      try {
        if (window.AndroidBilling?.setCurrentAppUser && auth.currentUser) {
          window.AndroidBilling.setCurrentAppUser(auth.currentUser.uid || '', auth.currentUser.email || '');
        } else if (window.AndroidBilling?.clearCurrentAppUser) {
          window.AndroidBilling.clearCurrentAppUser();
        }
      } catch (e) {
        console.warn('Nu s-a putut sincroniza userul curent cu Billing:', e);
      }
    }


    function syncNativeAdsState() {
      try {
        if (window.AndroidAds?.setPremiumStatus) {
          window.AndroidAds.setPremiumStatus(!!state.isPremium);
        }
      } catch (e) {
        console.warn('Nu s-a putut sincroniza starea reclamelor native:', e);
      }
    }

    async function sha256Hex(input) {
      const value = String(input || '');
      if (!value) return '';
      if (window.crypto?.subtle && window.TextEncoder) {
        const data = new TextEncoder().encode(value);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
      }
      return `fallback_${Math.abs(hash)}`;
    }

    async function getLinkedPlayPurchaseDoc(tokenHash) {
      if (!tokenHash) return null;
      const doc = await db.collection('playPurchaseLinks').doc(tokenHash).get();
      return doc.exists ? (doc.data() || null) : null;
    }

    async function linkGooglePlayPurchaseToCurrentUser(purchaseToken, productId, source = 'restore') {
      const user = auth.currentUser;
      state.restoreInProgress = false;
      if (!user) {
        handleBillingMessage('Autentifică-te mai întâi ca să legi abonamentul de contul tău.');
        applyBillingUiState('ready');
        return false;
      }

      const tokenHash = await sha256Hex(purchaseToken);
      const nowIso = new Date().toISOString();
      const linkRef = db.collection('playPurchaseLinks').doc(tokenHash);
      const profileRef = db.collection('users').doc(user.uid).collection('profile').doc('main');

      let existingData = null;
      let sharedLinkAvailable = true;
      try {
        const existingLink = await linkRef.get();
        existingData = existingLink.exists ? (existingLink.data() || {}) : null;
      } catch (e) {
        sharedLinkAvailable = false;
        console.warn('Nu s-a putut citi playPurchaseLinks. Continui cu activarea pe profilul userului:', e);
      }

      if (existingData?.uid && existingData.uid !== user.uid) {
        applyBillingUiState('ready');
        handleBillingMessage('Acest abonament Google Play este deja asociat cu alt cont din aplicație și nu poate fi folosit aici.');
        return false;
      }

      await profileRef.set({
        email: user.email || '',
        isPremium: true,
        plan: 'premium_monthly',
        premiumSource: 'google_play',
        premiumSince: existingData?.linkedAt || nowIso,
        activatedAt: nowIso,
        lastLoginAt: nowIso,
        playPurchaseTokenHash: tokenHash,
        premiumLinkedUid: user.uid,
        premiumProductId: productId || 'premium_monthly'
      }, { merge: true });

      if (sharedLinkAvailable) {
        try {
          await linkRef.set({
            uid: user.uid,
            email: user.email || '',
            productId: productId || 'premium_monthly',
            purchaseTokenHash: tokenHash,
            linkedAt: existingData?.linkedAt || nowIso,
            lastValidatedAt: nowIso,
            source
          }, { merge: true });
        } catch (e) {
          console.warn('Nu s-a putut salva playPurchaseLinks. Premium ramâne activ doar pe baza profilului userului:', e);
        }
      }

      state.playSubscription = {
        token: purchaseToken,
        tokenHash,
        productId: productId || 'premium_monthly',
        linkedUid: user.uid,
        source
      };
      state.isPremium = true;
      state.appUnlocked = true;
      applyBillingUiState('active');
      applyAccessMode();
      const premiumMsg = document.getElementById('premiumMsg');
      if (premiumMsg) premiumMsg.textContent = sharedLinkAvailable
        ? 'Premium activat pentru acest cont.'
        : 'Premium activat pentru acest cont. Maparea globală nu a putut fi salvată, dar accesul este activ.';
      await showApp();
      ensurePremiumAccessAfterLogin();
      return true;
    }

    async function maybeRestoreLinkedPlayPremium(profile) {
      if (!auth.currentUser || !profile?.playPurchaseTokenHash || !state.playSubscription?.tokenHash) return false;
      if (profile.playPurchaseTokenHash !== state.playSubscription.tokenHash) return false;
      state.isPremium = true;
      state.appUnlocked = true;
      applyBillingUiState('active');
      applyAccessMode();
      return true;
    }

    function getCurrentDeviceId() {
      try {
        if (window.AndroidDevice && typeof window.AndroidDevice.getDeviceId === 'function') {
          const nativeId = window.AndroidDevice.getDeviceId();
          if (nativeId && String(nativeId).trim()) return String(nativeId).trim();
        }
      } catch (e) {
        console.warn('Nu s-a putut citi Android device id:', e);
      }
      let fallback = localStorage.getItem('salary_local_device_id');
      if (!fallback) {
        fallback = 'web_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('salary_local_device_id', fallback);
      }
      return fallback;
    }

    async function enforceSingleDeviceSession(user) {
      if (!user) return { allowed: false, reason: 'no-user' };
      const currentDeviceId = getCurrentDeviceId();
      const ref = db.collection('users').doc(user.uid).collection('profile').doc('main');
      const snapshot = await ref.get();
      const profile = snapshot.exists ? (snapshot.data() || {}) : {};
      const savedDeviceId = profile.deviceId || null;
      const nowIso = new Date().toISOString();

      if (!savedDeviceId) {
        await ref.set({
          deviceId: currentDeviceId,
          devicePlatform: 'android',
          deviceBoundAt: nowIso,
          lastLoginAt: nowIso,
          lastDeviceCheckAt: nowIso,
          email: user.email || profile.email || ''
        }, { merge: true });
        return { allowed: true, profile: { ...profile, deviceId: currentDeviceId } };
      }

      if (savedDeviceId !== currentDeviceId) {
        // V16 auth fix: free/test users must not be locked out when emulator/device id changes.
        // Premium anti-sharing remains protected: premium accounts still require explicit transfer.
        if (profile?.isPremium !== true) {
          await ref.set({
            deviceId: currentDeviceId,
            devicePlatform: 'android',
            deviceBoundAt: nowIso,
            lastDeviceTransferAt: nowIso,
            lastLoginAt: nowIso,
            lastDeviceCheckAt: nowIso,
            email: user.email || profile.email || ''
          }, { merge: true });
          return { allowed: true, profile: { ...profile, deviceId: currentDeviceId } };
        }
        return { allowed: false, reason: 'device-mismatch', savedDeviceId, currentDeviceId, profile };
      }

      await ref.set({
        lastLoginAt: nowIso,
        lastDeviceCheckAt: nowIso,
        email: user.email || profile.email || ''
      }, { merge: true });
      return { allowed: true, profile };
    }

    function hasNativePremiumPin() {
      return false;
    }

    function openPremiumScreen() {
      showPremiumGate({
        email: state.currentUser?.email || '-',
        plan: state.isPremium ? 'premium_monthly' : 'free',
        isPremium: state.isPremium
      });
    }

    function setInteractiveDisabled(disabled) {
      const selectors = [
        '#baseSalary','#nightRate','#overtimeRate','#weekendRate','#holidayRate','#mealValue','#casRate','#cassRate','#taxRate',
        '#saveSettings','#demoBtn','#resetMonth','#yearSelect','#monthSelect','#days select'
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.disabled = !!disabled;
          el.classList.toggle('disabled-block', !!disabled);
        });
      });
    }

    function syncPremiumLabels(profile = null) {
      const currentPlanLabel = document.getElementById('currentPlanLabel');
      const premiumPlanLabel = document.getElementById('premiumPlanLabel');
      const effectivePlan = state.isPremium ? 'premium_monthly' : (profile?.plan || 'free');
      if (currentPlanLabel) currentPlanLabel.textContent = effectivePlan;
      if (premiumPlanLabel) premiumPlanLabel.textContent = effectivePlan;
    }

    function applyAccessMode() {
      const freeBanner = document.getElementById('freeModeBanner');
      const pinActions = document.getElementById('premiumQuickActions');
      syncPremiumLabels();
      syncNativeAdsState();
      if (freeBanner) freeBanner.style.display = state.isPremium ? 'none' : 'flex';
      // Update usage badge
      if (state.currentUser) {
        getUsageStatus(state.currentUser.uid, state.isPremium).then(u => updateUsageBadge(u.remaining, state.isPremium));
      }
      if (pinActions) pinActions.style.display = state.isPremium ? 'flex' : 'none';
      setInteractiveDisabled(!state.currentUser || !state.appUnlocked);
      syncSettingsToInputs();
      renderLogicSummary();
      if (!state.currentUser || !state.appUnlocked) {
        maskSensitiveViews();
      } else {
        recalc();
      }
    }

    function setPinModal(mode, options = {}) {
      return;
    }

    function closePinModal() {
      const backdrop = document.getElementById('pinModalBackdrop');
      if (backdrop) backdrop.style.display = 'none';
    }

    function lockPremiumSession() {
      return;
    }

    function ensurePremiumAccessAfterLogin() {
      state.appUnlocked = true;
      applyAccessMode();
      closePinModal();
      if (state.isPremium && !localStorage.getItem('salary_tutorial_seen')) {
        setTimeout(() => { openTutorial(); localStorage.setItem('salary_tutorial_seen', '1'); }, 350);
      }
    }


    const billingUiMap = {
      checking: { chip: 'Se verifică Google Play Billing...', button: 'Se verifică...', disabled: true },
      ready: { chip: 'Google Play Billing este pregătit.', button: 'Activează Premium', disabled: false },
      processing: { chip: 'Se pregătește plata...', button: 'Se deschide Google Play...', disabled: true },
      active: { chip: 'Premium este activ.', button: 'Premium activ', disabled: true },
      unavailable: { chip: 'Google Play Billing nu este disponibil momentan.', button: 'Indisponibil momentan', disabled: true },
      error: { chip: 'A apărut o problemă la plată.', button: 'Încearcă din nou', disabled: false },
      idle: { chip: 'Stare inițială.', button: 'Activează Premium', disabled: false }
    };

    function applyBillingUiState(nextState) {
      state.billingState = nextState || 'idle';
      const config = billingUiMap[state.billingState] || billingUiMap.idle;
      const chip = document.getElementById('premiumStateChip');
      const btn = document.getElementById('goToPlayBtn');
      if (chip) {
        chip.dataset.state = state.billingState;
        chip.textContent = config.chip;
      }
      if (btn) {
        btn.disabled = !!config.disabled;
        btn.textContent = config.button;
      }
    }

    function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
    function fmt(v){ return new Intl.NumberFormat(currentLang === 'en' ? 'en-GB' : 'ro-RO',{style:'currency',currency:'RON',maximumFractionDigits:2}).format(v||0); }
    function fmtPlain(v){ return new Intl.NumberFormat(currentLang === 'en' ? 'en-GB' : 'ro-RO',{maximumFractionDigits:2}).format(v||0); }
    function escapeHtml(value){ return String(value||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
    function pad(n){ return String(n).padStart(2,'0'); }
    function parseNum(id){ return Number(document.getElementById(id).value || 0); }
    function toISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
    function addDays(iso, n){ const d = new Date(iso+'T12:00:00'); d.setDate(d.getDate()+n); return toISO(d); }
    function orthodoxEaster(y){ const a=y%4,b=y%7,c=y%19,d=(19*c+15)%30,e=(2*a+4*b-d+34)%7,month=Math.floor((d+e+114)/31),day=((d+e+114)%31)+1; const julian=new Date(Date.UTC(y,month-1,day)); julian.setUTCDate(julian.getUTCDate()+13); return `${julian.getUTCFullYear()}-${pad(julian.getUTCMonth()+1)}-${pad(julian.getUTCDate())}`; }
    function getRomaniaHolidays(year){
      const easter=orthodoxEaster(year);
      const goodFriday=addDays(easter,-2);
      const easterMonday=addDays(easter,1);
      const pentecost=addDays(easter,49);
      const pentecostMonday=addDays(easter,50);
      return new Map([
        [`${year}-01-01`,'Anul Nou'],
        [`${year}-01-02`,'A doua zi de Anul Nou'],
        [`${year}-01-06`,'Boboteaza'],
        [`${year}-01-07`,'Sf. Ioan'],
        [`${year}-01-24`,'Ziua Unirii'],
        [goodFriday,'Vinerea Mare'],
        [easter,'Paște'],
        [easterMonday,'A doua zi de Paște'],
        [`${year}-05-01`,'Ziua Muncii'],
        [`${year}-06-01`,'Ziua Copilului'],
        [pentecost,'Rusalii'],
        [pentecostMonday,'A doua zi de Rusalii'],
        [`${year}-08-15`,'Adormirea Maicii Domnului'],
        [`${year}-11-30`,'Sf. Andrei'],
        [`${year}-12-01`,'Ziua Națională'],
        [`${year}-12-25`,'Crăciun'],
        [`${year}-12-26`,'A doua zi de Crăciun'],
      ]);
    }
    function monthKey(){ return `${state.currentUser?.email || 'guest'}_${state.year}_${state.month}`; }
    function cloudMonthKey(){ return `${state.year}-${String(state.month+1).padStart(2,'0')}`; }
    function loadEntries(){ state.entries = load('salary_entries_'+monthKey(), {}); }
    function saveEntries(){ save('salary_entries_'+monthKey(), state.entries); }
    function getDays(year, month){ const total = new Date(year, month+1, 0).getDate(); const arr=[]; for(let i=1;i<=total;i++){ const d=new Date(year, month, i, 12); arr.push({day:i, iso:toISO(d), weekday:d.toLocaleDateString('ro-RO',{weekday:'short'}), isWeekend:[0,6].includes(d.getDay())}); } return arr; }
    function workingDaysReference(days, holidays){ return days.filter(d => !d.isWeekend && !holidays.has(d.iso)).length; }
    function createDefaultEntry(){
      return {
        code:'OFF',
        workedHours:null,
        overtimeHours:0,
        regularNight:false,
        regularWeekend:null,
        regularHoliday:null,
        overtimeNight:false,
        overtimeWeekend:false,
        overtimeHoliday:false,
        note:''
      };
    }

    function normalizeEntry(raw){
      if (!raw) return createDefaultEntry();
      if (typeof raw === 'string') return { ...createDefaultEntry(), code: raw };
      return { ...createDefaultEntry(), ...raw, workedHours: raw.workedHours === null || raw.workedHours === undefined || raw.workedHours === '' ? null : Number(raw.workedHours), overtimeHours: Number(raw.overtimeHours || 0), note: String(raw.note || '') };
    }

    function updateEntry(iso, patch){
      const next = { ...normalizeEntry(state.entries[iso]), ...patch };
      state.entries[iso] = next;
      saveEntries();
      saveEntriesToCloud();
      recalc();
    }


    async function saveEntriesToCloud() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        await db.collection('users').doc(user.uid).collection('entries').doc(cloudMonthKey()).set(state.entries || {}, { merge: false });
      } catch (e) {
        console.error('Eroare la salvare entries:', e);
      }
    }

    function maskSensitiveViews() {
      document.getElementById('sumGross').textContent = '—';
      document.getElementById('sumNet').textContent = '—';
      const qNetBlank = document.getElementById('v10QuickNet'); if(qNetBlank) qNetBlank.textContent = '—';
      const qTaxBlank = document.getElementById('v10QuickTax'); if(qTaxBlank) qTaxBlank.textContent = '—';
      const qCasBlank = document.getElementById('v10QuickCas'); if(qCasBlank) qCasBlank.textContent = '—';
      const qCassBlank = document.getElementById('v10QuickCass'); if(qCassBlank) qCassBlank.textContent = '—';
      const qMealsBlank = document.getElementById('v10QuickMeals'); if(qMealsBlank) qMealsBlank.textContent = '—';
      const _gEst = document.getElementById('sumGrossEst'); if (_gEst) _gEst.textContent = '—';
      document.getElementById('sumMeals').textContent = '—';
      document.getElementById('sumExtras').textContent = '—';
      document.getElementById('sumTotal').textContent = '—';
      document.getElementById('detailList').innerHTML = '<div class="item"><span class="muted">Preview</span><strong>Valorile reale și modelul de calcul sunt afișate doar pentru Premium deblocat.</strong></div>';
      const dcPreview = document.getElementById('detailCards');
      if (dcPreview) dcPreview.style.display = 'none';
    }

    function renderLogicSummary() {
      const s = state.settings || defaultSettings;
      const list = [
        ['Bază orară', `salariul brut de referință se împarte la zilele lucrătoare de referință × ${fmtPlain(s.shiftHours)} h / tură`],
        ['Morning / After / Night', 'alegi tura direct din pop-up-ul zilei; Night aplică automat sporul de noapte'],
        ['Weekend automat', 'sâmbăta și duminica sunt detectate automat din calendar, fără bifă separată'],
        ['Sărbători automate', 'zilele legale sunt marcate în calendar și primesc automat sporul de sărbătoare'],
        ['Ore lucrate', 'în pop-up-ul zilei poți seta 0-8h sau poți scrie manual câte ore ai stat la muncă; diferența se scade automat din calcul'],
        ['Ore suplimentare', `+${fmtPlain(decimalToPercent(s.overtimeRate))}% din baza orară pentru fiecare oră suplimentară introdusă`],
        ['OT special', 'poți marca separat dacă overtime-ul a fost de noapte, în weekend sau de sărbătoare'],
        ['Bonuri', `${fmt(s.mealValue)} pentru fiecare zi cu tură lucrată`],
        ['Taxe', `CAS ${fmtPlain(decimalToPercent(s.casRate))}% · CASS ${fmtPlain(decimalToPercent(s.cassRate))}% · impozit ${fmtPlain(decimalToPercent(s.taxRate))}%`],
        ['CO / CM', 'Concediul de odihnă rămâne plătit la bază; pentru CM se țin cont zilele neplătite setate de tine.']
      ];
      document.getElementById('logicList').innerHTML = list.map(([a,b])=>`<div class="item"><span class="muted">${a}</span><span>${b}</span></div>`).join('');
    }


    const WEEKDAYS = currentLang === 'en' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Lun','Mar','Mie','Joi','Vin','Sâm','Dum'];
    const tutorialSteps = [
      'Atinge o zi din calendar pentru a deschide pop-up-ul compact al zilei.',
      'Alege rapid Liber, Morning, After sau Night din primul rând de butoane.',
      'Weekendul și sărbătorile se detectează automat din calendar, fără bife separate.',
      'Poți adăuga ore suplimentare și o notiță scurtă direct în pop-up-ul zilei.',
      'Detaliul calculului, logica și regulile salariale se deschid din săgețile de sus când ai nevoie.'
    ];
    let tutorialIndex = 0;
    function renderWeekdays(){ const box=document.getElementById('weekdays'); if(box) box.innerHTML=WEEKDAYS.map(d=>`<div class="weekday">${d}</div>`).join(''); }
    function openTutorial(){ tutorialIndex=0; document.getElementById('tutorialOverlay').style.display='flex'; document.getElementById('tutorialTitle').textContent=`Tutorial 1/${tutorialSteps.length}`; document.getElementById('tutorialText').textContent=tutorialSteps[0]; }
    function nextTutorial(){ tutorialIndex++; if(tutorialIndex>=tutorialSteps.length){ closeTutorial(); return; } document.getElementById('tutorialTitle').textContent=`Tutorial ${tutorialIndex+1}/${tutorialSteps.length}`; document.getElementById('tutorialText').textContent=tutorialSteps[tutorialIndex]; }
    function closeTutorial(){ document.getElementById('tutorialOverlay').style.display='none'; }

    async function loadEntriesFromCloud() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const doc = await db.collection('users').doc(user.uid).collection('entries').doc(cloudMonthKey()).get();
        if (doc.exists) {
          state.entries = doc.data() || {};
          saveEntries();
        } else {
          state.entries = {};
          saveEntries();
        }
      } catch (e) {
        console.error('Eroare la încărcare entries:', e);
        loadEntries();
      }
    }

    async function saveSettingsToCloud() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        await db.collection('users').doc(user.uid).collection('meta').doc('settings').set({
          ...state.settings,
          updatedAt: new Date().toISOString(),
          selectedYear: state.year,
          selectedMonth: state.month
        }, { merge: true });
      } catch (e) {
        console.error('Eroare la salvare settings:', e);
      }
    }

    async function loadSettingsFromCloud() {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const doc = await db.collection('users').doc(user.uid).collection('meta').doc('settings').get();
        if (doc.exists) {
          const data = doc.data() || {};
          state.settings = {
            ...defaultSettings,
            ...state.settings,
            ...Object.fromEntries(Object.entries(data).filter(([k]) => k in defaultSettings))
          };
          if (typeof data.selectedYear === 'number') state.year = data.selectedYear;
          if (typeof data.selectedMonth === 'number') state.month = data.selectedMonth;
          save('salary_settings', state.settings);
        }
      } catch (e) {
        console.error('Eroare la încărcare settings:', e);
      }
    }

    function renderSelectors(){
      const ys=document.getElementById('yearSelect'), ms=document.getElementById('monthSelect'); ys.innerHTML=''; ms.innerHTML='';
      for(let y=2025;y<=2035;y++){ const o=document.createElement('option'); o.value=y; o.textContent=y; if(y===state.year) o.selected=true; ys.appendChild(o); }
      MONTHS.forEach((m,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=m; if(i===state.month) o.selected=true; ms.appendChild(o); });
      const holidayTitle = document.querySelector('#holidaysSection h2');
      if (holidayTitle) holidayTitle.textContent = translateDynamic("Sărbători") + " " + state.year;
    }


    async function renderDays(){
      const days = getDays(state.year, state.month);
      const fallbackHolidays = getRomaniaHolidays(state.year);
      const cloudHolidays = await loadHolidaysFromFirestore(state.year.toString());
      const holidays = new Map([...fallbackHolidays, ...cloudHolidays]);
      const box = document.getElementById('days');
      if (!state.selectedDayIso && days[0]) state.selectedDayIso = days[0].iso;
      const firstDate = new Date(state.year, state.month, 1, 12);
      const offset = (firstDate.getDay() + 6) % 7;
      box.innerHTML='';
      for(let i=0;i<offset;i++){
        const empty=document.createElement('div');
        empty.className='day empty';
        box.appendChild(empty);
      }
      days.forEach(day => {
        const entry = normalizeEntry(state.entries[day.iso]);
        const autoHoliday = holidays.has(day.iso);
        const selected = state.selectedDayIso===day.iso;
        const bulkSelected = Array.isArray(state.bulkSelected) && state.bulkSelected.includes(day.iso);
        const code = entry.code || 'OFF';
        const wrap=document.createElement('div');
        wrap.className='day'+(selected?' selected':'')+(bulkSelected?' bulk-selected':'');
        wrap.classList.add('shift-' + code);
        if (autoHoliday) wrap.classList.add('holiday');
        if (day.isWeekend) wrap.classList.add('weekend');
        const tags=[];
        if (autoHoliday) tags.push(`<span class="mini-badge holiday">${holidays.get(day.iso) || 'Sărbătoare'}</span>`);
        else if (day.isWeekend) tags.push('<span class="mini-badge weekend">Weekend</span>');
        const dayShiftHours = Math.max(Number(state.settings.shiftHours) || 8, 0.25);
        const hasWorkShift = ['M','A','N'].includes(code);
        const shownWorkedHours = hasWorkShift ? Math.max(Math.min(entry.workedHours === null || entry.workedHours === undefined ? dayShiftHours : Number(entry.workedHours || 0), dayShiftHours), 0) : 0;
        if (hasWorkShift) tags.push(`<span class="mini-badge">${fmtPlain(shownWorkedHours)}h lucrate</span>`);
        if (hasWorkShift && shownWorkedHours < dayShiftHours) tags.push(`<span class="mini-badge ot">-${fmtPlain(dayShiftHours - shownWorkedHours)}h</span>`);
        if (entry.overtimeHours) tags.push(`<span class="mini-badge ot">+${fmtPlain(entry.overtimeHours)}h OT</span>`);
        if (entry.note && entry.note.trim()) tags.push('<span class="mini-badge note">📝 Notiță</span>');
        if (code==='CO') tags.push('<span class="mini-badge">CO</span>');
        if (code==='CM') tags.push('<span class="mini-badge">CM</span>');
        const notePreview = entry.note && entry.note.trim() ? `<div class="note-preview">${escapeHtml(entry.note.trim())}</div>` : '';
        wrap.innerHTML = `${bulkSelected ? '<span class="bulk-badge"></span>' : ''}${autoHoliday ? '<span class="holiday-dot"></span>' : ''}
          <div class="day-top">
            <div><div class="num">${day.day}</div><div class="meta">${day.weekday}</div></div>
            <div class="day-code code-${code}">${code==='OFF'?'—':code}</div>
          </div>
          <div class="day-sub">${SHIFT_OPTIONS.find(x=>x.code===code)?.label || 'Liber'}</div>
          <div class="day-note-line">${tags.join('')}</div>${notePreview}`;
        wrap.addEventListener('click',()=>{
          if (state.bulkMode) {
            toggleBulkDay(day.iso);
            renderDays();
            return;
          }
          state.selectedDayIso = day.iso;
          renderDays();
          openDayModal(day, entry, holidays);
        });
        box.appendChild(wrap);
      });
      renderHolidayYearPanel(holidays);
    }


    function refreshBulkToolbar(){
      const bar = document.getElementById('bulkToolbar');
      const info = document.getElementById('bulkInfo');
      const btn = document.getElementById('bulkModeBtn');
      const count = Array.isArray(state.bulkSelected) ? state.bulkSelected.length : 0;
      if (bar) bar.classList.toggle('active', !!state.bulkMode);
      if (info) info.textContent = state.bulkMode ? `Selectate: ${count} zile` : 'Selectare multiplă: oprită';
      if (btn) btn.textContent = state.bulkMode ? 'Gata selectarea' : 'Selectare zile';
    }

    function toggleBulkDay(iso){
      if (!Array.isArray(state.bulkSelected)) state.bulkSelected = [];
      if (state.bulkSelected.includes(iso)) state.bulkSelected = state.bulkSelected.filter(x => x !== iso);
      else state.bulkSelected = [...state.bulkSelected, iso];
      refreshBulkToolbar();
    }

    async function applyBulkShift(){
      if (!canUseCalculator()) { openPremiumScreen(); return; }
      const selected = Array.isArray(state.bulkSelected) ? state.bulkSelected : [];
      if (!selected.length) { alert('Selectează cel puțin o zi.'); return; }
      const code = document.getElementById('bulkShiftSelect')?.value || 'M';
      const configuredShiftHours = Math.max(Number(state.settings.shiftHours) || 8, 0.25);
      selected.forEach(iso => {
        const patch = { code, workedHours: ['M','A','N'].includes(code) ? configuredShiftHours : null };
        state.entries[iso] = { ...normalizeEntry(state.entries[iso]), ...patch };
      });
      saveEntries();
      await saveEntriesToCloud();
      recalc();
      state.bulkSelected = [];
      state.bulkMode = false;
      refreshBulkToolbar();
      await renderDays();
    }

    function initBulkTools(){
      const btn = document.getElementById('bulkModeBtn');
      const apply = document.getElementById('bulkApplyBtn');
      const clear = document.getElementById('bulkClearBtn');
      if (btn) btn.addEventListener('click', async () => { state.bulkMode = !state.bulkMode; if (!state.bulkMode) state.bulkSelected = []; refreshBulkToolbar(); await renderDays(); });
      if (apply) apply.addEventListener('click', applyBulkShift);
      if (clear) clear.addEventListener('click', async () => { state.bulkSelected = []; refreshBulkToolbar(); await renderDays(); });
      refreshBulkToolbar();
    }

    function renderDayEditor(day, entry, holidays){ return; }

    function renderHolidayYearPanel(holidays){
      const host = document.getElementById('holidayYearList');
      if (!host) return;
      const items = Array.from(holidays.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
      host.innerHTML = items.map(([iso,name])=>`<div class="holiday-item"><strong>${new Date(iso+"T12:00:00").toLocaleDateString('ro-RO',{day:'2-digit',month:'long'})}</strong><span class="muted">${name}</span></div>`).join('');
    }

    function openDayModal(day, entry, holidays){
      const autoHoliday = holidays.has(day.iso);
      const host = document.getElementById('dayModalContent');
      const overtime = Number(entry.overtimeHours || 0);
      const configuredShiftHours = Math.max(Number(state.settings.shiftHours) || 8, 0.25);
      const hasWorkShift = ['M','A','N'].includes(entry.code);
      const worked = hasWorkShift ? Math.max(Math.min(entry.workedHours === null || entry.workedHours === undefined ? configuredShiftHours : Number(entry.workedHours || 0), configuredShiftHours), 0) : 0;
      host.innerHTML = `
        <div class="day-modal-grid">
          <div class="modal-day-header">
            <div class="modal-day-number code-${entry.code || 'OFF'}">${day.day}</div>
            <div>
              <h3 style="margin-bottom:2px;font-size:18px;">${MONTHS[state.month]} ${state.year}</h3>
              <div class="muted-note" style="margin-top:0;">${translateDynamic('Alege tura, orele lucrate și opțional overtime/notiță.')}</div>
            </div>
          </div>
          <div class="modal-meta-row">
            ${day.isWeekend ? '<span class="mini-badge weekend">' + translateDynamic('Weekend automat') + '</span>' : '<span class="mini-badge">' + translateDynamic('Zi lucrătoare') + '</span>'}
            ${autoHoliday ? `<span class="mini-badge holiday">${holidays.get(day.iso)}</span>` : ''}
          </div>
          <div class="shift-quick-grid" id="dayShiftQuick"></div>
          <div class="shift-secondary-grid" id="dayShiftSecondary"></div>
          <div class="field">
            <label>${translateDynamic("Ore lucrate")}</label>
            <input id="dayModalWorkedHours" type="number" step="0.25" min="0" max="${configuredShiftHours}" value="${hasWorkShift ? fmtPlain(worked) : ''}" placeholder="Ex: 7.5" />
            <div class="hours-quick-grid" id="dayWorkedHoursQuick"></div>
            <div class="muted-note">${translateDynamic("Pentru plecat mai devreme, treci orele reale lucrate.")}</div>
          </div>
          <div class="field"><label>${translateDynamic("Ore suplimentare")}</label><input id="dayModalOvertime" type="number" step="0.25" min="0" value="${overtime || ''}" placeholder="0" /></div>
          <div class="field day-note-box"><label>${translateDynamic("Notiță")}</label><textarea id="dayModalNote" maxlength="200" placeholder="Ex: schimb cu colegul, tură specială, observații...">${escapeHtml(entry.note || '')}</textarea><div id="dayNoteCounter" class="note-counter">0/200 caractere</div></div>
          <div class="tiny-checks" id="dayOvertimeChecks"></div>
        </div>`;
      const quick = host.querySelector('#dayShiftQuick');
      const sec = host.querySelector('#dayShiftSecondary');
      const primaryCodes = ['OFF','M','A','N'];
      SHIFT_OPTIONS.filter(opt => primaryCodes.includes(opt.code)).forEach(opt => {
        const b=document.createElement('button');
        b.type='button';
        b.className=`tiny-shift-btn code-${opt.code}${entry.code===opt.code ? ' active' : ''}`;
        b.textContent=opt.label;
        b.disabled=!canUseCalculator();
        b.addEventListener('click',()=>{ if (!canUseCalculator()) { openPremiumScreen(); return; } updateEntry(day.iso,{ code: opt.code, workedHours: ['M','A','N'].includes(opt.code) ? (normalizeEntry(state.entries[day.iso]).workedHours ?? configuredShiftHours) : null }); openDayModal(day, normalizeEntry(state.entries[day.iso]), holidays); renderDays(); });
        quick.appendChild(b);
      });
      SHIFT_OPTIONS.filter(opt => !primaryCodes.includes(opt.code)).forEach(opt => {
        const b=document.createElement('button');
        b.type='button';
        b.className=`tiny-shift-btn code-${opt.code}${entry.code===opt.code ? ' active' : ''}`;
        b.textContent=opt.label;
        b.disabled=!canUseCalculator();
        b.addEventListener('click',()=>{ if (!canUseCalculator()) { openPremiumScreen(); return; } updateEntry(day.iso,{ code: opt.code, workedHours: ['M','A','N'].includes(opt.code) ? (normalizeEntry(state.entries[day.iso]).workedHours ?? configuredShiftHours) : null }); openDayModal(day, normalizeEntry(state.entries[day.iso]), holidays); renderDays(); });
        sec.appendChild(b);
      });
      const workedInput = host.querySelector('#dayModalWorkedHours');
      const workedQuick = host.querySelector('#dayWorkedHoursQuick');
      const maxQuickHour = Math.max(8, Math.ceil(configuredShiftHours));
      for (let h = 0; h <= maxQuickHour; h++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `hour-quick-btn${hasWorkShift && Math.abs(worked - h) < 0.001 ? ' active' : ''}`;
        b.textContent = `${h}h`;
        b.disabled = !canUseCalculator() || !hasWorkShift || h > configuredShiftHours;
        b.addEventListener('click', () => {
          if (!canUseCalculator()) { openPremiumScreen(); return; }
          updateEntry(day.iso, { workedHours: Math.max(Math.min(h, configuredShiftHours), 0) });
          openDayModal(day, normalizeEntry(state.entries[day.iso]), holidays);
          renderDays();
        });
        workedQuick.appendChild(b);
      }
      workedInput.disabled = !canUseCalculator() || !hasWorkShift;
      workedInput.addEventListener('input', () => {
        if (!canUseCalculator()) { openPremiumScreen(); return; }
        const val = Math.max(Math.min(Number(workedInput.value || 0), configuredShiftHours), 0);
        updateEntry(day.iso, { workedHours: val });
        renderDays();
      });
      const ot = host.querySelector('#dayModalOvertime');
      ot.disabled=!canUseCalculator();
      ot.addEventListener('input',()=>{ if (!canUseCalculator()) { openPremiumScreen(); return; } updateEntry(day.iso,{ overtimeHours: Math.max(Number(ot.value||0),0) }); renderDays(); });
      const noteInput = host.querySelector('#dayModalNote');
      noteInput.disabled=!canUseCalculator();
      noteInput.addEventListener('input',()=>{ if (!canUseCalculator()) { openPremiumScreen(); return; } updateEntry(day.iso,{ note: noteInput.value }); renderDays(); });
      const checkHost = host.querySelector('#dayOvertimeChecks');
      ['overtimeNight','overtimeWeekend','overtimeHoliday'].map((k,i)=>[
        k,
        [translateDynamic('OT noapte'),translateDynamic('OT weekend'),translateDynamic('OT sărbătoare')][i],
        [!!entry.overtimeNight,!!entry.overtimeWeekend,!!entry.overtimeHoliday][i]
      ]).forEach(([key,label,checked])=>{
        const item=document.createElement('label');
        item.className='tiny-check';
        item.innerHTML=`<input type="checkbox"> <span>${label}</span>`;
        const cb=item.querySelector('input');
        cb.checked=!!checked;
        cb.disabled=!canUseCalculator();
        cb.addEventListener('change',()=>{ if (!canUseCalculator()) { openPremiumScreen(); return; } updateEntry(day.iso,{ [key]: cb.checked }); renderDays(); });
        checkHost.appendChild(item);
      });
      document.getElementById('dayModalBackdrop').style.display='flex';
    }

    function closeDayModal(){
      document.getElementById('dayModalBackdrop').style.display='none';
    }

    function changeMonth(delta){
      const d = new Date(state.year, state.month + delta, 1);
      state.year = d.getFullYear();
      state.month = d.getMonth();
      renderSelectors();
      loadEntriesFromCloud().then(async ()=>{ await renderDays(); recalc(); saveSettingsToCloud(); });
    }

    function jumpToToday(){
      const n = new Date();
      state.year = n.getFullYear();
      state.month = n.getMonth();
      state.selectedDayIso = `${state.year}-${pad(state.month+1)}-${pad(n.getDate())}`;
      renderSelectors();
      loadEntriesFromCloud().then(async ()=>{ await renderDays(); recalc(); saveSettingsToCloud(); });
    }

    function bindCollapsibles(){
      document.querySelectorAll('.collapse-head').forEach(btn=>{
        if (btn.dataset.boundCollapse === '1') return;
        btn.dataset.boundCollapse = '1';
        btn.addEventListener('click',(ev)=>{
          ev.preventDefault();
          ev.stopPropagation();
          const body = document.getElementById(btn.dataset.collapse);
          if (!body) return;
          const open = body.classList.toggle('open');
          btn.classList.toggle('active', open);
          const arrow = btn.querySelector('.collapse-arrow');
          if (arrow) arrow.textContent = open ? '▾' : '▸';
        });
      });
    }

    async function loadCalcHistory() {
      if (!state.currentUser || !state.isPremium || !state.appUnlocked) {
        document.getElementById('historyList').innerHTML = '<div class="muted" style="font-size:13px;padding:16px 0;">' + translateDynamic('Autentifică-te și activează Premium pentru a vedea istoricul.') + '</div>';
        return;
      }
      document.getElementById('historyList').innerHTML = '<div class="muted" style="font-size:13px;padding:16px 0;">' + translateDynamic('Se încarcă...') + '</div>';
      try {
        const uid = state.currentUser.uid;
        const snapshot = await db.collection('users').doc(uid).collection('calculations')
          .orderBy('createdAt', 'desc').limit(50).get();
        const calcs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        document.getElementById('histCount').textContent = calcs.length;
        const total = calcs.reduce((s, c) => s + (c.totalEstimated ?? c.netSalary ?? 0), 0);
        document.getElementById('histTotal').textContent = fmt(total);

        if (calcs.length === 0) {
          document.getElementById('historyList').innerHTML = '<div class="muted" style="font-size:13px;padding:16px 0;">' + translateDynamic('Nu ai calcule salvate încă.') + '</div>';
          return;
        }

        const monthNamesArr = ['', 'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
        const html = calcs.map(c => {
          const gross = c.grossSalary ?? c.grossEstimate ?? 0;
          const net = c.netSalary ?? 0;
          const total = c.totalEstimated ?? net;
          const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString(currentLang === 'en' ? 'en-GB' : 'ro-RO', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
          const monthLabel = c.month ? `${monthNamesArr[c.month] || c.month} ${c.year || ''}` : '';
          return `<div class="card" style="padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
              <div>
                <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;">${escapeHtml(dateStr)}</div>
                ${monthLabel ? `<div style="font-size:13px;font-weight:600;margin-top:2px;color:#93c5fd;">${escapeHtml(monthLabel)}</div>` : ''}
              </div>
              <strong style="font-size:22px;color:#2ee6a6;">${fmt(net)}</strong>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
              <div><div class="muted" style="font-size:11px;">${translateDynamic('Brut')}</div><strong style="font-size:15px;">${fmt(gross)}</strong></div>
              <div><div class="muted" style="font-size:11px;">${translateDynamic('Tichete')}</div><strong style="font-size:15px;">${fmt(c.mealTickets ?? 0)}</strong></div>
              <div><div class="muted" style="font-size:11px;">${translateDynamic('Total')}</div><strong style="font-size:15px;">${fmt(total)}</strong></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
              <div><div class="muted" style="font-size:11px;">CAS</div><strong style="font-size:13px;color:#fda4af;">${fmt(c.cas ?? 0)}</strong></div>
              <div><div class="muted" style="font-size:11px;">CASS</div><strong style="font-size:13px;color:#fda4af;">${fmt(c.cass ?? 0)}</strong></div>
              <div><div class="muted" style="font-size:11px;">${translateDynamic('Impozit')}</div><strong style="font-size:13px;color:#fda4af;">${fmt(c.incomeTax ?? 0)}</strong></div>
            </div>
            <div style="display:flex;gap:8px;">
              <button onclick="exportHistoryCalc(${JSON.stringify(c).replace(/"/g,'&quot;')})" class="ghost" style="flex:1;font-size:12px;padding:10px;">📄 Export PDF</button>
              <button onclick="deleteHistoryCalc('${escapeHtml(c.id)}')" class="secondary" style="font-size:12px;padding:10px 14px;">🗑️</button>
            </div>
          </div>`;
        }).join('');
        document.getElementById('historyList').innerHTML = html;
      } catch(e) {
        console.error(e);
        document.getElementById('historyList').innerHTML = '<div class="muted" style="font-size:13px;padding:16px 0;">' + translateDynamic('Eroare la încărcare.') + '</div>';
      }
    }

    async function deleteHistoryCalc(id) {
      if (!state.currentUser) return;
      if (!window.confirm(translateDynamic('Sigur vrei să ștergi acest calcul?'))) return;
      try {
        await db.collection('users').doc(state.currentUser.uid).collection('calculations').doc(id).delete();
        handleBillingMessage(translateDynamic('Calcul șters cu succes.'));
        loadCalcHistory();
      } catch(e) {
        handleBillingMessage(translateDynamic('Eroare la ștergere.'));
      }
    }

    function exportHistoryCalc(c) {
      const gross = c.grossSalary ?? c.grossEstimate ?? 0;
      const net = c.netSalary ?? 0;
      const total = c.totalEstimated ?? net;
      const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('ro-RO', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
      const monthNamesArr = ['', 'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
      const monthLabel = c.month ? `${monthNamesArr[c.month] || c.month} ${c.year || ''}` : '';
      const w = window.open('', '_blank');
      if (!w) { handleBillingMessage('Nu s-a putut deschide fereastra de export.'); return; }
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Raport salariu ${escapeHtml(monthLabel)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111827}h1{margin-bottom:6px}.muted{color:#6b7280;margin-bottom:24px;font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card{border:1px solid #d1d5db;border-radius:12px;padding:14px}.label{color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.08em}.value{font-size:20px;font-weight:700;margin-top:6px}
/* ── ESTIMATE SECTION REDESIGN ───────────────────────────── */
.est-hero-row{display:grid;grid-template-columns:1.1fr 1fr;gap:14px;margin-bottom:16px}
.est-hero-net{background:linear-gradient(135deg,#05111f,#071c36 60%,#0a2840);border:1px solid rgba(46,230,166,.2);border-radius:22px;padding:22px;display:flex;flex-direction:column;justify-content:center}
.est-hero-label{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:6px}
.est-hero-value{font-size:44px;font-weight:900;color:#2ee6a6;line-height:1;letter-spacing:-.02em}
.est-hero-sub{font-size:12px;color:#475569;margin-top:6px}
.est-side-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.est-side-card{background:linear-gradient(180deg,rgba(17,28,49,.9),rgba(10,19,36,.95));border:1px solid rgba(148,163,184,.1);border-radius:16px;padding:12px}
.est-side-card.highlight{border-color:rgba(56,189,248,.25);background:linear-gradient(135deg,rgba(14,30,55,.95),rgba(10,24,46,.98))}
.est-side-label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
.est-side-value{font-size:18px;font-weight:800;color:#e2e8f0}
.est-extras{color:#fbbf24}
.est-gross{color:#94a3b8}
/* shift chips */
.shift-chips-row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:14px}
.shift-chip{display:flex;align-items:center;gap:8px;padding:10px 8px;border-radius:16px;border:1px solid rgba(148,163,184,.1);background:rgba(255,255,255,.03)}
.shift-chip-icon{width:28px;height:28px;border-radius:10px;display:grid;place-items:center;font-size:11px;font-weight:900;flex-shrink:0}
.shift-chip-count{font-size:18px;font-weight:800;line-height:1}
.shift-chip-name{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-top:2px}
.chip-m .shift-chip-icon{background:linear-gradient(135deg,rgba(16,185,129,.3),rgba(52,211,153,.2));color:#6ee7b7}
.chip-a .shift-chip-icon{background:linear-gradient(135deg,rgba(245,158,11,.3),rgba(251,191,36,.2));color:#fde68a}
.chip-n .shift-chip-icon{background:linear-gradient(135deg,rgba(37,99,235,.3),rgba(96,165,250,.2));color:#bfdbfe}
.chip-ot .shift-chip-icon{background:linear-gradient(135deg,rgba(14,165,233,.28),rgba(56,189,248,.2));color:#e0f2fe}
.chip-co .shift-chip-icon{background:linear-gradient(135deg,rgba(124,58,237,.28),rgba(167,139,250,.2));color:#f5f3ff}
.chip-h .shift-chip-icon{background:linear-gradient(135deg,rgba(244,63,94,.28),rgba(251,113,133,.2));font-size:14px}
@media(max-width:640px){.est-hero-row{grid-template-columns:1fr}.shift-chips-row{grid-template-columns:repeat(3,1fr)}.est-hero-value{font-size:36px}}
/* ── DETAIL CARDS REDESIGN ───────────────────────────────── */
.detail-cards-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.detail-card{padding:14px 16px;border-radius:18px;background:linear-gradient(180deg,rgba(17,28,49,.92),rgba(10,19,36,.96));border:1px solid rgba(148,163,184,.1);transition:border-color .2s}
.dc-gross{border-color:rgba(148,163,184,.18)}
.dc-deduct{border-color:rgba(251,113,133,.15)}
.dc-base{border-color:rgba(251,191,36,.15)}
.dc-net{border-color:rgba(46,230,166,.3);background:linear-gradient(135deg,#040f1e,#061624)}
.dc-label{font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:#64748b;margin-bottom:5px}
.dc-value{font-size:20px;font-weight:800;display:block}
.dc-red{color:#fda4af}
.dc-yellow{color:#fde68a}
.dc-green{color:#2ee6a6}
/* ── DAY MODAL HEADER ────────────────────────────────────── */
.modal-day-header{display:flex;align-items:center;gap:14px}
.modal-day-number{width:52px;height:52px;border-radius:18px;display:grid;place-items:center;font-size:22px;font-weight:900;flex-shrink:0;color:#f8fafc}
.modal-day-number.code-M{background:linear-gradient(135deg,rgba(16,185,129,.35),rgba(52,211,153,.25));border:1px solid rgba(52,211,153,.3)}
.modal-day-number.code-A{background:linear-gradient(135deg,rgba(245,158,11,.35),rgba(251,191,36,.25));border:1px solid rgba(251,191,36,.3)}
.modal-day-number.code-N{background:linear-gradient(135deg,rgba(37,99,235,.35),rgba(96,165,250,.25));border:1px solid rgba(96,165,250,.3)}
.modal-day-number.code-CO{background:linear-gradient(135deg,rgba(124,58,237,.35),rgba(167,139,250,.25));border:1px solid rgba(167,139,250,.3)}
.modal-day-number.code-CM{background:linear-gradient(135deg,rgba(244,63,94,.35),rgba(251,113,133,.25));border:1px solid rgba(251,113,133,.3)}
.modal-day-number.code-OFF{background:linear-gradient(135deg,rgba(71,85,105,.35),rgba(100,116,139,.2));border:1px solid rgba(148,163,184,.15)}


/* === V9 REAL PREMIUM DASHBOARD / visible UI refresh === */
:root{--v9-bg:#050b16;--v9-card:#0b1728;--v9-card2:#10213a;--v9-line:rgba(148,163,184,.18);--v9-text:#f8fafc;--v9-muted:#9fb0c8;--v9-blue:#38bdf8;--v9-green:#22c55e;--v9-purple:#a78bfa;--v9-orange:#f59e0b;}
body{background:radial-gradient(circle at 12% -5%,rgba(56,189,248,.22),transparent 30%),radial-gradient(circle at 100% 4%,rgba(34,197,94,.16),transparent 28%),linear-gradient(180deg,#071326 0%,#06101f 55%,#040914 100%)!important;}
.card.estimate-card{border-radius:30px!important;border:1px solid rgba(125,211,252,.20)!important;background:linear-gradient(180deg,rgba(13,30,55,.96),rgba(6,15,30,.98))!important;box-shadow:0 26px 70px rgba(0,0,0,.42),0 0 0 1px rgba(255,255,255,.035) inset!important;}
.estimate-head{background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(34,197,94,.06))!important;border-bottom:1px solid rgba(148,163,184,.12)!important;}
.estimate-head h2{font-size:26px!important;color:#f8fafc!important;text-shadow:0 8px 26px rgba(56,189,248,.12);}
.section-kicker{display:inline-flex!important;width:max-content;padding:7px 10px!important;border-radius:999px;background:rgba(56,189,248,.10);border:1px solid rgba(125,211,252,.25);font-size:11px!important;letter-spacing:.08em;text-transform:uppercase;color:#a5f3fc!important;margin-bottom:8px;}
.v8-month-pill{background:rgba(15,23,42,.68)!important;border-color:rgba(125,211,252,.22)!important;color:#dbeafe!important;}
.v8-estimate-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;}
.v8-metric{border-radius:24px!important;min-height:112px!important;align-items:flex-start!important;flex-direction:column!important;gap:10px!important;padding:15px!important;background:linear-gradient(145deg,rgba(17,34,58,.96),rgba(7,18,34,.98))!important;border:1px solid rgba(148,163,184,.16)!important;box-shadow:0 16px 34px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.055)!important;}
.v8-icon{width:44px!important;height:44px!important;border-radius:17px!important;font-size:22px!important;background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.055))!important;}
.v8-label{font-size:11px!important;text-transform:uppercase!important;letter-spacing:.07em!important;color:#a8bdd8!important;font-weight:900!important;}
.v8-value{font-size:20px!important;line-height:1.05!important;color:#fff!important;}
.v8-total-band{margin:16px 0 2px!important;border-radius:28px!important;padding:20px 14px!important;background:linear-gradient(135deg,#2563eb 0%,#0891b2 50%,#16a34a 100%)!important;box-shadow:0 22px 48px rgba(14,165,233,.30),0 0 36px rgba(34,197,94,.14),inset 0 1px 0 rgba(255,255,255,.25)!important;}
.v8-total-band .v8-label{color:rgba(255,255,255,.86)!important;font-size:12px!important;}
.v8-total-band .v8-value{font-size:36px!important;}
.v8-section-title{font-size:12px!important;color:#bae6fd!important;background:rgba(56,189,248,.07);border:1px solid rgba(125,211,252,.13);padding:9px 11px;border-radius:999px;width:max-content;margin-top:18px!important;}
.v8-shifts{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;}
.v8-shift{min-height:92px!important;border-radius:22px!important;padding:13px!important;background:linear-gradient(145deg,rgba(14,27,48,.98),rgba(8,18,34,.98))!important;border:1px solid rgba(148,163,184,.15)!important;box-shadow:0 12px 28px rgba(0,0,0,.20)!important;}
.v8-shift-count{font-size:24px!important;color:#f8fafc!important;}
.v8-shift-name{font-size:10.5px!important;color:#a8bdd8!important;}
#rulesSection .collapse-body{display:grid;gap:12px;}
#rulesSection .field{background:linear-gradient(145deg,rgba(17,34,58,.88),rgba(7,18,34,.96))!important;border:1px solid rgba(148,163,184,.16)!important;border-radius:22px!important;padding:13px!important;}
#rulesSection input{min-height:48px!important;font-size:16px!important;color:#fff!important;border:1px solid rgba(125,211,252,.20)!important;}
#rulesSection input:focus{outline:none!important;border-color:rgba(56,189,248,.78)!important;box-shadow:0 0 0 4px rgba(56,189,248,.12)!important;}
#rulesSection .footer-note,.footer-note{display:none!important;}
.pin-modal.day-modal{border-radius:30px 30px 0 0!important;background:linear-gradient(180deg,rgba(14,30,54,.98),rgba(5,13,27,.99))!important;}
.shift-quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
.tiny-shift-btn{background:linear-gradient(145deg,rgba(17,34,58,.96),rgba(7,18,34,.98))!important;border:1px solid rgba(148,163,184,.18)!important;}
.tiny-shift-btn.active{background:linear-gradient(135deg,rgba(37,99,235,.95),rgba(14,165,233,.75))!important;border-color:rgba(186,230,253,.82)!important;color:#fff!important;}
@media(max-width:480px){.v8-estimate-grid{gap:9px!important}.v8-metric{min-height:104px!important;padding:12px!important}.v8-value{font-size:17px!important}.v8-total-band .v8-value{font-size:31px!important}.estimate-head h2{font-size:23px!important}.v8-shift{min-height:84px!important}}






/* === V14 PRODUCT FEATURES PATCH === */
.mini-field-hint{font-size:11px;color:#93c5fd;margin-top:6px;display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}.mini-inline-btn{min-height:28px!important;padding:5px 8px!important;border-radius:999px!important;font-size:11px!important;background:linear-gradient(135deg,#16a34a,#eab308)!important;color:#06111f!important;border:0!important}.feature-preview-card{margin:12px 0;padding:13px 14px;border-radius:18px;background:linear-gradient(135deg,rgba(22,163,74,.16),rgba(234,179,8,.12));border:1px solid rgba(132,204,22,.24);color:#d9f99d;font-weight:800;font-size:13px;line-height:1.4}.faq-mini{padding:12px 0;border-bottom:1px solid rgba(148,163,184,.12);display:grid;gap:5px}.faq-mini span{color:#a8bdd8;font-size:13px;line-height:1.45}.note-counter{text-align:right;color:#94a3b8;font-size:11px;margin-top:5px}.pricing-compare{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.pricing-compare>div{padding:14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:rgba(15,23,42,.66);display:grid;gap:5px}.pricing-compare span{font-size:12px;color:#94a3b8;line-height:1.35}.pricing-compare .hot{background:linear-gradient(135deg,rgba(22,163,74,.22),rgba(234,179,8,.13));border-color:rgba(132,204,22,.25)}body.light-mode{--bg:#eef6ff!important;--panel:#ffffff!important;--text:#0f172a!important;--muted:#475569!important;background:#eef6ff!important;color:#0f172a!important}body.light-mode .card,body.light-mode .collapsible-card,body.light-mode .app-panel,body.light-mode .estimate-card{background:linear-gradient(180deg,#ffffff,#f8fbff)!important;color:#0f172a!important;border-color:rgba(15,23,42,.12)!important}body.light-mode input,body.light-mode textarea,body.light-mode select{background:#fff!important;color:#0f172a!important;border-color:rgba(15,23,42,.16)!important}@media(max-width:520px){.pricing-compare{grid-template-columns:1fr}.v8-estimate-actions{display:grid!important;grid-template-columns:1fr!important}}
</style></head><body><h1>Raport calcul salariu · Salary Helper</h1><p class="muted">${escapeHtml(dateStr)}${monthLabel ? ' · ' + escapeHtml(monthLabel) : ''}</p><div class="grid"><div class="card"><div class="label">Brut estimat</div><div class="value">${gross.toFixed(2)} RON</div></div><div class="card"><div class="label">Salariu net</div><div class="value">${net.toFixed(2)} RON</div></div><div class="card"><div class="label">Tichete masă</div><div class="value">${(c.mealTickets ?? 0).toFixed(2)} RON</div></div><div class="card"><div class="label">Total estimat</div><div class="value">${total.toFixed(2)} RON</div></div><div class="card"><div class="label">CAS</div><div class="value">${(c.cas ?? 0).toFixed(2)} RON</div></div><div class="card"><div class="label">CASS</div><div class="value">${(c.cass ?? 0).toFixed(2)} RON</div></div><div class="card"><div class="label">Impozit</div><div class="value">${(c.incomeTax ?? 0).toFixed(2)} RON</div></div><div class="card"><div class="label">Bază impozabilă</div><div class="value">${(c.taxableIncome ?? 0).toFixed(2)} RON</div></div></div><p style="margin-top:18px;color:#64748b;font-size:12px;">Folosește Print / Save as PDF din browser.</p></body></html>`);
      w.document.close(); w.focus();
    }


      document.querySelectorAll('.menu-tab').forEach(btn=>{
        btn.addEventListener('click',()=>{
          document.querySelectorAll('.menu-tab').forEach(x=>x.classList.remove('active'));
          btn.classList.add('active');
          const target = btn.dataset.target;
          // Show/hide history section
          const histSec = document.getElementById('historySection');
          if (histSec) histSec.style.display = target === 'historySection' ? 'block' : 'none';
          const el = document.getElementById(target);
          if (!el) return;
          if (target === 'historySection') {
            loadCalcHistory();
            el.scrollIntoView({behavior:'smooth', block:'start'});
            return;
          }
          const body = el.querySelector('.collapse-body, .estimate-body');
          const head = el.querySelector('.collapse-head, .estimate-head');
          if (body && !body.classList.contains('open')) {
            body.classList.add('open');
            if (head) head.classList.add('active');
          }
          el.scrollIntoView({behavior:'smooth', block:'start'});
        });
      });
      document.getElementById('refreshHistoryBtn').addEventListener('click', loadCalcHistory);


    function renderMonthlyStats(stats) {
      document.getElementById('statWorkedDays').textContent = stats.workedDays ?? '—';
      document.getElementById('statMorning').textContent = stats.morningDays ?? '—';
      document.getElementById('statAfter').textContent = stats.afterDays ?? '—';
      document.getElementById('statNight').textContent = stats.nightDays ?? '—';
      document.getElementById('statOvertime').textContent = `${fmtPlain(stats.overtimeHours || 0)}h`;
      document.getElementById('statHoliday').textContent = stats.holidayDays ?? '—';
    }

    // Store last calculation result for saving
    let _lastCalcResult = null;

    async function saveCalculation() {
      if (!state.currentUser) {
        handleBillingMessage(translateDynamic('Trebuie să fii autentificat'));
        return;
      }
      if (!_lastCalcResult || _lastCalcResult.gross <= 0) {
        handleBillingMessage(translateDynamic('Calculează mai întâi salariul'));
        return;
      }
      try {
        const uid = state.currentUser.uid;
        const r = _lastCalcResult;
        await db.collection('users').doc(uid).collection('calculations').add({
          grossSalary: r.gross,
          grossEstimate: r.gross,
          cas: r.cas,
          cass: r.cass,
          taxableIncome: r.taxable,
          incomeTax: r.tax,
          netSalary: r.net,
          mealTickets: r.mealTickets,
          totalEstimated: r.totalReceived,
          overtimeExtra: r.overtimeBonus,
          nightExtra: r.nightBonus,
          weekendExtra: r.weekendBonus,
          holidayExtra: r.holidayBonus,
          baseSalary: state.settings.baseSalary,
          month: state.month,
          year: state.year,
          createdAt: new Date().toISOString()
        });
        handleBillingMessage(translateDynamic('Calcul salvat cu succes'));
      } catch(e) {
        console.error(e);
        handleBillingMessage(translateDynamic('Eroare la salvarea calculului'));
      }
    }

    function exportMonthlyReport() {
      if (!state.isPremium || !state.appUnlocked) {
        openPremiumScreen();
        return;
      }
      const monthName = monthNames[state.month];
      const rows = Array.from(document.querySelectorAll('#detailList .item')).map(item => {
        const a = item.querySelector('span')?.textContent || '';
        const b = item.querySelector('strong')?.textContent || '';
        return `<tr><td style="padding:8px 10px;border-bottom:1px solid #dbe4f0;">${escapeHtml(a)}</td><td style="padding:8px 10px;border-bottom:1px solid #dbe4f0;text-align:right;">${escapeHtml(b)}</td></tr>`;
      }).join('');
      const w = window.open('', '_blank');
      if (!w) {
        handleBillingMessage('Nu s-a putut deschide fereastra pentru export.');
        return;
      }
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Raport salariu ${monthName} ${state.year}</title></head><body style="font-family:Arial,sans-serif;padding:24px;color:#0f172a;">
        <h1 style="margin:0 0 8px;">Salary Helper · raport lunar</h1>
        <p style="margin:0 0 20px;color:#475569;">${monthName} ${state.year} · ${escapeHtml(state.currentUser?.email || '-')}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
        <p style="margin-top:18px;color:#64748b;">Folosește Print / Save as PDF pentru export.</p>
      </body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 250);
    }

    function recalc(){
      const s=state.settings, days=getDays(state.year, state.month), holidays=getRomaniaHolidays(state.year);
      const refDays = Math.max(workingDaysReference(days, holidays),1);
      const shiftHours = Math.max(Number(s.shiftHours) || 8, 0.25);
      const hourlyBase = (Number(s.baseSalary) || 0) / (refDays * shiftHours);
      let workedDays=0, normalHours=0, nightHours=0, weekendHours=0, holidayHours=0, vacationDays=0, medicalDays=0;
      let undertimeHours=0, scheduledShiftDays=0;
      let overtimeHours=0, overtimeNightHours=0, overtimeWeekendHours=0, overtimeHolidayHours=0;
      let morningDays=0, afterDays=0, nightDays=0, holidayDays=0;

      days.forEach(day=>{
        const entry=normalizeEntry(state.entries[day.iso]);
        const autoHoliday=holidays.has(day.iso);
        const hasShift = ['M','A','N'].includes(entry.code);
        if(hasShift){
          scheduledShiftDays++;
          const actualWorkedHours = Math.max(Math.min(entry.workedHours === null || entry.workedHours === undefined ? shiftHours : Number(entry.workedHours || 0), shiftHours), 0);
          undertimeHours += Math.max(shiftHours - actualWorkedHours, 0);
          if(actualWorkedHours > 0) workedDays++;
          normalHours += actualWorkedHours;
          if(entry.code==='M' && actualWorkedHours > 0) morningDays++;
          if(entry.code==='A' && actualWorkedHours > 0) afterDays++;
          if(entry.code==='N' && actualWorkedHours > 0) { nightHours += actualWorkedHours; nightDays++; }
          if(day.isWeekend) weekendHours += actualWorkedHours;
          if(autoHoliday) { holidayHours += actualWorkedHours; if(actualWorkedHours > 0) holidayDays++; }
        }
        overtimeHours += entry.overtimeHours || 0;
        if(entry.overtimeNight) overtimeNightHours += entry.overtimeHours || 0;
        if(entry.overtimeWeekend) overtimeWeekendHours += entry.overtimeHours || 0;
        if(entry.overtimeHoliday || autoHoliday) overtimeHolidayHours += (entry.overtimeHoliday ? entry.overtimeHours || 0 : 0);
        if(entry.code==='CO') vacationDays++;
        if(entry.code==='CM') medicalDays++;
      });

      const hasEntries = workedDays > 0 || scheduledShiftDays > 0 || vacationDays > 0 || medicalDays > 0 || overtimeHours > 0;
      if (!hasEntries || !state.appUnlocked) {
        renderMonthlyStats({ workedDays:'—', morningDays:'—', afterDays:'—', nightDays:'—', overtimeHours:0, holidayDays:'—' });
        maskSensitiveViews();
        return;
      }

      const paidMedicalDays = Math.max(medicalDays - Math.max(Number(s.unpaidMedicalDays) || 0, 0), 0);
      const grossBase = normalHours * hourlyBase;
      const grossVacation = vacationDays * shiftHours * hourlyBase;
      const grossMedical = paidMedicalDays * shiftHours * hourlyBase;
      const grossOvertimeBase = overtimeHours * hourlyBase;
      const nightBonus = (nightHours + overtimeNightHours) * hourlyBase * s.nightRate;
      const overtimeBonus = overtimeHours * hourlyBase * s.overtimeRate;
      const weekendBonus = (weekendHours + overtimeWeekendHours) * hourlyBase * s.weekendRate;
      const holidayBonus = (holidayHours + overtimeHolidayHours) * hourlyBase * s.holidayRate;
      const gross = grossBase + grossVacation + grossMedical + grossOvertimeBase + nightBonus + overtimeBonus + weekendBonus + holidayBonus;
      const cas = gross * s.casRate;
      const cass = gross * s.cassRate;
      const taxable = gross - cas - cass;
      const tax = taxable * s.taxRate;
      const net = gross - cas - cass - tax;
      const mealTickets = workedDays * s.mealValue;
      const extras = nightBonus + overtimeBonus + weekendBonus + holidayBonus;
      const totalReceived = net + mealTickets;

      document.getElementById('sumGross').textContent = fmt(gross);
      const grossEstEl = document.getElementById('sumGrossEst');
      if (grossEstEl) grossEstEl.textContent = fmt(gross);
      const monthLabelEl = document.getElementById('estMonthLabel');
      if (monthLabelEl) {
        const mNames = currentLang === 'en'
          ? ['January','February','March','April','May','June','July','August','September','October','November','December']
          : ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
        monthLabelEl.textContent = mNames[state.month] + ' ' + state.year;
      }
      // Update detail cards
      const dcEl = document.getElementById('detailCards');
      if (dcEl) {
        dcEl.style.display = 'grid';
        document.getElementById('dcGross').textContent = fmt(gross);
        document.getElementById('dcCas').textContent = fmt(cas);
        document.getElementById('dcCass').textContent = fmt(cass);
        document.getElementById('dcTaxBase').textContent = fmt(gross - cas - cass);
        document.getElementById('dcTax').textContent = fmt(tax);
        document.getElementById('dcNet').textContent = fmt(net);
      }
      document.getElementById('sumNet').textContent = fmt(net);
      document.getElementById('sumMeals').textContent = fmt(mealTickets);
      document.getElementById('sumExtras').textContent = fmt(extras);
      document.getElementById('sumTotal').textContent = fmt(totalReceived);
      const qNet = document.getElementById('v10QuickNet'); if(qNet) qNet.textContent = fmt(net);
      const qTax = document.getElementById('v10QuickTax'); if(qTax) qTax.textContent = fmt(tax);
      const qCas = document.getElementById('v10QuickCas'); if(qCas) qCas.textContent = fmt(cas);
      const qCass = document.getElementById('v10QuickCass'); if(qCass) qCass.textContent = fmt(cass);
      const qMeals = document.getElementById('v10QuickMeals'); if(qMeals) qMeals.textContent = fmt(mealTickets);
      _lastCalcResult = { gross, cas, cass, taxable, tax, net, mealTickets, totalReceived, nightBonus, overtimeBonus, weekendBonus, holidayBonus };

      const detail = [
        ['Salariu brut de referință', fmt(s.baseSalary)],
        ['Ore / tură', `${fmtPlain(shiftHours)} h`],
        ['Zile cu tură setată', `${scheduledShiftDays} zile`],
        ['Zile lucrate efectiv', `${workedDays} zile`],
        ['Ore lucrate', `${fmtPlain(normalHours)} h`],
        ['Ore nelucrate / undertime', `${fmtPlain(undertimeHours)} h`],
        ['Ore suplimentare', `${fmtPlain(overtimeHours)} h`],
        ['Ore night', `${fmtPlain(nightHours + overtimeNightHours)} h`],
        ['Ore weekend', `${fmtPlain(weekendHours + overtimeWeekendHours)} h`],
        ['Ore sărbători', `${fmtPlain(holidayHours + overtimeHolidayHours)} h`],
        ['CO plătit', `${vacationDays} zile`],
        ['CM plătit', `${paidMedicalDays} zile`],
        ['Tarif orar', fmt(hourlyBase)],
        ['Spor noapte', fmt(nightBonus)],
        ['Spor overtime', fmt(overtimeBonus)],
        ['Spor weekend', fmt(weekendBonus)],
        ['Spor sărbători', fmt(holidayBonus)],
        ['Total brut', fmt(gross)],
        ['CAS', fmt(cas)],
        ['CASS', fmt(cass)],
        ['Impozit', fmt(tax)],
        ['Salariu net', fmt(net)],
        ['Bonuri de masă', fmt(mealTickets)],
        ['Total încasat', fmt(totalReceived)]
      ];
      document.getElementById('detailList').innerHTML = detail.map(([a,b])=>`<div class="item"><span class="muted">${a}</span><strong>${b}</strong></div>`).join('');
      renderMonthlyStats({ workedDays, morningDays, afterDays, nightDays, overtimeHours, holidayDays });
    }

    function decimalToPercent(value){
      return Number(((Number(value) || 0) * 100).toFixed(2));
    }

    function percentInputToDecimal(id){
      return (parseNum(id) || 0) / 100;
    }

    function syncSettingsToInputs(){
      // V9: Free users must be able to enter salary/rules. Limits are enforced only when Save/Calculate is pressed.
      const s = state.settings || defaultSettings;
      document.getElementById('baseSalary').value = s.baseSalary || '';
      const quickSalaryEl = document.getElementById('v10QuickSalary'); if (quickSalaryEl) quickSalaryEl.value = s.baseSalary || '';
      const quickRangeEl = document.getElementById('v10SalaryRange'); if (quickRangeEl && s.baseSalary) quickRangeEl.value = Math.max(1000, Math.min(50000, Number(s.baseSalary)));
      document.getElementById('nightRate').value = decimalToPercent(s.nightRate);
      document.getElementById('overtimeRate').value = decimalToPercent(s.overtimeRate);
      document.getElementById('weekendRate').value = decimalToPercent(s.weekendRate);
      document.getElementById('holidayRate').value = decimalToPercent(s.holidayRate);
      document.getElementById('mealValue').value = s.mealValue || '';
      document.getElementById('casRate').value = decimalToPercent(s.casRate);
      document.getElementById('cassRate').value = decimalToPercent(s.cassRate);
      document.getElementById('taxRate').value = decimalToPercent(s.taxRate);
      document.getElementById('shiftHours').value = s.shiftHours || '';
      document.getElementById('unpaidMedicalDays').value = s.unpaidMedicalDays ?? '';
    }

    async function saveSettings(){
      if (!state.isPremium) {
        // Free user: check usage limit
        if (canUseCalculator()) {
          const usage = await consumeUsage(state.currentUser.uid, false);
          if (!usage.allowed) {
            handleBillingMessage(translateDynamic('Ai atins limita de 15 calcule pe lună. Activează Premium pentru acces nelimitat.'));
            openPremiumScreen();
            return;
          }
          showAdIfNeeded(usage.shouldShowAd);
          updateUsageBadge(usage.remaining, false);
          // Allow free user to see the calc result (read-only)
          state.settings = {
            baseSalary: parseNum('baseSalary'),
            nightRate: percentInputToDecimal('nightRate'),
            overtimeRate: percentInputToDecimal('overtimeRate'),
            weekendRate: percentInputToDecimal('weekendRate'),
            holidayRate: percentInputToDecimal('holidayRate'),
            mealValue: parseNum('mealValue'),
            casRate: percentInputToDecimal('casRate'),
            cassRate: percentInputToDecimal('cassRate'),
            taxRate: percentInputToDecimal('taxRate'),
            shiftHours: Math.max(parseNum('shiftHours') || 8, 0.25),
            unpaidMedicalDays: Math.max(Math.round(parseNum('unpaidMedicalDays') || 1), 0)
          };
          recalc();
          return;
        }
        openPremiumScreen();
        return;
      }
      state.settings = {
        baseSalary: parseNum('baseSalary'),
        nightRate: percentInputToDecimal('nightRate'),
        overtimeRate: percentInputToDecimal('overtimeRate'),
        weekendRate: percentInputToDecimal('weekendRate'),
        holidayRate: percentInputToDecimal('holidayRate'),
        mealValue: parseNum('mealValue'),
        casRate: percentInputToDecimal('casRate'),
        cassRate: percentInputToDecimal('cassRate'),
        taxRate: percentInputToDecimal('taxRate'),
        shiftHours: Math.max(parseNum('shiftHours') || 8, 0.25),
        unpaidMedicalDays: Math.max(Math.round(parseNum('unpaidMedicalDays') || 1), 0)
      };
      save('salary_settings', state.settings);
      await saveSettingsToCloud();
      recalc();
      // Update usage badge for premium
      if (state.currentUser) updateUsageBadge(999999, true);
    }

    async function fillDemo(){
      if (!canUseCalculator()) {
        openPremiumScreen();
        return;
      }
      const days=getDays(state.year,state.month); const pattern=['M','A','N','OFF']; const entries={};
      days.forEach((d,i)=>{ entries[d.iso]={ ...createDefaultEntry(), code: pattern[i%4] }; });
      if(days[3]) entries[days[3].iso]={ ...createDefaultEntry(), code:'CO' }; if(days[11]) entries[days[11].iso]={ ...createDefaultEntry(), code:'CM' }; if(days[12]) entries[days[12].iso]={ ...createDefaultEntry(), code:'CM' }; if(days[20]) entries[days[20].iso]={ ...createDefaultEntry(), code:'N', overtimeHours:2, overtimeNight:true, overtimeWeekend:true, overtimeHoliday:true,  };
      state.entries=entries; saveEntries(); await saveEntriesToCloud(); await renderDays(); recalc();
    }

    async function resetMonth(){ if (!canUseCalculator()) { openPremiumScreen(); return; } state.entries={}; saveEntries(); await saveEntriesToCloud(); await renderDays(); recalc(); }

    async function setupAppUI(){
      await loadSettingsFromCloud();
      syncSettingsToInputs();
      renderSelectors();
      renderWeekdays();
      bindCollapsibles();
      await loadEntriesFromCloud();
      await renderDays();
      renderLogicSummary();
      recalc();
      applyAccessMode();
      if (!localStorage.getItem('salary_tutorial_seen')) {
        setTimeout(() => { openTutorial(); localStorage.setItem('salary_tutorial_seen', '1'); }, 350);
      }
    }

    function setMainAuthView(mode) {
      const reg = mode === 'register';
      document.getElementById('registerMainPanel').classList.toggle('hidden', !reg);
      document.getElementById('loginMainPanel').classList.toggle('hidden', reg);
      document.getElementById('tabRegisterMain').className = reg ? 'ghost' : 'secondary';
      document.getElementById('tabLoginMain').className = reg ? 'secondary' : 'ghost';
      document.getElementById('mainAuthMsg').textContent = '';
    }

    async function showApp() {
      document.getElementById('authScreen').style.display = 'none';
      document.getElementById('premiumScreen').style.display = 'none';
      document.getElementById('appScreen').style.display = 'block';
      document.getElementById('currentUserEmail').textContent = state.currentUser?.email || '-';
      syncPremiumLabels();
      await setupAppUI();
      translateTree(document.getElementById('appScreen'));
    }

    function hideDeviceTransferUi() {
      const wrap = document.getElementById('deviceTransferWrap');
      if (wrap) {
        wrap.classList.add('hidden');
        wrap.style.display = 'none';
      }
      const msg = document.getElementById('deviceTransferMsg');
      if (msg) {
        msg.textContent = 'Ai schimbat telefonul? Poți muta accesul pe acest dispozitiv după ce confirmi parola.';
      }
      pendingDeviceTransfer = false;
    }

    function showDeviceTransferUi(extraMessage) {
      const wrap = document.getElementById('deviceTransferWrap');
      if (wrap) {
        wrap.classList.remove('hidden');
        wrap.style.display = 'flex';
      }
      const msg = document.getElementById('deviceTransferMsg');
      if (msg && extraMessage) {
        msg.textContent = extraMessage;
      }
    }

    async function transferAccountToThisDevice(user, profile) {
      const now = new Date();
      const lastTransferAt = profile?.lastDeviceTransferAt ? new Date(profile.lastDeviceTransferAt) : null;
      const cooldownMs = 24 * 60 * 60 * 1000;
      if (lastTransferAt && !Number.isNaN(lastTransferAt.getTime())) {
        const diff = now.getTime() - lastTransferAt.getTime();
        if (diff < cooldownMs) {
          const remainingHours = Math.max(1, Math.ceil((cooldownMs - diff) / (60 * 60 * 1000)));
          throw new Error(`Dispozitivul poate fi schimbat din nou peste aproximativ ${remainingHours}h.`);
        }
      }

      const currentDeviceId = getCurrentDeviceId();
      const nowIso = now.toISOString();
      const ref = db.collection('users').doc(user.uid).collection('profile').doc('main');
      await ref.set({
        deviceId: currentDeviceId,
        devicePlatform: 'android',
        deviceBoundAt: nowIso,
        lastDeviceTransferAt: nowIso,
        lastLoginAt: nowIso,
        lastDeviceCheckAt: nowIso,
        email: user.email || profile?.email || ''
      }, { merge: true });

      const snap = await ref.get();
      const updatedProfile = snap.exists ? (snap.data() || {}) : {};
      await finishAuthenticatedSession(user, updatedProfile);
      return true;
    }

    function showAuth() {
      document.getElementById('authScreen').style.display = 'block';
      document.getElementById('premiumScreen').style.display = 'none';
      document.getElementById('appScreen').style.display = 'none';
      state.isPremium = false;
      syncNativeAdsState();
      state.appUnlocked = false;
      closePinModal();
      setMainAuthView('login');
      hideDeviceTransferUi();
      translateTree(document.getElementById('authScreen'));
    }

   async function showPremiumGate(profile) {
      document.getElementById('authScreen').style.display = 'none';
      document.getElementById('appScreen').style.display = 'none';
      document.getElementById('premiumScreen').style.display = 'block';
      syncPremiumLabels(profile);
      document.getElementById('premiumUserEmail').textContent = profile?.email || state.currentUser?.email || '-';
      document.getElementById('premiumMsg').textContent = '';
      document.getElementById('premiumBackBtn').style.display = state.currentUser ? 'inline-flex' : 'none';
      applyBillingUiState(window.AndroidBilling?.getBillingState?.() || state.billingState || 'checking');
      translateTree(document.getElementById('premiumScreen'));
    }


    function friendlyAuthError(e) {
      const code = e && (e.code || '');
      const msg = e && (e.message || '');
      if (code.includes('network') || msg.toLowerCase().includes('network')) return 'Nu există conexiune la internet în emulator sau Firebase nu poate fi accesat.';
      if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Email sau parolă greșită.';
      if (code.includes('user-not-found')) return 'Contul nu există. Creează cont sau verifică emailul.';
      if (code.includes('too-many-requests')) return 'Prea multe încercări. Așteaptă câteva minute.';
      if (code.includes('invalid-email')) return 'Email invalid.';
      return msg;
    }


    async function completeLoginAndOpenApp(user, source = 'login') {
      const msg = document.getElementById('mainAuthMsg');
      if (!user) {
        if (msg) msg.textContent = 'Autentificare reușită parțial, dar userul nu a fost returnat.';
        return;
      }
      try {
        state.currentUser = { email: user.email || '', uid: user.uid };
        state.appUnlocked = true;
        syncAndroidBillingUser();
        applyBillingUiState(window.AndroidBilling?.getBillingState?.() || state.billingState || 'ready');
        await ensureUserProfile(user.uid, user.email || '');
        let profile = null;
        try {
          const access = await enforceSingleDeviceSession(user);
          profile = access?.profile || null;
          if (access && access.allowed === false && access.profile?.isPremium === true) {
            pendingDeviceTransfer = false;
            await auth.signOut();
            state.currentUser = null;
            state.isPremium = false;
            state.appUnlocked = false;
            showAuth();
            if (msg) msg.textContent = 'Cont Premium asociat cu alt dispozitiv. Folosește mutarea dispozitivului.';
            showDeviceTransferUi('Confirmă parola și mută contul Premium pe acest dispozitiv.');
            return;
          }
        } catch (deviceError) {
          console.warn('Device check a eșuat; permit login pentru free/test:', deviceError);
        }
        try { profile = profile || await getUserProfile(user.uid); } catch (profileError) { console.warn('Citire profil eșuată:', profileError); }
        state.isPremium = profile?.isPremium === true;
        state.appUnlocked = true;
        const restoredForSameAccount = await maybeRestoreLinkedPlayPremium(profile).catch(() => false);
        if (state.isPremium || restoredForSameAccount) applyBillingUiState('active');
        await showApp();
        applyAccessMode();
        if (msg) msg.textContent = '';
      } catch (e) {
        console.error('Login flow a eșuat după autentificare:', e);
        try {
          state.currentUser = { email: user.email || '', uid: user.uid };
          state.isPremium = false;
          state.appUnlocked = true;
          document.getElementById('authScreen').style.display = 'none';
          document.getElementById('premiumScreen').style.display = 'none';
          document.getElementById('appScreen').style.display = 'block';
          const emailEl = document.getElementById('currentUserEmail');
          if (emailEl) emailEl.textContent = user.email || '-';
          await setupAppUI().catch(err => console.warn('setupAppUI fallback error:', err));
          applyAccessMode();
          if (msg) msg.textContent = '';
        } catch (fallbackError) {
          console.error('Fallback login failed:', fallbackError);
          if (msg) msg.textContent = 'Login reușit, dar interfața nu s-a putut deschide. Trimite Logcat.';
        }
      }
    }

    async function registerMainUser() {
      const email = document.getElementById('mainRegEmail').value.trim();
      const pass = document.getElementById('mainRegPass').value;
      const msg = document.getElementById('mainAuthMsg');
      msg.textContent = '';
      hideDeviceTransferUi();
      if (!email || !pass) {
        msg.textContent = 'Completează emailul și parola.';
        return;
      }
      try {
        const userCred = await auth.createUserWithEmailAndPassword(email, pass);
        await db.collection('users').doc(userCred.user.uid).set({
          email,
          createdAt: new Date().toISOString()
        }, { merge: true });
        try { await userCred.user.sendEmailVerification(); } catch(e) { console.warn('email verification failed', e); }
        await db.collection('users').doc(userCred.user.uid).collection('profile').doc('main').set({
          email,
          isPremium: false,
          plan: 'free',
          premiumSource: null,
          premiumSince: null,
          premiumExpiry: null,
          deviceId: getCurrentDeviceId(),
          devicePlatform: 'android',
          deviceBoundAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true });
        msg.textContent = 'Cont creat cu succes. Intrăm în aplicație...';
        await completeLoginAndOpenApp(userCred.user, 'register');
      } catch (e) {
        msg.textContent = e.message || 'Nu s-a putut crea contul.';
      }
    }

    async function loginMainUser() {
      const email = document.getElementById('mainLoginEmail').value.trim();
      const pass = document.getElementById('mainLoginPass').value;
      const msg = document.getElementById('mainAuthMsg');
      msg.textContent = '';
      hideDeviceTransferUi();
      if (!email || !pass) {
        msg.textContent = 'Completează emailul și parola.';
        return;
      }
      try {
        msg.textContent = 'Se autentifică...';
        const userCred = await auth.signInWithEmailAndPassword(email, pass);
        await completeLoginAndOpenApp(userCred.user, 'button-login');
      } catch (e) {
        console.error('Login Firebase eșuat:', e);
        msg.textContent = friendlyAuthError(e) || 'Login nereușit.';
      }
    }


    async function transferDeviceMainUser() {
      const email = document.getElementById('mainLoginEmail').value.trim();
      const pass = document.getElementById('mainLoginPass').value;
      const msg = document.getElementById('mainAuthMsg');
      msg.textContent = '';
      if (!email || !pass) {
        msg.textContent = 'Introdu emailul și parola ca să muți contul pe acest telefon.';
        return;
      }
      pendingDeviceTransfer = true;
      try {
        await auth.signInWithEmailAndPassword(email, pass);
      } catch (e) {
        pendingDeviceTransfer = false;
        msg.textContent = e.message || 'Nu s-a putut muta contul pe acest dispozitiv.';
      }
    }

    async function resetMainPassword() {
      const email = document.getElementById('mainLoginEmail').value.trim() || document.getElementById('mainRegEmail').value.trim();
      const msg = document.getElementById('mainAuthMsg');
      msg.textContent = '';
      if (!email) {
        msg.textContent = 'Introdu emailul mai întâi.';
        return;
      }
      try {
        await auth.sendPasswordResetEmail(email);
        msg.textContent = 'Email de resetare trimis.';
      } catch (e) {
        msg.textContent = e.message || 'Nu s-a putut trimite emailul.';
      }
    }

    function logoutMainUser() {
      auth.signOut();
    }

    document.getElementById('mainRegisterBtn').onclick = registerMainUser;
    document.getElementById('mainLoginBtn').onclick = loginMainUser;
    document.getElementById('transferDeviceBtn').onclick = transferDeviceMainUser;
    document.getElementById('logoutBtn').onclick = logoutMainUser;
    document.getElementById('premiumLogoutBtn').onclick = logoutMainUser;
    document.getElementById('premiumBackBtn').onclick = () => { if (state.currentUser) showApp(); };
    document.getElementById('openPremiumFromBanner').onclick = openPremiumScreen;
    document.getElementById('goToPlayBtn').onclick = () => {
      const premiumMsg = document.getElementById('premiumMsg');
      premiumMsg.textContent = '';
      applyBillingUiState('processing');
      if (window.AndroidBilling && window.AndroidBilling.startPremiumPurchase) {
        window.AndroidBilling.startPremiumPurchase();
      } else {
        applyBillingUiState('unavailable');
        premiumMsg.textContent = 'Plata nu este disponibilă încă.';
      }
    };
    document.getElementById('saveSettings').onclick = saveSettings;
    const v10QuickSalary = document.getElementById('v10QuickSalary');
    const v10SalaryRange = document.getElementById('v10SalaryRange');
    const v10CalcBtn = document.getElementById('v10CalcBtn');
    const v10PremiumBtn = document.getElementById('v10PremiumBtn');
    if (v10QuickSalary) {
      v10QuickSalary.addEventListener('input', () => {
        const v = Number(v10QuickSalary.value || 0);
        const base = document.getElementById('baseSalary');
        if (base) base.value = v10QuickSalary.value;
        if (v10SalaryRange && v > 0) v10SalaryRange.value = Math.max(1000, Math.min(50000, v));
      });
    }
    if (v10SalaryRange) {
      v10SalaryRange.addEventListener('input', () => {
        if (v10QuickSalary) v10QuickSalary.value = v10SalaryRange.value;
        const base = document.getElementById('baseSalary');
        if (base) base.value = v10SalaryRange.value;
      });
    }
    if (v10CalcBtn) {
      v10CalcBtn.addEventListener('click', async () => {
        if (v10QuickSalary && v10QuickSalary.value) { const base = document.getElementById('baseSalary'); if (base) base.value = v10QuickSalary.value; }
        await saveSettings();
        const est = document.getElementById('estimateSection'); if(est) est.scrollIntoView({behavior:'smooth', block:'start'});
      });
    }
    if (v10PremiumBtn) v10PremiumBtn.addEventListener('click', openPremiumScreen);
    document.getElementById('demoBtn').onclick = fillDemo;
    document.getElementById('tutorialBtn').onclick = openTutorial;
    document.getElementById('tutorialNextBtn').onclick = nextTutorial;
    document.getElementById('tutorialCloseBtn').onclick = closeTutorial;
    document.getElementById('dayModalCloseBtn').onclick = closeDayModal;
    document.getElementById('dayModalBackdrop').addEventListener('click', e => { if (e.target.id === 'dayModalBackdrop') closeDayModal(); });
    document.getElementById('prevMonthBtn').onclick = () => changeMonth(-1);
    document.getElementById('nextMonthBtn').onclick = () => changeMonth(1);
    document.getElementById('todayBtn').onclick = jumpToToday;
    document.getElementById('resetMonth').onclick = resetMonth;
    document.getElementById('yearSelect').addEventListener('change', async e=>{ if (!canUseCalculator()) { e.target.value = state.year; openPremiumScreen(); return; } state.year=Number(e.target.value); renderSelectors(); await loadEntriesFromCloud(); await renderDays(); recalc(); await saveSettingsToCloud(); });
    document.getElementById('monthSelect').addEventListener('change', async e=>{ if (!canUseCalculator()) { e.target.value = state.month; openPremiumScreen(); return; } state.month=Number(e.target.value); renderSelectors(); await loadEntriesFromCloud(); await renderDays(); recalc(); await saveSettingsToCloud(); });


        const triggerRestorePremium = () => {
      const premiumMsg = document.getElementById('premiumMsg');
      if (premiumMsg) premiumMsg.textContent = '';

      if (!auth.currentUser) {
        handleBillingMessage('Autentifică-te mai întâi, apoi încearcă din nou Restore Premium.');
        return;
      }

      if (state.restoreInProgress) {
        handleBillingMessage('Restore Premium este deja în curs. Așteaptă câteva secunde.');
        return;
      }

      state.restoreInProgress = false;
      applyBillingUiState('ready');

      if (state.isPremium) {
        handleBillingMessage('Premium este deja activ pe acest cont. Nu este nevoie să folosești Restore Premium.');
        return;
      }

      handleBillingMessage('Restore Premium este dezactivat temporar pentru a evita închiderea aplicației. Dacă ai deja un abonament, folosește același cont Google Play și contactează suportul dacă problema persistă.');
      return;
    };

    document.getElementById('restorePremiumBtn').onclick = triggerRestorePremium;
    document.getElementById('restorePremiumTopBtn').onclick = triggerRestorePremium;
    document.getElementById('restorePremiumEstimateBtn').onclick = triggerRestorePremium;


    // === V14 product features patch: Excel, share, validation, chart, CM simulator ===
    function numberFromInput(id, fallback=0){ const el=document.getElementById(id); const n=Number(el?.value); return Number.isFinite(n)?n:fallback; }
    function validateRulesInputs(){
      const checks=[
        ['baseSalary',0,200000,'Salariul brut trebuie să fie între 0 și 200.000 RON.'],['mealValue',0,500,'Bonul de masă trebuie să fie între 0 și 500 RON.'],['nightRate',0,300,'Sporul de noapte trebuie să fie între 0% și 300%.'],['overtimeRate',0,300,'Sporul overtime trebuie să fie între 0% și 300%.'],['weekendRate',0,300,'Sporul de weekend trebuie să fie între 0% și 300%.'],['holidayRate',0,400,'Sporul de sărbătoare trebuie să fie între 0% și 400%.'],['casRate',0,60,'CAS trebuie să fie între 0% și 60%.'],['cassRate',0,60,'CASS trebuie să fie între 0% și 60%.'],['taxRate',0,60,'Impozitul trebuie să fie între 0% și 60%.'],['shiftHours',1,24,'Orele pe tură trebuie să fie între 1 și 24.'],['unpaidMedicalDays',0,31,'Zilele CM neplătite trebuie să fie între 0 și 31.']
      ];
      for(const [id,min,max,msg] of checks){ const el=document.getElementById(id); if(!el) continue; const v=Number(el.value||0); if(!Number.isFinite(v)||v<min||v>max){ el.focus(); handleBillingMessage(msg); return false; } }
      return true;
    }
    const _oldSaveSettings = saveSettings;
    saveSettings = async function(){ if(!validateRulesInputs()) return; return _oldSaveSettings.apply(this, arguments); };

    function updateRulesLivePreview(){
      const el=document.getElementById('rulesLivePreview'); if(!el) return;
      const gross=numberFromInput('baseSalary',0); const cas=numberFromInput('casRate',25)/100; const cass=numberFromInput('cassRate',10)/100; const tax=numberFromInput('taxRate',10)/100;
      if(!gross){ el.textContent='Net estimat cu valorile curente: —'; return; }
      const net=gross-(gross*cas)-(gross*cass)-((gross-gross*cas-gross*cass)*tax);
      el.textContent='Net estimat cu valorile curente: '+fmt(Math.max(0,net));
    }
    ['baseSalary','casRate','cassRate','taxRate','mealValue','nightRate','overtimeRate','weekendRate','holidayRate','shiftHours','unpaidMedicalDays'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('input', updateRulesLivePreview); });
    const minBtn=document.getElementById('useMinSalaryBtn'); if(minBtn) minBtn.addEventListener('click',()=>{ const b=document.getElementById('baseSalary'); if(b){ b.value='4050'; updateRulesLivePreview(); recalc(); }});

    function getReportRows(){
      const rows=[]; document.querySelectorAll('#detailList .item').forEach(item=>{ rows.push([item.querySelector('span')?.textContent||'', item.querySelector('strong')?.textContent||'']); });
      if(_lastCalcResult){ rows.unshift(['Total estimat lunar', fmt(_lastCalcResult.totalReceived||0)], ['Salariu net', fmt(_lastCalcResult.net||0)]); }
      return rows;
    }
    function exportMonthlyExcel(){
      if(!state.isPremium || !state.appUnlocked){ openPremiumScreen(); return; }
      const rows=[['Raport salariu', (monthNames[state.month]||'')+' '+state.year], ['Cont', state.currentUser?.email||'-'], [], ['Indicator','Valoare'], ...getReportRows()];
      const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`raport-salariu-${state.year}-${String(state.month+1).padStart(2,'0')}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    async function shareCalculationSnapshot(){
      if(!_lastCalcResult){ handleBillingMessage('Calculează mai întâi salariul.'); return; }
      const payload={m:state.month,y:state.year,t:Math.round(_lastCalcResult.totalReceived||0),n:Math.round(_lastCalcResult.net||0),g:Math.round(_lastCalcResult.gross||0)};
      const text=`Calculator salariu ${monthNames[state.month]} ${state.year}: Net ${fmt(payload.n)}, total ${fmt(payload.t)}`;
      try{ if(navigator.share){ await navigator.share({title:'Calcul salariu',text}); } else { await navigator.clipboard.writeText(text+' | snapshot: '+btoa(JSON.stringify(payload))); handleBillingMessage('Snapshot copiat în clipboard.'); } }catch(e){ handleBillingMessage('Nu s-a putut partaja calculul.'); }
    }
    function updateNoteCounter(){ const n=document.getElementById('dayModalNote'); const c=document.getElementById('dayNoteCounter'); if(n&&c)c.textContent=(n.value||'').length+'/200 caractere'; }
    document.addEventListener('input',e=>{ if(e.target && e.target.id==='dayModalNote') updateNoteCounter(); });
    const _oldOpenDayModal = openDayModal;
    openDayModal = function(){ const r=_oldOpenDayModal.apply(this, arguments); setTimeout(updateNoteCounter,0); return r; };

    function updateCmSimulator(){
      const out=document.getElementById('cmSimResult'); if(!out) return;
      const days=Math.max(0,numberFromInput('cmSimDays',0)); const rate=Math.max(0,Math.min(100,numberFromInput('cmSimRate',75)))/100; const s=state.settings; const shiftHours=Number(s.shiftHours)||8; const refDays=Math.max(workingDaysReference(getDays(state.year,state.month),getRomaniaHolidays(state.year)),1); const dayGross=(Number(s.baseSalary)||0)/refDays; const unpaid=Math.max(days-Math.max(Number(s.unpaidMedicalDays)||0,0),0); const normalGross=days*dayGross; const cmGross=unpaid*dayGross*rate; const diff=Math.max(0,normalGross-cmGross); out.textContent=`Impact estimat: -${fmt(diff)} brut față de zile lucrate normal. CM plătit estimat: ${fmt(cmGross)}.`;
    }
    ['cmSimDays','cmSimRate'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('input', updateCmSimulator); });

    function drawHistoryChart(items){
      const canvas=document.getElementById('historyChart'); if(!canvas) return; const ctx=canvas.getContext('2d'); const w=canvas.width=canvas.clientWidth*devicePixelRatio; const h=canvas.height=150*devicePixelRatio; ctx.clearRect(0,0,w,h); ctx.scale(devicePixelRatio,devicePixelRatio); const data=(items||[]).slice().reverse().map(x=>Number(x.totalEstimated||x.netSalary||0)).filter(Boolean); ctx.strokeStyle='rgba(148,163,184,.22)'; ctx.lineWidth=1; for(let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(12, i*35); ctx.lineTo(canvas.clientWidth-12, i*35); ctx.stroke(); } if(data.length<2){ ctx.fillStyle='#94a3b8'; ctx.font='13px Arial'; ctx.fillText('Graficul apare după minimum 2 calcule salvate.',14,78); return; } const max=Math.max(...data), min=Math.min(...data); const span=Math.max(1,max-min); ctx.strokeStyle='#22c55e'; ctx.lineWidth=3; ctx.beginPath(); data.forEach((v,i)=>{ const x=18+i*((canvas.clientWidth-36)/(data.length-1)); const y=132-((v-min)/span)*104; i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.stroke(); ctx.fillStyle='#eab308'; data.forEach((v,i)=>{ const x=18+i*((canvas.clientWidth-36)/(data.length-1)); const y=132-((v-min)/span)*104; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill(); });
    }
    const _oldLoadCalcHistory = loadCalcHistory;
    loadCalcHistory = async function(){ const r=await _oldLoadCalcHistory.apply(this,arguments); try{ const uid=state.currentUser?.uid; if(uid){ const snap=await db.collection('users').doc(uid).collection('calculations').orderBy('createdAt','desc').limit(12).get(); drawHistoryChart(snap.docs.map(d=>d.data()||{})); } }catch(e){ drawHistoryChart([]); } return r; };

    const excelBtn=document.getElementById('exportExcelBtn'); if(excelBtn) excelBtn.onclick=exportMonthlyExcel;
    const shareBtn=document.getElementById('shareCalcBtn'); if(shareBtn) shareBtn.onclick=shareCalculationSnapshot;
    document.getElementById('exportPdfBtn').onclick = exportMonthlyReport;
    document.getElementById('saveCalcBtn').onclick = saveCalculation;



    function handleBillingMessage(message) {
      if (state.billingState !== 'checking') {
        state.restoreInProgress = false;
      }
      const premiumMsg = document.getElementById('premiumMsg');
      if (premiumMsg) premiumMsg.textContent = message || '';
    }

    function handleBillingState(nextState) {
      const safeState = nextState || 'idle';
      if (safeState !== 'checking' && safeState !== 'processing') {
        state.restoreInProgress = false;
      }
      applyBillingUiState(safeState);
    }

    async function handlePremiumActivated(purchaseToken, productId) {
      try {
        await linkGooglePlayPurchaseToCurrentUser(purchaseToken, productId, 'purchase');
      } catch (e) {
        console.error('Eroare la activarea premium:', e);
        state.restoreInProgress = false;
        applyBillingUiState('error');
        const premiumMsg = document.getElementById('premiumMsg');
        if (premiumMsg) premiumMsg.textContent = e.message || 'Nu s-a putut activa Premium.';
      }
    }

    async function handlePremiumRestored(purchaseToken, productId) {
      try {
        const ok = await linkGooglePlayPurchaseToCurrentUser(purchaseToken, productId, 'restore');
        if (!ok) {
          applyBillingUiState('ready');
        }
      } catch (e) {
        console.error('Eroare la restaurarea premium:', e);
        state.restoreInProgress = false;
        applyBillingUiState('error');
        const premiumMsg = document.getElementById('premiumMsg');
        if (premiumMsg) premiumMsg.textContent = e.message || 'Nu s-a putut restaura Premium.';
      }
    }

    async function handlePlaySubscriptionDetected(purchaseToken, productId) {
      state.restoreInProgress = false;
      const tokenHash = await sha256Hex(purchaseToken);
      state.playSubscription = {
        token: purchaseToken,
        tokenHash,
        productId: productId || 'premium_monthly'
      };

      const premiumMsg = document.getElementById('premiumMsg');
      const user = auth.currentUser;
      if (!user) return;

      const profile = await getUserProfile(user.uid);
      if (profile?.playPurchaseTokenHash && profile.playPurchaseTokenHash === tokenHash) {
        state.isPremium = true;
        state.appUnlocked = true;
        applyBillingUiState('active');
        if (premiumMsg) premiumMsg.textContent = 'Abonamentul acestui cont a fost recunoscut din Google Play.';
        applyAccessMode();
        return;
      }

      applyBillingUiState('ready');
      if (premiumMsg) {
        premiumMsg.textContent = 'Există un abonament activ în Google Play pe acest telefon, dar nu este legat automat de contul curent. Apasă „Restore Premium” doar dacă abonamentul îți aparține.';
      }
    }

    function handlePlaySubscriptionCleared() {
      state.restoreInProgress = false;
      state.playSubscription = null;
      if (!state.isPremium) {
        applyBillingUiState('ready');
      }
    }

    window.handleBillingMessage = handleBillingMessage;
    window.handleBillingState = handleBillingState;
    window.handlePremiumActivated = handlePremiumActivated;
    window.handlePremiumRestored = handlePremiumRestored;
    window.handlePlaySubscriptionDetected = handlePlaySubscriptionDetected;
    window.handlePlaySubscriptionCleared = handlePlaySubscriptionCleared;


    window.addEventListener('error', (event) => {
      console.error('Eroare globală în aplicație:', event.error || event.message || event);
      state.restoreInProgress = false;
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Promise respins în aplicație:', event.reason || event);
      state.restoreInProgress = false;
    });

   auth.onAuthStateChanged(async user => {
      try {
        if (user) {
          if (!state.currentUser || state.currentUser.uid !== user.uid || document.getElementById('authScreen')?.style.display !== 'none') {
            await completeLoginAndOpenApp(user, 'auth-state');
          }
        } else {
          state.currentUser = null;
          syncAndroidBillingUser();
          applyBillingUiState('checking');
          showAuth();
        }
      } catch (e) {
        console.error('Auth state flow failed:', e);
        const msg = document.getElementById('mainAuthMsg');
        if (msg) msg.textContent = 'Eroare după autentificare: ' + (e.message || e);
        if (auth.currentUser) await completeLoginAndOpenApp(auth.currentUser, 'auth-state-fallback');
      }
    });


    // ===== V12 real layout fix: tabs show one screen, nav stays at bottom =====
    function v12ActivateTab(target){
      const ids = ['calendarSection','estimateSection','rulesSection','detailSection','holidaysSection','logicSection','historySection'];
      document.body.classList.add('v12-tab-mode');
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === target) el.classList.add('v12-visible'); else el.classList.remove('v12-visible');
      });
      document.querySelectorAll('.menu-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.target === target));
      const active = document.getElementById(target);
      if (active) {
        const body = active.querySelector('.collapse-body, .estimate-body');
        const head = active.querySelector('.collapse-head, .estimate-head');
        if (body) body.classList.add('open');
        if (head) head.classList.add('active');
      }
      window.scrollTo({top:0, behavior:'auto'});
      if (target === 'historySection' && typeof loadCalcHistory === 'function') loadCalcHistory();
    }
    function v12InstallTabs(){
      document.querySelectorAll('.menu-tab').forEach(btn => {
        btn.addEventListener('click', function(ev){
          ev.preventDefault();
          ev.stopImmediatePropagation();
          v12ActivateTab(btn.dataset.target || 'calendarSection');
          return false;
        }, true);
      });
      v12ActivateTab('calendarSection');
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', v12InstallTabs); else v12InstallTabs();
    // ===== end V12 real layout fix =====



    function applyThemeMode(mode){
      const isLight = mode === 'light';
      document.body.classList.toggle('light-theme', isLight);
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = isLight ? '☀️ Light' : '🌙 Dark';
      try { localStorage.setItem('salary_theme_mode', mode); } catch {}
    }
    function initThemeToggle(){
      let saved = 'dark';
      try { saved = localStorage.getItem('salary_theme_mode') || 'dark'; } catch {}
      applyThemeMode(saved);
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.addEventListener('click', () => applyThemeMode(document.body.classList.contains('light-theme') ? 'dark' : 'light'));
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { initThemeToggle(); initBulkTools(); }); else { initThemeToggle(); initBulkTools(); }
    // ===== end V15 bulk select + theme toggle =====

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
    }
  