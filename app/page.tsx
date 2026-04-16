"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";
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

type DayType = "Liber" | "Morning" | "After" | "Night" | "CO" | "CM";

type DayData = {
  type: DayType;
  overtimeHours: number;
  note: string;
  otNight: boolean;
  otWeekend: boolean;
  otHoliday: boolean;
};

const HOLIDAYS_2026 = [
  { day: 1, month: 1, date: "01 ianuarie", name: "Anul Nou", enDate: "01 January", enName: "New Year's Day" },
  { day: 2, month: 1, date: "02 ianuarie", name: "A doua zi de Anul Nou", enDate: "02 January", enName: "Second day of New Year" },
  { day: 6, month: 1, date: "06 ianuarie", name: "Boboteaza", enDate: "06 January", enName: "Epiphany" },
  { day: 7, month: 1, date: "07 ianuarie", name: "Sf. Ioan", enDate: "07 January", enName: "Saint John" },
  { day: 24, month: 1, date: "24 ianuarie", name: "Ziua Unirii", enDate: "24 January", enName: "Union Day" },
  { day: 10, month: 4, date: "10 aprilie", name: "Vinerea Mare", enDate: "10 April", enName: "Good Friday" },
  { day: 12, month: 4, date: "12 aprilie", name: "Paște", enDate: "12 April", enName: "Easter" },
  { day: 13, month: 4, date: "13 aprilie", name: "A doua zi de Paște", enDate: "13 April", enName: "Second day of Easter" },
  { day: 1, month: 5, date: "01 mai", name: "Ziua Muncii", enDate: "01 May", enName: "Labour Day" },
  { day: 31, month: 5, date: "31 mai", name: "Rusalii", enDate: "31 May", enName: "Pentecost" },
  { day: 1, month: 6, date: "01 iunie", name: "A doua zi de Rusalii", enDate: "01 June", enName: "Second day of Pentecost" },
  { day: 15, month: 8, date: "15 august", name: "Adormirea Maicii Domnului", enDate: "15 August", enName: "Dormition of the Mother of God" },
  { day: 30, month: 11, date: "30 noiembrie", name: "Sf. Andrei", enDate: "30 November", enName: "Saint Andrew" },
  { day: 1, month: 12, date: "01 decembrie", name: "Ziua Națională", enDate: "01 December", enName: "National Day" },
  { day: 25, month: 12, date: "25 decembrie", name: "Crăciun", enDate: "25 December", enName: "Christmas" },
  { day: 26, month: 12, date: "26 decembrie", name: "A doua zi de Crăciun", enDate: "26 December", enName: "Second day of Christmas" },
];

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
    Liber: "Liber",
    Morning: "Morning",
    After: "After",
    Night: "Night",
    CO: "Concediu",
    CM: "Medical",
  },
  en: {
    Liber: "Off",
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
    intro: "Intră în cont sau creează unul nou ca să folosești aplicația. Datele tale sunt salvate în cloud pe contul tău.",
    register: "Înregistrare",
    login: "Login",
    account: "Cont",
    plan: "Plan",
    premiumManage: "Manage Premium",
    history: "Istoric",
    logout: "Logout",
    freePlan: "Plan Free",
    activatePremium: "Activează Premium",
    freeDescription: "Reclame + funcții limitate. Pentru detalii complete și experiență fără reclame, treci la Premium.",
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
    lockedFree: "Pe planul Free ai 30 calcule pe lună. Bannerul de jos rămâne activ, iar la fiecare 3 calcule apare poarta de reclamă.",
    lockedPremium: "Premium are acces nelimitat și fără reclame. Pentru acest calcul trebuie doar să fii online.",
    unlockFree: "Continuă spre reclamă și calcul",
    unlockPremium: "Generează estimarea",
    loading: "Se încarcă...",
    usageChecking: "Se verifică...",
    monthlyProgram: "Programul tău lunar",
    quickCalendar: "Calendar rapid",
    today: "Azi",
    reset: "Reset",
    shiftsSet: "Ture setate",
    monthHolidays: "Sărbători lună",
    selectedDay: "📅 Zi selectată",
    workedDay: "Zi lucrătoare",
    weekend: "Weekend",
    holiday: "Sărbătoare",
    overtimeHours: "Ore suplimentare",
    note: "Notiță pentru ziua asta",
    notePlaceholder: "Ex: schimb cu colegul, tură specială, observații...",
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
    nightBonus: "Spor noapte",
    weekendBonus: "Spor weekend",
    holidayBonus: "Spor sărbătoare",
    sickAdjust: "Ajustare CM",
    personalSettings: "Setări personale",
    salaryRules: "Reguli salariale",
    grossSalary: "Salariu brut de referință",
    ticketValue: "Bon masă / zi",
    nightPercent: "Spor noapte (%)",
    overtimePercent: "Spor overtime (%)",
    weekendPercent: "Spor weekend (%)",
    holidayPercent: "Spor sărbătoare (%)",
    casPercent: "CAS (%)",
    cassPercent: "CASS (%)",
    taxPercent: "Impozit (%)",
    hoursPerShift: "Ore / tură",
    unpaidMedical: "Zile CM neplătite / lună",
    calculate: "Calculează salariul",
    loadExample: "Încarcă exemplu",
    rulesHint1: "Weekendul și sărbătorile se detectează automat din calendar. Tura Night se alege direct din ziua selectată.",
    rulesHint2Free: "Plan Free: 30 calcule / lună, reclamă la fiecare 3 calcule și banner permanent jos.",
    rulesHint2Premium: "Plan Premium: fără reclame și fără limită de calcul.",
    quickCheck: "Verificare rapidă",
    calcDetails: "Detaliu calcul",
    preview: "Preview",
    premiumOnly: "Valorile reale și modelul de calcul sunt afișate doar pentru Premium deblocat.",
    saveCalc: "Salvează calcul",
    annualReference: "Referință anuală",
    howItWorks: "Cum calculează aplicația",
    logicImplemented: "Logica implementată",
    adKicker: "Publicitate",
    adTitle: "Se deschide pasul de monetizare",
    adBody: "Aici intră reclama reală fullscreen sau overlay atunci când o legi la providerul tău de ads. Până atunci, aplicația aplică deja logica: la fiecare 3 calcule free, se oprește aici înainte de deblocarea estimării.",
    adContinue: "Am văzut reclama / continuă",
    noInternet: "Ești offline. Re conectează-te la internet ca să poți calcula și salva.",
    freeLimitReached: "Ai atins limita lunară de 30 calcule. Activează Premium pentru acces nelimitat.",
    loginNeeded: "Trebuie să fii autentificat",
    savedSuccess: "Calcul salvat cu succes",
    savedError: "Eroare la salvarea calculului",
    loadExampleDone: "Exemplu încărcat",
    logoutOk: "Logout făcut",
    logoutErr: "Eroare la logout",
    adEveryThree: "reclamă la fiecare 3 calcule",
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
    freeDescription: "Ads + limited features. For full details and an ad-free experience, upgrade to Premium.",
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
    lockedFree: "Free plan includes 30 calculations per month. The bottom banner stays active, and every 3 calculations you hit the ad gate.",
    lockedPremium: "Premium has unlimited access and no ads. For this calculation you only need to stay online.",
    unlockFree: "Continue to ad and calculation",
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
    mealTickets: "Meal tickets",
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
    ticketValue: "Meal ticket / day",
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
    rulesHint2Free: "Free plan: 30 calculations / month, ad every 3 calculations and permanent bottom banner.",
    rulesHint2Premium: "Premium plan: no ads and no calculation limit.",
    quickCheck: "Quick check",
    calcDetails: "Calculation details",
    preview: "Preview",
    premiumOnly: "Real values and the full calculation model are shown only for unlocked Premium.",
    saveCalc: "Save calculation",
    annualReference: "Annual reference",
    howItWorks: "How the app calculates",
    logicImplemented: "Implemented logic",
    adKicker: "Advertising",
    adTitle: "Monetization step opens here",
    adBody: "This is where your real fullscreen or overlay ad will go when you connect your ad provider. Until then, the app already applies the logic: every 3 free calculations, it stops here before unlocking the estimate.",
    adContinue: "I watched the ad / continue",
    noInternet: "You are offline. Reconnect to the internet to calculate and save.",
    freeLimitReached: "You reached the monthly limit of 30 calculations. Activate Premium for unlimited access.",
    loginNeeded: "You need to be signed in",
    savedSuccess: "Calculation saved successfully",
    savedError: "Error while saving calculation",
    loadExampleDone: "Example loaded",
    logoutOk: "Logged out",
    logoutErr: "Logout error",
    adEveryThree: "ad every 3 calculations",
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

  const [activeTab, setActiveTab] = useState<TabKey>("calendar");

  const [grossSalary, setGrossSalary] = useState("13611");
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

  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [adGateOpen, setAdGateOpen] = useState(false);
  const [approvedCalculationSignature, setApprovedCalculationSignature] = useState<string | null>(null);

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
      const savedSettings = localStorage.getItem("salary-settings-v3");
      const savedCalendar = localStorage.getItem("salary-calendar-v3");
      const savedLang = localStorage.getItem("salary-lang-v1") as Lang | null;

      if (savedLang === "ro" || savedLang === "en") {
        setLang(savedLang);
      }

      if (savedSettings) {
        const s = JSON.parse(savedSettings);
        setGrossSalary(String(s.grossSalary ?? "13611"));
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
      }

      if (savedCalendar) {
        const c = JSON.parse(savedCalendar);
        setMonthIndex(Number(c.monthIndex ?? 3));
        setYear(Number(c.year ?? 2026));
        setDaysData(c.daysData ?? {});
      }
    } catch (err) {
      console.error("Local state load failed:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("salary-lang-v1", lang);
  }, [lang]);

  useEffect(() => {
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
    localStorage.setItem("salary-settings-v3", JSON.stringify(payload));
  }, [
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
    localStorage.setItem(
      "salary-calendar-v3",
      JSON.stringify({ monthIndex, year, daysData }),
    );
  }, [monthIndex, year, daysData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid, "profile", "main");
        const snap = await getDoc(ref);
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      } else {
        setProfile(null);
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
    ? profile?.plan || "premium_monthly"
    : "free";

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
      const holiday = HOLIDAYS_2026.find(
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
  }, [monthIndex, year, lang]);

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
    let overtimeExtra = 0;
    let nightExtra = 0;
    let weekendExtra = 0;
    let holidayExtra = 0;

    monthDays.forEach((item) => {
      if (!item.day) return;
      const entry = daysData[item.day];
      if (!entry) return;

      const dayHours = Number(entry.overtimeHours || 0);
      overtimeHoursTotal += dayHours;
      overtimeExtra += dayHours * hourlyBase * overtimeRate;

      const isWorkedShift =
        entry.type === "Morning" || entry.type === "After" || entry.type === "Night";

      if (entry.type === "Night") {
        nightExtra += dailyBase * nightRate;
      }

      if (isWorkedShift && item.isWeekend) {
        weekendExtra += dailyBase * weekendRate;
      }

      if (isWorkedShift && item.isHoliday) {
        holidayExtra += dailyBase * holidayRate;
      }

      if (dayHours > 0 && entry.otNight) {
        nightExtra += dayHours * hourlyBase * nightRate;
      }
      if (dayHours > 0 && entry.otWeekend) {
        weekendExtra += dayHours * hourlyBase * weekendRate;
      }
      if (dayHours > 0 && entry.otHoliday) {
        holidayExtra += dayHours * hourlyBase * holidayRate;
      }
    });

    const medicalAdjustment = Math.min(cmCount, unpaidMedicalDays) * dailyBase;
    const grossEstimate =
      gross + overtimeExtra + nightExtra + weekendExtra + holidayExtra - medicalAdjustment;

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

      if (result.shouldShowAd && !profile?.isPremium) {
        setAdGateOpen(true);
        return;
      }

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
            isPremium={!!profile?.isPremium}
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
            isPremium={!!profile?.isPremium}
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
            isPremium={!!profile?.isPremium}
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
            isPremium={!!profile?.isPremium}
            usageStatus={usageStatus}
            loading={usageLoading}
            onUnlock={handleCalculateRequest}
            isOnline={isOnline}
          />
        );
      case "holidays":
        return <HolidaysSection t={t} lang={lang} />;
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.20),_transparent_18%),linear-gradient(180deg,#071427_0%,#07192f_40%,#051324_100%)] pb-28 text-white">
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 lg:px-8">
        {!user && (
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
        )}

        {user && (
          <div className="space-y-4">
            {!isOnline && (
              <div className="rounded-[18px] border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {t.noInternet}
              </div>
            )}

            <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                    {t.appTitle}
                  </div>
                  <h1 className="mt-1 text-3xl font-bold md:text-5xl">
                    {t.appTitle}
                  </h1>
                </div>

                <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
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
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <InfoCard label={t.account} value={user.email || "-"} />
                <InfoCard label={t.plan} value={statusLabel} />
                <UsageCard 
                  t={t}
                  lang={lang}
                  isPremium={!!profile?.isPremium} 
                  usageStatus={usageStatus} 
                  loading={usageLoading} 
                />
                <InfoCard label="Status" value={isOnline ? t.online : t.offline} />
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionChip onClick={() => setActiveTab("calendar")} active={activeTab === "calendar"}>{t.calendar}</ActionChip>
                <ActionChip onClick={() => setActiveTab("estimate")} active={activeTab === "estimate"}>{t.estimate}</ActionChip>
                <ActionChip onClick={() => setActiveTab("rules")} active={activeTab === "rules"}>{t.rules}</ActionChip>
                <ActionChip onClick={() => setActiveTab("details")} active={activeTab === "details"}>{t.details}</ActionChip>
                <ActionChip onClick={() => setActiveTab("holidays")} active={activeTab === "holidays"}>{t.holidays}</ActionChip>
                <ActionChip onClick={() => setActiveTab("logic")} active={activeTab === "logic"}>{t.logic}</ActionChip>
                <Link
                  href="/premium"
                  className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  {t.premiumManage}
                </Link>
                <Link
                  href="/history"
                  className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  {t.history}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  {t.logout}
                </button>
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
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#071326]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</div>
      <div className="mt-2 break-all text-xl font-semibold md:text-2xl">{value}</div>
    </div>
  );
}

function UsageCard({
  t,
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
  const limit = usageStatus?.limit ?? 30;

  const isUnlimited = isPremium || limit === 999999;

  return (
    <div className="rounded-[22px] border border-white/10 bg-[#071326]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">{t.usage}</div>
      <div className="mt-2 break-words text-xl font-semibold md:text-2xl">
        {loading
  ? t.usageChecking
  : isUnlimited
    ? t.unlimited
    : `${remaining}/${limit}`}
      </div>
      <div className="mt-1 text-xs text-white/60">
        {isUnlimited ? t.unlimited : t.monthlyLeft}
      </div>
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
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[16px] border px-4 py-3 text-sm font-semibold transition ${
        active
          ? "border-blue-400/40 bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.35)]"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
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
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
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

  function getStyle(day: number, isWeekend: boolean, isHoliday: boolean) {
    const type = daysData[day]?.type || "Liber";

    if (type === "Morning") return "border-emerald-400/40 bg-emerald-500/[0.07]";
    if (type === "After") return "border-amber-400/40 bg-amber-500/[0.08]";
    if (type === "Night") return "border-blue-400/40 bg-blue-500/[0.08]";
    if (type === "CO") return "border-violet-400/40 bg-violet-500/[0.10]";
    if (type === "CM") return "border-rose-400/40 bg-rose-500/[0.10]";
    if (isHoliday) return "border-rose-400/30 bg-rose-500/[0.07]";
    if (isWeekend) return "border-amber-400/25 bg-amber-500/[0.05]";
    return "border-cyan-400/15 bg-cyan-500/[0.03]";
  }

  return (
    <SectionShell kicker={t.monthlyProgram} title={t.quickCalendar}>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-[24px] border border-white/10 bg-[#071326]/80 p-3">
          <div className="grid gap-2 md:grid-cols-[44px_1fr_44px]">
            <button
              onClick={prevMonth}
              className="rounded-[12px] border border-white/10 bg-white/[0.04] px-2 py-2 text-base font-semibold"
            >
              ‹
            </button>
            <div className="rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-2 text-center text-sm font-semibold">
              {months[monthIndex]}
            </div>
            <button
              onClick={nextMonth}
              className="rounded-[12px] border border-white/10 bg-white/[0.04] px-2 py-2 text-base font-semibold"
            >
              ›
            </button>
          </div>

          <div className="mt-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-2 text-center text-sm font-semibold">
            {year}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onToday}
              className="rounded-[10px] border border-white/10 bg-blue-500 px-3 py-2 text-[11px] font-semibold"
            >
              {t.today}
            </button>
            <button
              onClick={onReset}
              className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold"
            >
              {t.reset}
            </button>
          </div>


         <div className="mt-3 flex flex-wrap gap-2">
           <LegendPill color="bg-emerald-400" label={TYPE_LABELS[lang as Lang].Morning} />
           <LegendPill color="bg-amber-400" label={TYPE_LABELS[lang as Lang].After} />
           <LegendPill color="bg-blue-400" label={TYPE_LABELS[lang as Lang].Night} />
           <LegendPill color="bg-slate-500" label={TYPE_LABELS[lang as Lang].Liber} />
           <LegendPill color="bg-violet-400" label={TYPE_LABELS[lang as Lang].CO} />
           <LegendPill color="bg-rose-400" label={`${TYPE_LABELS[lang as Lang].CM} / ${t.holiday}`} />
         </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekdays.map((day: string) => (
              <div
                key={day}
                className="rounded-[10px] border border-white/10 bg-white/[0.03] px-2 py-2 text-center text-[10px] font-semibold text-white/70"
              >
                {day}
              </div>
            ))}

            {monthDays.map((item: any, idx: number) =>
              item.day ? (
                <button
                  key={`${item.day}-${idx}`}
                  onClick={() => setSelectedDay(item.day)}
                  className={`h-[84px] rounded-[14px] border px-2 py-2 text-left transition hover:scale-[1.01] overflow-hidden ${getStyle(
                    item.day,
                    item.isWeekend,
                    item.isHoliday
                  )} ${selectedDay === item.day ? "ring-2 ring-blue-400" : ""}`}
                >
                  <div className="text-2xl font-bold leading-none">{item.day}</div>
                  <div className="mt-1 text-[9px] font-medium leading-none text-white/75">
                    {weekdays[item.weekdayIndex]}
                  </div>
                  <div className="mt-2 text-[10px] font-semibold leading-3 break-words">
                    {TYPE_LABELS[lang as Lang][(daysData[item.day]?.type || "Liber") as keyof (typeof TYPE_LABELS)[Lang]]}
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
                  className="h-[84px] rounded-[14px] border border-white/5 bg-white/[0.02]"
                />
              ),
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <MiniMetric title={t.shiftsSet} value={String(Object.keys(daysData).length || "0")} />
          <MiniMetric title={TYPE_LABELS[lang as Lang].Morning} value={String(Object.values(daysData).filter((d: any) => d.type === "Morning").length || "0")} />
          <MiniMetric title={TYPE_LABELS[lang as Lang].After} value={String(Object.values(daysData).filter((d: any) => d.type === "After").length || "0")} />
          <MiniMetric title={TYPE_LABELS[lang as Lang].Night} value={String(Object.values(daysData).filter((d: any) => d.type === "Night").length || "0")} />
          <MiniMetric title="OT" value={`${Object.values(daysData).reduce((sum: number, d: any) => sum + (d.overtimeHours || 0), 0)}h`} />
          <MiniMetric title={t.monthHolidays} value={String(monthDays.filter((d: any) => d.day && d.isHoliday).length || "0")} />
        </div>
      </div>
    </SectionShell>
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

function MiniMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#071326]/80 p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">{title}</div>
      <div className="mt-2 break-words text-2xl font-bold">{value}</div>
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
  const [type, setType] = useState<DayType>(data?.type || "Liber");
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
          {(["Liber","Morning","After","Night","CO","CM"] as DayType[]).map((dayType) => (
            <ShiftButton
              key={dayType}
              selected={type === dayType}
              color={
                dayType === "Liber" ? "bg-slate-500/25 border-slate-300/25" :
                dayType === "Morning" ? "bg-emerald-500/25 border-emerald-300/25" :
                dayType === "After" ? "bg-amber-500/25 border-amber-300/25" :
                dayType === "Night" ? "bg-blue-500/25 border-blue-300/25" :
                dayType === "CO" ? "bg-violet-500/25 border-violet-300/25" :
                "bg-rose-500/25 border-rose-300/25"
              }
              onClick={() => setType(dayType)}
            >
              {dayTypeLabels[dayType]}
            </ShiftButton>
          ))}
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

function HolidaysSection({ t, lang }: { t: Translation; lang: Lang }) {
  return (
    <SectionShell kicker={t.annualReference} title={`${t.holidays} 2026`}>
      <div className="space-y-3">
        {HOLIDAYS_2026.map((item) => (
          <div
            key={`${item.date}-${item.name}`}
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
    ["Bază orară / Hourly base", "salariul brut de referință se împarte la aproximativ 160 ore lunare"],
    ["Morning / After / Night", "alegi tura direct din zi; Night primește sporul de noapte"],
    ["Weekend automat", "sâmbăta și duminica sunt detectate automat din calendar"],
    ["Sărbători automate", "zilele legale sunt marcate și primesc automat sporul de sărbătoare"],
    ["Ore suplimentare", "+75% din baza orară pentru fiecare oră introdusă"],
    ["Monetizare", "free: 30 calcule/lună, banner permanent și poartă de reclamă la fiecare 3 calcule; premium: fără reclame și fără limită"],
    ["Online only", "calculele noi și salvarea sunt permise doar când browserul este online"],
  ] : [
    ["Hourly base", "the reference gross salary is divided by roughly 160 monthly hours"],
    ["Morning / Afternoon / Night", "you choose the shift directly on the day; Night gets the night bonus"],
    ["Automatic weekend", "Saturday and Sunday are detected automatically from the calendar"],
    ["Automatic holidays", "legal holidays are marked and automatically receive the holiday bonus"],
    ["Overtime", "+75% of hourly base for each entered overtime hour"],
    ["Monetization", "free: 30 calculations/month, permanent banner and ad gate every 3 calculations; premium: no ads and no limit"],
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
