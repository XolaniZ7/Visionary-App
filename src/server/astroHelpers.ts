import { getSession } from "auth-astro";
import { authOpts } from "@server/authOpts";
import { p } from "@server/db";
import { z } from "zod";

export const getUser = async (request: Request) => {
    const session = await getSession(request, authOpts);
    const user = session?.user?.email
        ? await p.users.findUnique({ where: { email: session.user.email } })
        : null;

    return user
}

export const createUrl = (subpath: string) => {
    return (process.env.ASTROAUTH_URL ?? "") + subpath
}

export function formDataToJson(formData: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonObject: any = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value;
    });
    return jsonObject;
}

export async function approveText(comment: string) {

    const rwords = (await p.rkeywords.findMany()).map(x => x.keyword)
    const words = comment.split(' ');
    const found = words.some(word => {
        const cleanWord = word.replace(/^(https?:\/\/)/i, '').replace('/', '');
        return rwords.includes(cleanWord);
    });

    return found ? false : true
}

export const verifyCaptcha = async (gRecaptchaResponse: string) => {
    const recaptchaURL = "https://www.google.com/recaptcha/api/siteverify";
    const response = await fetch(recaptchaURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${process.env.CAPTCHA_SECRET_KEY}&response=${gRecaptchaResponse}`,
    });

    const responseData = await response.json();
    const parsedResponse = z.object({ success: z.boolean() }).parse(responseData);
    return parsedResponse.success
}