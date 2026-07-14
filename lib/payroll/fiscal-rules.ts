import type { FiscalRules } from "./types";

export const FISCAL_RULES: FiscalRules[] = [
  {
    id: "ro-2026-07",
    validFrom: "2026-07-01",
    casPercent: 25,
    cassPercent: 10,
    incomeTaxPercent: 10,
    camPercent: 2.25,
    personalDeduction: 0,
    nightStart: "22:00",
    nightEnd: "06:00",
    minimumNightBonusPercent: 25,
    minimumOvertimeBonusPercent: 75,
    minimumHolidayBonusPercent: 100,
    standardDailyHours: 8,
    standardWeeklyHours: 40,
    maximumAverageWeeklyHours: 48,
    minimumDailyRestHours: 12,
    minimumShiftRestHours: 8,
    minimumWeeklyRestHours: 48,
    medicalFirstUnpaidDays: 1,
    sources: [
      "Codul fiscal – ANAF, versiune actualizată",
      "Codul muncii, art. 112–137",
      "OUG 158/2005 și modificările aplicabile în 2026",
    ],
  },
];

export function getFiscalRulesForDate(date: string) {
  const ordered = [...FISCAL_RULES].sort((a,b)=>b.validFrom.localeCompare(a.validFrom));
  return ordered.find(rule => date >= rule.validFrom && (!rule.validTo || date <= rule.validTo)) || ordered[ordered.length - 1];
}
