# ESG Almaty — multilingual dashboard

A responsive Next.js dashboard covering Almaty's air quality, transport, districts and environmental behaviour.

## Run on Windows, macOS or Linux

Install Node.js 20.9 or newer (Node.js 22 LTS recommended), then open a terminal inside this folder:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Stop the server with Ctrl+C.

For a production build:

```bash
npm run build
npm start
```

Other checks: `npm run lint` and `npx tsc --noEmit`.

## What's new

- First-visit language chooser: Russian (RU), English (EN) and Kazakh (KZ).
- Header language switcher; preference saved in localStorage on the current device.
- Localized navigation, narrative, statistics, district names, chart labels, tooltips and accessibility labels. The document uses the correct `kk` language code for Kazakh, while the interface displays KZ.
- Ivory and forest-green visual system with a locally bundled Almaty mountain illustration, responsive cards and improved visual hierarchy.
- Original rotating title, scrolling ticker, smooth navigation, section reveals and card hover transitions retained.
- Animated new buttons, a decorative pointer ring on devices with a mouse, and reading progress indicator. The native pointer remains available. Touch devices use normal touch interaction.
- Reduced-motion preferences disable decorative movement and chart animation. Language chooser uses the native modal dialog for keyboard focus containment.

No new runtime dependencies or paid services are required. Google Fonts are optional; system fonts are used when they are unavailable.

## Language behaviour

The chooser opens on the first visit. Selecting a language closes it and saves the choice. Returning visitors see their saved language. Header buttons can change it immediately, and the hero's Change language button can reopen the chooser. If browser storage is unavailable, switching still works for the current visit.

To see the first-visit chooser again, clear this site's local storage in your browser or open a private window. Translations are maintained in `app/translations.json`; shared language controls and introductory copy live in `app/language.tsx`.

## Files

- `app/page.tsx` — original dashboard sections and Chart.js visualizations, now translated.
- `app/language.tsx` — locale state, modal and language controls.
- `app/translations.json` — English and Kazakh translations keyed by Russian source text.
- `app/motion.tsx` — pointer ring and reading progress.
- `app/globals.css` — original animations plus updated responsive theme.
- `public/almaty-landscape.svg` — local decorative illustration.

## Data and project details

The numerical datasets, source links and author profile are retained from the uploaded project. These are embedded historical and illustrative figures, including the explicitly labelled synthetic survey; the project does not fetch live monitoring data. Existing profile content is retained. The technology card describes the delivered Next.js implementation.

## Deployment

Upload the project to your Git repository and import it into Vercel as a Next.js project, or use any host that supports Next.js. Keep `node_modules` and `.next` out of Git. Set `NEXT_PUBLIC_SITE_URL` to your public URL to configure social sharing metadata (see `.env.example`).

The ZIP contains source code and the dependency lockfile. Run `npm ci` after extracting; dependencies and build caches are intentionally excluded.
