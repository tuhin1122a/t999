import crypto from 'crypto';

const TOKEN = 'cebcb5eeb92bd5f68e6c8dd772827e11';
const SECRET = '0d6e277db0020770476bb22a8a075ca5';
const SERVER_URL = 'https://igamingapis.live/api/v1';

const PAYLOAD = {
    user_id: '1234567890',
    balance: '40',
    game_uid: '3978',
    token: TOKEN,
    timestamp: Date.now(),
    return: 'https://google.com/return',
    callback: 'https://yourdomain.com/callback.php'
};

function encryptPayloadECB(data, key) {
    const json = JSON.stringify(data);
    const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(key, 'utf8'), null);
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    return encrypted.toString('base64');
}

async function test() {
    try {
        const encrypted = encryptPayloadECB(PAYLOAD, SECRET);
        const url = `${SERVER_URL}?payload=${encodeURIComponent(encrypted)}&token=${encodeURIComponent(TOKEN)}`;
        console.log("Sending request to SoftAPI...");
        
        const res = await fetch(url);
        const text = await res.text();
        
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
            console.log("\n✅ Response from SoftAPI:");
            console.dir(jsonResponse, { depth: null, colors: true });
        } catch (e) {
            console.log("\n❌ Response is not JSON:");
            console.log(text);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
