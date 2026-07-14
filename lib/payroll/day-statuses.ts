import type { DayStatus } from "./types";

export type DayStatusDefinition = {
  id: DayStatus;
  codeRo: string;
  codeEn: string;
  labelRo: string;
  labelEn: string;
  paid: boolean;
  worked: boolean;
  ticketEligible: boolean;
  documentRecommended: boolean;
  color: string;
};

export const DAY_STATUSES: DayStatusDefinition[] = [
  { id:"worked", codeRo:"LUCRAT", codeEn:"WORK", labelRo:"Lucrat", labelEn:"Worked", paid:true, worked:true, ticketEligible:true, documentRecommended:false, color:"#10b981" },
  { id:"off", codeRo:"L", codeEn:"OFF", labelRo:"Liber / repaus programat", labelEn:"Scheduled day off", paid:false, worked:false, ticketEligible:false, documentRecommended:false, color:"#64748b" },
  { id:"annual_leave", codeRo:"CO", codeEn:"AL", labelRo:"Concediu de odihnă", labelEn:"Annual leave", paid:true, worked:false, ticketEligible:false, documentRecommended:true, color:"#8b5cf6" },
  { id:"medical_leave", codeRo:"CM", codeEn:"SL", labelRo:"Concediu medical", labelEn:"Medical leave", paid:true, worked:false, ticketEligible:false, documentRecommended:true, color:"#f43f5e" },
  { id:"birthday_paid", codeRo:"ANV", codeEn:"BDAY", labelRo:"Zi aniversară liberă plătită", labelEn:"Paid birthday leave", paid:true, worked:false, ticketEligible:false, documentRecommended:false, color:"#d946ef" },
  { id:"absence_unexcused", codeRo:"ABS", codeEn:"ABS", labelRo:"Absență nemotivată", labelEn:"Unexcused absence", paid:false, worked:false, ticketEligible:false, documentRecommended:false, color:"#dc2626" },
  { id:"unpaid_leave", codeRo:"CFP", codeEn:"UPL", labelRo:"Concediu fără plată", labelEn:"Unpaid leave", paid:false, worked:false, ticketEligible:false, documentRecommended:true, color:"#9f1239" },
  { id:"document_pending", codeRo:"AD", codeEn:"DOC", labelRo:"Document în așteptare", labelEn:"Document pending", paid:false, worked:false, ticketEligible:false, documentRecommended:true, color:"#f59e0b" },
  { id:"family_event_paid", codeRo:"EFP", codeEn:"PFE", labelRo:"Eveniment familial plătit", labelEn:"Paid family event", paid:true, worked:false, ticketEligible:false, documentRecommended:true, color:"#0ea5e9" },
  { id:"family_emergency_recoverable", codeRo:"UF", codeEn:"FE", labelRo:"Urgență familială cu recuperare", labelEn:"Recoverable family emergency", paid:true, worked:false, ticketEligible:false, documentRecommended:true, color:"#f97316" },
  { id:"comp_time", codeRo:"RC", codeEn:"TOIL", labelRo:"Liber compensatoriu", labelEn:"Time off in lieu", paid:true, worked:false, ticketEligible:false, documentRecommended:false, color:"#14b8a6" },
  { id:"caregiver_leave", codeRo:"CI", codeEn:"CL", labelRo:"Concediu de îngrijitor", labelEn:"Caregiver leave", paid:true, worked:false, ticketEligible:false, documentRecommended:true, color:"#06b6d4" },
  { id:"paternity_leave", codeRo:"CP", codeEn:"PL", labelRo:"Concediu paternal", labelEn:"Paternity leave", paid:true, worked:false, ticketEligible:false, documentRecommended:true, color:"#3b82f6" },
  { id:"paid_custom", codeRo:"LP", codeEn:"PTO", labelRo:"Altă zi liberă plătită", labelEn:"Other paid leave", paid:true, worked:false, ticketEligible:false, documentRecommended:false, color:"#6366f1" },
];

export function getDayStatusDefinition(id: DayStatus) { return DAY_STATUSES.find(item=>item.id===id)!; }
