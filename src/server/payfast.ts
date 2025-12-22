import crypto from 'crypto'
import { getPayfastIntegration, isSandbox } from './subscriptionLogic';
import { z } from 'zod';
import { p } from './db';

export interface PayFastParams {
    merchant_id: string;
    merchant_key: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    name_first: string;
    name_last: string;
    email_address: string;
    m_payment_id: string;
    amount: string;
    item_name: string;
    item_description?: string;
    custom_str1?: string;
    custom_str2?: string;
    custom_str3?: string;
    custom_str4?: string;
    custom_str5?: string;
    [key: string]: string | undefined;
}

export function generatePayFastSignature(params: PayFastParams, passphrase?: string): string {

    const fields = ['merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url', 'notify_method',
        'name_first', 'name_last', 'email_address', 'cell_number', 'm_payment_id', 'amount', 'item_name',
        'item_description', 'custom_int1', 'custom_int2', 'custom_int3', 'custom_int4', 'custom_int5',
        'custom_str1', 'custom_str2', 'custom_str3', 'custom_str4', 'custom_str5', 'email_confirmation',
        'confirmation_address', 'currency', 'payment_method', 'subscription_type', 'passphrase',
        'billing_date', 'recurring_amount', 'frequency', 'cycles', 'subscription_notify_email',
        'subscription_notify_webhook', 'subscription_notify_buyer'];
    let dataString = '';

    fields.forEach(key => {
        const pp = params[key]
        if (pp && key !== "signature") {
            dataString += `${key}=${encodeURIComponent(pp.trim()).replace(/%20/g, '+')}&`;
        }
    })

    if (passphrase) {
        dataString += `passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    } else {
        dataString = dataString.slice(0, -1); // Remove the last '&'
    }
    console.log({ dataString })

    return crypto.createHash('md5').update(dataString).digest('hex');
}



export async function createFormFields(data: PayFastParams) {
    if (!Object.prototype.hasOwnProperty.call(data, 'amount')) {
        throw new Error('Required "amount" parameter missing');
    }

    data.amount = Number(data.amount).toFixed(2);

    if (!Object.prototype.hasOwnProperty.call(data, 'item_name')) {
        throw new Error('Required "item_name" parameter missing');
    }

    const payfastIntegration = await getPayfastIntegration()

    const signature = generatePayFastSignature(data, payfastIntegration.passphrase ?? "");
    data.signature = signature;

    const sandboxEnabled = await isSandbox()
    const baseUrl = !sandboxEnabled ? "https://www.payfast.co.za/eng/process" : "https://sandbox.payfast.co.za/eng/process"

    let htmlForm = `<form id="payfastSubmit" action="${baseUrl}" method="post">`;
    for (const [name, value] of Object.entries(data)) {
        if (value) {
            htmlForm += `<input name="${name}" type="hidden" value="${value}" />`;
        }
    }

    //htmlForm += `<button type="submit"></button>`;
    htmlForm += '</form>';

    return htmlForm;
}
const formatedTimestamp = () => {
    const d = new Date()
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0];
    return `${date}T${time}`
}

export const getSubscription = async (token: string) => {

    const payfastIntegration = await getPayfastIntegration()
    const sandboxEnabled = await isSandbox()

    const timee = formatedTimestamp()
    console.log({ timee })
    const headers = {
        "merchant-id": payfastIntegration.merchant_id?.toString() ?? "",
        version: "v1",
        timestamp: formatedTimestamp(),
    };


    interface SignatureData {
        [key: string]: string;
    }
    const signatureData: SignatureData = { ...headers, passphrase: payfastIntegration.passphrase ?? "" };

    const sortedSignatureData = Object.keys(signatureData).sort().reduce((obj: SignatureData, key) => {
        obj[key] = signatureData[key];
        return obj;
    }, {});

    let pfParamString = "";
    for (const key in sortedSignatureData) {
        if (Object.prototype.hasOwnProperty.call(sortedSignatureData, key) && key !== "signature") {
            pfParamString += `${key}=${encodeURIComponent(sortedSignatureData[key].trim()).replace(/%20/g, '+')}&`;
        }
    }

    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);


    // if (payfastIntegration.passphrase) {
    //     pfParamString += `&passphrase=${encodeURIComponent(payfastIntegration.passphrase.trim()).replace(/%20/g, '+')}`;
    // }

    console.log({ pfParamString })

    const signature = crypto.createHash("md5").update(pfParamString).digest("hex");

    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);




    const response = await fetch(`https://api.payfast.co.za/subscriptions/${token}/fetch${sandboxEnabled ? "?testing=true" : ""}`, {
        headers: { ...headers, signature: signature }
    })
    const result = await response.json()
    console.log(JSON.stringify(result.data))

    const responseSchema = z.object({
        amount: z.number(),
        cycles: z.number(),
        cycles_complete: z.number(),
        frequency: z.number(),
        run_date: z.coerce.date(),
        status: z.number().catch(0),
        status_reason: z.string(),
        status_text: z.string(),
        token: z.string(),
    });

    const parsedData = responseSchema.parse(result.data.response)
    console.log({ parsedData: parsedData.run_date.getFullYear() })

    return parsedData
}

export const updateSubscription = async (token: string, userId: number) => {
    const subscriptionData = await getSubscription(token)
    const frequency = await p.payments_subscription_frequency.findFirstOrThrow({ where: { payfast_id: subscriptionData.frequency } })
    await p.payments_subscription.upsert({
        where: { token }, create: {
            frequency_id: frequency.id,
            cycles: subscriptionData.cycles,
            cycles_complete: subscriptionData.cycles_complete,
            run_date: subscriptionData.run_date,
            status_id: subscriptionData.status,
            amount: subscriptionData.amount,
            user_id: userId,
            token: token
        }, update: {
            frequency_id: frequency.id,
            cycles: subscriptionData.cycles,
            cycles_complete: subscriptionData.cycles_complete,
            run_date: subscriptionData.run_date,
            status_id: subscriptionData.status,
            amount: subscriptionData.amount,
            user_id: userId,
        }
    })
}

export const resyncSubscription = async (token: string) => {
    const subscriptionData = await getSubscription(token)
    const frequency = await p.payments_subscription_frequency.findFirstOrThrow({ where: { payfast_id: subscriptionData.frequency } })
    await p.payments_subscription.update({
        where: { token }, data: {
            frequency_id: frequency.id,
            cycles: subscriptionData.cycles,
            cycles_complete: subscriptionData.cycles_complete,
            run_date: subscriptionData.run_date,
            status_id: subscriptionData.status,
            amount: subscriptionData.amount,
            token: token
        }
    })
}

export const cancelSubscription = async (token: string) => {

    const payfastIntegration = await getPayfastIntegration()
    const sandboxEnabled = await isSandbox()

    const timee = formatedTimestamp()
    console.log({ timee })
    const headers = {
        "merchant-id": payfastIntegration.merchant_id?.toString() ?? "",
        version: "v1",
        timestamp: formatedTimestamp(),
    };


    interface SignatureData {
        [key: string]: string;
    }
    const signatureData: SignatureData = { ...headers, passphrase: payfastIntegration.passphrase ?? "" };

    const sortedSignatureData = Object.keys(signatureData).sort().reduce((obj: SignatureData, key) => {
        obj[key] = signatureData[key];
        return obj;
    }, {});

    let pfParamString = "";
    for (const key in sortedSignatureData) {
        if (Object.prototype.hasOwnProperty.call(sortedSignatureData, key) && key !== "signature") {
            pfParamString += `${key}=${encodeURIComponent(sortedSignatureData[key].trim()).replace(/%20/g, '+')}&`;
        }
    }

    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);


    // if (payfastIntegration.passphrase) {
    //     pfParamString += `&passphrase=${encodeURIComponent(payfastIntegration.passphrase.trim()).replace(/%20/g, '+')}`;
    // }

    console.log({ pfParamString })

    const signature = crypto.createHash("md5").update(pfParamString).digest("hex");

    // Remove last ampersand
    pfParamString = pfParamString.slice(0, -1);




    const response = await fetch(`https://api.payfast.co.za/subscriptions/${token}/cancel${sandboxEnabled ? "?testing=true" : ""}`, {
        method: "put",
        headers: { ...headers, signature: signature }
    })
    const result = await response.json()
    console.log(JSON.stringify(result.data))


    return result
}


