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

    "Articole utile": "Useful articles",
    "Întrebări frecvente": "Frequently asked questions",
    "Informațiile sunt orientative și nu înlocuiesc calculul oficial al angajatorului, consultanța contabilă sau verificarea legislației aplicabile.": "The information is for guidance only and does not replace the employer’s official calculation, accounting advice or checking the applicable legislation.",
    "Salariu guide 2026": "Salary guide 2026",
    "Ghid salarizare România": "Romanian salary guide",
    "GHID SALARIZARE ROMÂNIA": "ROMANIAN SALARY GUIDE",
    "Bonuri de masă": "Meal vouchers",
    "FAQ": "FAQ",

    "Calculator Brut → Net 2026": "Gross → Net Salary Calculator 2026",
    "Formula completă pentru a calcula salariul net din brut în 2026: CAS 25%, CASS 10%, impozit 10%, cu exemple numerice reale pentru 4.050 lei, 7.000 lei și 13.000 lei brut.": "The complete formula for calculating net salary from gross salary in 2026: CAS 25%, CASS 10%, 10% income tax, with real numerical examples for 4,050 lei, 7,000 lei and 13,000 lei gross.",
    "Calculul salariului net din brut urmează o formulă fixă stabilită prin lege. Contribuțiile se calculează procentual din brut, iar impozitul se aplică pe baza impozabilă rămasă după deducerea CAS și CASS.": "Net salary from gross salary follows a fixed formula set by law. Contributions are calculated as a percentage of the gross salary, and income tax is applied to the taxable base remaining after CAS and CASS are deducted.",
    "Dacă brutul introdus în aplicație corespunde cu salariul din contractul tău, estimarea va fi apropiată de suma reală. Diferențele pot apărea din prime, deduceri personale, scutiri de impozit sau corecții aplicate de angajator.": "If the gross salary entered in the app matches the salary in your contract, the estimate should be close to the real amount. Differences may come from bonuses, personal deductions, tax exemptions or corrections applied by the employer.",
    "Formula de calcul brut → net": "Gross → net calculation formula",
    "Pasul 1: CAS (pensie) = brut × 25%. Pasul 2: CASS (sănătate) = brut × 10%. Pasul 3: Baza impozabilă = brut − CAS − CASS. Pasul 4: Impozit pe venit = baza impozabilă × 10%. Pasul 5: Net = brut − CAS − CASS − Impozit.": "Step 1: CAS (pension) = gross × 25%. Step 2: CASS (health insurance) = gross × 10%. Step 3: Taxable base = gross − CAS − CASS. Step 4: Income tax = taxable base × 10%. Step 5: Net = gross − CAS − CASS − income tax.",
    "Bonurile de masă nu sunt supuse impozitului și contribuțiilor sociale, deci se adaugă separat la suma netă. Sporurile (noapte, weekend, sărbători) se adaugă de regulă la brut înainte de calcul.": "Meal vouchers are not subject to income tax and social contributions, so they are added separately to the net amount. Bonuses (night, weekend, legal holidays) are usually added to the gross amount before calculation.",
    "Exemplu complet – salariu minim 4.050 lei brut": "Complete example – minimum salary of 4,050 lei gross",
    "Exemplu – brut 7.000 lei": "Example – 7,000 lei gross",
    "Exemplu – brut 13.000 lei": "Example – 13,000 lei gross",
    "Ce înseamnă CAS și CASS?": "What do CAS and CASS mean?",
    "Scutirea de impozit IT funcționează automat?": "Does the IT income tax exemption work automatically?",
    "De ce netul meu diferă față de calcul?": "Why is my net salary different from the calculation?",

    "Concediu Medical 2026": "Medical Leave 2026",
    "Cum se calculează indemnizația de boală: cine plătește, ce procent se aplică (75%, 80% sau 100%) și un exemplu complet cu cifre reale.": "How sick leave allowance is calculated: who pays, what percentage applies (75%, 80% or 100%) and a complete example with real figures.",
    "Concediul medical este reglementat prin OUG 158/2005 și oferă protecție financiară angajaților care nu pot presta activitate din cauza unei boli sau accidente. Suma primită nu este egală cu salariul normal — procentul variază între 75% și 100% din baza de calcul, în funcție de tipul afecțiunii.": "Medical leave is regulated by GEO 158/2005 and provides financial protection for employees who cannot work because of illness or an accident. The amount received is not equal to the normal salary — the percentage varies between 75% and 100% of the calculation base, depending on the type of condition.",
    "Regula cheie: angajatorul suportă primele 5 zile de concediu medical, CNAS suportă restul. Există excepții importante pentru urgențe și boli grave.": "Key rule: the employer covers the first 5 days of medical leave, while CNAS covers the rest. There are important exceptions for emergencies and serious illnesses.",
    "Cine plătește concediul medical": "Who pays medical leave",
    "Angajatorul plătește indemnizația pentru primele 5 zile calendaristice de concediu medical. Începând cu ziua a 6-a, plata este asigurată de Casa Națională de Asigurări de Sănătate (CNAS), din fondul de asigurări sociale de sănătate.": "The employer pays the allowance for the first 5 calendar days of medical leave. Starting with day 6, payment is covered by the National Health Insurance House (CNAS), from the social health insurance fund.",
    "Pentru a beneficia de plată din ziua a 6-a, angajatul trebuie să aibă minimum 6 luni de stagiu de cotizare în ultimele 12 luni. Excepțiile includ urgențele medicale și bolile infectocontagioase, pentru care CNAS plătește de la prima zi.": "To receive payment from day 6 onward, the employee must have at least 6 months of contribution period in the last 12 months. Exceptions include medical emergencies and infectious diseases, where CNAS pays from the first day.",
    "Procentele de indemnizație": "Allowance percentages",
    "Procentul aplicat depinde de tipul de concediu medical: 75% din baza de calcul pentru boli obișnuite și carantină; 80% pentru boli profesionale, accidente de muncă, tuberculoză, neoplazii și SIDA; 100% pentru urgențe chirurgicale, îngrijirea copilului bolnav sub 7 ani sau handicapat sub 18 ani.": "The applied percentage depends on the type of medical leave: 75% of the calculation base for ordinary illness and quarantine; 80% for occupational diseases, work accidents, tuberculosis, neoplasia and AIDS; 100% for surgical emergencies, care for a sick child under 7 or a disabled child under 18.",
    "Baza de calcul este media veniturilor brute lunare din ultimele 6 luni anterioare lunii în care survine incapacitatea de muncă, împărțită la numărul de zile lucrătoare din acea perioadă.": "The calculation base is the average monthly gross income from the last 6 months before the month in which the incapacity for work occurs, divided by the number of working days in that period.",
    "Exemplu de calcul – boli obișnuite (75%)": "Calculation example – ordinary illness (75%)",
    "Cum marchezi concediul medical în aplicație": "How to mark medical leave in the app",
    "În calendarul lunar marchezi zilele de concediu medical cu tipul Medical (M). Aplicația le identifică separat față de zilele de muncă, zilele nelucrate și concediul de odihnă.": "In the monthly calendar, mark medical leave days as Medical (M). The app identifies them separately from work days, non-working days and annual leave.",

    "Confirmare ștergere automată": "Automatic deletion confirmation",
    "Nu ești autentificat. Intră în cont, apoi revino pe această pagină pentru ștergere automată.": "You are not signed in. Sign in, then return to this page for automatic deletion.",
    "Scrie STERGERE pentru confirmare": "Type DELETE to confirm",
    "Șterge contul și datele": "Delete account and data",
    "Se șterge...": "Deleting...",
    "Dacă ștergerea automată nu funcționează": "If automatic deletion does not work",
    "Trimite un email la": "Send an email to",
    "cu subiectul „Ștergere cont Calculator Salariu”. Folosește această variantă doar dacă butonul de ștergere nu funcționează sau nu mai ai acces la cont.": "with the subject “Delete Salary Calculator account”. Use this option only if the deletion button does not work or you no longer have access to the account.",


    "Calculator": "Calculator",
    "Sporuri": "Bonuses",
    "Bonuri": "Meal vouchers",
    "Sărbători legale 2026": "Legal holidays 2026",
    "Salariu net": "Net salary",
    "Salariu brut": "Gross salary",
    "Program în ture": "Shift work",
    "Spor weekend": "Weekend bonus",
    "Ore suplimentare": "Overtime",
    "Ghid Calculator Salariu 2026": "Salary Calculator Guide 2026",
    "Spor de noapte 2026": "Night bonus 2026",
    "Spor Weekend 2026": "Weekend bonus 2026",
    "Ore suplimentare 2026": "Overtime 2026",
    "Program în ture 2026": "Shift work 2026",
    "Sărbători legale România 2026": "Romanian legal holidays 2026",
    "FAQ salarii": "Salary FAQ",
    "Întrebări frecvente despre salarii și calculator": "Frequently asked questions about salaries and the calculator",
    "Răspunsuri rapide pentru cele mai frecvente întrebări despre calculul salariului, sporuri, bonuri și utilizarea aplicației.": "Quick answers to the most common questions about salary calculation, bonuses, vouchers and using the app.",
    "Această pagină grupează întrebările frecvente despre calculator și despre elementele care pot influența venitul lunar. Răspunsurile sunt scrise simplu, pentru utilizare rapidă.": "This page groups common questions about the calculator and the elements that can influence monthly income. The answers are written simply for quick use.",
    "Dacă vrei explicații mai detaliate, folosește paginile dedicate din ghid: brut/net, sporuri, bonuri de masă și concediu medical.": "For more detailed explanations, use the dedicated guide pages: gross/net, bonuses, meal vouchers and medical leave.",
    "Întrebări despre calcul": "Questions about calculation",
    "Întrebări despre ture": "Questions about shifts",
    "Întrebări despre cont": "Questions about account",
    "Întrebări despre Premium": "Questions about Premium",
    "Exemplu întrebare": "Example question",
    "Exemplu utilizare": "Usage example",
    "De ce nu văd același rezultat ca pe fluturaș?": "Why don’t I see the same result as on my payslip?",
    "Pot salva calculele?": "Can I save calculations?",
    "Cum schimb luna?": "How do I change the month?",
    "Calculatorul funcționează pe telefon?": "Does the calculator work on mobile?",
    "Contact": "Contact",
    "Despre aplicație": "About the app",
    "Privacy": "Privacy",
    "Terms": "Terms",
    "Delete account": "Delete account",
    "Despre proiect": "About",

  };

  return dictionary[normalized] ?? text;
}
