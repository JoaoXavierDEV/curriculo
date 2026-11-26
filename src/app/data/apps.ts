import { IconKey } from '../os/icons';
import { LINKS, SocialLink } from './profile.data';

/** Seções do site que abrem como janela (desktop) ou app (celular). */
export type AppId =
  'sobre' | 'projetos' | 'carreira' | 'formacao' | 'contato' | 'lixeira' | 'config';

interface IconBase {
  readonly id: string;
  readonly icon: IconKey;
  readonly label: string;
}

export interface AppIcon extends IconBase {
  readonly kind: 'app';
  readonly id: AppId;
  /** Nome na barra de título, como um arquivo. */
  readonly file: string;
  /** Tamanho preferido da janela no desktop, em px (limitado à tela). */
  readonly size: { readonly w: number; readonly h: number };
  /** Abre no centro da área de trabalho em vez de em cascata. */
  readonly center?: boolean;
}

export interface LinkIcon extends IconBase {
  readonly kind: 'link';
  readonly href: string;
  readonly external: boolean;
}

export type DesktopIcon = AppIcon | LinkIcon;

const link = (icon: IconKey, source: SocialLink): LinkIcon => ({
  kind: 'link',
  id: source.id,
  icon,
  label: source.label,
  href: source.href,
  external: source.external,
});

export const APPS: readonly AppIcon[] = [
  {
    kind: 'app',
    id: 'sobre',
    icon: 'document',
    label: 'sobre.txt',
    file: 'sobre.txt',
    size: { w: 1251, h: 734 },
    center: true,
  },
  {
    kind: 'app',
    id: 'projetos',
    icon: 'folder',
    label: 'projetos',
    file: 'projetos/',
    size: { w: 940, h: 640 },
  },
  {
    kind: 'app',
    id: 'carreira',
    icon: 'briefcase',
    label: 'experiência',
    file: 'carreira.log',
    size: { w: 700, h: 580 },
  },
  {
    kind: 'app',
    id: 'formacao',
    icon: 'graduation',
    label: 'formação',
    file: 'formacao/',
    size: { w: 860, h: 480 },
  },
  {
    kind: 'app',
    id: 'contato',
    icon: 'terminal',
    label: 'contato.sh',
    file: 'contato.sh',
    size: { w: 680, h: 520 },
  },
  {
    kind: 'app',
    id: 'lixeira',
    icon: 'trash',
    label: 'lixeira',
    file: 'lixeira/cat.gif',
    size: { w: 440, h: 500 },
  },
  {
    kind: 'app',
    id: 'config',
    icon: 'settings',
    label: 'ajustes',
    file: 'config.ini',
    size: { w: 460, h: 600 },
  },
];

/** Atalhos: ficam à esquerda do desktop e abrem o link em nova aba. */
export const SHORTCUTS: readonly LinkIcon[] = [
  link('github', LINKS.github),
  link('linkedin', LINKS.linkedin),
  link('instagram', LINKS.instagram),
  link('whatsapp', LINKS.whatsapp),
  link('email', LINKS.email),
  link('heavycode', LINKS.heavycode),
  link('salome', LINKS.salome),
  link('youtube', LINKS.youtube),
  link('twitch', LINKS.twitch),
];

const app = (id: AppId): AppIcon => APPS.find((entry) => entry.id === id)!;

/** Ícones de seção no desktop (à direita); a lixeira fica sozinha no canto. */
export const DESKTOP_APPS: readonly AppIcon[] = [
  'sobre',
  'projetos',
  'carreira',
  'formacao',
  'contato',
].map((id) => app(id as AppId));
export const TRASH: AppIcon = app('lixeira');

/** Home do celular: seções, atalhos e, no fim, configurações e lixeira. */
export const PHONE_ICONS: readonly DesktopIcon[] = [
  ...DESKTOP_APPS,
  ...SHORTCUTS,
  app('config'),
  TRASH,
];

export function isAppId(value: string): value is AppId {
  return APPS.some((entry) => entry.id === value);
}

export function appById(id: AppId): AppIcon {
  return app(id);
}
