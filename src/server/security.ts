// Import required modules
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import { URL as NodeURL } from 'url';

export function hasValidSignature(urlToCheck: string): boolean {
    const appSecret = process.env.ASTROAUTH_SECRET ?? "";
    // Parse the URL and extract the query parameters
    const parsedUrl = new NodeURL(urlToCheck);
    const queryParams = querystring.parse(parsedUrl.search.substring(1));

    // Check if the required parameters are present
    if (!queryParams.signature) {
        return false;
    }

    // Check if the URL has expired (if the 'expires' parameter is present)
    if (queryParams.expires) {
        const expires = parseInt(queryParams.expires as string);
        if (expires < Math.floor(Date.now() / 1000)) {
            return false;
        }
    }

    // Remove the 'signature' parameter from the queryParams
    const signatureToCheck = queryParams.signature as string;
    delete queryParams.signature;

    // Sort the remaining parameters by key
    const sortedParameters: { [key: string]: string | number | boolean } = {};
    Object.keys(queryParams)
        .sort()
        .forEach((key) => {
            sortedParameters[key] = queryParams[key] as string ?? "";
        });

    // Create the parameter string for hashing
    const paramString = querystring.stringify(sortedParameters);

    // Create the HMAC hash using the appSecret
    const calculatedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(paramString)
        .digest('hex');

    // Compare the calculated signature with the signature from the URL
    return signatureToCheck === calculatedSignature;
}

// Function to generate a temporary signed URL
export function createSignedUrl(
    baseUrl: string,
    expiresInMinutes: number | null,
    parameters: { [key: string]: string | number | boolean }
): string {
    const appSecret = process.env.ASTROAUTH_SECRET ?? ""
    // Calculate the expiration timestamp (if expiresInMinutes is provided)
    if (expiresInMinutes !== null) {
        const expires = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
        parameters.expires = expires;
    }

    // Sort the parameters by key
    const sortedParameters: { [key: string]: string | number | boolean } = {};
    Object.keys(parameters)
        .sort()
        .forEach((key) => {
            sortedParameters[key] = parameters[key];
        });

    // Create the parameter string for hashing
    const paramString = querystring.stringify(sortedParameters);

    // Create the HMAC hash using the appSecret
    const signature = crypto
        .createHmac('sha256', appSecret)
        .update(paramString)
        .digest('hex');

    // Add the 'signature' parameter to the query parameters
    sortedParameters.signature = signature;

    // Generate the final URL
    const finalUrl = `${baseUrl}?${querystring.stringify(sortedParameters)}`;

    return finalUrl;
}

// // Example usage
// const baseUrl = 'https://visionarywritings.com/';
// const expiresInMinutes = 5;
// const parameters = {
//     cancel_payment: 1,
//     invoice_id: 2711,
// };
// const appSecret = 'your_app_secret_key';
// const signedUrl = createSignedUrl(baseUrl, expiresInMinutes, parameters, appSecret);
// console.log({ signedUrl });




// if (hasValidSignature('https://visionarywritings.com/?cancel_payment=1&expires=1680685641&invoice_id=2712&signature=bb09f948a99bd5d0281df8ea01f34978148c361228bebea3de78eb5669768bf5', appSecret)) {
//     console.log('The URL has a valid signature');
// } else {
//     console.log('The URL has an invalid signature');
// }