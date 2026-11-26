// Gera os assets ASCII estáticos usados no site (banner do nome e retrato).
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

const portrait = trimRight(
  execFileSync(
    'npx',
    [
      'asciify-engine',
      'public/avatar.jpg',
      '-f',
      'text',
      '-w',
      '42',
      '--cell-aspect',
      '2.1',
      '--crop',
      '0.33,0.03,0.46,0.7',
      '--contrast',
      '1.3',
      '--no-color',
    ],
    { encoding: 'utf8', shell: process.platform === 'win32' },
  ),
);

const toLiteral = (text) =>
  '`' + text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';

const file = `// Arquivo gerado por scripts/generate-ascii.mjs. Não editar à mão.

/** "JOÃO XAVIER" em FIGlet (fonte ANSI Shadow). */
export const NAME_BANNER = ${toLiteral(banner)};

/** Retrato do avatar do GitHub convertido com asciify-engine (modo shape). */
export const PORTRAIT = ${toLiteral(portrait)};
`;

writeFileSync('src/app/data/ascii-art.ts', file);
console.log(banner);
console.log(portrait);
