import { LINKS, SocialLink } from './profile.data';

/** Seções do site que abrem como janela (desktop) ou app (celular). */
export type AppId = 'sobre' | 'projetos' | 'carreira' | 'formacao' | 'contato';

interface IconBase {
  readonly id: string;
  /** Texto curto desenhado dentro do ícone, em ASCII. */
  readonly glyph: string;
  readonly label: string;
}

export interface AppIcon extends IconBase {
  readonly kind: 'app';
  readonly id: AppId;
  /** Nome na barra de título, como um arquivo. */
  readonly file: string;
  /** Tamanho preferido da janela no desktop, em px. */
  readonly size: { readonly w: number; readonly h: number };
}

export interface LinkIcon extends IconBase {
  readonly kind: 'link';
  readonly href: string;
  readonly external: boolean;
}

export type DesktopIcon = AppIcon | LinkIcon;

const link = (glyph: string, source: SocialLink, label = source.label): LinkIcon => ({
  kind: 'link',
  id: source.id,
  glyph,
  label,
  href: source.href,
  external: source.external,
});

export const APPS: readonly AppIcon[] = [
  {
    kind: 'app',
    id: 'sobre',
    glyph: '?_',
    label: 'sobre mim',
    file: 'sobre.txt',
    size: { w: 620, h: 560 },
  },
  {
    kind: 'app',
    id: 'projetos',
    glyph: '>_',
    label: 'projetos',
    file: 'projetos/',
    size: { w: 940, h: 640 },
  },
  {
    kind: 'app',
    id: 'carreira',
    glyph: '{}',
    label: 'experiência',
    file: 'carreira.log',
    size: { w: 700, h: 580 },
  },
  {
    kind: 'app',
    id: 'formacao',
    glyph: '[]',
    label: 'formação',
    file: 'formacao/',
    size: { w: 860, h: 480 },
  },
  {
    kind: 'app',
    id: 'contato',
    glyph: '!',
    label: 'contato',
    file: 'contato.sh',
    size: { w: 680, h: 520 },
  },
];

export const SHORTCUTS: readonly LinkIcon[] = [
  link('gh', LINKS.github),
  link('in', LINKS.linkedin),
  link('ig', LINKS.instagram),
  link('wa', LINKS.whatsapp),
  link('@', LINKS.email),
  link('hc', LINKS.heavycode),
  link('sa', LINKS.salome),
  link('yt', LINKS.youtube),
  link('tv', LINKS.twitch),
];

export const ICONS: readonly DesktopIcon[] = [...APPS, ...SHORTCUTS];

export function isAppId(value: string): value is AppId {
  return APPS.some((app) => app.id === value);
}

export function appById(id: AppId): AppIcon {
  return APPS.find((app) => app.id === id)!;
}
