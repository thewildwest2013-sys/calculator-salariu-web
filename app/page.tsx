
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logoutUser } from "@/lib/auth";
import { checkUsage, increaseUsage } from "@/lib/usage";

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
  { day: 1, month: 1, date: "01 ianuarie", name: "Anul Nou" },
  { day: 2, month: 1, date: "02 ianuarie", name: "A doua zi de Anul Nou" },
  { day: 6, month: 1, date: "06 ianuarie", name: "Boboteaza" },
  { day: 7, month: 1, date: "07 ianuarie", name: "Sf. Ioan" },
  { day: 24, month: 1, date: "24 ianuarie", name: "Ziua Unirii" },
  { day: 10, month: 4, date: "10 aprilie", name: "Vinerea Mare" },
  { day: 12, month: 4, date: "12 aprilie", name: "Paște" },
  { day: 13, month: 4, date: "13 aprilie", name: "A doua zi de Paște" },
  { day: 1, month: 5, date: "01 mai", name: "Ziua Muncii" },
  { day: 31, month: 5, date: "31 mai", name: "Rusalii" },
  { day: 1, month: 6, date: "01 iunie", name: "A doua zi de Rusalii" },
  { day: 15, month: 8, date: "15 august", name: "Adormirea Maicii Domnului" },
  { day: 30, month: 11, date: "30 noiembrie", name: "Sf. Andrei" },
  { day: 1, month: 12, date: "01 decembrie", name: "Ziua Națională" },
  { day: 25, month: 12, date: "25 decembrie", name: "Crăciun" },
  { day: 26, month: 12, date: "26 decembrie", name: "A doua zi de Crăciun" },
];

const MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

const WEEKDAYS = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("salary-settings-v2");
      const savedCalendar = localStorage.getItem("salary-calendar-v2");
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
      console.error("Nu s-au putut încărca datele locale:", err);
    }
  }, []);

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
    localStorage.setItem("salary-settings-v2", JSON.stringify(payload));
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
      "salary-calendar-v2",
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

  const statusLabel = profile?.isPremium
    ? profile?.plan || "premium_monthly"
    : "free";

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
        holidayName: holiday?.name,
      });
    }

    while (items.length % 7 !== 0) {
      items.push({ day: null });
    }

    while (items.length < 35) {
      items.push({ day: null });
    }

    return items;
  }, [monthIndex, year]);

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

    const workedBaseDays = Object.values(daysData).filter(
      (d) => d.type === "Morning" || d.type === "After" || d.type === "Night" || d.type === "CO",
    ).length;

    const morningCount = Object.values(daysData).filter((d) => d.type === "Morning").length;
    const afterCount = Object.values(daysData).filter((d) => d.type === "After").length;
    const nightCount = Object.values(daysData).filter((d) => d.type === "Night").length;
    const coCount = Object.values(daysData).filter((d) => d.type === "CO").length;
    const cmCount = Object.values(daysData).filter((d) => d.type === "CM").length;

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

  async function handleLogout() {
    try {
      await logoutUser();
      alert("Logout făcut");
    } catch {
      alert("Eroare la logout");
    }
  }

  async function saveCalculation() {
    if (!user) {
      alert("Trebuie să fii autentificat");
      return;
    }

    if (calculation.netSalary <= 0) {
      alert("Calculează mai întâi salariul");
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

      alert("Calcul salvat cu succes");
    } catch (err) {
      console.error(err);
      alert("Eroare la salvarea calculului");
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
    alert("Exemplu încărcat");
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
          />
        );
      case "estimate":
        return (
          <EstimateSection
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
        );
      case "rules":
        return (
          <RulesSection
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
            onCalculate={() => setActiveTab("estimate")}
            onLoadExample={loadExample}
          />
        );
      case "details":
        return (
          <DetailsSection
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
        );
      case "holidays":
        return <HolidaysSection />;
      case "logic":
        return <LogicSection />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#061428] p-8 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">Calculator Salariu</h1>
          <p className="mt-4 text-white/70">Se încarcă...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.20),_transparent_18%),linear-gradient(180deg,#071427_0%,#07192f_40%,#051324_100%)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 lg:px-8">
        {!user && (
          <section className="mx-auto mt-10 max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
            <div className="mb-5 inline-flex rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200">
              🔒 Autentificare securizată
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">Calculator Salariu</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
              Intră în cont sau creează unul nou ca să folosești aplicația. Datele tale sunt
              salvate în cloud pe contul tău.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href="/register"
                className="rounded-[24px] border border-white/10 bg-white/10 px-6 py-4 text-center text-2xl font-semibold transition hover:bg-white/15"
              >
                Înregistrare
              </Link>
              <Link
                href="/login"
                className="rounded-[24px] border border-white/10 bg-[#071326] px-6 py-4 text-center text-2xl font-semibold transition hover:bg-[#0a1c34]"
              >
                Login
              </Link>
            </div>
          </section>
        )}

        {user && (
          <div className="space-y-4">
            <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_60px_rgba(0,80,255,0.08)] backdrop-blur-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                    Calculator Salariu
                  </div>
                  <h1 className="mt-1 text-3xl font-bold md:text-5xl">
                    Calculator Salariu
                  </h1>
                </div>

                <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-sm font-bold shadow-[0_0_24px_rgba(59,130,246,0.45)]">
                    RO
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-bold">
                    GB
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
                <InfoCard label="Cont" value={user.email || "-"} />
                <InfoCard label="Plan" value={statusLabel} />
                <Link
                  href="/premium"
                  className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-5 text-left text-xl font-semibold transition hover:bg-white/15"
                >
                  Restore / Manage Premium
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionChip onClick={() => setActiveTab("calendar")} active={activeTab === "calendar"}>
                  Calendar
                </ActionChip>
                <ActionChip onClick={() => setActiveTab("estimate")} active={activeTab === "estimate"}>
                  Estimare
                </ActionChip>
                <ActionChip onClick={() => setActiveTab("rules")} active={activeTab === "rules"}>
                  Reguli
                </ActionChip>
                <ActionChip onClick={() => setActiveTab("details")} active={activeTab === "details"}>
                  Detalii
                </ActionChip>
                <ActionChip onClick={() => setActiveTab("holidays")} active={activeTab === "holidays"}>
                  Sărbători
                </ActionChip>
                <ActionChip onClick={() => setActiveTab("logic")} active={activeTab === "logic"}>
                  Logică
                </ActionChip>
                <Link
                  href="/history"
                  className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  Istoric
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            </header>

            {!profile?.isPremium && (
              <section className="rounded-[24px] border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-50 shadow-[0_0_30px_rgba(250,204,21,0.08)]">
                <div className="text-xs uppercase tracking-[0.22em] text-yellow-100/70">
                  Plan Free
                </div>
                <h2 className="mt-1 text-xl font-semibold">Activează Premium</h2>
                <p className="mt-1 max-w-2xl text-sm text-yellow-50/80">
                  Reclame + funcții limitate. Pentru detalii complete și experiență fără reclame, treci la Premium.
                </p>
              </section>
            )}

            {renderTabContent()}

            {selectedDay && (
              <DayModal
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
    <SectionShell kicker="Programul tău lunar" title="Calendar rapid">
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
              {MONTHS[monthIndex]}
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
              Azi
            </button>
            <button
              onClick={onReset}
              className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <LegendPill color="bg-emerald-400" label="Morning" />
            <LegendPill color="bg-amber-400" label="After" />
            <LegendPill color="bg-blue-400" label="Night" />
            <LegendPill color="bg-slate-500" label="Liber" />
            <LegendPill color="bg-violet-400" label="CO" />
            <LegendPill color="bg-rose-400" label="CM / Sărbătoare" />
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {WEEKDAYS.map((day) => (
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
                    {WEEKDAYS[item.weekdayIndex]}
                  </div>
                  <div className="mt-2 text-[10px] font-semibold leading-3 break-words">
                    {daysData[item.day]?.type || "Liber"}
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
          <MiniMetric title="Ture setate" value={String(Object.keys(daysData).length || "0")} />
          <MiniMetric
            title="Morning"
            value={String(Object.values(daysData).filter((d: any) => d.type === "Morning").length || "0")}
          />
          <MiniMetric
            title="After"
            value={String(Object.values(daysData).filter((d: any) => d.type === "After").length || "0")}
          />
          <MiniMetric
            title="Night"
            value={String(Object.values(daysData).filter((d: any) => d.type === "Night").length || "0")}
          />
          <MiniMetric
            title="OT"
            value={`${Object.values(daysData).reduce((sum: number, d: any) => sum + (d.overtimeHours || 0), 0)}h`}
          />
          <MiniMetric
            title="Sărbători lună"
            value={String(monthDays.filter((d: any) => d.day && d.isHoliday).length || "0")}
          />
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
  day,
  monthIndex,
  year,
  data,
  isWeekend,
  holidayName,
  onClose,
  onSave,
}: {
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
          📅 Zi selectată
        </div>

        <h2 className="mt-4 text-3xl font-bold">
          {day} {MONTHS[monthIndex]} {year}
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Alegi tura, apoi poți adăuga ore suplimentare și notițe pentru ziua respectivă.
        </p>

        <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80">
          {isHoliday ? "Sărbătoare" : isWeekend ? "Weekend" : "Zi lucrătoare"}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ShiftButton selected={type === "Liber"} color="bg-slate-500/25 border-slate-300/25" onClick={() => setType("Liber")}>
            Liber
          </ShiftButton>
          <ShiftButton selected={type === "Morning"} color="bg-emerald-500/25 border-emerald-300/25" onClick={() => setType("Morning")}>
            Morning
          </ShiftButton>
          <ShiftButton selected={type === "After"} color="bg-amber-500/25 border-amber-300/25" onClick={() => setType("After")}>
            After
          </ShiftButton>
          <ShiftButton selected={type === "Night"} color="bg-blue-500/25 border-blue-300/25" onClick={() => setType("Night")}>
            Night
          </ShiftButton>
          <ShiftButton selected={type === "CO"} color="bg-violet-500/25 border-violet-300/25" onClick={() => setType("CO")}>
            Concediu odihnă
          </ShiftButton>
          <ShiftButton selected={type === "CM"} color="bg-rose-500/25 border-rose-300/25" onClick={() => setType("CM")}>
            Concediu medical
          </ShiftButton>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm text-white/75">Ore suplimentare</label>
          <input
            type="number"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(Number(e.target.value))}
            className="w-full rounded-[18px] border border-white/10 bg-[#041224] px-5 py-4 text-2xl font-semibold outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm text-white/75">Notiță pentru ziua asta</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: schimb cu colegul, tură specială, observații..."
            rows={4}
            className="w-full rounded-[18px] border border-white/10 bg-[#041224] px-5 py-4 text-base text-white/90 outline-none placeholder:text-white/30"
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <CheckboxPill checked={otNight} onChange={() => setOtNight(!otNight)}>
            OT noapte
          </CheckboxPill>
          <CheckboxPill checked={otWeekend} onChange={() => setOtWeekend(!otWeekend)}>
            OT weekend
          </CheckboxPill>
          <CheckboxPill checked={otHoliday} onChange={() => setOtHoliday(!otHoliday)}>
            OT sărbătoare
          </CheckboxPill>
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
            Salvează
          </button>

          <button
            onClick={onClose}
            className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-semibold transition hover:bg-white/[0.08]"
          >
            Închide
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
    <SectionShell kicker="Rezumat rapid" title="Estimare lunară">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <EstimateCard title="Salariu net estimat" value={net ? `${net.toFixed(2)} RON` : "—"} highlight />
        <EstimateCard title="Tichete masă" value={mealTickets ? `${mealTickets.toFixed(2)} RON` : "—"} />
        <EstimateCard
          title="Sporuri totale"
          value={(overtimeExtra + nightExtra + weekendExtra + holidayExtra)
            ? `${(overtimeExtra + nightExtra + weekendExtra + holidayExtra).toFixed(2)} RON`
            : "—"}
        />
        <EstimateCard title="Total estimat" value={total ? `${total.toFixed(2)} RON` : "—"} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Zile lucrate" value={String(workedDays || "0")} />
        <DetailCard label="Morning" value={String(morning || "0")} />
        <DetailCard label="After" value={String(after || "0")} />
        <DetailCard label="Night" value={String(night || "0")} />
        <DetailCard label="Ore suplimentare" value={`${overtimeHours || 0}h`} />
        <DetailCard label="OT +75%" value={overtimeExtra ? `${overtimeExtra.toFixed(2)} RON` : "—"} />
        <DetailCard label="Spor noapte" value={nightExtra ? `${nightExtra.toFixed(2)} RON` : "—"} />
        <DetailCard label="Spor weekend" value={weekendExtra ? `${weekendExtra.toFixed(2)} RON` : "—"} />
        <DetailCard label="Spor sărbătoare" value={holidayExtra ? `${holidayExtra.toFixed(2)} RON` : "—"} />
        <DetailCard label="Ajustare CM" value={medicalAdjustment ? `-${medicalAdjustment.toFixed(2)} RON` : "—"} />
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
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Estimare lunară</div>
      <div className={`mt-6 break-words text-2xl font-bold ${highlight ? "text-emerald-300" : "text-white"}`}>
        {value}
      </div>
      <div className="mt-4 text-base text-white/70">{title}</div>
    </div>
  );
}

function RulesSection(props: {
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
}) {
  return (
    <SectionShell kicker="Setări personale" title="Reguli salariale">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Salariu brut de referință" value={props.grossSalary} onChange={props.setGrossSalary} />
        <Field label="Bon masă / zi" value={props.mealTicketPerDay} onChange={props.setMealTicketPerDay} />
        <Field label="Spor noapte (%)" value={props.nightPercent} onChange={props.setNightPercent} />
        <Field label="Spor overtime (%)" value={props.overtimePercent} onChange={props.setOvertimePercent} />
        <Field label="Spor weekend (%)" value={props.weekendPercent} onChange={props.setWeekendPercent} />
        <Field label="Spor sărbătoare (%)" value={props.holidayPercent} onChange={props.setHolidayPercent} />
        <Field label="CAS (%)" value={props.casPercent} onChange={props.setCasPercent} />
        <Field label="CASS (%)" value={props.cassPercent} onChange={props.setCassPercent} />
        <Field label="Impozit (%)" value={props.taxPercent} onChange={props.setTaxPercent} />
        <Field label="Ore / tură" value={props.hoursPerShift} onChange={props.setHoursPerShift} />
        <Field label="Zile CM neplătite / lună" value={props.medicalLeaveDays} onChange={props.setMedicalLeaveDays} />
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <button
          onClick={props.onCalculate}
          className="rounded-[18px] bg-blue-600 px-6 py-3 text-base font-semibold transition hover:bg-blue-500"
        >
          Calculează salariul
        </button>
        <button
          onClick={props.onLoadExample}
          className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-semibold transition hover:bg-white/[0.08]"
        >
          Încarcă exemplu
        </button>
      </div>

      <p className="mt-5 max-w-4xl text-sm leading-7 text-white/70">
        Weekendul și sărbătorile se detectează automat din calendar. Tura Night se alege direct din ziua selectată.
      </p>
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
    <SectionShell kicker="Verificare rapidă" title="Detaliu calcul">
      {isPremium ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailCard label="Brut estimat" value={grossEstimate ? `${grossEstimate.toFixed(2)} RON` : "—"} />
          <DetailCard label="Bază orară brută" value={hourlyBase ? `${hourlyBase.toFixed(2)} RON` : "—"} />
          <DetailCard label="CAS" value={cas ? `${cas.toFixed(2)} RON` : "—"} />
          <DetailCard label="CASS" value={cass ? `${cass.toFixed(2)} RON` : "—"} />
          <DetailCard label="Bază impozabilă" value={taxableIncome ? `${taxableIncome.toFixed(2)} RON` : "—"} />
          <DetailCard label="Impozit" value={incomeTax ? `${incomeTax.toFixed(2)} RON` : "—"} />
          <DetailCard label="Salariu net" value={netSalary ? `${netSalary.toFixed(2)} RON` : "—"} highlight />
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-[#071326]/80 p-5">
          <div className="grid gap-4 md:grid-cols-[140px_1fr]">
            <div className="text-lg text-white/55">Preview</div>
            <div className="text-xl font-semibold leading-tight">
              Valorile reale și modelul de calcul sunt afișate doar pentru Premium deblocat.
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onSaveCalculation}
        className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-base font-semibold transition hover:bg-white/[0.08]"
      >
        Salvează calcul
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

function HolidaysSection() {
  return (
    <SectionShell kicker="Referință anuală" title="Sărbători 2026">
      <div className="space-y-3">
        {HOLIDAYS_2026.map((item) => (
          <div
            key={`${item.date}-${item.name}`}
            className="flex flex-col justify-between gap-2 rounded-[18px] border border-white/10 bg-[#071326]/80 px-5 py-4 md:flex-row md:items-center"
          >
            <div className="text-lg font-bold">{item.date}</div>
            <div className="text-lg text-white/65 break-words">{item.name}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function LogicSection() {
  const rows = [
    ["Bază orară", "salariul brut de referință se împarte la aproximativ 160 ore lunare"],
    ["Morning / After / Night", "alegi tura direct din zi; Night primește sporul de noapte"],
    ["Weekend automat", "sâmbăta și duminica sunt detectate automat din calendar"],
    ["Sărbători automate", "zilele legale sunt marcate și primesc automat sporul de sărbătoare"],
    ["Ore suplimentare", "+75% din baza orară pentru fiecare oră introdusă"],
    ["OT special", "poți marca separat dacă overtime-ul a fost de noapte, în weekend sau de sărbătoare"],
    ["Bonuri", "valoarea setată se aplică pentru fiecare zi Morning / After / Night"],
    ["Taxe", "CAS, CASS și impozit se aplică pe brutul estimat"],
    ["CO / CM", "CO rămâne plătit la bază; CM poate scădea zilele neplătite setate de tine"],
  ];

  return (
    <SectionShell kicker="Cum calculează aplicația" title="Logica implementată">
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
