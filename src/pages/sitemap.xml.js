
const SITE_URL = 'https://www.transportesmx.org';
const SORO_TOKEN = '07d3aead-54ab-43cd-b99d-6791c24828a9';

const STATIC_PAGES = [
  '/',
  '/blog',
  '/reservar',
  '/Privacidad',
  '/Terminos',
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getSoroArticles() {
  const response = await fetch(
    `https://app.trysoro.com/api/embed/${SORO_TOKEN}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Soro respondió con HTTP ${response.status}`);
  }

  const script = await response.text();

  const match = script.match(
    /var\s+SORO_ARTICLES\s*=\s*(\[[\s\S]*?\]);/
  );

  if (!match) {
    throw new Error('No se encontró la lista de artículos de Soro');
  }

  const articles = JSON.parse(match[1]);

  return articles.filter(
    (article) =>
      typeof article.slug === 'string' &&
      article.slug.length > 0
  );
}

export async function getServerSideProps({ res }) {
  const urls = new Set(
    STATIC_PAGES.map((path) => `${SITE_URL}${path}`)
  );

  try {
    const articles = await getSoroArticles();

    for (const article of articles) {
      const url = new URL('/blog', SITE_URL);
      url.searchParams.set('post', article.slug);
      urls.add(url.toString());
    }
  } catch (error) {
    // Mantener disponibles las páginas fijas si Soro falla.
    console.error('Error al generar el sitemap de Soro:', error);
  }

  const entries = [...urls]
    .map(
      (url) => `
  <url>
    <loc>${escapeXml(url)}</loc>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=300, stale-while-revalidate=600'
  );
  res.statusCode = 200;
  res.end(xml);

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
