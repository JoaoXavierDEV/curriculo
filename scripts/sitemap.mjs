// Gera dist/curriculo/browser/sitemap.xml a partir das páginas pré-renderizadas.
// Roda sozinho depois do `npm run build` (script postbuild).
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = 'dist/curriculo/browser';
const site = 'https://joaoxavier.dev';
const today = new Date().toISOString().slice(0, 10);

function pages(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pages(path);
    return name === 'index.html' ? [path] : [];
  });
}

const urls = pages(root)
  .map((file) => relative(root, file).split(sep).slice(0, -1).join('/'))
  .filter((path) => path !== 'lixeira' && path !== 'ajustes')
  .map((path) => `${site}/${path}`)
  .sort();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;

writeFileSync(join(root, 'sitemap.xml'), xml);
console.log(`sitemap.xml: ${urls.length} páginas`);
