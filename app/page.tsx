"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";
import { clearStoredSecurityState } from "@/lib/security-client";
import { consumeUsage, getUsageStatus, UsageStatus } from "@/lib/usage";

type Lang = "ro" | "en";

type UserProfile = {
  email: string;
  isPremium: boolean;
  plan?: string;
  createdAt?: unknown;
  premiumSince?: string | null;
  premiumSource?: string | null;
};

type TabKey =
  | "calendar"
  | "estimate"
  | "rules"
  | "details"
  | "holidays"
  | "logic";

type DayType = "Off" | "Morning" | "After" | "Night" | "CO" | "CM";

type DayData = {
  type: DayType;
  workedHours?: number;
  overtimeHours: number;
  note: string;
  otNight: boolean;
  otWeekend: boolean;
  otHoliday: boolean;
};

type CloudSalaryState = {
  grossSalary?: string;
  mealTicketPerDay?: string;
  nightPercent?: string;
  overtimePercent?: string;
  weekendPercent?: string;
  holidayPercent?: string;
  casPercent?: string;
  cassPercent?: string;
  taxPercent?: string;
  hoursPerShift?: string;
  medicalLeaveDays?: string;
  monthIndex?: number;
  year?: number;
  daysData?: Record<number, DayData>;
  lang?: Lang;
  updatedAt?: string;
};

type HolidayItem = {
  day: number;
  month: number;
  date: string;
  name: string;
  enDate: string;
  enName: string;
};

const HOLIDAYS_2026: HolidayItem[] = [
  { day: 1, month: 1, date: "01 ianuarie", name: "Anul Nou", enDate: "01 January", enName: "New Year's Day" },
  { day: 2, month: 1, date: "02 ianuarie", name: "A doua zi de Anul Nou", enDate: "02 January", enName: "Second day of New Year" },
  { day: 6, month: 1, date: "06 ianuarie", name: "Boboteaza", enDate: "06 January", enName: "Epiphany" },
  { day: 7, month: 1, date: "07 ianuarie", name: "Sf. Ioan", enDate: "07 January", enName: "Saint John" },
  { day: 24, month: 1, date: "24 ianuarie", name: "Ziua Unirii Principatelor Române", enDate: "24 January", enName: "Union Day" },
  { day: 10, month: 4, date: "10 aprilie", name: "Vinerea Mare", enDate: "10 April", enName: "Good Friday" },
  { day: 12, month: 4, date: "12 aprilie", name: "Paște Ortodox", enDate: "12 April", enName: "Orthodox Easter" },
  { day: 13, month: 4, date: "13 aprilie", name: "A doua zi de Paște", enDate: "13 April", enName: "Second day of Orthodox Easter" },
  { day: 1, month: 5, date: "01 mai", name: "Ziua Muncii", enDate: "01 May", enName: "Labour Day" },
  { day: 31, month: 5, date: "31 mai", name: "Rusalii", enDate: "31 May", enName: "Pentecost" },
  { day: 1, month: 6, date: "01 iunie", name: "A doua zi de Rusalii", enDate: "01 June", enName: "Second day of Pentecost" },
  { day: 15, month: 8, date: "15 august", name: "Adormirea Maicii Domnului", enDate: "15 August", enName: "Dormition of the Mother of God" },
  { day: 30, month: 11, date: "30 noiembrie", name: "Sf. Andrei", enDate: "30 November", enName: "Saint Andrew" },
  { day: 1, month: 12, date: "01 decembrie", name: "Ziua Națională a României", enDate: "01 December", enName: "National Day" },
  { day: 25, month: 12, date: "25 decembrie", name: "Crăciun", enDate: "25 December", enName: "Christmas" },
  { day: 26, month: 12, date: "26 decembrie", name: "A doua zi de Crăciun", enDate: "26 December", enName: "Second day of Christmas" },
];

function getOrthodoxEasterDate(year: number) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;

  const julianEaster = new Date(year, month - 1, day);
  julianEaster.setDate(julianEaster.getDate() + 13);
  return julianEaster;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatRoDate(day: number, month: number) {
  return `${String(day).padStart(2, "0")} ${MONTHS_RO[month - 1].toLowerCase()}`;
}

function formatEnDate(day: number, month: number) {
  return `${String(day).padStart(2, "0")} ${MONTHS_EN[month - 1]}`;
}

function holidayFromDate(dateObj: Date, name: string, enName: string): HolidayItem {
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;

  return {
    day,
    month,
    date: formatRoDate(day, month),
    name,
    enDate: formatEnDate(day, month),
    enName,
  };
}

function dedupeHolidaysPreferMovable(holidays: HolidayItem[]) {
  const map = new Map<string, HolidayItem>();

  for (const holiday of holidays) {
    const key = `${holiday.month}-${holiday.day}`;
    // Dacă două sărbători cad în aceeași zi, afișăm o singură linie curată.
    // Holidaysle mobile (Paște/Rusalii) sunt adăugate ultimele și au prioritate.
    map.set(key, holiday);
  }

  return Array.from(map.values()).sort((a, b) => a.month - b.month || a.day - b.day);
}

function getRomanianHolidays(year: number): HolidayItem[] {
  // Pentru anul curent folosit în aplicație păstrăm lista stabilă, verificată manual.
  if (year === 2026) {
    return HOLIDAYS_2026;
  }

  const easter = getOrthodoxEasterDate(year);

  const fixed: HolidayItem[] = [
    { day: 1, month: 1, date: "01 ianuarie", name: "Anul Nou", enDate: "01 January", enName: "New Year's Day" },
    { day: 2, month: 1, date: "02 ianuarie", name: "A doua zi de Anul Nou", enDate: "02 January", enName: "Second day of New Year" },
    { day: 6, month: 1, date: "06 ianuarie", name: "Boboteaza", enDate: "06 January", enName: "Epiphany" },
    { day: 7, month: 1, date: "07 ianuarie", name: "Sf. Ioan", enDate: "07 January", enName: "Saint John" },
    { day: 24, month: 1, date: "24 ianuarie", name: "Ziua Unirii Principatelor Române", enDate: "24 January", enName: "Union Day" },
    { day: 1, month: 5, date: "01 mai", name: "Ziua Muncii", enDate: "01 May", enName: "Labour Day" },
    { day: 1, month: 6, date: "01 iunie", name: "Ziua Copilului", enDate: "01 June", enName: "Children's Day" },
    { day: 15, month: 8, date: "15 august", name: "Adormirea Maicii Domnului", enDate: "15 August", enName: "Dormition of the Mother of God" },
    { day: 30, month: 11, date: "30 noiembrie", name: "Sf. Andrei", enDate: "30 November", enName: "Saint Andrew" },
    { day: 1, month: 12, date: "01 decembrie", name: "Ziua Națională a României", enDate: "01 December", enName: "National Day" },
    { day: 25, month: 12, date: "25 decembrie", name: "Crăciun", enDate: "25 December", enName: "Christmas" },
    { day: 26, month: 12, date: "26 decembrie", name: "A doua zi de Crăciun", enDate: "26 December", enName: "Second day of Christmas" },
  ];

  const movable: HolidayItem[] = [
    holidayFromDate(addDays(easter, -2), "Vinerea Mare", "Good Friday"),
    holidayFromDate(easter, "Paște Ortodox", "Orthodox Easter"),
    holidayFromDate(addDays(easter, 1), "A doua zi de Paște", "Second day of Orthodox Easter"),
    holidayFromDate(addDays(easter, 49), "Rusalii", "Pentecost"),
    holidayFromDate(addDays(easter, 50), "A doua zi de Rusalii", "Second day of Pentecost"),
  ];

  return dedupeHolidaysPreferMovable([...fixed, ...movable]);
}


const MONTHS_RO = [
  "Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie",
  "Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie",
];
const MONTHS_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const WEEKDAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TYPE_LABELS: Record<Lang, Record<DayType, string>> = {
  ro: {
    Off: "Off",
    Morning: "Morning",
    After: "After",
    Night: "Night",
    CO: "Vacation",
    CM: "Medical",
  },
  en: {
    Off: "Off",
    Morning: "Morning",
    After: "Afternoon",
    Night: "Night",
    CO: "Vacation",
    CM: "Sick",
  },
};

type Translation = {
  appTitle: string;
  secureAuth: string;
  intro: string;
  register: string;
  login: string;
  account: string;
  plan: string;
  premiumManage: string;
  history: string;
  logout: string;
  freePlan: string;
  activatePremium: string;
  freeDescription: string;
  calendar: string;
  estimate: string;
  rules: string;
  details: string;
  holidays: string;
  logic: string;
  usage: string;
  monthlyLeft: string;
  onlineRequired: string;
  lockedTitle: string;
  lockedKicker: string;
  lockedFree: string;
  lockedPremium: string;
  unlockFree: string;
  unlockPremium: string;
  loading: string;
  usageChecking: string;
  monthlyProgram: string;
  quickCalendar: string;
  today: string;
  reset: string;
  shiftsSet: string;
  monthHolidays: string;
  selectedDay: string;
  workedDay: string;
  weekend: string;
  holiday: string;
  workedHours: string;
  workedHoursHint: string;
  undertimeHours: string;
  overtimeHours: string;
  note: string;
  notePlaceholder: string;
  otNight: string;
  otWeekend: string;
  otHoliday: string;
  save: string;
  close: string;
  summary: string;
  monthlyEstimate: string;
  estimatedNet: string;
  mealTickets: string;
  totalExtras: string;
  totalEstimated: string;
  workedDays: string;
  overtimePlus: string;
  nightBonus: string;
  weekendBonus: string;
  holidayBonus: string;
  sickAdjust: string;
  personalSettings: string;
  salaryRules: string;
  grossSalary: string;
  ticketValue: string;
  nightPercent: string;
  overtimePercent: string;
  weekendPercent: string;
  holidayPercent: string;
  casPercent: string;
  cassPercent: string;
  taxPercent: string;
  hoursPerShift: string;
  unpaidMedical: string;
  calculate: string;
  loadExample: string;
  rulesHint1: string;
  rulesHint2Free: string;
  rulesHint2Premium: string;
  quickCheck: string;
  calcDetails: string;
  preview: string;
  premiumOnly: string;
  saveCalc: string;
  annualReference: string;
  howItWorks: string;
  logicImplemented: string;
  adKicker: string;
  adTitle: string;
  adBody: string;
  adContinue: string;
  noInternet: string;
  freeLimitReached: string;
  loginNeeded: string;
  savedSuccess: string;
  savedError: string;
  loadExampleDone: string;
  logoutOk: string;
  logoutErr: string;
  adEveryThree: string;
  unlimited: string;
  online: string;
  offline: string;
};

const T: Record<Lang, Translation> = {
  ro: {
    appTitle: "Calculator Salariu",
    secureAuth: "🔒 Autentificare securizată",
    intro: "Autentifică-te sau creează un cont nou pentru a folosi aplicația. Datele tale sunt salvate în cloud, în contul tău.",
    register: "Înregistrare",
    login: "Autentificare",
    account: "Cont",
    plan: "Plan",
    premiumManage: "Gestionează Premium",
    history: "Istoric",
    logout: "Ieșire",
    freePlan: "Plan Free",
    activatePremium: "Activează Premium",
    freeDescription: "Plan Free activ. Pentru istoric extins, setări avansate și acces complet, treci la Premium.",
    calendar: "Calendar",
    estimate: "Estimare",
    rules: "Reguli",
    details: "Detalii",
    holidays: "Sărbători",
    logic: "Logică",
    usage: "Utilizare",
    monthlyLeft: "calcule rămase în fereastra lunară",
    onlineRequired: "Trebuie să fii online pentru a genera calcule noi și pentru a salva rezultate.",
    lockedTitle: "Deblochează estimarea",
    lockedKicker: "Calcul blocat",
    lockedFree: "Pe planul Free ai 15 calcule pe lună. Estimatea rapidă se vede în pagina Calendar, iar detaliile complete se deblochează controlat.",
    lockedPremium: "Premium are acces nelimitat și fără reclame. Pentru acest calcul trebuie doar să fii online.",
    unlockFree: "Generează calculul complet",
    unlockPremium: "Generează estimarea",
    loading: "Se încarcă...",
    usageChecking: "Se verifică...",
    monthlyProgram: "Programul tău lunar",

    quickCalendar: "Calendar rapid",
    today: "Astăzi",
    reset: "Resetează",
    shiftsSet: "Ture setate",
    monthHolidays: "Sărbători lunare",
    selectedDay: "📅 Zi selectată",
    workedDay: "Zi lucrătoare",
    weekend: "Weekend",
    holiday: "Sărbătoare",
    workedHours: "Ore lucrate efectiv",
    workedHoursHint: "Pentru zilele în care ai plecat mai devreme: alege 1–8h sau scrie manual, de exemplu 6.5",
    undertimeHours: "Ore nelucrate / minus",
    overtimeHours: "Ore suplimentare",
    note: "Notă pentru această zi",
    notePlaceholder: "Ex: schimb de tură, tură specială, observații...",
    otNight: "OT noapte",
    otWeekend: "OT weekend",
    otHoliday: "OT sărbătoare",
    save: "Salvează",
    close: "Închide",
    summary: "Rezumat rapid",
    monthlyEstimate: "Estimare lunară",
    estimatedNet: "Salariu net estimat",
    mealTickets: "Tichete masă",
    totalExtras: "Sporuri totale",
    totalEstimated: "Total estimat",
    workedDays: "Zile lucrate",
    overtimePlus: "OT +75%",
    nightBonus: "Spor de noapte",
    weekendBonus: "Spor weekend",
    holidayBonus: "Spor sărbătoare",
    sickAdjust: "Ajustare CM",
    personalSettings: "Setări personale",
    salaryRules: "Reguli salariale",
    grossSalary: "Salariu brut de referință",
    ticketValue: "Bon de masă / zi",
    nightPercent: "Spor noapte (%)",
    overtimePercent: "Spor ore suplimentare (%)",
    weekendPercent: "Spor weekend (%)",
    holidayPercent: "Spor sărbătoare (%)",
    casPercent: "CAS (%)",
    cassPercent: "CASS (%)",
    taxPercent: "Impozit venit (%)",
    hoursPerShift: "Ore / tură",
    unpaidMedical: "Zile medicale neplătite / lună",
    calculate: "Calculează salariul",
    loadExample: "Încarcă exemplu",
    rulesHint1: "Weekendurile și sărbătorile legale sunt detectate automat din calendar. Tura de noapte se selectează direct pe ziua aleasă.",
    rulesHint2Free: "Plan Free: 15 calcule / lună. În perioada de review AdSense, reclamele sunt dezactivate.",
    rulesHint2Premium: "Plan Premium: acces extins și fără limită de calcule.",
    quickCheck: "Verificare rapidă",
    calcDetails: "Detaliu calcul",
    preview: "Previzualizare",
    premiumOnly: "Valorile reale și modelul de calcul sunt afișate doar pentru Premium deblocat.",
    saveCalc: "Salvează calculul",
    annualReference: "Referință anuală",
    howItWorks: "Cum calculează aplicația",
    logicImplemented: "Logică implementată",
    adKicker: "Informare",
    adTitle: "Calcul disponibil",
    adBody: "Estimarea este deblocată fără reclamă în perioada de review AdSense.",
    adContinue: "Continuă",
    noInternet: "Ești offline. Re conectează-te la internet ca să poți calcula și salva.",
    freeLimitReached: "Ai atins limita lunară de 15 calcule. Activează Premium pentru acces nelimitat.",
    loginNeeded: "Trebuie să fii autentificat",
    savedSuccess: "Calcul salvat cu succes",
    savedError: "Eroare la salvarea calculului",
    loadExampleDone: "Exemplu încărcat",
    logoutOk: "Deconectare reușită",
    logoutErr: "Eroare la deconectare",
    adEveryThree: "mod review curat",
    unlimited: "nelimitat",
    online: "Online",
    offline: "Offline",
  },
  en: {
    appTitle: "Salary Calculator",
    secureAuth: "🔒 Secure authentication",
    intro: "Sign in or create a new account to use the app. Your data is saved in the cloud on your account.",
    register: "Register",
    login: "Login",
    account: "Account",
    plan: "Plan",
    premiumManage: "Manage Premium",
    history: "History",
    logout: "Logout",
    freePlan: "Free Plan",
    activatePremium: "Activate Premium",
    freeDescription: "Limited features. For full details and extended access, upgrade to Premium.",
    calendar: "Calendar",
    estimate: "Estimate",
    rules: "Rules",
    details: "Details",
    holidays: "Holidays",
    logic: "Logic",
    usage: "Usage",
    monthlyLeft: "calculations left in the monthly window",
    onlineRequired: "You must stay online to generate new calculations and save results.",
    lockedTitle: "Unlock the estimate",
    lockedKicker: "Calculation locked",
    lockedFree: "Free plan includes 15 calculations per month. During AdSense review, promotional surfaces are disabled.",
    lockedPremium: "Premium has unlimited access and no ads. For this calculation you only need to stay online.",
    unlockFree: "Continue to calculation",
    unlockPremium: "Generate estimate",
    loading: "Loading...",
    usageChecking: "Checking...",
    monthlyProgram: "Your monthly schedule",
    quickCalendar: "Quick calendar",
    today: "Today",
    reset: "Reset",
    shiftsSet: "Shifts set",
    monthHolidays: "Monthly holidays",
    selectedDay: "📅 Selected day",
    workedDay: "Work day",
    weekend: "Weekend",
    holiday: "Holiday",
    workedHours: "Actual worked hours",
    workedHoursHint: "For days when you left early: choose 1–8h or type manually, e.g. 6.5",
    undertimeHours: "Undertime / missing hours",
    overtimeHours: "Overtime hours",
    note: "Note for this day",
    notePlaceholder: "Ex: shift swap, special shift, observations...",
    otNight: "Night OT",
    otWeekend: "Weekend OT",
    otHoliday: "Holiday OT",
    save: "Save",
    close: "Close",
    summary: "Quick summary",
    monthlyEstimate: "Monthly estimate",
    estimatedNet: "Estimated net salary",
    mealTickets: "Meal Vouchers",
    totalExtras: "Total extras",
    totalEstimated: "Estimated total",
    workedDays: "Worked days",
    overtimePlus: "OT +75%",
    nightBonus: "Night bonus",
    weekendBonus: "Weekend bonus",
    holidayBonus: "Holiday bonus",
    sickAdjust: "Sick leave adjustment",
    personalSettings: "Personal settings",
    salaryRules: "Salary rules",
    grossSalary: "Reference gross salary",
    ticketValue: "Meal voucher / day",
    nightPercent: "Night bonus (%)",
    overtimePercent: "Overtime bonus (%)",
    weekendPercent: "Weekend bonus (%)",
    holidayPercent: "Holiday bonus (%)",
    casPercent: "CAS (%)",
    cassPercent: "CASS (%)",
    taxPercent: "Tax (%)",
    hoursPerShift: "Hours / shift",
    unpaidMedical: "Unpaid sick days / month",
    calculate: "Calculate salary",
    loadExample: "Load example",
    rulesHint1: "Weekends and legal holidays are detected automatically from the calendar. The Night shift is selected directly on the day.",
    rulesHint2Free: "Free plan: 15 calculations / month. Ads are disabled during AdSense review.",
    rulesHint2Premium: "Premium plan: extended access and no calculation limit.",
    quickCheck: "Quick check",
    calcDetails: "Calculation details",
    preview: "Preview",
    premiumOnly: "Real values and the full calculation model are shown only for unlocked Premium.",
    saveCalc: "Save calculation",
    annualReference: "Annual reference",
    howItWorks: "How the app calculates",
    logicImplemented: "Implemented logic",
    adKicker: "Notice",
    adTitle: "Calculation available",
    adBody: "The estimate is unlocked without ads during the AdSense review period.",
    adContinue: "Continue",
    noInternet: "You are offline. Reconnect to the internet to calculate and save.",
    freeLimitReached: "You reached the monthly limit of 15 calculations. Activate Premium for unlimited access.",
    loginNeeded: "You need to be signed in",
    savedSuccess: "Calculation saved successfully",
    savedError: "Error while saving calculation",
    loadExampleDone: "Example loaded",
    logoutOk: "Logged out",
    logoutErr: "Logout error",
    adEveryThree: "review mode without ads",
    unlimited: "unlimited",
    online: "Online",
    offline: "Offline",
  },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("ro");
  const t: Translation = T[lang]
  const months = lang === "ro" ? MONTHS_RO : MONTHS_EN;
  const weekdays = lang === "ro" ? WEEKDAYS_RO : WEEKDAYS_EN;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showAndroidDownloadPopup, setShowAndroidDownloadPopup] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("calendar");

  const [grossSalary, setGrossSalary] = useState("0");
  const [mealTicketPerDay, setMealTicketPerDay] = useState("30");
  const [nightPercent, setNightPercent] = useState("25");
  const [overtimePercent, setOvertimePercent] = useState("75");
  const [weekendPercent, setWeekendPercent] = useState("10");
  const [holidayPercent, setHolidayPercent] = useState("100");
  const [casPercent, setCasPercent] = useState("25");
  const [cassPercent, setCassPercent] = useState("10");
  const [taxPercent, setTaxPercent] = useState("10");
  const [hoursPerShift, setHoursPerShift] = useState("8");
  const [medicalLeaveDays, setMedicalLeaveDays] = useState("0");

  const [monthIndex, setMonthIndex] = useState(3);
  const [year, setYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [daysData, setDaysData] = useState<Record<number, DayData>>({});
  const [cloudStateLoaded, setCloudStateLoaded] = useState(false);

  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [adGateOpen, setAdGateOpen] = useState(false);
  const [approvedCalculationSignature, setApprovedCalculationSignature] = useState<string | null>(null);
  const holidaysForYear = useMemo(() => getRomanianHolidays(year), [year]);


  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

      const hiddenUntil = Number(localStorage.getItem("android-apk-popup-hidden-until") || "0");
      const dismissedAfterDownload = localStorage.getItem("android-apk-popup-downloaded") === "true";

      if (isStandalone || dismissedAfterDownload || Date.now() < hiddenUntil) {
        setShowAndroidDownloadPopup(false);
        return;
      }

      const timer = window.setTimeout(() => {
        setShowAndroidDownloadPopup(true);
      }, 1800);

      return () => window.clearTimeout(timer);
    } catch (error) {
      console.error("Android APK popup init failed:", error);
    }
  }, []);

  function hideAndroidDownloadPopupForOneDay() {
    try {
      localStorage.setItem(
        "android-apk-popup-hidden-until",
        String(Date.now() + 24 * 60 * 60 * 1000),
      );
    } catch (error) {
      console.error("Android APK popup hide failed:", error);
    }

    setShowAndroidDownloadPopup(false);
  }

  function handleAndroidApkDownloadClick() {
    try {
      localStorage.setItem("android-apk-popup-downloaded", "true");
    } catch (error) {
      console.error("Android APK popup download state failed:", error);
    }

    setShowAndroidDownloadPopup(false);
  }

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("salary-lang-v1") as Lang | null;

      if (savedLang === "ro" || savedLang === "en") {
        setLang(savedLang);
      }
    } catch (err) {
      console.error("Local language load failed:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("salary-lang-v1", lang);
    localStorage.setItem("calculator-salariu-lang", lang);
    window.dispatchEvent(new CustomEvent("calculator-salariu-lang-change", { detail: lang }));
  }, [lang]);

  useEffect(() => {
    if (!user) return;

    const payload = {
      grossSalary,
      mealTicketPerDay,
      nightPercent,
      overtimePercent,
      weekendPercent,
      holidayPercent,
      casPercent,
      cassPercent,
      taxPercent,
      hoursPerShift,
      medicalLeaveDays,
    };

    localStorage.setItem(`salary-settings-v3-${user.uid}`, JSON.stringify(payload));
  }, [
    user,
    grossSalary,
    mealTicketPerDay,
    nightPercent,
    overtimePercent,
    weekendPercent,
    holidayPercent,
    casPercent,
    cassPercent,
    taxPercent,
    hoursPerShift,
    medicalLeaveDays,
  ]);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem(
      `salary-calendar-v3-${user.uid}`,
      JSON.stringify({ monthIndex, year, daysData }),
    );
  }, [user, monthIndex, year, daysData]);

  useEffect(() => {
    if (!user || !cloudStateLoaded) return;

    const payload: CloudSalaryState = {
      grossSalary,
      mealTicketPerDay,
      nightPercent,
      overtimePercent,
      weekendPercent,
      holidayPercent,
      casPercent,
      cassPercent,
      taxPercent,
      hoursPerShift,
      medicalLeaveDays,
      monthIndex,
      year,
      daysData,
      lang,
      updatedAt: new Date().toISOString(),
    };

    const timeout = window.setTimeout(async () => {
      try {
        await setDoc(
          doc(db, "users", user.uid, "calendarState", "main"),
          payload,
          { merge: true },
        );
      } catch (error) {
        console.error("Cloud state save error:", error);
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [
    user,
    cloudStateLoaded,
    grossSalary,
    mealTicketPerDay,
    nightPercent,
    overtimePercent,
    weekendPercent,
    holidayPercent,
    casPercent,
    cassPercent,
    taxPercent,
    hoursPerShift,
    medicalLeaveDays,
    monthIndex,
    year,
    daysData,
    lang,
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setCloudStateLoaded(false);

      if (currentUser) {
        try {
          const ref = doc(db, "users", currentUser.uid, "profile", "main");
          const snap = await getDoc(ref);
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);

          const stateRef = doc(db, "users", currentUser.uid, "calendarState", "main");
          const stateSnap = await getDoc(stateRef);

          if (stateSnap.exists()) {
            const state = stateSnap.data() as CloudSalaryState;

            setGrossSalary(String(state.grossSalary ?? "0"));
            setMealTicketPerDay(String(state.mealTicketPerDay ?? "30"));
            setNightPercent(String(state.nightPercent ?? "25"));
            setOvertimePercent(String(state.overtimePercent ?? "75"));
            setWeekendPercent(String(state.weekendPercent ?? "10"));
            setHolidayPercent(String(state.holidayPercent ?? "100"));
            setCasPercent(String(state.casPercent ?? "25"));
            setCassPercent(String(state.cassPercent ?? "10"));
            setTaxPercent(String(state.taxPercent ?? "10"));
            setHoursPerShift(String(state.hoursPerShift ?? "8"));
            setMedicalLeaveDays(String(state.medicalLeaveDays ?? "0"));
            setMonthIndex(Number(state.monthIndex ?? 3));
            setYear(Number(state.year ?? 2026));
            setDaysData(state.daysData ?? {});

            if (state.lang === "ro" || state.lang === "en") {
              setLang(state.lang);
            }
          } else {
            const savedSettings = localStorage.getItem(`salary-settings-v3-${currentUser.uid}`);
            const savedCalendar = localStorage.getItem(`salary-calendar-v3-${currentUser.uid}`);

            if (savedSettings) {
              const s = JSON.parse(savedSettings);
              setGrossSalary(String(s.grossSalary ?? "0"));
              setMealTicketPerDay(String(s.mealTicketPerDay ?? "30"));
              setNightPercent(String(s.nightPercent ?? "25"));
              setOvertimePercent(String(s.overtimePercent ?? "75"));
              setWeekendPercent(String(s.weekendPercent ?? "10"));
              setHolidayPercent(String(s.holidayPercent ?? "100"));
              setCasPercent(String(s.casPercent ?? "25"));
              setCassPercent(String(s.cassPercent ?? "10"));
              setTaxPercent(String(s.taxPercent ?? "10"));
              setHoursPerShift(String(s.hoursPerShift ?? "8"));
              setMedicalLeaveDays(String(s.medicalLeaveDays ?? "0"));
            } else {
              setGrossSalary("0");
              setMealTicketPerDay("30");
              setNightPercent("25");
              setOvertimePercent("75");
              setWeekendPercent("10");
              setHolidayPercent("100");
              setCasPercent("25");
              setCassPercent("10");
              setTaxPercent("10");
              setHoursPerShift("8");
              setMedicalLeaveDays("0");
            }

            if (savedCalendar) {
              const c = JSON.parse(savedCalendar);
              setMonthIndex(Number(c.monthIndex ?? 3));
              setYear(Number(c.year ?? 2026));
              setDaysData(c.daysData ?? {});
            } else {
              setMonthIndex(3);
              setYear(2026);
              setDaysData({});
            }
          }
        } catch (error) {
          console.error("Cloud state load error:", error);
        } finally {
          setCloudStateLoaded(true);
        }
      } else {
        setProfile(null);
        setCloudStateLoaded(false);
        setGrossSalary("0");
        setMealTicketPerDay("30");
        setNightPercent("25");
        setOvertimePercent("75");
        setWeekendPercent("10");
        setHolidayPercent("100");
        setCasPercent("25");
        setCassPercent("10");
        setTaxPercent("10");
        setHoursPerShift("8");
        setMedicalLeaveDays("0");
        setDaysData({});
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadUsage() {
      if (!user) {
        setUsageStatus(null);
        return;
      }

      try {
        setUsageLoading(true);
        const status = await getUsageStatus(user.uid, !!profile?.isPremium);
        setUsageStatus(status);
      } catch (error) {
        console.error("Usage load error:", error);
      } finally {
        setUsageLoading(false);
      }
    }

    if (!loading) {
      loadUsage();
    }
  }, [user, profile?.isPremium, loading]);

  const statusLabel = profile?.isPremium
    ? (lang === "ro" ? "Premium lunar" : "Premium monthly")
    : (lang === "ro" ? "Gratuit" : "Free");

  const isPremium = !!profile?.isPremium;
  // Pentru review AdSense nu afișăm reclame/placeholder-e în ecranele aplicației.
  // Reclamele pot fi reactivate controlat doar pe pagini editoriale după aprobare.
  const adMode = "adsense_review_safe";

  const calculationSignature = useMemo(() => JSON.stringify({
    grossSalary,
    mealTicketPerDay,
    nightPercent,
    overtimePercent,
    weekendPercent,
    holidayPercent,
    casPercent,
    cassPercent,
    taxPercent,
    hoursPerShift,
    medicalLeaveDays,
    monthIndex,
    year,
    daysData,
  }), [
    grossSalary,
    mealTicketPerDay,
    nightPercent,
    overtimePercent,
    weekendPercent,
    holidayPercent,
    casPercent,
    cassPercent,
    taxPercent,
    hoursPerShift,
    medicalLeaveDays,
    monthIndex,
    year,
    daysData,
  ]);

  const calculationUnlocked = approvedCalculationSignature === calculationSignature;

  const monthDays = useMemo(() => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const normalizedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const items: Array<{
      day: number | null;
      weekdayIndex?: number;
      isWeekend?: boolean;
      isHoliday?: boolean;
      holidayName?: string;
    }> = [];

    for (let i = 0; i < normalizedFirstDay; i++) {
      items.push({ day: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const weekday = date.getDay();
      const weekdayIndex = weekday === 0 ? 6 : weekday - 1;
      const isWeekend = weekdayIndex >= 5;
      const holiday = holidaysForYear.find(
        (h) => h.month === monthIndex + 1 && h.day === day,
      );

      items.push({
        day,
        weekdayIndex,
        isWeekend,
        isHoliday: !!holiday,
        holidayName: holiday ? (lang === "ro" ? holiday.name : holiday.enName) : undefined,
      });
    }

    while (items.length % 7 !== 0) {
      items.push({ day: null });
    }

    while (items.length < 35) {
      items.push({ day: null });
    }

    return items;
  }, [monthIndex, year, lang, holidaysForYear]);

  const calculation = useMemo(() => {
    const gross = Number(grossSalary || 0);
    const hoursShift = Math.max(1, Number(hoursPerShift || 8));
    const casRate = Number(casPercent || 0) / 100;
    const cassRate = Number(cassPercent || 0) / 100;
    const taxRate = Number(taxPercent || 0) / 100;
    const mealValue = Number(mealTicketPerDay || 0);
    const nightRate = Number(nightPercent || 0) / 100;
    const overtimeRate = Number(overtimePercent || 0) / 100;
    const weekendRate = Number(weekendPercent || 0) / 100;
    const holidayRate = Number(holidayPercent || 0) / 100;
    const unpaidMedicalDays = Math.max(0, Number(medicalLeaveDays || 0));

    const morningCount = Object.values(daysData).filter((d) => d.type === "Morning").length;
    const afterCount = Object.values(daysData).filter((d) => d.type === "After").length;
    const nightCount = Object.values(daysData).filter((d) => d.type === "Night").length;
    const coCount = Object.values(daysData).filter((d) => d.type === "CO").length;
    const cmCount = Object.values(daysData).filter((d) => d.type === "CM").length;
    const workedBaseDays = morningCount + afterCount + nightCount + coCount;

    const hourlyBase = gross / Math.max(1, 160);
    const dailyBase = hourlyBase * hoursShift;

    let overtimeHoursTotal = 0;
    let workedHoursTotal = 0;
    let undertimeHoursTotal = 0;
    let undertimeAdjustment = 0;
    let overtimeExtra = 0;
    let nightExtra = 0;
    let weekendExtra = 0;
    let holidayExtra = 0;

    monthDays.forEach((item) => {
      if (!item.day) return;
      const entry = daysData[item.day];
      if (!entry) return;

      const overtimeDayHours = Math.max(0, Number(entry.overtimeHours || 0));
      overtimeHoursTotal += overtimeDayHours;
      overtimeExtra += overtimeDayHours * hourlyBase * overtimeRate;

      const isWorkedShift =
        entry.type === "Morning" || entry.type === "After" || entry.type === "Night";

      const rawWorkedHours = Number(entry.workedHours);
      const workedHours = isWorkedShift
        ? Math.min(hoursShift, Math.max(0, Number.isFinite(rawWorkedHours) ? rawWorkedHours : hoursShift))
        : 0;
      const undertimeHours = isWorkedShift ? Math.max(0, hoursShift - workedHours) : 0;

      workedHoursTotal += workedHours;
      undertimeHoursTotal += undertimeHours;
      undertimeAdjustment += undertimeHours * hourlyBase;

      if (entry.type === "Night") {
        nightExtra += workedHours * hourlyBase * nightRate;
      }

      if (isWorkedShift && item.isWeekend) {
        weekendExtra += workedHours * hourlyBase * weekendRate;
      }

      if (isWorkedShift && item.isHoliday) {
        holidayExtra += workedHours * hourlyBase * holidayRate;
      }

      if (overtimeDayHours > 0 && entry.otNight) {
        nightExtra += overtimeDayHours * hourlyBase * nightRate;
      }
      if (overtimeDayHours > 0 && entry.otWeekend) {
        weekendExtra += overtimeDayHours * hourlyBase * weekendRate;
      }
      if (overtimeDayHours > 0 && entry.otHoliday) {
        holidayExtra += overtimeDayHours * hourlyBase * holidayRate;
      }
    });

    const medicalAdjustment = Math.min(cmCount, unpaidMedicalDays) * dailyBase;
    const grossEstimate =
      gross + overtimeExtra + nightExtra + weekendExtra + holidayExtra - medicalAdjustment - undertimeAdjustment;

    const casValue = grossEstimate * casRate;
    const cassValue = grossEstimate * cassRate;
    const taxableIncome = Math.max(0, grossEstimate - casValue - cassValue);
    const incomeTax = taxableIncome * taxRate;
    const netSalary = Math.max(0, grossEstimate - casValue - cassValue - incomeTax);

    const mealTickets = (morningCount + afterCount + nightCount) * mealValue;
    const totalEstimated = netSalary + mealTickets;

    return {
      workedDays: morningCount + afterCount + nightCount,
      workedBaseDays,
      morningCount,
      afterCount,
      nightCount,
      coCount,
      cmCount,
      overtimeHours: overtimeHoursTotal,
      workedHours: workedHoursTotal,
      undertimeHours: undertimeHoursTotal,
      undertimeAdjustment,
      hourlyBase,
      grossEstimate,
      cas: casValue,
      cass: cassValue,
      taxableIncome,
      incomeTax,
      netSalary,
      mealTickets,
      overtimeExtra,
      nightExtra,
      weekendExtra,
      holidayExtra,
      medicalAdjustment,
      totalEstimated,
    };
  }, [
    daysData,
    monthDays,
    grossSalary,
    hoursPerShift,
    casPercent,
    cassPercent,
    taxPercent,
    mealTicketPerDay,
    nightPercent,
    overtimePercent,
    weekendPercent,
    holidayPercent,
    medicalLeaveDays,
  ]);

  async function refreshUsage() {
    if (!user) {
      setUsageStatus(null);
      return;
    }

    try {
      const status = await getUsageStatus(user.uid, !!profile?.isPremium);
      setUsageStatus(status);
    } catch (error) {
      console.error("Usage refresh error:", error);
    }
  }

  async function unlockCalculationAndConsume() {
    if (!user) {
      alert(t.loginNeeded);
      return;
    }

    if (!isOnline) {
      alert(t.noInternet);
      return;
    }

    try {
      setUsageLoading(true);
      const result = await consumeUsage(user.uid, !!profile?.isPremium);
      setUsageStatus(result);

      if (!result.allowed) {
        alert(t.freeLimitReached);
        return;
      }

      // În modul de review AdSense nu folosim porți, overlay-uri sau placeholder-e de reclamă.
      // După aprobare, monetizarea se reactivează controlat fără a forța clickuri/vizionări.
      setApprovedCalculationSignature(calculationSignature);
      setActiveTab("estimate");
    } catch (error) {
      console.error(error);
      alert("Usage validation failed.");
    } finally {
      setUsageLoading(false);
    }
  }

  async function handleCalculateRequest() {
    if (!user) {
      alert(t.loginNeeded);
      return;
    }

    if (!isOnline) {
      alert(t.noInternet);
      return;
    }

    await unlockCalculationAndConsume();
  }

  function handleAdGateContinue() {
    setAdGateOpen(false);
    setApprovedCalculationSignature(calculationSignature);
    setActiveTab("estimate");
  }

  async function handleLogout() {
    try {
      clearStoredSecurityState();
      await logoutUser();
      alert(t.logoutOk);
    } catch {
      alert(t.logoutErr);
    }
  }

  async function saveCalculation() {
    if (!user) {
      alert(t.loginNeeded);
      return;
    }

    if (!isOnline) {
      alert(t.noInternet);
      return;
    }

    if (calculation.netSalary <= 0) {
      alert(t.calculate);
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "calculations"), {
        grossSalary: Number(grossSalary),
        mealTicketPerDay: Number(mealTicketPerDay),
        nightPercent: Number(nightPercent),
        overtimePercent: Number(overtimePercent),
        weekendPercent: Number(weekendPercent),
        holidayPercent: Number(holidayPercent),
        casPercent: Number(casPercent),
        cassPercent: Number(cassPercent),
        taxPercent: Number(taxPercent),
        hoursPerShift: Number(hoursPerShift),
        medicalLeaveDays: Number(medicalLeaveDays),
        grossEstimate: calculation.grossEstimate,
        cas: calculation.cas,
        cass: calculation.cass,
        taxableIncome: calculation.taxableIncome,
        incomeTax: calculation.incomeTax,
        netSalary: calculation.netSalary,
        mealTickets: calculation.mealTickets,
        overtimeExtra: calculation.overtimeExtra,
        nightExtra: calculation.nightExtra,
        weekendExtra: calculation.weekendExtra,
        holidayExtra: calculation.holidayExtra,
        totalEstimated: calculation.totalEstimated,
        daysData,
        createdAt: new Date(),
      });

      alert(t.savedSuccess);
    } catch (err) {
      console.error(err);
      alert(t.savedError);
    }
  }

  function loadExample() {
    setGrossSalary("13611");
    setMealTicketPerDay("30");
    setNightPercent("25");
    setOvertimePercent("75");
    setWeekendPercent("10");
    setHolidayPercent("100");
    setCasPercent("25");
    setCassPercent("10");
    setTaxPercent("10");
    setHoursPerShift("8");
    setMedicalLeaveDays("0");
    alert(t.loadExampleDone);
  }

  function resetCalendar() {
    setDaysData({});
    setSelectedDay(null);
  }

  function setToday() {
    const now = new Date();
    setMonthIndex(now.getMonth());
    setYear(now.getFullYear());
  }

  function renderTabContent() {
    switch (activeTab) {
      case "calendar":
        return (
          <CalendarSection
            t={t}
            months={months}
            weekdays={weekdays}
            monthIndex={monthIndex}
            setMonthIndex={setMonthIndex}
            year={year}
            setYear={setYear}
            monthDays={monthDays}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            daysData={daysData}
            onToday={setToday}
            onReset={resetCalendar}
            lang={lang}
            calculation={calculation}
            onCalculate={handleCalculateRequest}
            usageLoading={usageLoading}
            isOnline={isOnline}
          />
        );
      case "estimate":
        return calculationUnlocked ? (
          <EstimateSection
            t={t}
            lang={lang}
            net={calculation.netSalary}
            mealTickets={calculation.mealTickets}
            total={calculation.totalEstimated}
            workedDays={calculation.workedDays}
            morning={calculation.morningCount}
            after={calculation.afterCount}
            night={calculation.nightCount}
            workedHours={calculation.workedHours}
            undertimeHours={calculation.undertimeHours}
            undertimeAdjustment={calculation.undertimeAdjustment}
            overtimeHours={calculation.overtimeHours}
            overtimeExtra={calculation.overtimeExtra}
            nightExtra={calculation.nightExtra}
            weekendExtra={calculation.weekendExtra}
            holidayExtra={calculation.holidayExtra}
            medicalAdjustment={calculation.medicalAdjustment}
          />
        ) : (
          <CalculationLockedSection
            t={t}
            lang={lang}
            isPremium={isPremium}
            usageStatus={usageStatus}
            loading={usageLoading}
            onUnlock={handleCalculateRequest}
            isOnline={isOnline}
          />
        );
      case "rules":
        return (
          <RulesSection
            t={t}
            grossSalary={grossSalary}
            setGrossSalary={setGrossSalary}
            mealTicketPerDay={mealTicketPerDay}
            setMealTicketPerDay={setMealTicketPerDay}
            nightPercent={nightPercent}
            setNightPercent={setNightPercent}
            overtimePercent={overtimePercent}
            setOvertimePercent={setOvertimePercent}
            weekendPercent={weekendPercent}
            setWeekendPercent={setWeekendPercent}
            holidayPercent={holidayPercent}
            setHolidayPercent={setHolidayPercent}
            casPercent={casPercent}
            setCasPercent={setCasPercent}
            cassPercent={cassPercent}
            setCassPercent={setCassPercent}
            taxPercent={taxPercent}
            setTaxPercent={setTaxPercent}
            hoursPerShift={hoursPerShift}
            setHoursPerShift={setHoursPerShift}
            medicalLeaveDays={medicalLeaveDays}
            setMedicalLeaveDays={setMedicalLeaveDays}
            onCalculate={handleCalculateRequest}
            isPremium={isPremium}
            usageStatus={usageStatus}
            usageLoading={usageLoading}
            onLoadExample={loadExample}
            isOnline={isOnline}
          />
        );
      case "details":
        return calculationUnlocked ? (
          <DetailsSection
            t={t}
            lang={lang}
            isPremium={isPremium}
            grossEstimate={calculation.grossEstimate}
            hourlyBase={calculation.hourlyBase}
            cas={calculation.cas}
            cass={calculation.cass}
            taxableIncome={calculation.taxableIncome}
            incomeTax={calculation.incomeTax}
            netSalary={calculation.netSalary}
            onSaveCalculation={saveCalculation}
          />
        ) : (
          <CalculationLockedSection
            t={t}
            lang={lang}
            isPremium={isPremium}
            usageStatus={usageStatus}
            loading={usageLoading}
            onUnlock={handleCalculateRequest}
            isOnline={isOnline}
          />
        );
      case "holidays":
        return <HolidaysSection t={t} lang={lang} year={year} holidays={holidaysForYear} />;
      case "logic":
        return <LogicSection t={t} lang={lang} />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#061428] p-8 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">{t.appTitle}</h1>
          <p className="mt-4 text-white/70">{t.loading}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_8%,_rgba(34,211,238,0.18),_transparent_22%),radial-gradient(circle_at_85%_5%,_rgba(59,130,246,0.22),_transparent_24%),linear-gradient(180deg,#061122_0%,#07192f_45%,#04101f_100%)] pb-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8">
        {!user && (
          <>
          <section className="mx-auto mt-10 max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
            <div className="mb-5 inline-flex rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200">
              {t.secureAuth}
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">{t.appTitle}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
              {t.intro}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href="/register"
                className="rounded-[24px] border border-white/10 bg-white/10 px-6 py-4 text-center text-2xl font-semibold transition hover:bg-white/15"
              >
                {t.register}
              </Link>
              <Link
                href="/login"
                className="rounded-[24px] border border-white/10 bg-[#071326] px-6 py-4 text-center text-2xl font-semibold transition hover:bg-[#0a1c34]"
              >
                {t.login}
              </Link>
            </div>
          </section>

          <section className="mx-auto mt-6 max-w-5xl rounded-[28px] border border-white/10 bg-[#071326]/75 p-6 text-white/80 shadow-[0_0_50px_rgba(0,80,255,0.06)]">
            <div className="text-xs uppercase tracking-[0.22em] text-blue-200/70">Ghid salarizare România</div>
            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Calculator salariu, sporuri, ture și sărbători legale</h2>
            <p className="mt-4 leading-8">
              Salary Calculator este construit pentru angajații care lucrează în ture și vor o estimare rapidă a venitului lunar.
              Pe lângă aplicația de calcul, site-ul include ghiduri despre salariul brut/net, sporul de noapte, concediul medical,
              bonurile de masă și sărbătorile legale din România. Informațiile sunt orientative și trebuie verificate cu legislația
              actuală, contractul individual de muncă și regulamentul intern al angajatorului.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/calculator-brut-net" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-semibold text-white transition hover:bg-white/[0.08]">Brut vs net</Link>
              <Link href="/spor-de-noapte" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-semibold text-white transition hover:bg-white/[0.08]">Spor de noapte</Link>
              <Link href="/concediu-medical" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-semibold text-white transition hover:bg-white/[0.08]">Medical leave</Link>
              <Link href="/sarbatori-legale-2026" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-semibold text-white transition hover:bg-white/[0.08]">Holidays 2026</Link>
            </div>
          </section>
          </>
        )}

        {user && (
          <div className="space-y-4">
            {!isOnline && (
              <div className="rounded-[18px] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {t.noInternet}
              </div>
            )}

            <header className="flex flex-col gap-5 rounded-[34px] border border-white/10 bg-[#08162a]/80 p-5 shadow-[0_0_80px_rgba(14,165,233,0.10),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                    {t.appTitle}
                  </div>
                  <h1 className="mt-1 text-[2.65rem] font-bold leading-[0.98] tracking-tight sm:text-5xl md:text-6xl">
                    {t.appTitle}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start lg:justify-end">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <button
                      onClick={() => setLang("ro")}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition ${
                        lang === "ro"
                          ? "bg-gradient-to-br from-blue-400 to-cyan-400 shadow-[0_0_24px_rgba(59,130,246,0.45)]"
                          : "border border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      RO
                    </button>
                    <button
                      onClick={() => setLang("en")}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition ${
                        lang === "en"
                          ? "bg-gradient-to-br from-blue-400 to-cyan-400 shadow-[0_0_24px_rgba(59,130,246,0.45)]"
                          : "border border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      EN
                    </button>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300/30 hover:bg-rose-500/10 hover:text-white"
                  >
                    {lang === "ro" ? "Ieșire" : "Logout"}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.7fr_1fr_1fr_1fr] xl:gap-4">
                <InfoCard icon="👤" label={t.account} value={user.email || "-"} />
                <InfoCard icon="👑" label={t.plan} value={statusLabel} />
                <UsageCard 
                  t={t}
                  lang={lang}
                  isPremium={isPremium} 
                  usageStatus={usageStatus} 
                  loading={usageLoading} 
                />
                <InfoCard icon="🟢" label="Status" value={isOnline ? t.online : t.offline} />
              </div>

              <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/10 bg-[#041224]/65 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <ActionChip dataTab="calendar" onClick={() => setActiveTab("calendar")} active={activeTab === "calendar"}>📅 {t.calendar}</ActionChip>
                <ActionChip dataTab="estimate" onClick={() => setActiveTab("estimate")} active={activeTab === "estimate"}>📊 {t.estimate}</ActionChip>
                <ActionChip dataTab="rules" onClick={() => setActiveTab("rules")} active={activeTab === "rules"}>⚙️ {t.rules}</ActionChip>
                <ActionChip dataTab="holidays" onClick={() => setActiveTab("holidays")} active={activeTab === "holidays"}>🎉 {t.holidays}</ActionChip>
                <ActionChip dataTab="logic" onClick={() => setActiveTab("logic")} active={activeTab === "logic"}>🧠 {t.logic}</ActionChip>
                <Link
                  href="/premium"
                  className="rounded-[14px] border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400/15 hover:text-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.25)]"
                >
                  👑 {t.premiumManage}
                </Link>
                <Link
                  href="/history"
                  className="rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/90 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.25)]"
                >
                  {t.history}
                </Link>
                <a
                  href="/downloads/calculator-salariu.apk"
                  onClick={handleAndroidApkDownloadClick}
                  className="rounded-[14px] border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-400/15 hover:text-white hover:shadow-[0_10px_24px_rgba(34,211,238,0.25)]"
                >
                  📲 {lang === "ro" ? "Descarcă aplicația" : "Download app"}
                </a>
                <Link
                  href="/security"
                  className="rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/90 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.25)]"
                >
                  🛡️ {lang === "ro" ? "Securitate" : "Security"}
                </Link>

              </div>
            </header>

            {!profile?.isPremium && (
              <section className="rounded-[24px] border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-50 shadow-[0_0_30px_rgba(250,204,21,0.08)]">
                <div className="text-xs uppercase tracking-[0.22em] text-yellow-100/70">
                  {t.freePlan}
                </div>
                <h2 className="mt-1 text-xl font-semibold">{t.activatePremium}</h2>
                <p className="mt-1 max-w-3xl text-sm text-yellow-50/80">
                  {t.freeDescription}
                </p>
              </section>
            )}

            {renderTabContent()}


            {selectedDay && (
              <DayModal
                t={t}
                dayTypeLabels={TYPE_LABELS[lang as Lang]}
                months={months}
                day={selectedDay}
                monthIndex={monthIndex}
                year={year}
                data={daysData[selectedDay]}
                isWeekend={!!monthDays.find((item) => item.day === selectedDay)?.isWeekend}
                holidayName={monthDays.find((item) => item.day === selectedDay)?.holidayName}
                onClose={() => setSelectedDay(null)}
                onSave={(newData: DayData) => {
                  setDaysData((prev) => ({
                    ...prev,
                    [selectedDay]: newData,
                  }));
                  setSelectedDay(null);
                }}
              />
            )}

            {adGateOpen && (
              <AdGateModal
                t={t}
                onClose={() => setAdGateOpen(false)}
                onContinue={handleAdGateContinue}
                loading={usageLoading}
                remaining={usageStatus?.remaining ?? 0}
              />
            )}
          </div>
        )}
      </div>

      {showAndroidDownloadPopup && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 px-4 pb-5 pt-10 backdrop-blur-sm sm:items-center sm:pb-10">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-cyan-300/25 bg-[#061428] text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="bg-gradient-to-r from-blue-600/40 to-cyan-500/30 px-5 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/80">
                {lang === "ro" ? "Aplicația Android" : "Android app"}
              </div>
              <h3 className="mt-1 text-2xl font-black leading-tight">
                {lang === "ro" ? "Descarcă aplicația pe telefon" : "Download the app on your phone"}
              </h3>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm leading-6 text-white/78">
                {lang === "ro"
                  ? "Instalează varianta Android pentru acces rapid la Calculator Salariu. Premium se sincronizează prin contul tău."
                  : "Install the Android version for quick access to Salary Calculator. Premium syncs through your account."}
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-white/65">
                {lang === "ro"
                  ? "Dacă Android cere permisiune pentru instalare din browser, apasă Permite / Install unknown apps doar pentru această instalare."
                  : "If Android asks permission to install from the browser, allow Install unknown apps only for this installation."}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="/downloads/calculator-salariu.apk"
                  onClick={handleAndroidApkDownloadClick}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center text-sm font-black text-white shadow-[0_0_26px_rgba(34,211,238,0.28)] transition hover:scale-[1.02]"
                >
                  {lang === "ro" ? "Descarcă APK" : "Download APK"}
                </a>

                <button
                  type="button"
                  onClick={hideAndroidDownloadPopupForOneDay}
                  className="flex-1 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-white/[0.08]"
                >
                  {lang === "ro" ? "Mai târziu" : "Later"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 z-50 w-full px-3 pb-2">
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-[16px] border border-white/10 bg-[#041224]/90 px-3 py-2 text-center text-[12px] text-white/70 shadow-[0_10px_32px_rgba(2,8,23,0.45)] backdrop-blur-md sm:text-sm">
          {!profile?.isPremium ? (
            <div className="flex flex-wrap items-center justify-center gap-2 font-medium text-white/75">
              <span>{lang === "ro" ? "Plan Free activ" : "Free plan active"}</span>
              <Link
                href="/premium"
                className="rounded-full border border-blue-300/35 bg-gradient-to-r from-blue-600/80 to-cyan-500/70 px-3 py-1 text-white shadow-[0_0_22px_rgba(59,130,246,0.35)] transition-all duration-200 hover:scale-[1.03] hover:from-blue-500 hover:to-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]"
              >
                {lang === "ro" ? "Deblochează Premium" : "Unlock Premium"}
              </Link>
            </div>
          ) : (
            <div className="font-medium text-white/75">{lang === "ro" ? "Premium activ" : "Premium active"}</div>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value, icon = "•" }: { label: string; value: string; icon?: string }) {
  const normalizedLabel = label.toLowerCase();
  const isPlanCard = normalizedLabel.includes("plan");
  const isLongValue = value.length > 18;

  const valueClass = isPlanCard
    ? "whitespace-nowrap break-normal text-[1.05rem] sm:text-[1.15rem] md:text-[1.25rem] xl:text-[1.35rem]"
    : isLongValue
      ? "break-all text-[1rem] sm:text-[1.05rem] md:text-[1.1rem] xl:text-[1.2rem]"
      : "break-words text-xl md:text-[2rem]";

  return (
    <div
      title={value}
      className="rounded-[26px] border border-white/10 bg-[#071326]/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/20 hover:bg-[#08182e]/90 hover:shadow-[0_14px_34px_rgba(15,23,42,0.24)]"
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm">{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`mt-3 font-black leading-tight ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function UsageCard({
  t,
  lang,
  isPremium,
  usageStatus,
  loading,
}: {
  t: Translation;
  lang: Lang;
  isPremium: boolean;
  usageStatus: UsageStatus | null;
  loading: boolean;
}) {
  const remaining = usageStatus?.remaining ?? "—";
  const limit = usageStatus?.limit ?? 15;
  const isUnlimited = isPremium || limit === 999999;
  const value = loading
    ? t.usageChecking
    : isUnlimited
      ? t.unlimited.charAt(0).toUpperCase() + t.unlimited.slice(1)
      : `${remaining}/${limit}`;
  const hint = isUnlimited
    ? (lang === "ro" ? "Plan premium" : "Premium plan")
    : (lang === "ro" ? "Fereastra lunară curentă" : "Current monthly window");

  const tooltip = isUnlimited
    ? (lang === "ro" ? "Planul Premium permite utilizare nelimitată." : "Premium allows unlimited use.")
    : (lang === "ro" ? `Planul Free permite ${limit} calcule pe lună.` : `Free plan allows ${limit} calculations per month.`);

  return (
    <div
      title={tooltip}
      className="cursor-help rounded-[26px] border border-white/10 bg-[#061327]/90 p-4 shadow-[0_14px_34px_rgba(2,8,23,0.25),inset_0_1px_0_rgba(255,255,255,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-[#08182e]/95"
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm">⚡</span>
        <span>{t.usage}</span>
      </div>
      <div className="mt-3 break-all text-xl font-black leading-tight md:break-words md:text-[2rem]">{value}</div>
      <div className="mt-1 text-xs text-white/60">{loading ? t.usageChecking : hint}</div>
    </div>
  );
}

function CalculationLockedSection({
  t,
  isPremium,
  usageStatus,
  loading,
  onUnlock,
  isOnline,
}: {
  t: Translation;
  lang: Lang;
  isPremium: boolean;
  usageStatus: UsageStatus | null;
  loading: boolean;
  onUnlock: () => void;
  isOnline: boolean;
}) {
  return (
    <SectionShell kicker={t.lockedKicker} title={t.lockedTitle}>
      <div className="rounded-[28px] border border-white/10 bg-[#071326]/80 p-6">
        <p className="max-w-3xl text-lg leading-8 text-white/80">
          {isPremium ? t.lockedPremium : t.lockedFree}
        </p>

        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
          {isPremium ? t.plan : t.usage}:{" "}
          <span className="font-semibold text-white">
            {loading ? t.usageChecking : usageStatus?.remaining ?? "—"}
          </span>
        </div>

        {!isOnline && (
          <div className="mt-4 rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {t.noInternet}
          </div>
        )}

        <button
          onClick={onUnlock}
          disabled={loading || !isOnline}
          className="mt-5 rounded-[18px] bg-blue-600 px-6 py-3 text-base font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPremium ? t.unlockPremium : t.unlockFree}
        </button>
      </div>
    </SectionShell>
  );
}

function AdGateModal({
  t,
  onClose,
  onContinue,
  loading,
  remaining,
}: {
  t: Translation;
  onClose: () => void;
  onContinue: () => void;
  loading: boolean;
  remaining: number;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#071326] p-6 shadow-[0_0_80px_rgba(0,80,255,0.18)]">
        <div className="inline-flex rounded-full bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-100">
          {t.adKicker}
        </div>

        <h3 className="mt-4 text-3xl font-bold">{t.adTitle}</h3>
        <p className="mt-3 text-base leading-7 text-white/75">
          {t.adBody}
        </p>

        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          {t.usage}: <span className="font-semibold text-white">{remaining}</span>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onContinue}
            disabled={loading}
            className="rounded-[18px] bg-blue-600 px-6 py-3 text-base font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t.adContinue}
          </button>
          <button
            onClick={onClose}
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-semibold transition hover:bg-white/[0.08]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionChip({
  children,
  active,
  onClick,
  dataTab,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  dataTab?: string;
}) {
  return (
    <button
      data-tab={dataTab}
      onClick={onClick}
      className={`rounded-[14px] px-3 py-2 text-xs font-bold transition-all duration-200
      ${active
        ? "bg-blue-500/20 text-blue-200 border border-blue-400/35 shadow-[0_0_22px_rgba(59,130,246,0.28)]"
        : "bg-white/[0.04] text-white/72 border border-white/10 hover:bg-white/[0.08] hover:text-white hover:-translate-y-[1px]"
      }`}
    >
      {children}
    </button>
  );
}

function SectionShell({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[34px] border border-white/10 bg-[#08162a]/72 p-5 shadow-[0_0_80px_rgba(14,165,233,0.09),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl md:p-6">
      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{kicker}</div>
      <h2 className="mt-1 text-2xl font-bold md:text-4xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CalendarSection({
  t,
  months,
  weekdays,
  monthIndex,
  setMonthIndex,
  year,
  setYear,
  monthDays,
  selectedDay,
  setSelectedDay,
  daysData,
  onToday,
  onReset,
  lang,
  calculation,
  onCalculate,
  usageLoading,
  isOnline,
}: any) {
  function prevMonth() {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear(year - 1);
    } else {
      setMonthIndex(monthIndex - 1);
    }
  }

  function nextMonth() {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear(year + 1);
    } else {
      setMonthIndex(monthIndex + 1);
    }
  }

  function openRules() {
    const direct =
      (document.querySelector('[data-tab="rules"]') as HTMLElement | null) ||
      (document.querySelector('[data-tab="reguli"]') as HTMLElement | null);

    if (direct) {
      direct.click();
      return;
    }

    const buttons = Array.from(document.querySelectorAll("button")) as HTMLElement[];
    const rulesButton = buttons.find((button) => {
      const text = button.textContent?.trim().toLowerCase() || "";
      return text.includes("rules") || text.includes("reguli");
    });

    rulesButton?.click();
  }

  const dayEntries = Object.values(daysData) as DayData[];
  const morningCount = dayEntries.filter((d) => d.type === "Morning").length;
  const afternoonCount = dayEntries.filter((d) => d.type === "After").length;
  const nightCount = dayEntries.filter((d) => d.type === "Night").length;
  const vacationCount = dayEntries.filter((d) => d.type === "CO").length;
  const medicalCount = dayEntries.filter((d) => d.type === "CM").length;
  const totalHours = calculation?.workedHours ?? dayEntries.reduce((sum, d) => sum + (d.workedHours || 0), 0);

  function getStyle(day: number, isWeekend: boolean, isHoliday: boolean) {
    const type = daysData[day]?.type || "Off";

    if (type === "Morning") return "border-emerald-400/45 bg-emerald-500/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-emerald-500/[0.13]";
    if (type === "After") return "border-amber-400/45 bg-amber-500/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-amber-500/[0.14]";
    if (type === "Night") return "border-blue-400/45 bg-blue-500/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-blue-500/[0.14]";
    if (type === "CO") return "border-violet-400/45 bg-violet-500/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-violet-500/[0.16]";
    if (type === "CM") return "border-rose-400/45 bg-rose-500/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-rose-500/[0.16]";
    if (isHoliday) return "border-rose-400/30 bg-rose-500/[0.08] hover:bg-rose-500/[0.12]";
    if (isWeekend) return "border-amber-400/25 bg-amber-500/[0.06] hover:bg-amber-500/[0.10]";
    return "border-cyan-400/15 bg-cyan-500/[0.035] hover:bg-cyan-500/[0.07]";
  }

  return (
    <SectionShell kicker={t.monthlyProgram} title={t.quickCalendar}>
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.85fr)_minmax(360px,0.75fr)]">
        <div className="rounded-[28px] border border-white/10 bg-[#061327]/92 p-3 shadow-[0_18px_60px_rgba(2,8,23,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] md:p-4">
          <div className="grid gap-2 md:grid-cols-[48px_1fr_48px]">
            <button
              onClick={prevMonth}
              className="rounded-[14px] border border-white/10 bg-white/[0.04] px-2 py-2 text-lg font-semibold transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              ‹
            </button>
            <div className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-2 text-center text-sm font-bold tracking-wide">
              {months[monthIndex]}
            </div>
            <button
              onClick={nextMonth}
              className="rounded-[14px] border border-white/10 bg-white/[0.04] px-2 py-2 text-lg font-semibold transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              ›
            </button>
          </div>

          <div className="mt-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-2 text-center text-sm font-bold tracking-wide">
            {year}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onToday}
                className="rounded-[13px] border border-blue-300/30 bg-blue-500 px-3 py-2 text-[11px] font-bold shadow-[0_8px_20px_rgba(59,130,246,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-400"
              >
                {t.today}
              </button>
              <button
                onClick={onReset}
                className="rounded-[13px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                {t.reset}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <LegendPill color="bg-emerald-400" label={TYPE_LABELS[lang as Lang].Morning} />
            <LegendPill color="bg-amber-400" label={TYPE_LABELS[lang as Lang].After} />
            <LegendPill color="bg-blue-400" label={TYPE_LABELS[lang as Lang].Night} />
            <LegendPill color="bg-slate-500" label={TYPE_LABELS[lang as Lang].Off} />
            <LegendPill color="bg-violet-400" label={TYPE_LABELS[lang as Lang].CO} />
            <LegendPill color="bg-rose-400" label={`${TYPE_LABELS[lang as Lang].CM} / ${t.holiday}`} />
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekdays.map((day: string) => (
              <div
                key={day}
                className="rounded-[12px] border border-white/10 bg-white/[0.035] px-2 py-2 text-center text-[10px] font-bold text-white/70"
              >
                {day}
              </div>
            ))}

            {monthDays.map((item: any, idx: number) =>
              item.day ? (
                <button
                  key={`${item.day}-${idx}`}
                  onClick={() => setSelectedDay(item.day)}
                  className={`min-h-[78px] overflow-hidden rounded-[18px] border px-2.5 py-2 text-left transition-all duration-200 transform-gpu hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98] hover:border-white/25 ${getStyle(
                    item.day,
                    item.isWeekend,
                    item.isHoliday
                  )}${selectedDay === item.day
                    ? " ring-2 ring-blue-400/75 bg-blue-500/10 shadow-[0_0_28px_rgba(59,130,246,0.28)] scale-[1.02]"
                    : ""}`}
                >
                  <div className="text-2xl font-black leading-none">{item.day}</div>
                  <div className="mt-1 text-[9px] font-semibold leading-none text-white/70">
                    {weekdays[item.weekdayIndex]}
                  </div>
                  <div className="mt-2 text-[10px] font-bold leading-3 break-words text-white/90">
                    {TYPE_LABELS[lang as Lang][
                      ((daysData[item.day]?.type || "Off") as keyof (typeof TYPE_LABELS)[Lang])
                    ]}
                  </div>
                  {item.holidayName && (
                    <div className="mt-1 rounded-full bg-white/10 px-1.5 py-1 text-[7px] leading-2 text-white/80 break-words">
                      {item.holidayName}
                    </div>
                  )}
                </button>
              ) : (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[78px] rounded-[18px] border border-white/5 bg-white/[0.018]"
                />
              ),
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.13] to-cyan-500/[0.06] p-5 shadow-[0_0_45px_rgba(16,185,129,0.12)] 2xl:sticky 2xl:top-24 2xl:self-start">
          <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-100/70">
            {lang === "ro" ? "Calcul live" : "Live calculation"}
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-200 drop-shadow-[0_0_18px_rgba(110,231,183,0.22)] md:text-4xl">
            {calculation?.totalEstimated ? `${calculation.totalEstimated.toFixed(2)} RON` : "—"}
          </div>
          <div className="mt-1 text-sm text-white/70">
            {lang === "ro" ? "Total estimat net + bonuri de masă" : "Estimated total net + meal vouchers"}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl border border-white/10 bg-[#071326]/70 p-3">
              <div className="text-white/45">💰 Net</div>
              <div className="mt-1 font-bold">{calculation?.netSalary ? `${calculation.netSalary.toFixed(2)} RON` : "—"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#071326]/70 p-3">
              <div className="text-white/45">🎟️ {lang === "ro" ? "Bonuri de masă" : "Meal Vouchers"}</div>
              <div className="mt-1 font-bold">{calculation?.mealTickets ? `${calculation.mealTickets.toFixed(2)} RON` : "—"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#071326]/70 p-3">
              <div className="text-white/45">✨ {lang === "ro" ? "Sporuri" : "Bonuses"}</div>
              <div className="mt-1 font-bold">{calculation ? `${(calculation.overtimeExtra + calculation.nightExtra + calculation.weekendExtra + calculation.holidayExtra).toFixed(2)} RON` : "—"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#071326]/70 p-3">
              <div className="text-white/45">⏱️ {lang === "ro" ? "Ore" : "Hours"}</div>
              <div className="mt-1 font-bold">{calculation ? `${calculation.workedHours.toFixed(1)}h` : "0h"}</div>
            </div>
          </div>
          <button
            onClick={onCalculate}
            disabled={usageLoading || !isOnline}
            className="mt-4 w-full rounded-[18px] bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {lang === "ro" ? "Vezi detaliile complete" : "View full details"}
          </button>
        </div>
      </div>

      <GuideAccordionGrid lang={lang} />
    </SectionShell>
  );
}

function GuideAccordionGrid({ lang }: { lang: Lang }) {
  const cards = [
    {
      icon: "📘",
      title: lang === "ro" ? "Ghid salariu 2026" : "Salary guide 2026",
      href: "/calculator-salariu-2026",
    },
    {
      icon: "⚡",
      title: lang === "ro" ? "Sporuri și beneficii" : "Bonuses and benefits",
      href: "/spor-de-noapte",
    },
    {
      icon: "🍽️",
      title: lang === "ro" ? "Bonuri de masă" : "Meal Vouchers",
      href: "/bonuri-de-masa",
    },
    {
      icon: "🏥",
      title: lang === "ro" ? "Concediu medical" : "Sick leave",
      href: "/concediu-medical",
    },
    {
      icon: "⚖️",
      title: lang === "ro" ? "Diferența brut / net" : "Gross / net",
      href: "/calculator-brut-net",
    },
    {
      icon: "❓",
      title: lang === "ro" ? "FAQ salarii" : "Salary FAQ",
      href: "/faq",
    },
  ];

  return (
    <div className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-1.5 sm:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group flex min-h-[42px] items-center gap-2 rounded-[12px] border border-white/10 bg-[#061327]/62 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.045]"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[11px] leading-none">
            {card.icon}
          </span>
          <span className="min-w-0 flex-1 truncate text-[11px] font-bold leading-tight text-white/88">
            {card.title}
          </span>
          <span className="text-[10px] text-white/38 transition group-hover:translate-x-0.5 group-hover:text-cyan-100">
            ›
          </span>
        </Link>
      ))}
    </div>
  );
}

function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-[10px] font-medium text-white/90 md:text-[11px]">{label}</span>
    </div>
  );
}

function MiniMetric({
  title,
  value,
  icon = "•",
  tone = "cyan",
}: {
  title: string;
  value: string;
  icon?: string;
  tone?: "emerald" | "amber" | "blue" | "violet" | "rose" | "cyan";
}) {
  const toneClass: Record<string, string> = {
    emerald: "border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-200",
    amber: "border-amber-400/20 bg-amber-500/[0.06] text-amber-200",
    blue: "border-blue-400/20 bg-blue-500/[0.06] text-blue-200",
    violet: "border-violet-400/20 bg-violet-500/[0.06] text-violet-200",
    rose: "border-rose-400/20 bg-rose-500/[0.06] text-rose-200",
    cyan: "border-cyan-400/20 bg-cyan-500/[0.06] text-cyan-200",
  };

  return (
    <div className={`rounded-[24px] border p-4 shadow-[0_14px_35px_rgba(2,8,23,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.025] hover:bg-white/[0.06] ${toneClass[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">{title}</div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-base">{icon}</div>
      </div>
      <div className="mt-3 break-words text-2xl font-black text-white md:text-3xl">{value}</div>
    </div>
  );
}

function DayModal({
  t,
  dayTypeLabels,
  months,
  day,
  monthIndex,
  year,
  data,
  isWeekend,
  holidayName,
  onClose,
  onSave,
}: {
  t: Translation;
  dayTypeLabels: Record<DayType, string>;
  months: string[];
  day: number;
  monthIndex: number;
  year: number;
  data?: DayData;
  isWeekend?: boolean;
  holidayName?: string;
  onClose: () => void;
  onSave: (newData: DayData) => void;
}) {
  const [type, setType] = useState<DayType>(data?.type || "Off");
  const maxShiftHours = 8;
  const initialWorkedHours = typeof data?.workedHours === "number" ? data.workedHours : (data?.type && data.type !== "Off" && data.type !== "CO" && data.type !== "CM" ? maxShiftHours : 0);
  const [workedHoursInput, setWorkedHoursInput] = useState<string>(String(initialWorkedHours));
  const [overtimeHours, setOvertimeHours] = useState<number>(data?.overtimeHours || 0);
  const [note, setNote] = useState<string>(data?.note || "");
  const [otNight, setOtNight] = useState<boolean>(data?.otNight || false);
  const [otWeekend, setOtWeekend] = useState<boolean>(data?.otWeekend || false);
  const [otHoliday, setOtHoliday] = useState<boolean>(data?.otHoliday || false);

  const isHoliday = !!holidayName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-auto rounded-[28px] border border-white/10 bg-[#071326] p-5 shadow-[0_0_80px_rgba(0,80,255,0.18)]">
        <div className="inline-flex rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200">
          {t.selectedDay}
        </div>

        <h2 className="mt-4 text-3xl font-bold">
          {day} {months[monthIndex]} {year}
        </h2>

        <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80">
          {isHoliday ? t.holiday : isWeekend ? t.weekend : t.workedDay}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(["Off","Morning","After","Night","CO","CM"] as DayType[]).map((dayType) => (
            <ShiftButton
              key={dayType}
              selected={type === dayType}
              color={
                dayType === "Off" ? "bg-slate-500/25 border-slate-300/25" :
                dayType === "Morning" ? "bg-emerald-500/25 border-emerald-300/25" :
                dayType === "After" ? "bg-amber-500/25 border-amber-300/25" :
                dayType === "Night" ? "bg-blue-500/25 border-blue-300/25" :
                dayType === "CO" ? "bg-violet-500/25 border-violet-300/25" :
                "bg-rose-500/25 border-rose-300/25"
              }
              onClick={() => {
                setType(dayType);
                if (dayType === "Morning" || dayType === "After" || dayType === "Night") {
                  setWorkedHoursInput((current) => current === "0" || current.trim() === "" ? String(maxShiftHours) : current);
                } else {
                  setWorkedHoursInput("0");
                }
              }}
            >
              {dayTypeLabels[dayType]}
            </ShiftButton>
          ))}
        </div>

        <div className="mt-5 rounded-[22px] border border-blue-400/20 bg-blue-500/10 p-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <label className="block text-sm font-semibold text-blue-100">{t.workedHours}</label>
              <p className="mt-1 text-xs leading-5 text-white/55">{t.workedHoursHint}</p>
            </div>
            <div className="text-sm font-semibold text-white/75">
              {t.undertimeHours}: {Math.max(0, maxShiftHours - Math.min(maxShiftHours, Math.max(0, Number(workedHoursInput.replace(',', '.')) || 0))).toFixed(1)}h
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 md:grid-cols-8">
            {[1,2,3,4,5,6,7,8].map((hour) => {
              const active = Number(workedHoursInput.replace(',', '.')) === hour;
              return (
                <button
                  key={hour}
                  type="button"
                  onClick={() => setWorkedHoursInput(String(hour))}
                  className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${active ? "border-blue-300 bg-blue-500 text-white" : "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"}`}
                >
                  {hour}h
                </button>
              );
            })}
          </div>

          <input
            type="number"
            min={0}
            max={maxShiftHours}
            step={0.5}
            inputMode="decimal"
            value={workedHoursInput}
            onChange={(e) => setWorkedHoursInput(e.target.value)}
            className="mt-4 w-full rounded-[18px] border border-white/10 bg-[#041224] px-5 py-4 text-2xl font-semibold outline-none"
            placeholder="Ex: 6.5"
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm text-white/75">{t.overtimeHours}</label>
          <input
            type="number"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(Number(e.target.value))}
            className="w-full rounded-[18px] border border-white/10 bg-[#041224] px-5 py-4 text-2xl font-semibold outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm text-white/75">{t.note}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notePlaceholder}
            rows={4}
            className="w-full rounded-[18px] border border-white/10 bg-[#041224] px-5 py-4 text-base text-white/90 outline-none placeholder:text-white/30"
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <CheckboxPill checked={otNight} onChange={() => setOtNight(!otNight)}>{t.otNight}</CheckboxPill>
          <CheckboxPill checked={otWeekend} onChange={() => setOtWeekend(!otWeekend)}>{t.otWeekend}</CheckboxPill>
          <CheckboxPill checked={otHoliday} onChange={() => setOtHoliday(!otHoliday)}>{t.otHoliday}</CheckboxPill>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <button
            onClick={() =>
              onSave({
                type,
                workedHours: type === "Morning" || type === "After" || type === "Night"
                  ? Math.min(maxShiftHours, Math.max(0, Number(workedHoursInput.replace(',', '.')) || 0))
                  : 0,
                overtimeHours,
                note,
                otNight,
                otWeekend,
                otHoliday,
              })
            }
            className="rounded-[18px] bg-blue-600 px-6 py-3 text-base font-semibold transition hover:bg-blue-500"
          >
            {t.save}
          </button>

          <button
            onClick={onClose}
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-semibold transition hover:bg-white/[0.08]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShiftButton({
  children,
  selected,
  color,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[18px] border px-5 py-4 text-base font-semibold transition ${
        selected
          ? `${color} ring-2 ring-blue-400`
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
      }`}
    >
      {children}
    </button>
  );
}

function CheckboxPill({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
      <span>{children}</span>
    </label>
  );
}

function EstimateSection({
  t,
  lang,
  net,
  mealTickets,
  total,
  workedDays,
  morning,
  after,
  night,
  workedHours,
  undertimeHours,
  undertimeAdjustment,
  overtimeHours,
  overtimeExtra,
  nightExtra,
  weekendExtra,
  holidayExtra,
  medicalAdjustment,
}: {
  t: Translation;
  lang: Lang;
  net: number;
  mealTickets: number;
  total: number;
  workedDays: number;
  morning: number;
  after: number;
  night: number;
  workedHours: number;
  undertimeHours: number;
  undertimeAdjustment: number;
  overtimeHours: number;
  overtimeExtra: number;
  nightExtra: number;
  weekendExtra: number;
  holidayExtra: number;
  medicalAdjustment: number;
}) {
  return (
    <SectionShell kicker={t.summary} title={t.monthlyEstimate}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <EstimateCard title={t.estimatedNet} value={net ? `${net.toFixed(2)} RON` : "—"} highlight />
        <EstimateCard title={t.mealTickets} value={mealTickets ? `${mealTickets.toFixed(2)} RON` : "—"} />
        <EstimateCard
          title={t.totalExtras}
          value={(overtimeExtra + nightExtra + weekendExtra + holidayExtra)
            ? `${(overtimeExtra + nightExtra + weekendExtra + holidayExtra).toFixed(2)} RON`
            : "—"}
        />
        <EstimateCard title={t.totalEstimated} value={total ? `${total.toFixed(2)} RON` : "—"} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <DetailCard label={t.workedDays} value={String(workedDays || "0")} />

  <DetailCard
    label={TYPE_LABELS[lang as Lang].Morning}
    value={String(morning || "0")}
  />

  <DetailCard
    label={TYPE_LABELS[lang as Lang].After}
    value={String(after || "0")}
  />

  <DetailCard
    label={TYPE_LABELS[lang as Lang].Night}
    value={String(night || "0")}
  />

  <DetailCard
    label={t.workedHours}
    value={`${workedHours.toFixed(1)}h`}
  />

  <DetailCard
    label={t.undertimeHours}
    value={`${undertimeHours.toFixed(1)}h${undertimeAdjustment ? ` / -${undertimeAdjustment.toFixed(2)} RON` : ""}`}
  />

  <DetailCard
    label={t.overtimeHours}
    value={`${overtimeHours || 0}h`}
  />

  <DetailCard
    label={t.overtimePlus}
    value={overtimeExtra ? `${overtimeExtra.toFixed(2)} RON` : "-"}
  />

  <DetailCard
    label={t.nightBonus}
    value={nightExtra ? `${nightExtra.toFixed(2)} RON` : "-"}
  />

  <DetailCard
    label={t.weekendBonus}
    value={weekendExtra ? `${weekendExtra.toFixed(2)} RON` : "-"}
  />

  <DetailCard
    label={t.holidayBonus}
    value={holidayExtra ? `${holidayExtra.toFixed(2)} RON` : "-"}
  />

  <DetailCard
    label={t.sickAdjust}
    value={
      medicalAdjustment
        ? `-${medicalAdjustment.toFixed(2)} RON`
        : "-"
    }
  />
</div>
    </SectionShell>
  );
}

function EstimateCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#071326]/80 p-5">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Estimate</div>
      <div className={`mt-6 break-words text-2xl font-bold ${highlight ? "text-emerald-300" : "text-white"}`}>
        {value}
      </div>
      <div className="mt-4 text-base text-white/70">{title}</div>
    </div>
  );
}

function RulesSection(props: {
  t: Translation;
  grossSalary: string;
  setGrossSalary: (v: string) => void;
  mealTicketPerDay: string;
  setMealTicketPerDay: (v: string) => void;
  nightPercent: string;
  setNightPercent: (v: string) => void;
  overtimePercent: string;
  setOvertimePercent: (v: string) => void;
  weekendPercent: string;
  setWeekendPercent: (v: string) => void;
  holidayPercent: string;
  setHolidayPercent: (v: string) => void;
  casPercent: string;
  setCasPercent: (v: string) => void;
  cassPercent: string;
  setCassPercent: (v: string) => void;
  taxPercent: string;
  setTaxPercent: (v: string) => void;
  hoursPerShift: string;
  setHoursPerShift: (v: string) => void;
  medicalLeaveDays: string;
  setMedicalLeaveDays: (v: string) => void;
  onCalculate: () => void;
  onLoadExample: () => void;
  isPremium: boolean;
  usageStatus: UsageStatus | null;
  usageLoading: boolean;
  isOnline: boolean;
}) {
  return (
    <SectionShell kicker={props.t.personalSettings} title={props.t.salaryRules}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={props.t.grossSalary} value={props.grossSalary} onChange={props.setGrossSalary} />
        <Field label={props.t.ticketValue} value={props.mealTicketPerDay} onChange={props.setMealTicketPerDay} />
        <Field label={props.t.nightPercent} value={props.nightPercent} onChange={props.setNightPercent} />
        <Field label={props.t.overtimePercent} value={props.overtimePercent} onChange={props.setOvertimePercent} />
        <Field label={props.t.weekendPercent} value={props.weekendPercent} onChange={props.setWeekendPercent} />
        <Field label={props.t.holidayPercent} value={props.holidayPercent} onChange={props.setHolidayPercent} />
        <Field label={props.t.casPercent} value={props.casPercent} onChange={props.setCasPercent} />
        <Field label={props.t.cassPercent} value={props.cassPercent} onChange={props.setCassPercent} />
        <Field label={props.t.taxPercent} value={props.taxPercent} onChange={props.setTaxPercent} />
        <Field label={props.t.hoursPerShift} value={props.hoursPerShift} onChange={props.setHoursPerShift} />
        <Field label={props.t.unpaidMedical} value={props.medicalLeaveDays} onChange={props.setMedicalLeaveDays} />
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <button
          onClick={props.onCalculate}
          disabled={props.usageLoading || !props.isOnline}
          className="rounded-[18px] bg-blue-600 px-6 py-3 text-base font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.t.calculate}
        </button>
        <button
          onClick={props.onLoadExample}
          className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-semibold transition hover:bg-white/[0.08]"
        >
          {props.t.loadExample}
        </button>
      </div>

      <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/75">
        <p>{props.t.rulesHint1}</p>
        <p className="mt-2">{props.isPremium ? props.t.rulesHint2Premium : props.t.rulesHint2Free}</p>
      </div>
    </SectionShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm text-white/70">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[18px] border border-white/10 bg-[#041224] px-5 py-4 text-xl font-semibold outline-none transition placeholder:text-white/20 focus:border-blue-400/40"
      />
    </label>
  );
}

function DetailsSection({
  t,
  lang, //
  isPremium,
  grossEstimate,
  hourlyBase,
  cas,
  cass,
  taxableIncome,
  incomeTax,
  netSalary,
  onSaveCalculation,
}: {
  t: Translation;
  lang: Lang; //
  isPremium: boolean;
  grossEstimate: number;
  hourlyBase: number;
  cas: number;
  cass: number;
  taxableIncome: number;
  incomeTax: number;
  netSalary: number;
  onSaveCalculation: () => void;
}) {
  return (
    <SectionShell kicker={t.quickCheck} title={t.calcDetails}>
      {isPremium ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailCard label={lang === "ro" ? "Brut estimat" : "Estimated gross"} value={grossEstimate ? `${grossEstimate.toFixed(2)} RON` : "—"} />
          <DetailCard label={lang === "ro" ? "Bază orară" : "Hourly base"} value={hourlyBase ? `${hourlyBase.toFixed(2)} RON` : "—"} />
          <DetailCard label="CAS" value={cas ? `${cas.toFixed(2)} RON` : "—"} />
          <DetailCard label="CASS" value={cass ? `${cass.toFixed(2)} RON` : "—"} />
          <DetailCard label={lang === "ro" ? "Bază impozabilă" : "Taxable income"} value={taxableIncome ? `${taxableIncome.toFixed(2)} RON` : "—"} />
          <DetailCard label={lang === "ro" ? "Impozit" : "Tax"} value={incomeTax ? `${incomeTax.toFixed(2)} RON` : "—"} />
          <DetailCard label={lang === "ro" ? "Net" : "Net salary"} value={netSalary ? `${netSalary.toFixed(2)} RON` : "—"} highlight />
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-[#071326]/80 p-5">
          <div className="grid gap-4 md:grid-cols-[140px_1fr]">
            <div className="text-lg text-white/55">{t.preview}</div>
            <div className="text-xl font-semibold leading-tight">
              {t.premiumOnly}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onSaveCalculation}
        className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-semibold transition hover:bg-white/[0.08]"
      >
        {t.saveCalc}
      </button>
    </SectionShell>
  );
}

function DetailCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#071326]/80 p-5">
      <div className="text-sm text-white/55">{label}</div>
      <div className={`mt-4 break-words text-2xl font-bold ${highlight ? "text-emerald-300" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function HolidaysSection({
  t,
  lang,
  year,
  holidays,
}: {
  t: Translation;
  lang: Lang;
  year: number;
  holidays: HolidayItem[];
}) {
  return (
    <SectionShell kicker={t.annualReference} title={`${t.holidays} ${year}`}>
      <div className="mb-4 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/65">
        {lang === "ro"
          ? year === 2026
            ? "Lista pentru 2026 este stabilă și nu amestecă date din alte surse. Pentru anii următori, aplicația calculează automat Paștele, Rusaliile și sărbătorile fixe."
            : "Holidaysle sunt generate automat local pentru anul selectat. Dacă două sărbători cad în aceeași zi, aplicația afișează o singură zi curată în calendar."
          : year === 2026
            ? "The 2026 list is stable and does not mix external data. For future years, the app automatically calculates Easter, Pentecost and fixed holidays."
            : "Holidays are generated locally for the selected year. If two holidays fall on the same date, the app displays one clean calendar day."}
      </div>

      <div className="space-y-3">
        {holidays.map((item) => (
          <div
            key={`${item.month}-${item.day}-${item.name}`}
            className="flex flex-col justify-between gap-2 rounded-[18px] border border-white/10 bg-[#071326]/80 px-5 py-4 md:flex-row md:items-center"
          >
            <div className="text-lg font-bold">{lang === "ro" ? item.date : item.enDate}</div>
            <div className="text-lg text-white/65 break-words">{lang === "ro" ? item.name : item.enName}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function LogicSection({ t, lang }: { t: Translation; lang: Lang }) {
  const rows = lang === "ro" ? [
    ["Hourly base", "the reference gross salary is divided by approximately 160 monthly hours"],
    ["Morning / After / Night", "choose the shift directly from the day; Night receives the night bonus"],
    ["Automatic weekend", "sâmbăta și duminica sunt detectate automat din calendar"],
    ["Holidays automate", "legal holidays are marked and receive the holiday bonus automatically"],
    ["Overtime", "+75% of the hourly base for each entered hour"],
    ["Monetization", "în perioada de review AdSense, aplicația rulează fără reclame, fără overlay-uri și fără porți de vizionare; după aprobare, reclamele trebuie activate doar în zone conforme"],
    ["Online only", "new calculations and saving are allowed only when the browser is online"],
  ] : [
    ["Hourly base", "the reference gross salary is divided by roughly 160 monthly hours"],
    ["Morning / Afternoon / Night", "you choose the shift directly on the day; Night gets the night bonus"],
    ["Automatic weekend", "Saturday and Sunday are detected automatically from the calendar"],
    ["Automatic holidays", "legal holidays are marked and automatically receive the holiday bonus"],
    ["Overtime", "+75% of hourly base for each entered overtime hour"],
    ["Monetization", "during the AdSense review period, the app runs without ads, overlays or view gates; after approval, ads must be enabled only in compliant areas"],
    ["Online only", "new calculations and saving are allowed only while the browser is online"],
  ];

  return (
    <SectionShell kicker={t.howItWorks} title={t.logicImplemented}>
      <div className="space-y-3">
        {rows.map(([left, right]) => (
          <div
            key={left}
            className="grid gap-4 rounded-[18px] border border-white/10 bg-[#071326]/80 px-5 py-4 md:grid-cols-[220px_1fr]"
          >
            <div className="text-base text-white/60">{left}</div>
            <div className="text-base leading-tight break-words">{right}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
