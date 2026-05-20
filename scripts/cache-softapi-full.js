import { promises as fs } from 'fs';
import path from 'path';

const cacheFile = path.join(process.cwd(), 'data', 'softapi-providers-cache.json');
const cacheDir = path.join(process.cwd(), 'data', 'softapi-brand-cache');

function mapCategory(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('slot') || c === 'flash' || c === 'video slot') return 'slots';
  if (c.includes('live') || c.includes('casino') || c.includes('baccarat') || c.includes('roulette')) return 'live_dealers';
  if (c.includes('fish') || c.includes('shoot')) return 'fishing';
  if (c.includes('sport')) return 'sport';
  if (c.includes('poker') || c.includes('table') || c.includes('card')) return 'live_dealers';
  if (c.includes('lottery') || c.includes('keno') || c.includes('bingo')) return 'lottery';
  if (c.includes('mini') || c.includes('crash') || c.includes('instant')) return 'slots';
  return 'slots';
}

function mapBrandToTitle(brandId) {
  const mapping = {
    '49': 'jili_gaming',
    '45': 'pgsoft_slot',
    '58': 'evolution',
    '67': 'spribe',
    '51': 'tada_gaming',
    '53': 'pragmatic_live_asia',
    '54': 'pragmatic_live_asia',
    '52': 'cq9_slot',
    '65': 'bgaming',
    '70': 'hacksaw',
    '69': 'habanero',
    '71': 'smartsoft',
  };
  return mapping[brandId] || `softapi_${brandId}`;
}

function parseGames(data, brand_id) {
  const rawGames = data.games || data.data || [];
  const providerTitle = mapBrandToTitle(brand_id);
  const games = rawGames.map(g => ({
    id: g.game_code || g.gameID || g.game_id,
    name: g.game_name || g.gameNameEn || g.name,
    img: g.game_img || g.img || g.image,
    device: 'mobile,desktop',
    title: providerTitle,
    categories: mapCategory(g.category || g.game_type || ''),
    bm: '0',
    demo: '1',
    rewriterule: '0',
    exitButton: '1',
    brand_id,
    raw_category: g.category,
  }));
  return { games, providerTitle };
}

function isCloudflareChallenge(text) {
  return text.includes('Just a moment') || text.includes('cf-ray') || text.includes('_cf_chl_opt') || text.includes('challenge-platform') || text.includes('Enable JavaScript and cookies to continue');
}

async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  const providerJson = JSON.parse(await fs.readFile(cacheFile, 'utf8'));
  const ids = (providerJson.games || []).map(g => g.brand_id).filter(Boolean);
  await fs.mkdir(cacheDir, { recursive: true });
  const results = [];

  for (const brandId of ids) {
    const outPath = path.join(cacheDir, `${brandId}.json`);
    const already = await fs.stat(outPath).then(() => true).catch(() => false);
    if (already) {
      console.log(`#${brandId}: already cached`);
      results.push({ brandId, status: 'cached' });
      continue;
    }

    const urls = ['https://igamingapis.com/provider/brands.php', 'https://igamingapis.live/provider/brands.php'];
    let saved = false;
    for (const base of urls) {
      const url = `${base}?brand_id=${brandId}`;
      try {
        const res = await fetchWithTimeout(url, 10000);
        const text = await res.text();
        if (isCloudflareChallenge(text)) {
          console.log(`#${brandId}: cloudflare challenge from ${base}`);
          continue;
        }
        if (!res.ok) {
          console.log(`#${brandId}: http ${res.status} from ${base}`);
          continue;
        }
        const data = JSON.parse(text);
        const { games, providerTitle } = parseGames(data, brandId);
        const payload = {
          success: true,
          brand_id: brandId,
          provider_title: providerTitle,
          total_games: games.length,
          games,
        };
        await fs.writeFile(outPath, JSON.stringify(payload, null, 2), 'utf8');
        console.log(`#${brandId}: saved ${games.length} games from ${base}`);
        results.push({ brandId, status: 'saved', source: base, count: games.length });
        saved = true;
        break;
      } catch (err) {
        console.log(`#${brandId}: fetch error from ${base}:`, err.message || err);
      }
    }

    if (!saved) {
      const payload = { success: false, brand_id: brandId, games: [], warning: 'failed to fetch remote data' };
      await fs.writeFile(outPath, JSON.stringify(payload, null, 2), 'utf8');
      console.log(`#${brandId}: saved fallback empty file`);
      results.push({ brandId, status: 'failed' });
    }
  }

  console.log('completed', results.filter(r => r.status !== 'cached'));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
