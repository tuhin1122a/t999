import fetch from 'node-fetch';

async function testUrl(url) {
  console.log(`Testing URL: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    const text = await res.text();
    console.log("Response starts with:", text.substring(0, 300));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function run() {
  await testUrl("https://igamingapis.com/provider/brands.php?brand_id=49");
  console.log("\n-------------------------\n");
  await testUrl("https://igamingapis.live/provider/brands.php?brand_id=49");
}

run();
