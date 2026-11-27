import { IconKey } from '../os/icons';
import { LINKS, SocialLink } from './profile.data';

/** Seções do site que abrem como janela (desktop) ou app (celular). */
export type AppId =
  | 'sobre'
  | 'projetos'
  | 'projeto'
  | 'carreira'
  | 'formacao'
  | 'contato'
  | 'terminal'
  | 'lixeira'
  | 'config';

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
  /** Caminho da página (sem barra). `projeto` usa `projetos/:slug`. */
  readonly route: string;
  /** Título e descrição da página pré-renderizada (SEO e prévia de link). */
  readonly seo: { readonly title: string; readonly description: string };
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
    route: 'sobre',
    seo: {
      title: 'Sobre mim',
      description:
        'Quem é o João Xavier: dev full stack .NET + Angular no Rio de Janeiro, pós-graduado em Engenharia de Software pela PUC-Rio.',
    },
    center: true,
  },
  {
    kind: 'app',
    id: 'projetos',
    icon: 'folder',
    label: 'projetos',
    file: 'projetos/',
    size: { w: 940, h: 640 },
    route: 'projetos',
    seo: {
      title: 'Projetos',
      description:
        'Projetos finalizados do João Xavier: o Salomé, Claude-Color e outros repositórios em C#, Angular e Python.',
    },
  },
  {
    kind: 'app',
    id: 'carreira',
    icon: 'briefcase',
    label: 'experiência',
    file: 'carreira.log',
    size: { w: 564, h: 722 },
    route: 'carreira',
    seo: {
      title: 'Experiência',
      description:
        'Experiência profissional do João Xavier: NST E-Business e CMCorp, com .NET, C# e Angular.',
    },
  },
  {
    kind: 'app',
    id: 'formacao',
    icon: 'graduation',
    label: 'formação',
    file: 'formacao/',
    size: { w: 960, h: 560 },
    route: 'formacao',
    seo: {
      title: 'Formação acadêmica',
      description:
        'Formação do João Xavier: pós em Engenharia de Software (PUC-Rio), Sistemas de Informação (Estácio) e técnico (Senac RJ).',
    },
  },
  {
    kind: 'app',
    id: 'contato',
    icon: 'contact',
    label: 'contato.sh',
    file: 'contato.sh',
    size: { w: 1106, h: 500 },
    route: 'contato',
    seo: {
      title: 'Contato',
      description: 'Fale com o João Xavier por e-mail ou WhatsApp.',
    },
  },
  {
    kind: 'app',
    id: 'terminal',
    icon: 'terminal',
    label: 'terminal',
    file: 'bash — joao@xavier',
    size: { w: 760, h: 480 },
    route: 'terminal',
    seo: {
      title: 'Terminal',
      description:
        'Um terminal de verdade no site do João Xavier: digite help, neofetch ou sudo hire joao.',
    },
  },
  {
    kind: 'app',
    id: 'projeto',
    icon: 'document',
    label: 'projeto',
    file: 'projetos/',
    size: { w: 1100, h: 760 },
    center: true,
    route: 'projetos/:slug',
    seo: {
      title: 'Projeto',
      description: 'Detalhes de um projeto do João Xavier.',
    },
  },
  {
    kind: 'app',
    id: 'lixeira',
    icon: 'trash',
    label: 'lixeira',
    file: 'lixeira/cat.gif',
    size: { w: 463, h: 622 },
    route: 'lixeira',
    seo: {
      title: 'Lixeira',
      description: 'Tem um gato na lixeira.',
    },
  },
  {
    kind: 'app',
    id: 'config',
    icon: 'settings',
    label: 'ajustes',
    file: 'config.ini',
    size: { w: 460, h: 600 },
    route: 'ajustes',
    seo: {
      title: 'Ajustes',
      description: 'Configurações visuais do joaoxavier.dev: efeito matrix, CRT e ícones.',
    },
  },
];

/** Atalhos: ficam à direita do desktop e abrem o link em nova aba. */
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

/** Ícones de seção no desktop (à esquerda); a lixeira fica no canto de baixo. */
export const DESKTOP_APPS: readonly AppIcon[] = [
  'sobre',
  'projetos',
  'carreira',
  'formacao',
  'contato',
  'terminal',
].map((id) => app(id as AppId));
export const TRASH: AppIcon = app('lixeira');

/** Dock do celular: as seções principais do currículo, sempre à mão. */
export const PHONE_DOCK: readonly AppIcon[] = ['sobre', 'projetos', 'carreira', 'contato'].map(
  (id) => app(id as AppId),
);

/** Pasta da home do celular: um ícone que abre um popup com outros ícones. */
export interface PhoneFolder {
  readonly kind: 'folder';
  readonly id: string;
  readonly label: string;
  readonly icons: readonly LinkIcon[];
}

export type PhoneItem = DesktopIcon | PhoneFolder;

/** Home do celular: apps, GitHub, pasta de redes sociais e demais atalhos. */
export const PHONE_HOME: readonly PhoneItem[] = [
  app('terminal'),
  app('formacao'),
  link('github', LINKS.github),
  {
    kind: 'folder',
    id: 'redes',
    label: 'Redes sociais',
    icons: [
      link('linkedin', LINKS.linkedin),
      link('email', LINKS.email),
      link('youtube', LINKS.youtube),
      link('twitch', LINKS.twitch),
    ],
  },
  link('whatsapp', LINKS.whatsapp),
  link('instagram', LINKS.instagram),
  link('heavycode', LINKS.heavycode),
  link('salome', LINKS.salome),
  app('config'),
  TRASH,
];

export function isAppId(value: string): value is AppId {
  return APPS.some((entry) => entry.id === value);
}

export function appById(id: AppId): AppIcon {
  return app(id);
}
