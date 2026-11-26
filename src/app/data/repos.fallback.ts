import { Repo } from '../services/github-repos.service';

/**
 * Repositórios mostrados quando nenhum repo tem a topic `finalizado`
 * ou quando a API do GitHub não responde (limite de 60 req/h por IP).
 * Snapshot de 26/11/2026.
 */
export const FALLBACK_REPOS: readonly Repo[] = [
  {
    name: 'Claude-Color',
    description:
      'Suas luzes RGB mostram o que o Claude Code está fazendo: pensando, aguardando aprovação do plano ou fazendo uma pergunta. Funciona com OpenRGB, iCUE, G HUB, Mystic Light, Tuya e Discord.',
    language: 'C#',
    stars: 3,
    url: 'https://github.com/JoaoXavierDEV/Claude-Color',
    homepage: null,
    updatedAt: '2026-11-20T20:05:53Z',
  },
  {
    name: 'MVP-Mental-Health',
    description:
      'Predição de necessidade de tratamento de saúde mental em profissionais de tecnologia, com um modelo de Machine Learning treinado com dados reais.',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/MVP-Mental-Health',
    homepage: null,
    updatedAt: '2026-04-09T01:34:15Z',
  },
  {
    name: 'RuleKernel-RegraPorTenant',
    description:
      'Regra personalizada por tenant: gera uma DLL com a regra do cliente, buscada no banco e compilada em tempo de execução.',
    language: 'C#',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/RuleKernel-RegraPorTenant',
    homepage: null,
    updatedAt: '2026-02-20T13:00:45Z',
  },
  {
    name: 'Extension4WithVSSDK',
    description:
      'Extensão do Visual Studio que observa a lista de erros e abre uma janela com uma imagem e um som aleatório.',
    language: 'C#',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/Extension4WithVSSDK',
    homepage: null,
    updatedAt: '2026-03-04T23:09:14Z',
  },
  {
    name: 'MVP.PortalEventos.WEB',
    description:
      'Aplicação web (Angular + Angular Material) para gerenciamento e participação em eventos.',
    language: 'TypeScript',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/MVP.PortalEventos.WEB',
    homepage: null,
    updatedAt: '2025-12-22T12:12:02Z',
  },
  {
    name: 'MVP.PortalEventos.API',
    description: 'API REST de eventos e inscrições em Python com FastAPI e SQLAlchemy.',
    language: 'Python',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/MVP.PortalEventos.API',
    homepage: null,
    updatedAt: '2025-12-22T12:12:19Z',
  },
  {
    name: 'ChatSignalR',
    description:
      'Chat em tempo real com presença de usuários usando Angular (standalone + signals) e ASP.NET Core SignalR.',
    language: 'TypeScript',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/ChatSignalR',
    homepage: null,
    updatedAt: '2025-11-20T21:07:09Z',
  },
  {
    name: 'API-CadastroClientes',
    description: 'Teste técnico: Web API com .NET Core, EF In-Memory e DDD.',
    language: 'C#',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/API-CadastroClientes',
    homepage: null,
    updatedAt: '2025-07-08T18:33:11Z',
  },
  {
    name: 'XptoVeiculos',
    description:
      'Teste técnico PUC: manipulação, validação e relatórios de números de série de veículos.',
    language: 'C#',
    stars: 0,
    url: 'https://github.com/JoaoXavierDEV/XptoVeiculos',
    homepage: null,
    updatedAt: '2025-06-16T18:15:58Z',
  },
];

export const FALLBACK_NAMES: ReadonlySet<string> = new Set(FALLBACK_REPOS.map((repo) => repo.name));
