
import type { APIRoute } from "astro";
import dns from 'dns';
import { formDataToJson } from "@server/astroHelpers";
import { InvoiceStatus, getPayfastIntegration, isSandbox } from "@server/subscriptionLogic";
import crypto from "crypto"
import { z } from "zod";
import { k, p } from "@server/db";
import { getSubscription, updateSubscription } from "@server/payfast";
import Sentry from "@sentry/node"

Sentry.init({
    dsn: "https://8b820b384bd241b58a98818ea0d706e9@o241703.ingest.sentry.io/4504973772783616",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});


const pfValidSignature = (pfData: { [key: string]: string | undefined }, pfParamString: string, pfPassphrase?: string) => {
    if (pfPassphrase) {
        pfParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, '+')}`;
    }

    console.log({ paramWithPassPhrase: pfParamString })

    const signature = crypto.createHash("md5").update(pfParamString).digest("hex");
    console.log({ wwhat: signature })
    return pfData['signature'] === signature;
};

const isPayFastDomain = async (clientAddress: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        dns.reverse(clientAddress, (error, hostnames) => {
            if (error) {
                reject(error);
            } else {
                const validDomains = ['www.payfast.co.za', 'sandbox.payfast.co.za', "w1w.payfast.co.za",
                    "w2w.payfast.co.za",];
                const isPayFast = hostnames.some((hostname) => validDomains.includes(hostname));
                resolve(isPayFast);
            }
        });
    });
};


export const all: APIRoute = async ({ request, clientAddress }) => {
    const transaction = Sentry.startTransaction({
        op: "test",
        name: "My First Test Transaction",
    });

    try {
        console.log("NOTIFY");
        const formData = await request.formData();
        const submittedData = formDataToJson(formData);
        //const submittedData = Object.fromEntries(formData.entries());
        console.log({ request: submittedData });

        const sandboxEnabled = await isSandbox();
        const pfHost = sandboxEnabled ? "sandbox.payfast.co.za" : "www.payfast.co.za";
        const payfastIntegration = await getPayfastIntegration();

        let pfParamString = "";
        for (const key in submittedData) {
            if (Object.prototype.hasOwnProperty.call(submittedData, key) && key !== "signature") {
                pfParamString += `${key}=${encodeURIComponent(submittedData[key].trim()).replace(/%20/g, '+')}&`;
            }
        }

        // Remove last ampersand
        pfParamString = pfParamString.slice(0, -1);

        console.log({ pfParamString })

        const check1 = pfValidSignature(submittedData, pfParamString, payfastIntegration.passphrase ?? "");
        console.log({ signature: check1 });

        console.log({ clientAddress })
        // const check2 = await isPayFastDomain(clientAddress)
        //console.log({ check2 })

        const m_payment_id = z.coerce.number().parse(submittedData["m_payment_id"])
        const amount_gross = z.coerce.number().parse(submittedData["amount_gross"])
        const invoice = await k.selectFrom("payments_invoice").selectAll().where("id", "=", m_payment_id).executeTakeFirstOrThrow()
        const { amount } = await k.selectFrom("payments_invoice_item")
            .select(eb => eb.fn.sum<number>("cost").as("amount")).where("invoice_id", "=", invoice.id).executeTakeFirstOrThrow()

        const check3 = Math.abs(amount - amount_gross) <= 0.01;

        console.log({ invoiceTotal: amount, check3 })

        const tokenParsed = z.string().safeParse(submittedData["token"])
        if (invoice.user_id && tokenParsed.success) {
            await updateSubscription(tokenParsed.data, invoice.user_id)
        }


        const serverCheckResponse = await fetch(`https://${pfHost}/eng/query/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submittedData)
        });

        const serverCheckResult = await serverCheckResponse.text();
        const check4 = serverCheckResult === "VALID"

        console.log({ serverCheckResult, check4 })

        //Check 2 is buggy
        if (check1 && check3 && check4) {
            console.log("All Checks Pass")

            //Update Invoice to PAID
            await p.payments_invoice.update({ where: { id: invoice.id }, data: { status_id: InvoiceStatus.Paid } })

            const productId = z.coerce.number().parse(submittedData["custom_int2"])

            if (productId == 1) {
                const authorId = z.coerce.number().parse(submittedData["custom_int1"])
                const authorAmount = amount * 0.9
                const type = "tip"

                await p.transaction.create({
                    data: {
                        user_id: authorId,
                        amount: authorAmount,
                        type: type,
                        on_views: 0,
                        date: new Date()
                    }
                })

                //Update Author Wallet
                await p.users.update({ where: { id: authorId }, data: { amount: { increment: authorAmount } } })

                //Update Admin Wallet
                await p.users.updateMany({ where: { admin: true }, data: { amount: { increment: amount } } })
            }

            if (productId == 2) {
                const token = z.string().parse(submittedData["token"])
                if (invoice.user_id) {
                    await updateSubscription(token, invoice.user_id)
                }
                //Update Admin Wallet
                await p.users.updateMany({ where: { admin: true }, data: { amount: { increment: amount } } })
            }
        }

        return {
            body: JSON.stringify({
                name: "Astro",
                url: "https://astro.build/",
            }),
        };
    } catch (e) {
        Sentry.captureException(e);

    } finally {
        transaction.finish();

    }

    return new Response(null, {
        status: 500,
        statusText: 'Error'
    });
};



