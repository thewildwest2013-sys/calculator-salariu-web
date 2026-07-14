import { getDayStatusDefinition } from "./day-statuses";
import { analyzeShift, validateShiftSequence } from "./schedule-engine";
import type { CalendarEntry, FiscalRules, PayrollResult, PayrollSettings, ShiftDefinition } from "./types";

const round2=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;

export function calculatePayroll(input:{entries:CalendarEntry[];shifts:ShiftDefinition[];settings:PayrollSettings;rules:FiscalRules;holidays?:Set<string>}):PayrollResult{
  const {entries,shifts,settings,rules}=input; const holidays=input.holidays||new Set<string>();
  const shiftMap=new Map(shifts.map(shift=>[shift.id,shift]));
  const hourlyBase=settings.baseGrossMonthly/Math.max(1,settings.monthlyNormHours);
  let scheduledHours=0,workedHours=0,paidLeaveHours=0,unpaidHours=0,overtimeHours=0,undertimeHours=0,legalNightHours=0,nightBonusHours=0,weekendHours=0,holidayHours=0,ticketDays=0;
  const shiftEntries:Array<{date:string;shift:ShiftDefinition}>=[];
  let presenceBonusEligible=true;

  for(const entry of entries){
    const status=getDayStatusDefinition(entry.status);
    const shift=entry.shiftId?shiftMap.get(entry.shiftId):undefined;
    const breakdown=shift?analyzeShift(entry.date,shift,rules,holidays):undefined;
    let scheduled=entry.scheduledHours??rules.standardDailyHours;
    if(breakdown){
      scheduled=breakdown.totalPaidHours;
      scheduledHours+=scheduled;
      shiftEntries.push({date:entry.date,shift:shift!});
    } else if(entry.status!=="off") scheduledHours+=scheduled;

    if(status.worked){
      const declaredUndertime=Math.max(0,entry.undertimeHours||0);
      const declaredWorked=Math.max(0,entry.workedHours??scheduled);
      const effectiveWorked=Math.max(0,Math.min(scheduled,declaredWorked,scheduled-declaredUndertime));
      const missingHours=Math.max(0,scheduled-effectiveWorked);
      const workedRatio=scheduled>0?effectiveWorked/scheduled:0;

      workedHours+=effectiveWorked;
      undertimeHours+=missingHours;
      unpaidHours+=missingHours;
      overtimeHours+=Math.max(0,entry.overtimeHours||0);

      // Without exact clock-in/clock-out timestamps, variable shift bonuses are
      // reduced proportionally to the hours actually worked.
      if(breakdown){
        legalNightHours+=breakdown.legalNightHours*workedRatio;
        nightBonusHours+=breakdown.paidNightBonusHours*workedRatio;
        weekendHours+=breakdown.weekendHours*workedRatio;
        holidayHours+=breakdown.holidayHours*workedRatio;
      }

      if((entry.ticketEligible??status.ticketEligible)&&effectiveWorked>0)ticketDays++;
    }
    else if(status.paid){const paid=entry.customPaidHours??scheduled;paidLeaveHours+=paid;if(entry.status==="medical_leave"&&typeof entry.medicalPercent==="number") unpaidHours+=paid*(1-Math.max(0,Math.min(100,entry.medicalPercent))/100);}
    else {unpaidHours+=scheduled;if(entry.status==="absence_unexcused"||entry.status==="document_pending")presenceBonusEligible=false;}
    if(entry.keepPresenceBonus===false)presenceBonusEligible=false;
  }

  const adjustedBaseGross=Math.max(0,settings.baseGrossMonthly-unpaidHours*hourlyBase);
  const nightBonus=hourlyBase*nightBonusHours*(settings.nightBonusPercent/100);
  const weekendBonus=hourlyBase*weekendHours*(settings.weekendBonusPercent/100);
  const holidayEligibleHours=settings.cumulateWeekendAndHoliday?holidayHours:Math.max(0,holidayHours-Math.min(holidayHours,weekendHours));
  const holidayBonus=hourlyBase*holidayEligibleHours*(settings.holidayBonusPercent/100);
  const overtimeBase=hourlyBase*overtimeHours;
  const overtimeBonus=overtimeBase*(settings.overtimeBonusPercent/100);
  const presenceBonus=presenceBonusEligible?settings.presenceBonusFixed:0;
  const grossTaxable=adjustedBaseGross+nightBonus+weekendBonus+holidayBonus+overtimeBase+overtimeBonus+settings.shiftBonusFixed+presenceBonus+settings.otherTaxableBonuses;
  const mealTicketsGross=ticketDays*settings.mealTicketValue;
  const casRate=(settings.customTaxMode?settings.customCasPercent:rules.casPercent)||0;
  const cassRate=(settings.customTaxMode?settings.customCassPercent:rules.cassPercent)||0;
  const taxRate=(settings.customTaxMode?settings.customIncomeTaxPercent:rules.incomeTaxPercent)||0;
  const camRate=(settings.customTaxMode?settings.customCamPercent:rules.camPercent)||0;
  const casBase=grossTaxable+(settings.mealTicketsSubjectToCas?mealTicketsGross:0);
  const cassBase=grossTaxable+(settings.mealTicketsSubjectToCass?mealTicketsGross:0);
  const cas=casBase*casRate/100;
  const cass=cassBase*cassRate/100;
  const taxMealBase=settings.mealTicketsSubjectToIncomeTax?mealTicketsGross:0;
  const taxableBase=Math.max(0,grossTaxable+taxMealBase-cas-cass-rules.personalDeduction);
  const incomeTax=taxableBase*taxRate/100;
  const netCash=grossTaxable-cas-cass-incomeTax-settings.deductionsAfterNet;
  const netWithBenefits=netCash+mealTicketsGross+settings.otherNonTaxableBenefits;
  const employerCam=grossTaxable*camRate/100;
  const warnings=validateShiftSequence(shiftEntries,rules);
  if(settings.nightBonusPercent<rules.minimumNightBonusPercent&&nightBonusHours>0)warnings.push(`Sporul de noapte (${settings.nightBonusPercent}%) este sub pragul legal implicit (${rules.minimumNightBonusPercent}%).`);
  if(settings.overtimeBonusPercent<rules.minimumOvertimeBonusPercent&&overtimeHours>0)warnings.push(`Sporul pentru ore suplimentare (${settings.overtimeBonusPercent}%) este sub pragul legal implicit (${rules.minimumOvertimeBonusPercent}%).`);
  if(settings.holidayBonusPercent<rules.minimumHolidayBonusPercent&&holidayHours>0)warnings.push(`Sporul de sărbătoare (${settings.holidayBonusPercent}%) este sub pragul legal implicit (${rules.minimumHolidayBonusPercent}%).`);
  if(settings.customTaxMode)warnings.push("Au fost folosite taxe personalizate; rezultatul este o simulare personalizată.");

  return {hourlyBase:round2(hourlyBase),scheduledHours:round2(scheduledHours),workedHours:round2(workedHours),paidLeaveHours:round2(paidLeaveHours),unpaidHours:round2(unpaidHours),overtimeHours:round2(overtimeHours),undertimeHours:round2(undertimeHours),legalNightHours:round2(legalNightHours),nightBonusHours:round2(nightBonusHours),weekendHours:round2(weekendHours),holidayHours:round2(holidayHours),ticketDays,adjustedBaseGross:round2(adjustedBaseGross),nightBonus:round2(nightBonus),weekendBonus:round2(weekendBonus),holidayBonus:round2(holidayBonus),overtimeBase:round2(overtimeBase),overtimeBonus:round2(overtimeBonus),grossTaxable:round2(grossTaxable),mealTicketsGross:round2(mealTicketsGross),cas:round2(cas),cass:round2(cass),taxableBase:round2(taxableBase),incomeTax:round2(incomeTax),netCash:round2(netCash),netWithBenefits:round2(netWithBenefits),employerCam:round2(employerCam),employerTotalCost:round2(grossTaxable+employerCam),warnings,calculationVersion:rules.id};
}
