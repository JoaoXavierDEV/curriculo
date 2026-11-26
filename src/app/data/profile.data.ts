export interface SocialLink {
  readonly id: string;
  /** Rótulo curto em caixa, usado como "ícone" ASCII, ex.: `[gh]`. */
  readonly tag: string;
  readonly label: string;
  readonly handle: string;
  readonly href: string;
  readonly external: boolean;
}

export interface Role {
  readonly title: string;
  readonly kind: string;
  readonly start: string;
  readonly end: string;
  readonly note?: string;
}

export interface Experience {
  readonly company: string;
  readonly slug: string;
  readonly location: string;
  readonly duration: string;
  readonly current: boolean;
  readonly roles: readonly Role[];
}

export interface Education {
  readonly institution: string;
  readonly course: string;
  readonly start: string;
  readonly end: string;
  readonly file: string;
}

export interface SideProject {
  readonly name: string;
  readonly url: string;
  readonly domain: string;
  readonly description: string;
  readonly art: string;
}

const EMAIL = 'contato@joaoxavier.dev';
const WHATSAPP = '5521980827649';
const WHATSAPP_TEXT = 'Oi, João! Vim pelo joaoxavier.dev';

export const PROFILE = {
  name: 'João Xavier',
  fullName: 'João Fernando Xavier',
  role: 'Dev Full Stack .NET + Angular',
  location: 'Rio de Janeiro, Brasil',
  bio: 'Escrevo C# de dia, Angular de tarde e às vezes coisas estranhas de madrugada, tipo fazer as luzes RGB do PC reagirem ao Claude Code. Pós-graduado em Engenharia de Software pela PUC-Rio.',
  stack: [
    'C#',
    '.NET',
    'ASP.NET Core',
    'Angular',
    'TypeScript',
    'EF Core',
    'SQL Server',
    'PostgreSQL',
    'Python',
    'Azure',
    'Flutter',
  ],
  githubUser: 'JoaoXavierDEV',
  email: EMAIL,
  whatsappDisplay: '+55 (21) 98082-7649',
} as const;

export const LINKS = {
  github: {
    id: 'github',
    tag: 'gh',
    label: 'GitHub',
    handle: '@JoaoXavierDEV',
    href: 'https://github.com/JoaoXavierDEV',
    external: true,
  },
  linkedin: {
    id: 'linkedin',
    tag: 'in',
    label: 'LinkedIn',
    handle: '/in/joaoxavierdev',
    href: 'https://www.linkedin.com/in/joaoxavierdev/',
    external: true,
  },
  instagram: {
    id: 'instagram',
    tag: 'ig',
    label: 'Instagram',
    handle: '@joaoxavier.dev',
    href: 'https://www.instagram.com/joaoxavier.dev/',
    external: true,
  },
  youtube: {
    id: 'youtube',
    tag: 'yt',
    label: 'YouTube',
    handle: 'canal',
    href: 'https://www.youtube.com/channel/UCmuDm5HN4u2LjsbIZ0Tbikw',
    external: true,
  },
  twitch: {
    id: 'twitch',
    tag: 'tv',
    label: 'Twitch',
    handle: '/joaoxavierdev',
    href: 'https://www.twitch.tv/joaoxavierdev',
    external: true,
  },
  email: {
    id: 'email',
    tag: '@',
    label: 'E-mail',
    handle: EMAIL,
    href: `mailto:${EMAIL}`,
    external: false,
  },
  whatsapp: {
    id: 'whatsapp',
    tag: 'wa',
    label: 'WhatsApp',
    handle: '+55 21 98082-7649',
    href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WHATSAPP_TEXT)}`,
    external: true,
  },
  heavycode: {
    id: 'heavycode',
    tag: 'hc',
    label: 'Heavy Code',
    handle: 'heavycode.com.br',
    href: 'https://heavycode.com.br/',
    external: true,
  },
  salome: {
    id: 'salome',
    tag: 'sa',
    label: 'Salomé',
    handle: 'espacosalome.com.br',
    href: 'https://espacosalome.com.br/',
    external: true,
  },
} as const satisfies Record<string, SocialLink>;

export const SOCIALS: readonly SocialLink[] = [
  LINKS.github,
  LINKS.linkedin,
  LINKS.instagram,
  LINKS.youtube,
  LINKS.twitch,
];

export const EXPERIENCE: readonly Experience[] = [
  {
    company: 'NST E-Business',
    slug: 'nst-e-business',
    location: 'Ribeirão Preto/SP · remoto',
    duration: 'desde ago 2025',
    current: true,
    roles: [
      {
        title: 'Desenvolvedor de Software Pleno',
        kind: 'tempo integral',
        start: 'ago 2025',
        end: 'atual',
      },
    ],
  },
  {
    company: 'CMCorp',
    slug: 'cmcorp',
    location: 'Rio de Janeiro/RJ · remoto',
    duration: '3 anos e 6 meses',
    current: false,
    roles: [
      {
        title: 'Desenvolvedor .NET Júnior',
        kind: 'tempo integral',
        start: 'nov 2023',
        end: 'mai 2025',
        note: 'Telerik, Angular e mais 12 competências',
      },
      {
        title: 'Estagiário de Desenvolvimento C#',
        kind: 'estágio',
        start: 'dez 2021',
        end: 'nov 2023',
      },
    ],
  },
];

export const EDUCATION: readonly Education[] = [
  {
    institution: 'PUC-Rio',
    course: 'Pós-Graduação em Engenharia de Software',
    start: 'fev 2025',
    end: 'abr 2026',
    file: 'pos-puc-rio.txt',
  },
  {
    institution: 'Estácio',
    course: 'Bacharelado em Sistemas de Informação',
    start: 'ago 2019',
    end: 'dez 2023',
    file: 'bacharelado-estacio.txt',
  },
  {
    institution: 'Senac RJ',
    course: 'Técnico em Informática',
    start: '2018',
    end: '2019',
    file: 'tecnico-senac.txt',
  },
];

export const SIDE_PROJECTS: readonly SideProject[] = [
  {
    name: 'Heavy Code',
    url: LINKS.heavycode.href,
    domain: LINKS.heavycode.handle,
    description:
      'Minha empresa: software sob medida, integrações e consultoria. É a casa do Salomé.',
    art: String.raw` .------------------.
 | o o o            |
 |------------------|
 | $ heavy --code   |
 | > build ok       |
 | > deploy ok_     |
 '------------------'`,
  },
  {
    name: 'Salomé',
    url: LINKS.salome.href,
    domain: LINKS.salome.handle,
    description:
      'A rede social de salões e barbearias: encontre, compare preços e agende. Para o salão, agenda, equipe e serviços num lugar só.',
    art: String.raw`   .--.
  ( () )__________
   '--'\_________/
   .--./~~~~~~~~~\
  ( () )~~~~~~~~~~
   '--'`,
  },
];
