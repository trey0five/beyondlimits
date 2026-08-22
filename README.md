# Beyond Limits Therapy & Education Center — Website

A single-page, dependency-free website (plain HTML/CSS/JS — no build step).
Open `index.html` in a browser, or serve the folder with any static host
(Netlify, Vercel, GitHub Pages, S3…).

```bash
# local preview
python3 -m http.server 8080
# → http://localhost:8080
```

## Structure

| File | Purpose |
|---|---|
| `index.html` | The entire one-page site (hero → about → approach → services → micro school → reviews → contact) |
| `styles.css` | Design system: cream / light sage / light brown palette, gold accents |
| `main.js` | Preloader, sparkle canvas, parallax meadows, scroll reveals, counters, reviews carousel, contact form |
| `assets/img/` | AI-generated imagery (see below) |
| `scripts/generate-images.mjs` | Regenerates imagery via OpenAI `gpt-image-1` |

## Reviews — how they work (no backend needed)

- Published reviews live in **`reviews.js`** — a plain file the site reads.
- Visitors click **"Share Your Story ✦"** and submit through the flower popup.
  Their review shows immediately **on their own device** (localStorage, marked
  "pending") and is **emailed to the practice inbox**.
- The owner opens the management panel either by adding **`#garden-keeper`**
  to the URL (e.g. `https://yoursite.com/#garden-keeper`) or by **tapping
  Vickie's name or portrait five times quickly** in the Meet the Founder section:
  add reviews from the inbox, edit, reorder, delete — then click
  **Download reviews.js** and replace that file on the web host.
  The site updates for every visitor. No AWS, no database, and nothing
  publishes globally without the owner's explicit approval.

## ⚠️ Before launch — placeholders to replace

1. **Contact details** — set (954-793-0253, 12233 SW 55th St Unit 812, Cooper City FL 33330,
   beyondlimits.cc.entc@gmail.com). Forms and review submissions email `ADMIN_EMAIL` in `main.js`.
2. **Reviews** — the testimonials in the `#reviews` section are **sample copy**,
   clearly marked with an HTML comment. Replace with real family reviews
   (with permission) before going live.
3. **Logo** — `assets/img/logo-icon.png` is an AI approximation of the practice's
   gold mark. Drop in the real logo file (transparent PNG) under the same name
   to swap it everywhere at once.

## Regenerating images

Reads `OPENAI_API_KEY` from the environment, falling back to
`../village-finder/.env`.

```bash
node scripts/generate-images.mjs              # only missing images
node scripts/generate-images.mjs --force      # everything
node scripts/generate-images.mjs --slug=svc-ot
```

Edit the prompt `MANIFEST` inside the script to change any image.

Post-processing (the generator outputs PNG):

- **Meadow layers & logo** are generated on pure white, then keyed transparent:
  `python3 scripts/key-white.py assets/img/hero-meadow-far.png ...`
  (then cropped/quantized — see git-less note below; the keyed files in
  `assets/img/` are already final).
- **Photos** were converted to JPEG (`.jpg`) to keep the page light; if you
  regenerate one, convert it again:
  `python3 -c "from PIL import Image; Image.open('assets/img/svc-ot.png').convert('RGB').save('assets/img/svc-ot.jpg', quality=85, optimize=True)"`
  The HTML references the `.jpg` names.
- The meadow strips are used as `repeat-x` CSS backgrounds sized by height,
  so they tile at natural plant scale on any screen.
