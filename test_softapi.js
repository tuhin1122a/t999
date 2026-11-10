import crypto from 'crypto';

const TOKEN = process.env.SOFTAPI_TOKEN || 'cebcb5eeb92bd5f68e6c8dd772827e11';
const SECRET = process.env.SOFTAPI_SECRET || '0d6e277db0020770476bb22a8a075ca5';
const SERVER_URL = process.env.SOFTAPI_SERVER_URL || 'https://igamingapis.live/api/v1';

const PAYLOAD = {
    user_id: 1001,
    balance: 100.00,
    game_uid: '3978',
    token: TOKEN,
    timestamp: Date.now(),
    return: 'https://yoursite.com/lobby',
    callback: 'https://yoursite.com/api/softapi/callback',
    language: 'en',
    currency_code: 'BDT',
};

function encryptPayloadECB(data, key32) {
    if (Buffer.byteLength(key32, 'utf8') !== 32) {
        throw new Error('AES key must be 32 bytes');
    }
    const json = JSON.stringify(data);
    const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(key32, 'utf8'), null);
    cipher.setAutoPadding(true); // PKCS7 padding
    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    return encrypted.toString('base64');
}

async function test() {
    try {
        const encrypted = encryptPayloadECB(PAYLOAD, SECRET);
        console.log("Sending POST launch request to SoftAPI...");

        const res = await fetch(SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: TOKEN,
                payload: encrypted,
            }),
        });
        const text = await res.text();

        try {
            const jsonResponse = JSON.parse(text);
            console.log("\n✅ Response from SoftAPI:");
            console.dir(jsonResponse, { depth: null, colors: true });
        } catch {
            console.log("\n❌ Response is not JSON:");
            console.log(text);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
