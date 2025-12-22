import { p } from "./db"

export const isSandbox = async () => {
    const globalSettings = await p.payments_global_settings.findFirst()
    return globalSettings?.sandbox_enabled ?? true
}

export const getPayfastIntegration = async () => {
    const sandboxEnabled = await isSandbox()
    return await p.payments_payfast_integration.findUniqueOrThrow({ where: { id: sandboxEnabled ? 1 : 2 } })
}

export const getSubsciptionPlans = async () => {
    const yearlyCostQuery = await p.payments_product.findFirst({
        where: {
            id: 2
        }
    })
    const yearlyBaseCost = yearlyCostQuery?.base_price.toNumber() ?? 708
    const biannuallyBaseCost = yearlyBaseCost / 2
    const monthlyCost = yearlyBaseCost / 12

    const biannualDiscount = 10
    const biannualDiscountSavings = (biannuallyBaseCost * (biannualDiscount / 100))
    const biannuallyCost = biannuallyBaseCost - biannualDiscountSavings

    const yearlyDiscount = 17
    const yearlyDiscountSavings = (yearlyBaseCost * (yearlyDiscount / 100))
    const yearlyCost = yearlyBaseCost - yearlyDiscountSavings

    return { monthlyCost, biannuallyCost, yearlyCost, biannualDiscount, biannualDiscountSavings, yearlyDiscount, yearlyDiscountSavings }
}

export type Plan = "monthly" | "biannually" | "yearly"

export const getSubsciptionPlan = async (plan: Plan) => {
    const plans = await getSubsciptionPlans()
    if (plan == "monthly") {
        return { cost: plans.monthlyCost, frequency: 3 }
    }
    if (plan == "biannually") {
        return { cost: plans.biannuallyCost, frequency: 5 }
    }
    if (plan == "yearly") {
        return { cost: plans.yearlyCost, frequency: 6 }
    }

    return null
}

export const InvoiceStatus = {
    Draft: 1,
    Unpaid: 2,
    Paid: 3,
    Cancelled: 4,
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];
