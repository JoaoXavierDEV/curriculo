import { APPS, AppId, SHORTCUTS } from '../../data/apps';
import { CASE_STUDIES } from '../../data/case-studies';
import { EDUCATION, EXPERIENCE, LINKS, PROFILE } from '../../data/profile.data';
import { CrtMode, WallpaperMode } from '../../services/settings.service';

/** Uma linha de saída. `kind` muda a cor; `href` vira link. */
export interface OutLine {
  readonly text: string;
  readonly kind?: 'ok' | 'err' | 'dim' | 'accent';
  readonly href?: string;
}

/** O que o terminal pede para o "sistema" fazer depois de imprimir. */
export type TermAction =
  | { readonly type: 'open'; readonly app: AppId; readonly slug?: string }
  | { readonly type: 'link'; readonly href: string }
  | { readonly type: 'wallpaper'; readonly value: WallpaperMode }
  | { readonly type: 'crt'; readonly value: CrtMode }
  | { readonly type: 'clear' }
  | { readonly type: 'exit' };

export interface TermResult {
  readonly lines: readonly OutLine[];
  readonly actions: readonly TermAction[];
}

export interface TermContext {
  readonly history: readonly string[];
  /** Repositórios conhecidos (nome → slug), vindos da API do GitHub. */
  readonly projects: readonly { readonly name: string; readonly slug: string }[];
  readonly now: Date;
}

const out = (...lines: (string | OutLine)[]): OutLine[] =>
  lines.map((line) => (typeof line === 'string' ? { text: line } : line));

const result = (lines: OutLine[], actions: TermAction[] = []): TermResult => ({ lines, actions });

/** Arquivos que `ls` mostra e `cat` lê. */
const FILES: Readonly<Record<string, () => OutLine[]>> = {
  'sobre.txt': () =>
    out(
      { text: PROFILE.name, kind: 'accent' },
      PROFILE.role,
      '',
      PROFILE.bio,
      '',
      `local: ${PROFILE.location} · remoto`,
      `stack: ${PROFILE.stack.join(', ')}`,
    ),
  'carreira.log': () =>
    EXPERIENCE.flatMap((job) => [
      { text: `${job.company} — ${job.location}`, kind: 'accent' as const },
      ...job.roles.map((role) => ({ text: `  ${role.start} → ${role.end}  ${role.title}` })),
    ]),
  'contato.sh': () =>
    out(
      '#!/bin/sh',
      { text: `email="${PROFILE.email}"`, href: LINKS.email.href },
      { text: `whatsapp="${PROFILE.whatsappDisplay}"`, href: LINKS.whatsapp.href },
      { text: 'echo "pode chamar, eu respondo"', kind: 'dim' },
    ),
  'formacao/': () =>
    EDUCATION.map((item) => ({
      text: `${item.start} → ${item.end}  ${item.course} · ${item.institution}`,
    })),
};

const HELP: readonly (readonly [string, string])[] = [
  ['help', 'mostra esta ajuda'],
  ['whoami', 'quem sou eu'],
  ['ls', 'lista os arquivos'],
  ['cat <arquivo>', 'lê um arquivo (ex.: cat sobre.txt)'],
  ['open <algo>', 'abre uma janela ou rede (ex.: open projetos, open github)'],
  ['projetos', 'lista os projetos'],
  ['projeto <nome>', 'abre a janela de um projeto (ex.: projeto salome)'],
  ['links', 'minhas redes'],
  ['contato', 'e-mail e WhatsApp'],
  ['neofetch', 'informações do "sistema"'],
  ['matrix <off|ondas|chuva>', 'papel de parede'],
  ['crt <off|sutil|forte>', 'efeito de monitor antigo'],
  ['date · echo · history · clear', 'o de sempre'],
  ['exit', 'fecha o terminal'],
];

const NEOFETCH_LOGO = [
  '      ██╗██╗  ██╗',
  '      ██║╚██╗██╔╝',
  '      ██║ ╚███╔╝ ',
  ' ██   ██║ ██╔██╗ ',
  ' ╚█████╔╝██╔╝ ██╗',
  '  ╚════╝ ╚═╝  ╚═╝',
];

const normalize = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const COMMANDS = [
  'help',
  'whoami',
  'ls',
  'cat',
  'open',
  'projetos',
  'projeto',
  'links',
  'contato',
  'neofetch',
  'matrix',
  'crt',
  'date',
  'echo',
  'history',
  'clear',
  'exit',
  'sudo',
];

/** Opções de Tab conforme o comando: arquivos para cat, janelas/redes para open… */
export function completions(line: string, ctx: TermContext): string[] {
  const [command, ...rest] = line.split(' ');
  if (rest.length === 0) return COMMANDS;
  const projects = [
    ...CASE_STUDIES.map((study) => study.slug),
    ...ctx.projects.map((project) => project.slug),
  ];
  switch (normalize(command)) {
    case 'cat':
      return [...Object.keys(FILES), ...EDUCATION.map((item) => `formacao/${item.file}`)];
    case 'open':
      return [
        ...APPS.filter((app) => app.id !== 'projeto').map((app) => app.id),
        ...SHORTCUTS.map((link) => link.id),
        ...projects,
      ];
    case 'projeto':
      return projects;
    case 'matrix':
      return ['off', 'ondas', 'chuva'];
    case 'crt':
      return ['off', 'sutil', 'forte'];
    case 'sudo':
      return ['hire joao'];
    default:
      return [];
  }
}

/** Completa a última palavra; com várias opções, até o prefixo comum. Null se não houver. */
export function complete(line: string, ctx: TermContext): string | null {
  const parts = line.split(' ');
  const last = (parts.pop() ?? '').toLowerCase();
  if (!last) return null;
  const options = [...new Set(completions(line, ctx))].filter((option) => option.startsWith(last));
  if (options.length === 0) return null;
  if (options.length === 1)
    return [...parts, options[0]].join(' ') + (parts.length === 0 ? ' ' : '');
  let prefix = options[0];
  for (const option of options) {
    while (!option.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix.length > last.length ? [...parts, prefix].join(' ') : null;
}

function openTarget(target: string, ctx: TermContext): TermResult {
  const key = normalize(target);
  if (!key) return result(out({ text: 'uso: open <projetos|carreira|github|...>', kind: 'err' }));

  const app = APPS.find(
    (entry) =>
      entry.id !== 'projeto' &&
      (entry.id === key || normalize(entry.label) === key || normalize(entry.file) === key),
  );
  if (app)
    return result(out({ text: `abrindo ${app.file}…`, kind: 'ok' }), [
      { type: 'open', app: app.id },
    ]);

  const link = SHORTCUTS.find((entry) => entry.id === key || normalize(entry.label) === key);
  if (link)
    return result(out({ text: `abrindo ${link.label}…`, kind: 'ok' }), [
      { type: 'link', href: link.href },
    ]);

  return openProject(key, ctx);
}

function openProject(target: string, ctx: TermContext): TermResult {
  const key = normalize(target);
  const study = CASE_STUDIES.find((entry) => entry.slug === key || normalize(entry.name) === key);
  const project = study
    ? { slug: study.slug, name: study.name }
    : ctx.projects.find((entry) => entry.slug === key || normalize(entry.name) === key);
  if (!project) {
    return result(out({ text: `não achei "${target}". tente: projetos`, kind: 'err' }));
  }
  return result(out({ text: `abrindo projetos/${project.slug}…`, kind: 'ok' }), [
    { type: 'open', app: 'projeto', slug: project.slug },
  ]);
}

/** Interpreta uma linha. Sem efeitos colaterais: as ações voltam para quem chamou. */
export function run(input: string, ctx: TermContext): TermResult {
  const line = input.trim();
  if (!line) return result([]);
  const [rawCommand, ...args] = line.split(/\s+/);
  const command = normalize(rawCommand);
  const arg = args.join(' ');

  switch (command) {
    case 'help':
    case 'ajuda':
      return result([
        { text: 'comandos disponíveis:', kind: 'accent' },
        ...HELP.map(([name, text]) => ({ text: `  ${name.padEnd(30)} ${text}` })),
        { text: 'dica: Tab completa, ↑/↓ navegam no histórico, Ctrl+L limpa.', kind: 'dim' },
      ]);

    case 'whoami':
      return result(
        out(
          `${PROFILE.name.toLowerCase().replace(' ', '.')} — ${PROFILE.role}, ${PROFILE.location}`,
        ),
      );

    case 'ls': {
      const dir = normalize(arg);
      if (dir === 'formacao' || dir === 'formacao/')
        return result(out(...EDUCATION.map((item) => item.file)));
      if (dir === 'projetos' || dir === 'projetos/') return projectsList(ctx);
      return result(out('sobre.txt  carreira.log  contato.sh  formacao/  projetos/  .lixeira/'));
    }

    case 'cat': {
      const key = normalize(arg);
      if (!key) return result(out({ text: 'uso: cat <arquivo>', kind: 'err' }));
      if (key.startsWith('formacao/') && key !== 'formacao/') {
        const item = EDUCATION.find((entry) => `formacao/${entry.file}` === key);
        if (item)
          return result(
            out(
              `${item.course}`,
              `${item.institution} · ${item.start} → ${item.end}`,
              '[✓] concluído',
            ),
          );
      }
      const file = FILES[key] ?? FILES[`${key}/`];
      if (file) return result(file());
      if (key.includes('lixeira'))
        return result(out('cat.gif: arquivo binário. tente: open lixeira'));
      return result(out({ text: `cat: ${arg}: arquivo não encontrado`, kind: 'err' }));
    }

    case 'open':
    case 'abrir':
      return openTarget(arg, ctx);

    case 'projetos':
      return projectsList(ctx);

    case 'projeto':
      return arg ? openProject(arg, ctx) : projectsList(ctx);

    case 'links':
    case 'redes':
      return result(
        SHORTCUTS.map((link) => ({
          text: `  ${link.label.padEnd(12)} ${link.href.replace(/^mailto:/, '')}`,
          href: link.href,
        })),
      );

    case 'contato':
      return result(FILES['contato.sh']());

    case 'neofetch': {
      const years = ctx.now.getFullYear() - 2018;
      const info = [
        `joao@xavier`,
        '-----------',
        'OS: joaoxavier.dev (Angular 22)',
        'Shell: jxsh 1.1',
        `Uptime: ${years} anos programando`,
        `Cargo: ${PROFILE.role}`,
        `Local: ${PROFILE.location}`,
        `Stack: C#, .NET, Angular, Azure`,
        'Café: 3 xícaras/dia',
      ];
      const rows = Math.max(NEOFETCH_LOGO.length, info.length);
      return result(
        Array.from({ length: rows }, (_, index) => ({
          text: `${(NEOFETCH_LOGO[index] ?? '').padEnd(20)}${info[index] ?? ''}`,
          kind: index < NEOFETCH_LOGO.length ? ('accent' as const) : undefined,
        })),
      );
    }

    case 'matrix': {
      const map: Record<string, WallpaperMode> = {
        off: 'off',
        desligado: 'off',
        ondas: 'waves',
        chuva: 'rain',
        on: 'rain',
      };
      const value = map[normalize(arg) || 'on'];
      if (!value) return result(out({ text: 'uso: matrix <off|ondas|chuva>', kind: 'err' }));
      return result(out({ text: `papel de parede: ${normalize(arg) || 'chuva'}`, kind: 'ok' }), [
        { type: 'wallpaper', value },
      ]);
    }

    case 'crt': {
      const map: Record<string, CrtMode> = {
        off: 'off',
        desligado: 'off',
        sutil: 'subtle',
        forte: 'strong',
        on: 'strong',
      };
      const value = map[normalize(arg) || 'on'];
      if (!value) return result(out({ text: 'uso: crt <off|sutil|forte>', kind: 'err' }));
      return result(out({ text: `crt: ${normalize(arg) || 'forte'}`, kind: 'ok' }), [
        { type: 'crt', value },
      ]);
    }

    case 'date':
      return result(
        out(ctx.now.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })),
      );

    case 'echo':
      return result(out(arg));

    case 'history':
      return result(
        ctx.history.map((entry, index) => ({
          text: `  ${String(index + 1).padStart(3)}  ${entry}`,
        })),
      );

    case 'clear':
    case 'cls':
      return result([], [{ type: 'clear' }]);

    case 'exit':
    case 'logout':
      return result(out({ text: 'até mais 👋', kind: 'dim' }), [{ type: 'exit' }]);

    case 'sudo': {
      if (normalize(arg) === 'hire joao' || normalize(arg) === 'contratar joao') {
        return result(
          out(
            { text: '[sudo] senha para recrutador: ********', kind: 'dim' },
            { text: 'verificando currículo… ok', kind: 'ok' },
            { text: 'verificando projetos… ok', kind: 'ok' },
            { text: 'permissão concedida. abrindo contato.sh', kind: 'accent' },
          ),
          [{ type: 'open', app: 'contato' }],
        );
      }
      return result(
        out({
          text: 'joao não está no arquivo sudoers. este incidente será reportado. 🙂',
          kind: 'err',
        }),
      );
    }

    case 'rm':
      if (/-rf?\s*\/|\*/.test(arg)) {
        return result(
          out({ text: 'rm: nem pensar. mas tem um gato na lixeira, se quiser: oiia', kind: 'err' }),
        );
      }
      return result(out({ text: 'rm: aqui só leitura', kind: 'err' }));

    case 'oiia':
    case 'cat.gif':
      return result(out({ text: 'oiia oiia 🐈', kind: 'accent' }), [
        { type: 'open', app: 'lixeira' },
      ]);

    case 'pwd':
      return result(out('/home/joao'));

    default:
      return result(
        out({ text: `comando não encontrado: ${rawCommand} — digite help`, kind: 'err' }),
      );
  }
}

function projectsList(ctx: TermContext): TermResult {
  const curated = CASE_STUDIES.map((study) => ({
    text: `  ${study.slug.padEnd(28)} ${study.private ? '(privado) ' : ''}${study.tagline}`,
    kind: 'accent' as const,
  }));
  const others = ctx.projects
    .filter((project) => !CASE_STUDIES.some((study) => study.slug === project.slug))
    .map((project) => ({ text: `  ${project.slug}` }));
  return result([...curated, ...others, { text: 'abra com: projeto <nome>', kind: 'dim' }]);
}
