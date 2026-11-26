// Gera os assets ASCII estáticos usados no site (banner do nome e retrato).
// Antes, rode `python -I scripts/prepare-portrait.py` se o avatar mudar.
// Rodar com: npm run ascii
// O resultado é commitado em src/app/data/ascii-art.ts, então o build não depende deste script.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const figlet = require('figlet');

const trimRight = (text) =>
  text
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line, index, lines) => line.length > 0 || index < lines.length - 1)
    .join('\n')
    .replace(/\n+$/, '');

const first = trimRight(figlet.textSync('JOAO', { font: 'ANSI Shadow' }));
const last = trimRight(figlet.textSync('XAVIER', { font: 'ANSI Shadow' }));

// O FIGlet não tem "Ã": desenha o til sobre o A (colunas 18–25 em ANSI Shadow).
const tilde = ' '.repeat(19) + '▄▀▀▄▄▀';
const banner = `${tilde}\n${first}\n${last}`;

// Retrato: SVG com a cor de cada caractere vinda da imagem tingida.
execFileSync(
  'npx',
  [
    'asciify-engine',
    'scripts/portrait-source.png',
    '-o',
    'public/portrait.svg',
    '-w',
    '96',
    '--mode',
    'shape',
    '--color',
    '--background',
    'transparent',
  ],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);

const toLiteral = (text) =>
  '`' + text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';

const file = `// Arquivo gerado por scripts/generate-ascii.mjs. Não editar à mão.

/** "JOÃO XAVIER" em FIGlet (fonte ANSI Shadow). */
export const NAME_BANNER = ${toLiteral(banner)};
`;

writeFileSync('src/app/data/ascii-art.ts', file);
console.log(banner);
