# NSE Chart PDF

A small installable web app (PWA): upload a CSV/XLSX of NSE stock symbols,
it fetches 1-year price history for each and outputs a single PDF with one
chart per stock. Wrapped into an Android app via PWABuilder — no Android
Studio or Kotlin needed.

## 1. Push this to GitHub

```
cd nse-chart-pdf
git init
git add .
git commit -m "NSE chart PDF PWA"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## 2. Turn on GitHub Pages

- Repo → **Settings → Pages**
- Source: **Deploy from a branch**, branch `main`, folder `/ (root)`
- Save. Your app will be live at `https://<your-username>.github.io/<repo-name>/`
- Open that URL on your phone/laptop and confirm the upload + generate flow works before packaging.

## 3. Build the Android app with PWABuilder

- Go to https://www.pwabuilder.com
- Paste your GitHub Pages URL, click **Start**
- It will read `manifest.json` and score the PWA (should pass since icons + manifest + service worker are included)
- Click **Package for stores → Android**
- Choose **Signing key**: let PWABuilder generate one for you (keep the downloaded `.keystore` and passwords safe — you need them for future updates)
- Download the package. It gives you a signed `.apk` (install directly) and/or `.aab` (for Play Store)

## 4. Install on your phone

- Copy the `.apk` to your phone and open it (allow "install unknown apps" for your file manager/browser when prompted)
- Or upload the `.aab` to the Play Console for Play Store distribution

## How it works now

On open, the app fetches NSE's official list of ~2,000 listed equities
(`EQUITY_L.csv` from NSE's archives) and shows it as a searchable, checkbox
list — no upload needed. Search by symbol or company name, check the ones
you want (or "Select all filtered" after narrowing a search), then generate.
The PDF only includes what you've selected — generating all ~2,000 at once
isn't practical (very slow, likely to hit proxy rate limits, and not a PDF
you'd actually read on a phone), so the search/filter step is there by design.

The symbol list is cached in the browser for 24 hours so it doesn't re-fetch
every time you open the app.

An "upload a CSV/XLSX instead" link is still there if you'd rather bulk-select
by uploading a list of symbols — it checks the matching boxes in the same list.

## Notes on stock data

- Price history is fetched from Yahoo Finance for `SYMBOL.NS`.
- Both the NSE symbol list and Yahoo Finance price data are fetched client-side
  through a public CORS proxy. The app tries four in order (codetabs,
  corsproxy.io, allorigins.win, thingproxy) and falls back automatically if one
  is down or blocked — NSE's archive server in particular sometimes rejects
  certain proxies. If the symbol list still fails to load, tap **Retry**, or
  use the "upload a CSV/XLSX of symbols instead" link, which needs no fetch at
  all (you just need the symbol list in a file once).
- These proxies are free and unauthenticated, so they can be slow or
  rate-limited under heavy use — especially if you select a large number of
  stocks at once.
- **For more reliable fetching**, host your own tiny proxy instead — a free
  Cloudflare Worker works well. Example:

  ```js
  export default {
    async fetch(request) {
      const target = new URL(request.url).searchParams.get('url');
      if (!target) return new Response('Missing url param', { status: 400 });
      const res = await fetch(target);
      const body = await res.text();
      return new Response(body, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
      });
    }
  }
  ```

  Deploy it (Cloudflare Workers free tier), then replace the `PROXIES` array
  in `index.html` with your worker URL.

## Input file format

Any CSV or XLSX with a column of NSE symbols, e.g.:

```
Symbol
RELIANCE
TCS
INFY
HDFCBANK
```

A header row is optional — if the first row doesn't look like a header, every
row is read as a symbol.

## Updating the app later

Edit `index.html` (all logic lives there), commit, push. GitHub Pages updates
automatically. You only need to re-run PWABuilder if you want a fresh APK,
and re-use the same signing key so it's treated as an update, not a new app.
