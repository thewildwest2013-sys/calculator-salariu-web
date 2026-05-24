export type Lang = "ro" | "en";

export function getSavedLang(): Lang {
  if (typeof window === "undefined") return "ro";

  const keys = [
    "salary-lang-v1",
    "calculator-salariu-lang",
    "lang",
    "language",
  ];

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value === "ro" || value === "en") return value;
  }

  return "ro";
}

export function setSavedLang(lang: Lang) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("salary-lang-v1", lang);
  window.localStorage.setItem("calculator-salariu-lang", lang);
  window.dispatchEvent(new CustomEvent("calculator-salariu-lang-change", { detail: lang }));
}

export function translateStaticText(text: string, lang: Lang): string {
  if (lang !== "en") return text;

  const normalized = text.trim();

  const dictionary: Record<string, string> = {
    "Calculator Salariu": "Salary Calculator",
    "Ghid salariu 2026": "Salary guide 2026",
    "Brut / net": "Gross / net",
    "Spor noapte": "Night bonus",
    "Concediu medical": "Medical leave",
    "Sărbători legale": "Legal holidays",
    "Confidențialitate": "Privacy",
    "Termeni": "Terms",
    "Ștergere cont": "Delete account",
    "Sistem online": "System online",
    "Înapoi": "Back",
    "Înapoi la Home": "Back to Home",
    "Înapoi la calculator": "Back to calculator",
    "Home": "Home",

    "History calcule": "Calculation history",
    "HISTORY PERSONAL": "PERSONAL HISTORY",
    "CALCULE SALVATE": "SAVED CALCULATIONS",
    "TOTAL ESTIMAT SALVAT": "SAVED ESTIMATED TOTAL",
    "Aici apar calculele salvate din aplicație. Poți exporta rapid un raport PDF folosind funcția de printare a browserului.": "Saved calculations from the app appear here. You can quickly export a PDF report using your browser print function.",
    "Nu ai calcule salvate încă. După ce faci un calcul, intră la Details și apasă „Save calcul”.": "You do not have saved calculations yet. After making a calculation, go to Details and press “Save calculation”.",

    "SALARY CALCULATOR PREMIUM": "SALARY CALCULATOR PREMIUM",
    "Mai rapid, fără întreruperi": "Faster, without interruptions",
    "Premium este pentru utilizatorii care calculează des salariul, își salvează lunile și vor o experiență curată, fără pași inutili.": "Premium is for users who frequently calculate salaries, save monthly data and want a clean experience without unnecessary steps.",
    "Plan lunar": "Monthly plan",
    "Anulezi oricând": "Cancel anytime",
    "Status: Free": "Status: Free",
    "Plan curent: free": "Current plan: free",
    "Ce primești": "What you get",
    "Fără poarta de reclamă la calcul": "No ad gate before calculation",
    "15+ calcule lunare și acces prioritar la funcții noi": "15+ monthly calculations and priority access to new features",
    "Salvare calcule în cloud și istoric personal": "Cloud saving and personal calculation history",
    "Experiență mai curată pe telefon și desktop": "Cleaner experience on phone and desktop",
    "Bază pregătită pentru export PDF și rapoarte lunare": "Prepared base for PDF export and monthly reports",
    "Activează Premium": "Activate Premium",

    "SECURITY": "SECURITY",
    "Control acces web": "Web access control",
    "Contul tău poate avea un singur browser/dispozitiv web activ. De aici poți invalida alte sesiuni și poți permite schimbarea browserului.": "Your account can have only one active web browser/device. From here you can invalidate other sessions and allow browser changes.",
    "DISPOZITIV ACTIV": "ACTIVE DEVICE",
    "SCHIMBARE BROWSER": "BROWSER CHANGE",
    "Disponibil acum": "Available now",
    "Poți muta contul imediat.": "You can move the account immediately.",
    "Poți și debloca manual mutarea din browserul curent.": "You can also manually unlock moving from the current browser.",
    "ID activ": "Active ID",
    "Sesiune validă aici": "Session valid here",
    "Force logout alte browsere": "Force logout other browsers",
    "Schimbă dispozitivul acum": "Change device now",
    "Reîncarcă statusul": "Reload status",

    "Politica de confidențialitate": "Privacy Policy",
    "Calculator Salariu colectează doar datele necesare pentru funcționarea aplicației: autentificare, salvarea setărilor salariale, istoricul de calcul și preferințele utilizatorului.": "Salary Calculator collects only the data needed for the app to work: authentication, saved salary settings, calculation history and user preferences.",
    "Servicii utilizate": "Services used",
    "Site-ul poate utiliza Firebase pentru autentificare și stocare, Google Analytics pentru analiză agregată a traficului și Google AdSense pentru afișarea reclamelor, dacă acestea sunt activate.": "The site may use Firebase for authentication and storage, Google Analytics for aggregated traffic analysis and Google AdSense for displaying ads if they are enabled.",
    "Cookie-uri și publicitate": "Cookies and advertising",
    "Google și partenerii săi pot folosi cookie-uri sau identificatori similari pentru măsurarea performanței și, unde este cazul, pentru personalizarea reclamelor. Utilizatorii pot controla cookie-urile din setările browserului.": "Google and its partners may use cookies or similar identifiers for performance measurement and, where applicable, ad personalization. Users can control cookies from their browser settings.",
    "Date salariale": "Salary data",
    "Valorile introduse în aplicație sunt folosite pentru estimări și pot fi salvate în contul tău pentru sincronizare. Nu vindem datele utilizatorilor și nu publicăm informații salariale personale.": "Values entered in the app are used for estimates and may be saved to your account for synchronization. We do not sell user data and we do not publish personal salary information.",
    "Ștergerea datelor": "Data deletion",
    "Poți solicita sau folosi ștergerea automată a contului și a datelor asociate din pagina dedicată ștergerii contului. Unele informații pot rămâne temporar în backup-uri tehnice, conform ciclurilor normale de securitate.": "You can request or use automatic deletion of your account and associated data from the dedicated account deletion page. Some information may remain temporarily in technical backups according to normal security cycles.",
    "Pentru întrebări, folosește pagina Contact.": "For questions, use the Contact page.",

    "Termeni și condiții": "Terms and Conditions",
    "Calculator Salariu este un instrument informativ pentru estimarea veniturilor lunare. Prin folosirea site-ului accepți că rezultatele sunt orientative și nu reprezintă documente fiscale, juridice sau de salarizare oficiale.": "Salary Calculator is an informational tool for estimating monthly income. By using the site, you accept that the results are estimates and do not represent official tax, legal or payroll documents.",
    "Responsabilitatea utilizatorului": "User responsibility",
    "Utilizatorul trebuie să introducă valori corecte pentru salariu, sporuri, ore lucrate, bonuri și alte setări. Rezultatul poate varia în funcție de contract, regulament intern, legislație și modul de calcul folosit de angajator.": "The user must enter correct values for salary, bonuses, worked hours, meal vouchers and other settings. The result may vary depending on the employment contract, internal rules, legislation and the calculation method used by the employer.",
    "Plan Free și Premium": "Free and Premium plans",
    "Anumite funcții pot fi limitate în planul gratuit. Planul Premium poate oferi acces extins, istoric suplimentar și funcții avansate. Condițiile comerciale pot fi actualizate în timp.": "Some features may be limited in the free plan. The Premium plan may provide extended access, additional history and advanced features. Commercial conditions may be updated over time.",
    "Limitarea răspunderii": "Limitation of liability",
    "Nu garantăm că estimările vor coincide exact cu fluturașul de salariu. Pentru valori finale, verifică documentele oficiale de salarizare sau discută cu angajatorul ori departamentul HR.": "We do not guarantee that the estimates will exactly match your payslip. For final values, check the official payroll documents or speak with your employer or HR department.",

    "Pentru întrebări despre aplicație, erori, sugestii sau solicitări legate de date, ne poți contacta prin email.": "For questions about the app, errors, suggestions or data-related requests, you can contact us by email.",
    "Timp de răspuns": "Response time",
    "Încercăm să răspundem în 24–72 de ore, în funcție de volumul solicitărilor.": "We try to respond within 24–72 hours, depending on request volume.",
    "Ce poți trimite": "What you can send",
    "probleme tehnice din aplicație;": "technical issues in the app;",
    "sugestii pentru calcul și interfață;": "calculation and interface suggestions;",
    "solicitări de ștergere sau clarificare date;": "data deletion or clarification requests;",
    "întrebări despre funcțiile Free/Premium.": "questions about Free/Premium features.",

    "Poți șterge automat contul Calculator Salariu și datele asociate direct din această pagină, dacă ești autentificat. Emailul de suport este necesar doar dacă ștergerea automată nu funcționează sau dacă nu mai ai acces la cont.": "You can automatically delete your Salary Calculator account and associated data directly from this page if you are signed in. The support email is needed only if automatic deletion does not work or you no longer have access to your account.",
    "Ce date se șterg": "What data is deleted",
    "profilul contului;": "account profile;",
    "setările salariale salvate;": "saved salary settings;",
    "istoricul de calcul asociat contului;": "calculation history associated with the account;",
    "sesiunile, dispozitivele și datele de sincronizare stocate în Firebase.": "sessions, devices and synchronization data stored in Firebase.",
    "Important despre abonamente": "Important subscription note",
    "Dacă ai un abonament activ prin Google Play sau Stripe, anularea abonamentului trebuie făcută și din platforma prin care a fost achiziționat. Ștergerea contului nu garantează anularea automată a plăților recurente gestionate de terți.": "If you have an active subscription through Google Play or Stripe, the subscription must also be cancelled in the platform where it was purchased. Account deletion does not guarantee automatic cancellation of recurring payments managed by third parties.",
    "Confirmare ștergere automată": "Automatic deletion confirmation",
    "Nu ești autentificat. Intră în cont, apoi revino pe această pagină pentru ștergere automată.": "You are not signed in. Sign in, then return to this page for automatic deletion.",
    "Scrie STERGERE pentru confirmare": "Type DELETE to confirm",
    "Șterge contul și datele": "Delete account and data",
    "Se șterge...": "Deleting...",
    "Dacă ștergerea automată nu funcționează": "If automatic deletion does not work",
    "Trimite un email la": "Send an email to",
    "cu subiectul „Ștergere cont Calculator Salariu”. Folosește această variantă doar dacă butonul de ștergere nu funcționează sau nu mai ai acces la cont.": "with the subject “Delete Salary Calculator account”. Use this option only if the deletion button does not work or you no longer have access to the account.",
  };

  return dictionary[normalized] ?? text;
}
