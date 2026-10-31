# Farm Market — فارم ماركت

An Arabic, RTL-first storefront for digital farm design, layout consultations, and educational coaching. Built with React, TypeScript, Vite, Tailwind CSS 4 and Lucide React. This is a frontend demo: all products, availability, and EUR prices are explicitly sample data. No payments, authentication, database, or admin dashboard are implemented.

## Local development

Requires Node.js 22.12+ (validated on Node 24) and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the address printed by Vite. Run `npm run build` for TypeScript checking and a production build; `npm run preview` serves the production output.

### Windows / PowerShell

`/workspace/farm-market` is the cloud workspace path, not a folder on your Windows PC. Download and extract the project archive first. Open the extracted `farm-market` folder in File Explorer, then right-click inside it and choose **Open in Terminal**. Confirm that `package.json` is in the current folder before running:

```powershell
node --version
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Install Node.js 24 LTS if `node` is not recognized, then reopen the terminal. Using `npm.cmd` avoids the common PowerShell script execution-policy error without changing your execution policy. Open the local address printed by Vite, usually `http://localhost:5173`. An administrator terminal is not required. Never run setup from `C:\Windows\System32`.

### WhatsApp

Set `VITE_WHATSAPP_NUMBER` in `.env.local` to the owner's international phone number, digits only (7–15 digits, no `+`, spaces, or leading `00`). Restart Vite after changing it. For deployments, configure it as a build environment variable and rebuild. It is public frontend configuration, never a secret. No real number is included. Missing or invalid configuration produces an explanatory Arabic notice instead of opening a broken conversation. Product inquiries include the product name in a URL-encoded Arabic message. Unavailable services cannot be requested.

## Structure

- `src/data/products.ts`: typed sample products, categories, and a repository adapter. Replace this data-access boundary with Supabase later.
- `src/components/`: shared layout, product cards, WhatsApp behavior, and original farm SVG artwork.
- `src/pages/`: homepage, searchable catalog, product details, about, contact, legal placeholders, and not-found page.
- `src/lib/i18n.ts`: locale metadata and shared text; centralize remaining page copy in locale dictionaries when implementing English and German. Current UI is Arabic only; no pretend language switcher.
- `src/lib/whatsapp.ts`: independently testable message and number handling.
- `src/styles.css`: Tailwind integration, palette, components, responsive layouts, and reduced-motion support.
- `tests/storefront.spec.ts`: browser checks for catalog state, product navigation, configuration feedback, and mobile navigation.

Category/search/sort state lives in URL parameters, so links can be shared and refreshed. Routes use BrowserRouter and support browser back/forward. Cairo is self-hosted from `@fontsource/cairo`; no external font requests. All illustrations and favicon are original vectors authored for this project. Cairo is SIL OFL licensed; Lucide is ISC licensed (see dependency licenses). No official game graphics, logos, or third-party product photos are used.

## Cloudflare Pages

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root
- Optional build variable: `VITE_WHATSAPP_NUMBER`
- Use Node 22.12+ or 24.

`public/_redirects` provides the SPA fallback so direct product/detail links work. No server runtime or Cloudflare secret is needed for this version. Do not publish before replacing sample content, adding the owner's contact details, and finalizing legal information.

## Browser validation

```sh
npx playwright install chromium
npm test
```

Playwright starts Vite itself on port 4173. Tests use an unset WhatsApp number by default. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if you need a system Chromium. Tests include desktop and mobile viewports. There are no fabricated customer reviews or claims of completed orders.

## Next phase

1. Agree on real services, imagery, prices, delivery terms, and owner information.
2. Finalize privacy, terms, legal imprint, and service-specific consumer requirements with the owner.
3. Add Supabase data access behind the product repository, storage, and secure server-side authorization/RLS.
4. Build a real authenticated admin dashboard with product/category management and validated uploads; never expose service-role keys in this frontend.
5. Add full English/German translations and locale-aware routing; expand keyboard/screen-reader and browser testing.
6. Configure the owner's WhatsApp number and deploy to Cloudflare Pages after review.
