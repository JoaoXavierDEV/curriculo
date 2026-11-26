# joaoxavier.dev

Meu site pessoal: links, projetos finalizados do GitHub, experiência e formação, com cara de terminal e arte ASCII.

- **Desktop (≥ 768 px):** uma área de trabalho de terminal. Cada link é um ícone: seções (sobre, projetos, experiência, formação, contato) abrem janelas que dá para arrastar, minimizar, maximizar e fechar; redes e sites abrem direto em nova aba. A barra de baixo é a taskbar.
- **Celular:** home no estilo Android com apps em tela cheia, "voltar" no topo e integração com o voltar do sistema. Links diretos como `joaoxavier.dev/#projetos` abrem a seção.
- **Stack:** Angular 22 (standalone, signals, zoneless), Tailwind 4, [asciify-engine](https://asciify.org) para o papel de parede ASCII e os títulos.
- **Projetos:** vêm ao vivo da API do GitHub. Aparecem os repositórios com a topic `finalizado`; sem nenhum, uma lista curada; se a API falhar, um snapshot em `src/app/data/repos.fallback.ts`.
- **Dados:** `src/app/data/profile.data.ts` (textos e links) e `src/app/data/apps.ts` (ícones e janelas).

## Rodar

```bash
npm install
npm start          # http://localhost:4200
npx ng test --watch=false
npm run build      # dist/curriculo/browser
```

## Deploy

Push na `main` roda `.github/workflows/azure-static-web-apps.yml`: testes, build e upload para o Azure Static Web Apps (grupo `salome`). O token fica no secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. Cabeçalhos, CSP e fallback de rota ficam em `public/staticwebapp.config.json`.
