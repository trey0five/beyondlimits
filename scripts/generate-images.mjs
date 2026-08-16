#!/usr/bin/env node
/**
 * generate-images.mjs — builds the Beyond Limits image library via OpenAI gpt-image-1.
 *
 * Reads OPENAI_API_KEY from env, falling back to ../village-finder/.env.
 * Output: assets/img/<slug>.png
 *
 * Usage:
 *   node scripts/generate-images.mjs             # generate missing only
 *   node scripts/generate-images.mjs --force     # regenerate all
 *   node scripts/generate-images.mjs --slug=hero-meadow-near
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

// ── API key ──────────────────────────────────────────────────────────
if (!process.env.OPENAI_API_KEY) {
  const envPath = path.resolve(ROOT, '..', 'village-finder', '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const m = line.match(/^OPENAI_API_KEY=(.*)$/);
      if (m) process.env.OPENAI_API_KEY = m[1].split('#')[0].trim();
    }
  }
}
if (!process.env.OPENAI_API_KEY) {
  console.error('No OPENAI_API_KEY found.');
  process.exit(1);
}

const STYLE_PHOTO =
  'Warm editorial photograph, soft natural window light, earthy palette of pale sage green, cream and light brown, ' +
  'shallow depth of field, genuine joyful mood, high-end lifestyle magazine quality.';

const MANIFEST = [
  {
    slug: 'hero-meadow-far',
    size: '1536x1024',
    quality: 'high',
    prompt:
      'Flat 2D vector illustration on a solid pure white #ffffff background: a row of wildflower meadow silhouettes growing up ' +
      'from the bottom edge — tall grasses, dandelion seed heads, cow parsley, daisies. Every plant is a completely solid, flat, ' +
      'opaque shape filled with one single color: sage green #96a56e. Crisp clean vector edges like a paper-cut stencil. ' +
      'Absolutely no glow, no fog, no gradients, no halo, no shading, no texture. The top two thirds of the canvas is plain ' +
      'empty white.',
  },
  {
    slug: 'hero-meadow-near',
    size: '1536x1024',
    quality: 'high',
    prompt:
      'Flat 2D vector illustration on a solid pure white #ffffff background: a dense row of wildflower meadow silhouettes ' +
      'growing up from the bottom edge — tall grasses, seed heads, daisies, clover. Every plant is a completely solid, flat, ' +
      'opaque shape filled with one single color: deep sage green #5c6b3c. Denser at the ground, wispy at the tips. Crisp clean ' +
      'vector edges like a paper-cut stencil. Absolutely no glow, no fog, no gradients, no halo, no shading, no texture. ' +
      'The top two thirds of the canvas is plain empty white.',
  },
  {
    slug: 'logo-icon',
    size: '1024x1024',
    quality: 'high',
    prompt:
      'Flat 2D vector logo mark on a solid pure white #ffffff background, no text: an abstract uplifted human figure with ' +
      'radiating wing-like leaves sweeping upward on both sides, three small four-point sparkle stars above the head. ' +
      'Filled with a rich gold gradient from #8a6420 to #e0b84f. Crisp clean vector edges. Absolutely no glow, no shadow, ' +
      'no texture, no embossing, no background decoration — just the flat gold mark centered on plain white.',
  },
  {
    slug: 'svc-ot',
    size: '1536x1024',
    quality: 'medium',
    prompt:
      `${STYLE_PHOTO} A pediatric occupational therapist helping a smiling young child balance on a sage-green exercise ball ` +
      'in a bright, plant-filled therapy studio with wooden shelves and soft cream walls.',
  },
  {
    slug: 'svc-speech',
    size: '1536x1024',
    quality: 'medium',
    prompt:
      `${STYLE_PHOTO} A friendly speech therapist and a young child sitting face to face at a light wooden table with letter ` +
      'tiles, both mid-laugh practicing sounds, cozy cream and sage therapy room.',
  },
  {
    slug: 'svc-tutoring',
    size: '1536x1024',
    quality: 'medium',
    prompt:
      `${STYLE_PHOTO} A patient tutor and a proud school-age child working through a workbook together at a warm wooden desk, ` +
      'pencil in hand, soft afternoon light, bookshelves and a small potted plant behind them.',
  },
  {
    slug: 'svc-microschool',
    size: '1536x1024',
    quality: 'medium',
    prompt:
      `${STYLE_PHOTO} A small joyful micro-school classroom: four children of different ages at round wooden tables doing ` +
      'hands-on projects with a warm teacher kneeling beside one, plants, cream walls, sage accents, morning light.',
  },
  {
    slug: 'micro-horse',
    size: '1536x1024',
    quality: 'medium',
    prompt:
      `${STYLE_PHOTO} A gentle equine therapy moment: a young child softly brushing a calm pony's mane outdoors at golden ` +
      'hour, an instructor close beside them, dry grass field in soft sage and tan tones.',
  },
  {
    slug: 'micro-arts',
    size: '1536x1024',
    quality: 'medium',
    prompt:
      `${STYLE_PHOTO} Children painting at easels and one playing a small drum in a bright creative-arts studio, aprons on, ` +
      'splashes of earthy paint colors, sage green walls, joyful concentration.',
  },
  {
    slug: 'micro-yoga',
    size: '1536x1024',
    quality: 'medium',
    prompt:
      `${STYLE_PHOTO} A small group of children doing playful yoga tree poses on cork mats in a calm movement studio, ` +
      'instructor at the front, cream walls, big windows, hanging plants.',
  },
];

const BLOOM_STYLE =
  'Flat 2D vector illustration on a solid pure white #ffffff background, paper-cut stencil style: a single stylized ' +
  'flower bloom viewed straight-on from the front, perfectly symmetrical and centered, filling most of the frame. ' +
  'Solid flat shapes only, in a palette of sage greens (#5c6b3c, #96a56e, #c8d3a7), warm gold (#c9a03f) and cream (#f5f0e0). ' +
  'No stem, no leaves, no text, no glow, no gradients, no shading, no outline. The bloom is: ';

const BLOOMS = [
  { slug: 'bloom-ot', desc: 'a layered zinnia with two rings of rounded petals, sage outer ring, gold inner ring, cream center disc.' },
  { slug: 'bloom-speech', desc: 'an open cosmos flower with eight wide notched petals in pale sage and a large warm gold center disc.' },
  { slug: 'bloom-tutoring', desc: 'a cheerful sunflower with slim gold petals and a big deep-sage center disc.' },
  { slug: 'bloom-micro', desc: 'a classic daisy with many slender cream petals and a large gold center disc.' },
  { slug: 'bloom-art', desc: 'a playful anemone with slightly irregular overlapping petals alternating sage and gold, cream center disc.' },
  { slug: 'bloom-equine', desc: 'a prairie coneflower with relaxed drooping sage petals around a large domed gold-brown center.' },
  { slug: 'bloom-yoga', desc: 'a serene lotus with layered pointed petals, pale sage outside fading to cream inside, small gold center.' },
];
for (const b of BLOOMS) {
  MANIFEST.push({ slug: b.slug, size: '1024x1024', quality: 'medium', prompt: BLOOM_STYLE + b.desc });
}

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const SLUG = args.find((a) => a.startsWith('--slug='))?.slice(7);

async function generate(item) {
  const dest = path.join(OUT, `${item.slug}.png`);
  const jpg = path.join(OUT, `${item.slug}.jpg`);
  if (!FORCE && !SLUG && (fs.existsSync(dest) || fs.existsSync(jpg))) {
    console.log(`skip   ${item.slug} (exists)`);
    return;
  }
  console.log(`gen    ${item.slug} ...`);
  const body = {
    model: 'gpt-image-1',
    prompt: item.prompt,
    size: item.size,
    quality: item.quality,
    n: 1,
  };
  if (item.background) body.background = item.background;
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${item.slug}: HTTP ${res.status} ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  fs.writeFileSync(dest, Buffer.from(json.data[0].b64_json, 'base64'));
  console.log(`done   ${item.slug} -> ${path.relative(ROOT, dest)}`);
}

const queue = MANIFEST.filter((m) => !SLUG || m.slug === SLUG);
let failed = 0;
for (const item of queue) {
  try {
    await generate(item);
  } catch (e) {
    failed++;
    console.error(`FAIL   ${e.message}`);
  }
}
console.log(failed ? `finished with ${failed} failure(s)` : 'all images ready');
process.exit(failed ? 1 : 0);
