// Haalt GTA 6-nieuws uit de RSS-feeds in feeds.json.
// Draait als serverless functie op Vercel. Geen npm-pakketten nodig.
// Een feed die niet werkt wordt stil overgeslagen, zodat de site altijd blijft werken.

import feedsConfig from '../feeds.json' with { type: 'json' };
import statisch from '../nieuws.json' with { type: 'json' };

const MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function tekstUit(blok, tag) {
  const m = blok.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
  if (!m) return '';
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function itemsUitFeed(xml, bron) {
  const blokken = xml.match(/<(item|entry)[\s\S]*?<\/\1>/gi) || [];
  return blokken.map((b) => {
    const link = tekstUit(b, 'link') || (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || '';
    const datum = tekstUit(b, 'pubDate') || tekstUit(b, 'published') || tekstUit(b, 'updated');
    const d = datum ? new Date(datum) : null;
    return {
      titel: tekstUit(b, 'title'),
      tekst: (tekstUit(b, 'description') || tekstUit(b, 'summary')).slice(0, 220),
      url: link.trim(),
      bron,
      tijd: d && !isNaN(d) ? d.getTime() : 0,
      datum: d && !isNaN(d) ? d.getDate() + ' ' + MAANDEN[d.getMonth()] : ''
    };
  }).filter((i) => i.titel && i.url);
}

export default async function handler(req, res) {
  const woorden = (feedsConfig.woorden || []).map((w) => w.toLowerCase());
  const raakt = (i) => woorden.some((w) => (i.titel + ' ' + i.tekst).toLowerCase().includes(w));

  const resultaten = await Promise.allSettled(
    (feedsConfig.feeds || []).map(async (f) => {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 4000);
      try {
        const r = await fetch(f.url, { signal: c.signal, headers: { 'user-agent': 'hetgamekompas.nl' } });
        if (!r.ok) return [];
        return itemsUitFeed(await r.text(), f.naam);
      } finally {
        clearTimeout(t);
      }
    })
  );

  const alles = resultaten
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter(raakt)
    .sort((a, b) => b.tijd - a.tijd);

  // dubbele titels eruit
  const gezien = new Set();
  const uniek = alles.filter((i) => {
    const k = i.titel.toLowerCase().slice(0, 50);
    if (gezien.has(k)) return false;
    gezien.add(k);
    return true;
  }).slice(0, 6);

  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.status(200).json({
    bron: uniek.length ? 'feeds' : 'statisch',
    items: uniek.length ? uniek : statisch
  });
}
