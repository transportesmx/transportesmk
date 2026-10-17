
const SITE_URL = 'https://www.transportesmx.org';

const pages = [
  { path: '/', priority: '1.0' },
  { path: '/blog', priority: '0.9' },
  { path: '/Privacidad', priority: '0.3' },
  { path: '/Terminos', priority: '0.3' },
];

export async function getServerSideProps({ res }) {
  const urls = pages
    .map(({ path, priority }) => `
      <url>
        <loc>${SITE_URL}${path === '/' ? '' : path}</loc>
        <changefreq>weekly</changefreq>
        <priority>${priority}</priority>
      </url>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
  res.statusCode = 200;
  res.end(xml);

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
