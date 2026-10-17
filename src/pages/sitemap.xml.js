
const SITE_URL = 'https://www.transportesmx.org';

const pages = [
  '/',
  '/blog',
  '/Privacidad',
  '/Terminos',
  '/reservar',
];

export async function getServerSideProps({ res }) {
  const urls = pages
    .map(
      (page) => `
        <url>
          <loc>${SITE_URL}${page}</loc>
        </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}

