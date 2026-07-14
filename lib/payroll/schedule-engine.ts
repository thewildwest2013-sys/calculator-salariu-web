import type { FiscalRules, ShiftBreakdown, ShiftDefinition } from "./types";

function toMinutes(time: string) {
  const [h,m] = time.split(":").map(Number);
  return Math.max(0, Math.min(1439, h * 60 + m));
}
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function inWrappedInterval(minuteOfDay: number, start: number, end: number) { return start < end ? minuteOfDay >= start && minuteOfDay < end : minuteOfDay >= start || minuteOfDay < end; }
function resolveBreakStart(shift: ShiftDefinition, startAbs: number, endAbs: number) {
  if (!shift.breakMinutes || shift.breakPaid) return null;
  if (shift.breakStartTime) {
    let minute = toMinutes(shift.breakStartTime);
    if (minute < startAbs % 1440 || endAbs > 1440 && minute < endAbs % 1440) minute += startAbs >= 1440 ? 1440 : (minute < startAbs ? 1440 : 0);
    return minute;
  }
  return Math.floor(startAbs + (endAbs - startAbs - shift.breakMinutes) / 2);
}

export function analyzeShift(dateISO: string, shift: ShiftDefinition, rules: FiscalRules, holidays: Set<string> = new Set()): ShiftBreakdown {
  const date = new Date(`${dateISO}T00:00:00`);
  const start = toMinutes(shift.startTime);
  let end = toMinutes(shift.endTime);
  if (end <= start) end += 1440;
  const breakStart = resolveBreakStart(shift,start,end);
  const nightStart = toMinutes(rules.nightStart);
  const nightEnd = toMinutes(rules.nightEnd);
  const customStart = toMinutes(shift.customNightStart || rules.nightStart);
  const customEnd = toMinutes(shift.customNightEnd || rules.nightEnd);

  let paidMinutes=0, legalNight=0, weekend=0, holiday=0, day=0, customNight=0;
  for(let absolute=start; absolute<end; absolute++){
    const onBreak = breakStart !== null && absolute >= breakStart && absolute < breakStart + shift.breakMinutes;
    if(onBreak) continue;
    paidMinutes++;
    const dayOffset=Math.floor(absolute/1440);
    const minute=absolute%1440;
    const current=new Date(date); current.setDate(current.getDate()+dayOffset);
    const legal=inWrappedInterval(minute,nightStart,nightEnd);
    if(legal) legalNight++; else day++;
    if(current.getDay()===0||current.getDay()===6) weekend++;
    if(holidays.has(dateKey(current))) holiday++;
    if(inWrappedInterval(minute,customStart,customEnd)) customNight++;
  }

  let paidNight = legalNight;
  if(shift.nightBonusRule==="whole_shift") paidNight=paidMinutes;
  if(shift.nightBonusRule==="fixed_hours") paidNight=Math.min(paidMinutes,Math.max(0,(shift.fixedNightBonusHours||0)*60));
  if(shift.nightBonusRule==="custom_interval") paidNight=customNight;
  if(shift.nightBonusRule==="manual") paidNight=Math.min(paidMinutes,Math.max(0,(shift.manualNightBonusHours||0)*60));

  return {
    totalScheduledHours:(end-start)/60,
    totalPaidHours:paidMinutes/60,
    legalNightHours:legalNight/60,
    paidNightBonusHours:paidNight/60,
    weekendHours:weekend/60,
    holidayHours:holiday/60,
    dayHours:day/60,
    startsAt:`${dateISO}T${shift.startTime}:00`,
    endsAt:new Date(date.getTime()+end*60000).toISOString(),
  };
}

export function validateShiftSequence(entries: Array<{date:string;shift:ShiftDefinition}>, rules: FiscalRules) {
  const warnings:string[]=[];
  const intervals=entries.map(item=>{
    const start=new Date(`${item.date}T${item.shift.startTime}:00`).getTime();
    let end=new Date(`${item.date}T${item.shift.endTime}:00`).getTime();
    if(end<=start)end+=86400000;
    return {...item,start,end};
  }).sort((a,b)=>a.start-b.start);
  for(let i=1;i<intervals.length;i++){
    const rest=(intervals[i].start-intervals[i-1].end)/3600000;
    const minimum=rules.minimumShiftRestHours;
    if(rest<minimum)warnings.push(`Repaus de numai ${Math.max(0,rest).toFixed(1)}h între ${intervals[i-1].date} și ${intervals[i].date}; prag configurat ${minimum}h.`);
  }
  return warnings;
}
