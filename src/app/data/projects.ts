import { CASE_STUDIES, caseStudy } from './case-studies';
import { FALLBACK_REPOS } from './repos.fallback';

export interface ProjectMeta {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly image?: string;
}

/** Slug de um repositório: o nome em minúsculas (/projetos/chatsignalr). */
export const repoSlug = (name: string): string => name.toLowerCase();

/** Slugs pré-renderizados: curados primeiro, depois os repositórios conhecidos. */
export const PROJECT_SLUGS: readonly string[] = [
  ...new Set([
    ...CASE_STUDIES.map((study) => study.slug),
    ...FALLBACK_REPOS.map((repo) => repoSlug(repo.name)),
  ]),
];

/** Nome e descrição de um projeto para título, SEO e barra da janela. */
export function projectMeta(slug: string): ProjectMeta {
  const study = caseStudy(slug);
  if (study) {
    return {
      slug: study.slug,
      name: study.name,
      description: study.description,
      image: study.ogImage,
    };
  }
  const repo = FALLBACK_REPOS.find((entry) => repoSlug(entry.name) === slug.toLowerCase());
  return {
    slug,
    name: repo?.name ?? slug,
    description: repo?.description ?? `Projeto ${slug} no GitHub do João Xavier.`,
  };
}
