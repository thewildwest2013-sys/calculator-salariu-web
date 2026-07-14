export type DayStatus =
  | "worked"
  | "off"
  | "annual_leave"
  | "medical_leave"
  | "birthday_paid"
  | "absence_unexcused"
  | "unpaid_leave"
  | "document_pending"
  | "family_event_paid"
  | "family_emergency_recoverable"
  | "comp_time"
  | "caregiver_leave"
  | "paternity_leave"
  | "paid_custom";

export type NightBonusRule = "legal_interval" | "whole_shift" | "fixed_hours" | "custom_interval" | "manual";

export type ShiftDefinition = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  breakPaid: boolean;
  breakStartTime?: string;
  color?: string;
  nightBonusRule: NightBonusRule;
  fixedNightBonusHours?: number;
  customNightStart?: string;
  customNightEnd?: string;
  manualNightBonusHours?: number;
};

export type CalendarEntry = {
  date: string;
  status: DayStatus;
  shiftId?: string;
  scheduledHours?: number;
  workedHours?: number;
  overtimeHours?: number;
  undertimeHours?: number;
  overtimeNight?: boolean;
  overtimeWeekend?: boolean;
  overtimeHoliday?: boolean;
  documentStatus?: "not_required" | "pending" | "verified" | "rejected";
  medicalCode?: string;
  medicalPercent?: number;
  note?: string;
  customPaidHours?: number;
  ticketEligible?: boolean;
  keepPresenceBonus?: boolean;
};

export type FiscalRules = {
  id: string;
  validFrom: string;
  validTo?: string;
  casPercent: number;
  cassPercent: number;
  incomeTaxPercent: number;
  camPercent: number;
  personalDeduction: number;
  nightStart: string;
  nightEnd: string;
  minimumNightBonusPercent: number;
  minimumOvertimeBonusPercent: number;
  minimumHolidayBonusPercent: number;
  standardDailyHours: number;
  standardWeeklyHours: number;
  maximumAverageWeeklyHours: number;
  minimumDailyRestHours: number;
  minimumShiftRestHours: number;
  minimumWeeklyRestHours: number;
  medicalFirstUnpaidDays: number;
  sources: string[];
};

export type PayrollSettings = {
  baseGrossMonthly: number;
  monthlyNormHours: number;
  mealTicketValue: number;
  nightBonusPercent: number;
  weekendBonusPercent: number;
  holidayBonusPercent: number;
  overtimeBonusPercent: number;
  shiftBonusFixed: number;
  presenceBonusFixed: number;
  otherTaxableBonuses: number;
  otherNonTaxableBenefits: number;
  deductionsAfterNet: number;
  mealTicketsSubjectToCass: boolean;
  mealTicketsSubjectToIncomeTax: boolean;
  mealTicketsSubjectToCas: boolean;
  cumulateWeekendAndHoliday: boolean;
  customTaxMode: boolean;
  customCasPercent?: number;
  customCassPercent?: number;
  customIncomeTaxPercent?: number;
  customCamPercent?: number;
};

export type ShiftBreakdown = {
  totalScheduledHours: number;
  totalPaidHours: number;
  legalNightHours: number;
  paidNightBonusHours: number;
  weekendHours: number;
  holidayHours: number;
  dayHours: number;
  startsAt: string;
  endsAt: string;
};

export type PayrollResult = {
  hourlyBase: number;
  scheduledHours: number;
  workedHours: number;
  paidLeaveHours: number;
  unpaidHours: number;
  overtimeHours: number;
  undertimeHours: number;
  legalNightHours: number;
  nightBonusHours: number;
  weekendHours: number;
  holidayHours: number;
  ticketDays: number;
  adjustedBaseGross: number;
  nightBonus: number;
  weekendBonus: number;
  holidayBonus: number;
  overtimeBase: number;
  overtimeBonus: number;
  grossTaxable: number;
  mealTicketsGross: number;
  cas: number;
  cass: number;
  taxableBase: number;
  incomeTax: number;
  netCash: number;
  netWithBenefits: number;
  employerCam: number;
  employerTotalCost: number;
  warnings: string[];
  calculationVersion: string;
};
