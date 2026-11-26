import { RenderMode, ServerRoute } from '@angular/ssr';
import { PROJECT_SLUGS, repoSlug } from './data/projects';
import { PROFILE } from './data/profile.data';

/** Repositórios com a topic `finalizado` no momento do build (se a API responder). */
async function liveSlugs(): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${PROFILE.githubUser}/repos?per_page=100`,
      { headers: { Accept: 'application/vnd.github+json' } },
    );
    if (!response.ok) return [];
    const repos = (await response.json()) as { name: string; topics?: string[]; fork: boolean }[];
    return repos
      .filter((repo) => !repo.fork && repo.topics?.includes('finalizado'))
      .map((repo) => repoSlug(repo.name));
  } catch {
    return [];
  }
}

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projetos/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      [...new Set([...PROJECT_SLUGS, ...(await liveSlugs())])].map((slug) => ({ slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
