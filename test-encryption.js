const crypto = require('crypto');

function encryptPayloadECB(data, key) {
    if (key.length !== 32) throw new Error("Key must be 32 bytes long");
    const json = JSON.stringify(data);
    const cipher = crypto.createCipheriv("aes-256-ecb", Buffer.from(key, 'utf8'), null);
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    return encrypted.toString('base64');
}

const data = { test: "data" };
const key = "12345678901234567890123456789012";
console.log(encryptPayloadECB(data, key));
