/**
 * Projetos com texto escrito à mão (as janelas de /projetos/:slug).
 * Os demais repositórios abrem o README renderizado pelo GitHub.
 */

export interface CaseSection {
  readonly title: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
  /** Diagrama em ASCII; `diagramLabel` descreve o desenho para leitores de tela. */
  readonly diagram?: string;
  readonly diagramLabel?: string;
}

export interface CaseImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption: string;
}

export interface CaseLink {
  readonly label: string;
  readonly href: string;
}

export interface CaseStudy {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  /** Descrição curta para SEO e prévia de link. */
  readonly description: string;
  readonly role: string;
  readonly period: string;
  readonly status: string;
  readonly private: boolean;
  readonly stack: readonly string[];
  readonly links: readonly CaseLink[];
  readonly sections: readonly CaseSection[];
  readonly gallery: readonly CaseImage[];
  readonly learnings: readonly string[];
  /** Imagem de prévia de link (og:image), relativa ao site. */
  readonly ogImage?: string;
}

const SALOME_DIAGRAM = String.raw`
 dev ──push──> GitHub Actions ──> staging (beta) ──"promover"──> produção
               └─ migra os bancos > só publica se migrar > swap blue-green

┌───────────────────────────────── Azure ──────────────────────────────────┐
│                                                                          │
│ Static Web Apps        App Service               Azure Functions         │
│ ┌────────────────┐      ┌───────────────────┐     ┌────────────────┐     │
│ │ portal Angular │─────>│ API .NET 10       │     │ 13 timers      │     │
│ │ (PWA)          │HTTPS │ slots: staging    │     │ + migração     │     │
│ │                │      │   <-> produção    │     │   no deploy    │     │
│ └────────────────┘      └─────────┬─────────┘     └───────┬────────┘     │
│                                   v                       v              │
│                   ┌─────────────────────────────────────────────┐        │
│                   │ PostgreSQL                                  │        │
│                   │   central: contas, planos, busca (PostGIS)  │        │
│                   │   + 1 banco por salão ──outbox──> central   │        │
│                   └─────────────────────────────────────────────┘        │
│                                                                          │
│ Blob (imagens) · Communication Services (e-mail) + Event Grid            │
│ Notification Hubs (push) · Application Insights (OpenTelemetry)          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
 externos: Mercado Pago · Google (login, mapas) · Cloudflare (DNS, Turnstile)
           WhatsApp Cloud API · NFS-e (Emissor Nacional) · IBGE · ViaCEP

 clientes: app Flutter (Android) · portal web
`;

export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: 'salome',
    name: 'Salomé',
    tagline:
      'A rede social de salões e barbearias: o cliente encontra e agenda; o salão gere tudo num lugar só.',
    description:
      'Salomé: SaaS multi-tenant para salões e barbearias, com .NET 10, Angular, Flutter, Azure Functions, PostgreSQL por salão, Mercado Pago e notificações.',
    role: 'Criador · arquitetura, backend, web e mobile',
    period: '2025 — agora',
    status: 'em produção',
    private: true,
    stack: [
      '.NET 10',
      'ASP.NET Core',
      'EF Core',
      'PostgreSQL',
      'PostGIS',
      'Azure Functions',
      'Angular 21',
      'Flutter',
      'Tailwind',
      'Mercado Pago',
      'OpenTelemetry',
      'GitHub Actions',
    ],
    links: [
      { label: 'espacosalome.com.br', href: 'https://espacosalome.com.br/' },
      { label: 'Heavy Code', href: 'https://heavycode.com.br/' },
    ],
    sections: [
      {
        title: 'o que é',
        paragraphs: [
          'Para quem procura: encontrar salões e barbearias perto, comparar serviços e preços, agendar e pagar pelo app ou pelo site.',
          'Para o salão: agenda, equipe e comissões, clientes e anamnese, catálogo de serviços, financeiro, fidelidade, avaliações, portfólio de fotos, relatórios e nota fiscal. Tudo multi-unidade e com permissões por cargo.',
          'O código é privado. Aqui está o desenho da solução, que é a parte de que mais me orgulho.',
        ],
      },
      {
        title: 'arquitetura',
        paragraphs: [
          'Dois ambientes no Azure. Cada push vai para o staging (beta); um botão promove para produção. O deploy migra os bancos antes e só publica a API se a migração passar, e a troca de versão é um swap blue-green entre slots, com caminho de volta.',
        ],
        diagram: SALOME_DIAGRAM,
        diagramLabel:
          'Diagrama da arquitetura: GitHub Actions publica no staging e promove para produção. O portal Angular fica no Static Web Apps e chama a API .NET 10 no App Service, que tem slots staging e produção. Azure Functions roda os timers. Ambos usam PostgreSQL, com um banco central e um banco por salão sincronizados por outbox. Serviços compartilhados: Blob, Communication Services com Event Grid, Notification Hubs e Application Insights. Externos: Mercado Pago, Google, Cloudflare, WhatsApp Cloud API, NFS-e, IBGE e ViaCEP. Clientes: app Flutter e portal web.',
      },
      {
        title: 'backend .NET 10',
        bullets: [
          'Camadas no estilo Clean/DDD: domínio, aplicação (casos de uso), motor de regras, infraestrutura e apresentação (API e Functions compartilham a mesma composição).',
          'Multi-tenant de verdade: um banco PostgreSQL por salão, criado por provisionamento assíncrono. Um banco central guarda contas, planos e o índice de busca, alimentado por uma outbox de cada salão.',
          'Motor de regras: regras por salão em C#, guardadas no banco e compiladas em runtime com Roslyn, com cache do assembly.',
          'Result pattern com mensagens localizadas, FluentValidation e auditoria de alterações via interceptor do EF Core.',
          'Segurança: ASP.NET Identity, JWT com sessão de refresh em cookie, 2FA por TOTP, login com Google, Cloudflare Turnstile e rate limiting por rota.',
          'Observabilidade com OpenTelemetry no Application Insights, com filtros para controlar custo de telemetria.',
          'Relatórios em PDF (renderizados com Playwright), CSV e XLSX.',
        ],
      },
      {
        title: 'azure functions',
        paragraphs: [
          'O trabalho que não pode travar uma requisição fica em Functions (isolated, .NET 10), quase tudo em timers. Cada execução usa advisory locks no Postgres para não rodar duas vezes em instâncias diferentes e registra um "sinal de vida" que aparece no painel da plataforma.',
        ],
        bullets: [
          'Provisionamento de banco para cada salão novo e migração de todos os bancos no deploy.',
          'Filas de e-mail e de WhatsApp, publicação de notificações agendadas e lembretes.',
          'Sincronização das outboxes dos salões com o banco central.',
          'Pagamentos: conciliação com o Mercado Pago, liberação de reservas não pagas, taxa da plataforma e faturamento dos planos.',
          'Feriados: fecha a agenda e avisa o dono do salão.',
          'LGPD: expurgo de sessões vencidas e de fotos cuja divulgação foi revogada.',
        ],
      },
      {
        title: 'notificações',
        bullets: [
          'Toda notificação é gravada primeiro (existe uma central de notificações no app) e um timer publica nos canais quando chega a hora.',
          'Push no app Android via Notification Hubs / Firebase Cloud Messaging.',
          'E-mail transacional com Azure Communication Services, fila com chave de idempotência e status de entrega recebido pelo Event Grid.',
          'WhatsApp pela Cloud API da Meta, com agendamento via WhatsApp Flows (em implantação).',
        ],
      },
      {
        title: 'integrações',
        bullets: [
          'Mercado Pago no modelo marketplace: cada salão conecta a própria conta por OAuth, o cliente paga com Pix ou cartão e a taxa da plataforma é descontada na hora.',
          'Google: login e geocodificação dos endereços; PostGIS faz a busca de salões por raio.',
          'NFS-e pelo Emissor Nacional, atrás de uma interface de provedor (em homologação).',
          'Catálogos públicos: municípios do IBGE, feriados e CEP via ViaCEP.',
          'Cloudflare na frente: DNS e Turnstile contra robôs.',
        ],
      },
      {
        title: 'angular e flutter',
        bullets: [
          'Portal Angular 21 com signals, Tailwind 4 e PWA: landing pública, área do salão (gestão) e área da plataforma (super-admin: salões, planos, catálogo, feriados e diagnóstico das Functions).',
          'App Flutter para Android: busca e agendamento para clientes, gestão para o salão, cache offline, push, QR code, login com Google. Estado com provider e navegação com go_router.',
        ],
      },
      {
        title: 'qualidade e processo',
        bullets: [
          'Testes de unidade e de integração com PostgreSQL de verdade (criando e apagando bancos de salão), testes do motor de regras, Vitest no portal, testes no Flutter e E2E com Playwright num ambiente isolado com dados de demonstração.',
          'Desenvolvimento guiado por specs: mais de 70 especificações com requisitos, critérios de aceite e plano técnico.',
          'IA no fluxo: subagentes revisores especializados (multi-tenant, migrations, LGPD) e skills próprias para relatórios e testes.',
        ],
      },
    ],
    gallery: [
      {
        src: '/projetos/salome/landing.webp',
        width: 1200,
        height: 750,
        alt: 'Página inicial do Salomé dividida em barbearia (azul) e salão de beleza (rosa)',
        caption: 'landing: barbearias e salões',
      },
      {
        src: '/projetos/salome/app-inicio.webp',
        width: 540,
        height: 1170,
        alt: 'App Flutter: tela inicial com opções explorar, agendar e cadastrar salão',
        caption: 'app: boas-vindas',
      },
      {
        src: '/projetos/salome/app-portais.webp',
        width: 540,
        height: 1170,
        alt: 'App Flutter: escolha entre o portal do usuário e o portal da empresa',
        caption: 'app: um login, dois portais',
      },
      {
        src: '/projetos/salome/app-salao.webp',
        width: 540,
        height: 1170,
        alt: 'App Flutter: painel do salão com agendamentos do dia, receita e clientes',
        caption: 'app: painel do salão',
      },
      {
        src: '/projetos/salome/app-cliente.webp',
        width: 540,
        height: 1170,
        alt: 'App Flutter: início do cliente com próximo atendimento e serviços bem avaliados',
        caption: 'app: área do cliente',
      },
      {
        src: '/projetos/salome/portal-showcase-azul.webp',
        width: 1200,
        height: 667,
        alt: 'Portal Angular: página de showcase do design system no tema azul',
        caption: 'portal: design system (tema azul)',
      },
      {
        src: '/projetos/salome/portal-showcase-rosa.webp',
        width: 1200,
        height: 667,
        alt: 'Portal Angular: a mesma página de showcase no tema rosa',
        caption: 'portal: o mesmo componente, tema rosa',
      },
    ],
    learnings: [
      'Banco por tenant dá isolamento e tranquilidade com LGPD, mas exige pensar desde o início em provisionamento, migração em lote e sincronização com o central.',
      'Migrar antes de publicar e manter migrations compatíveis com a versão anterior tornou o deploy um não-evento.',
      'Timers simples com locks no Postgres resolveram o que eu achava que precisaria de uma fila dedicada.',
    ],
    ogImage: '/projetos/salome/og.png',
  },
  {
    slug: 'claude-color',
    name: 'Claude-Color',
    tagline: 'As luzes RGB do PC mostram o que o Claude Code está fazendo.',
    description:
      'Claude-Color: app .NET 10 para Windows que acende as luzes RGB, notifica e atualiza o Discord conforme os hooks do Claude Code.',
    role: 'Autor',
    period: '2026',
    status: 'publicado no GitHub',
    private: false,
    stack: ['.NET 10', 'Windows Forms', 'OpenRGB', 'Tuya', 'Discord RPC', 'Claude Code hooks'],
    links: [
      { label: 'repositório no GitHub', href: 'https://github.com/JoaoXavierDEV/Claude-Color' },
    ],
    sections: [
      {
        title: 'o que é',
        paragraphs: [
          'Quando o Claude Code faz uma pergunta, pede permissão ou espera a aprovação de um plano, as luzes piscam; quando termina, ficam verdes. Dá para fazer outra coisa e saber, de longe, quando ele precisa de você.',
          'É um único executável na bandeja do sistema. Ao fim do sinal, cada dispositivo volta ao modo e às cores que tinha antes.',
        ],
      },
      {
        title: 'como funciona',
        bullets: [
          'O app instala hooks no settings.json do Claude Code (com backup e sem mexer nos hooks de outras ferramentas): PreToolUse, Notification, Stop, UserPromptSubmit, PostToolUse, SessionStart e SessionEnd.',
          'Cada evento tem cor, brilho, piscadas e duração configuráveis, e pode durar "até você agir".',
          'Sem RGB também funciona: notificação do Windows com o nome do projeto e o botão do terminal piscando na barra de tarefas.',
          'Discord Rich Presence: "Jogando Claude Code · Aguardando você: pergunta", com modelo, tempo e tokens lidos do transcript.',
        ],
      },
      {
        title: 'integrações',
        bullets: [
          'OpenRGB: placa-mãe, memória, placa de vídeo, fans, fitas ARGB e periféricos de vários fabricantes.',
          'Lâmpadas Wi-Fi Tuya / Smart Life / Elgin Smart pela rede local, sem nuvem.',
          'Nativas e opcionais: Corsair iCUE, Logitech G HUB, MSI Mystic Light e a iluminação dinâmica do Windows 11 (experimental).',
        ],
      },
    ],
    gallery: [
      {
        src: '/projetos/claude-color/sinais.png',
        width: 1180,
        height: 780,
        alt: 'Tela Sinais do Claude-Color com a cor de cada evento do Claude Code',
        caption: 'página Sinais: uma cor por evento',
      },
      {
        src: '/projetos/claude-color/discord.png',
        width: 1180,
        height: 780,
        alt: 'Página Discord do Claude-Color com a prévia do status no perfil',
        caption: 'status no Discord',
      },
    ],
    learnings: [
      'Hooks do Claude Code são uma API de eventos simples e poderosa para integrar com o mundo físico.',
      'Restaurar o estado anterior de cada dispositivo é o que separa um brinquedo de uma ferramenta usável no dia a dia.',
    ],
  },
];

export function caseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug.toLowerCase());
}
