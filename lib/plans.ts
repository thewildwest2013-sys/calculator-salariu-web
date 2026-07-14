export type PlanKind = "credit_pack" | "personal_subscription" | "business_subscription" | "addon" | "enterprise";
export type BillingInterval = "one_time" | "month" | "year";

export type PlanDefinition = {
  id: string;
  kind: PlanKind;
  interval: BillingInterval;
  nameRo: string;
  nameEn: string;
  priceLei: number | null;
  credits?: number;
  employeeLimit?: number;
  adminLimit?: number;
  profileLimit?: number;
  aiMessages?: number;
  stripeEnv?: string;
  highlighted?: boolean;
};

export const PLANS: PlanDefinition[] = [
  { id: "credit_1", kind: "credit_pack", interval: "one_time", nameRo: "1 calcul", nameEn: "1 calculation", priceLei: 2.99, credits: 1, stripeEnv: "STRIPE_PRICE_CREDIT_1" },
  { id: "credit_5", kind: "credit_pack", interval: "one_time", nameRo: "5 calcule", nameEn: "5 calculations", priceLei: 8.99, credits: 5, stripeEnv: "STRIPE_PRICE_CREDIT_5", highlighted: true },
  { id: "credit_12", kind: "credit_pack", interval: "one_time", nameRo: "12 calcule", nameEn: "12 calculations", priceLei: 17.99, credits: 12, stripeEnv: "STRIPE_PRICE_CREDIT_12" },

  { id: "personal_monthly", kind: "personal_subscription", interval: "month", nameRo: "Premium Personal lunar", nameEn: "Personal Premium monthly", priceLei: 29.99, profileLimit: 3, aiMessages: 100, stripeEnv: "STRIPE_PRICE_PERSONAL_MONTHLY" },
  { id: "personal_yearly", kind: "personal_subscription", interval: "year", nameRo: "Premium Personal anual", nameEn: "Personal Premium yearly", priceLei: 199.99, profileLimit: 3, aiMessages: 1200, stripeEnv: "STRIPE_PRICE_PERSONAL_YEARLY", highlighted: true },

  { id: "business_starter_monthly", kind: "business_subscription", interval: "month", nameRo: "Business Starter", nameEn: "Business Starter", priceLei: 49.99, employeeLimit: 10, adminLimit: 2, aiMessages: 300, stripeEnv: "STRIPE_PRICE_BUSINESS_STARTER_MONTHLY" },
  { id: "business_starter_yearly", kind: "business_subscription", interval: "year", nameRo: "Business Starter anual", nameEn: "Business Starter yearly", priceLei: 499.99, employeeLimit: 10, adminLimit: 2, aiMessages: 3600, stripeEnv: "STRIPE_PRICE_BUSINESS_STARTER_YEARLY" },
  { id: "business_growth_monthly", kind: "business_subscription", interval: "month", nameRo: "Business Growth", nameEn: "Business Growth", priceLei: 149.99, employeeLimit: 25, adminLimit: 3, aiMessages: 750, stripeEnv: "STRIPE_PRICE_BUSINESS_GROWTH_MONTHLY", highlighted: true },
  { id: "business_growth_yearly", kind: "business_subscription", interval: "year", nameRo: "Business Growth anual", nameEn: "Business Growth yearly", priceLei: 1499.99, employeeLimit: 25, adminLimit: 3, aiMessages: 9000, stripeEnv: "STRIPE_PRICE_BUSINESS_GROWTH_YEARLY" },
  { id: "business_pro_monthly", kind: "business_subscription", interval: "month", nameRo: "Business Pro", nameEn: "Business Pro", priceLei: 299.99, employeeLimit: 50, adminLimit: 5, aiMessages: 1500, stripeEnv: "STRIPE_PRICE_BUSINESS_PRO_MONTHLY" },
  { id: "business_pro_yearly", kind: "business_subscription", interval: "year", nameRo: "Business Pro anual", nameEn: "Business Pro yearly", priceLei: 2999.99, employeeLimit: 50, adminLimit: 5, aiMessages: 18000, stripeEnv: "STRIPE_PRICE_BUSINESS_PRO_YEARLY" },
  { id: "business_plus_monthly", kind: "business_subscription", interval: "month", nameRo: "Business Plus", nameEn: "Business Plus", priceLei: 399.99, employeeLimit: 100, adminLimit: 10, aiMessages: 3500, stripeEnv: "STRIPE_PRICE_BUSINESS_PLUS_MONTHLY" },
  { id: "business_plus_yearly", kind: "business_subscription", interval: "year", nameRo: "Business Plus anual", nameEn: "Business Plus yearly", priceLei: 3999.99, employeeLimit: 100, adminLimit: 10, aiMessages: 42000, stripeEnv: "STRIPE_PRICE_BUSINESS_PLUS_YEARLY" },
  { id: "business_addon_5", kind: "addon", interval: "month", nameRo: "+5 angajați activi", nameEn: "+5 active employees", priceLei: 29.99, employeeLimit: 5, stripeEnv: "STRIPE_PRICE_BUSINESS_ADDON_5" },
  { id: "enterprise", kind: "enterprise", interval: "month", nameRo: "Enterprise", nameEn: "Enterprise", priceLei: 699.99, employeeLimit: 101, adminLimit: 10 },
];

export function getPlan(planId: string) {
  return PLANS.find((plan) => plan.id === planId) || null;
}

export function getStripePriceId(plan: PlanDefinition) {
  return plan.stripeEnv ? process.env[plan.stripeEnv] || null : null;
}

export function isSubscriptionPlan(plan: PlanDefinition) {
  return plan.kind === "personal_subscription" || plan.kind === "business_subscription" || plan.kind === "addon";
}
