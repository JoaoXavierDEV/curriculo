# joaoxavier.dev

Meu site pessoal: links, projetos finalizados do GitHub, experiência e formação, com cara de terminal e arte ASCII.

- **Stack:** Angular 22 (standalone, signals, zoneless), Tailwind 4, [asciify-engine](https://asciify.org) para o fundo do hero, os títulos e o wordmark do rodapé.
- **Projetos:** vêm ao vivo da API do GitHub. Aparecem os repositórios com a topic `finalizado`; sem nenhum, uma lista curada; se a API falhar, um snapshot em `src/app/data/repos.fallback.ts`.
- **Dados pessoais:** tudo em `src/app/data/profile.data.ts`.
- **Arte ASCII:** o banner do nome (FIGlet) e o retrato (asciify-engine) são gerados por `npm run ascii` e salvos em `src/app/data/ascii-art.ts`.

## Rodar

```bash
npm install
npm start          # http://localhost:4200
npx ng test --watch=false
npm run build      # dist/curriculo/browser
```

## Deploy

Push na `main` roda `.github/workflows/azure-static-web-apps.yml`: testes, build e upload para o Azure Static Web Apps (grupo `salome`). O token fica no secret `AZURE_STATIC_WEB_APPS_API_TOKEN`. Cabeçalhos, CSP e fallback de rota ficam em `public/staticwebapp.config.json`.
