# hetgamekompas.nl

Statische site met één serverless functie. Klaar voor Vercel.

## Uploaden
1. Vercel, New Project, "Deploy without Git" of sleep deze map erin.
2. Framework preset: **Other**. Geen build command, geen output directory.
3. Na de eerste deploy: Settings, Domains, voeg `hetgamekompas.nl` toe.
4. Vercel geeft je dan een A-record en een CNAME. Die zet je bij TransIP
   onder DNS-instellingen van het domein.

## Wat zit erin
- `index.html` - de hele site, responsief, mobiel en desktop in één bestand
- `api/nieuws.js` - haalt elk half uur GTA 6-nieuws uit de RSS-feeds in feeds.json
- `feeds.json` - de feeds en de filterwoorden. **Controleer deze adressen.**
  Een feed die niet werkt wordt stil overgeslagen.
- `nieuws.json` - de zes nieuwsitems die getoond worden als geen enkele feed werkt
- `sitemap.xml`, `robots.txt`, `favicon.svg`, `vercel.json`

## Hoe het nieuws werkt
De pagina vraagt bij het laden `/api/nieuws` op. Die functie leest de feeds,
filtert op "gta 6", "gta vi" en "grand theft auto", gooit dubbele titels eruit
en geeft de zes nieuwste terug. Werkt geen enkele feed, dan valt hij terug op
nieuws.json. Jij hoeft dus niets bij te werken.

## Wat de pagina zelf doet
- De aftelklok loopt naar 19 november 2026, 00:00 Nederlandse tijd.
- Zodra die datum voorbij is verandert de pagina vanzelf van toon: de klok
  verdwijnt, de koppen worden "GTA 6 is uit" en de checklist wordt een lijst
  met spullen die je erbij wilt hebben.

## Affiliate
Alle bol-links gebruiken websitecode **1558349** (Het Game Kompas).
