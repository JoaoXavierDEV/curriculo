import { HttpClient } from '@angular/common/http';
import { Service, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, map, of, tap } from 'rxjs';
import { FALLBACK_NAMES, FALLBACK_REPOS } from '../data/repos.fallback';
import { PROFILE } from '../data/profile.data';

export interface Repo {
  readonly name: string;
  readonly description: string | null;
  readonly language: string | null;
  readonly stars: number;
  readonly url: string;
  readonly homepage: string | null;
  readonly updatedAt: string;
}

/** Campos da resposta de `GET /users/{user}/repos` que o site usa. */
export interface GithubRepoDto {
  readonly name: string;
  readonly description: string | null;
  readonly language: string | null;
  readonly stargazers_count: number;
  readonly html_url: string;
  readonly homepage: string | null;
  readonly pushed_at: string;
  readonly fork: boolean;
  readonly archived: boolean;
  readonly topics?: readonly string[];
}

export type RepoSource = 'topic' | 'curated' | 'offline';

export interface RepoList {
  readonly repos: readonly Repo[];
  readonly source: RepoSource;
}

export const FINISHED_TOPIC = 'finalizado';
const CACHE_KEY = 'jx.repos.v1';
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Escolhe os repositórios "finalizados": os que têm a topic `finalizado`;
 * se nenhum tiver, os da lista curada, com dados atualizados da API.
 */
export function selectFinished(dtos: readonly GithubRepoDto[]): RepoList {
  const candidates = dtos.filter((dto) => !dto.fork && !dto.archived);
  const tagged = candidates.filter((dto) => dto.topics?.includes(FINISHED_TOPIC));
  const chosen =
    tagged.length > 0 ? tagged : candidates.filter((dto) => FALLBACK_NAMES.has(dto.name));

  if (chosen.length === 0) {
    return { repos: FALLBACK_REPOS, source: 'offline' };
  }

  const repos = chosen
    .map((dto): Repo => ({
      name: dto.name,
      description: dto.description,
      language: dto.language,
      stars: dto.stargazers_count,
      url: dto.html_url,
      homepage: dto.homepage || null,
      updatedAt: dto.pushed_at,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return { repos, source: tagged.length > 0 ? 'topic' : 'curated' };
}

@Service()
export class GithubReposService {
  private readonly http = inject(HttpClient);

  private readonly resource = rxResource<RepoList, void>({
    stream: () => this.load(),
    defaultValue: { repos: [], source: 'offline' },
  });

  readonly loading = this.resource.isLoading;

  /** Em caso de erro (rede, limite da API) cai para o snapshot estático. */
  readonly list = computed<RepoList>(() =>
    this.resource.error() ? { repos: FALLBACK_REPOS, source: 'offline' } : this.resource.value(),
  );

  private load(): Observable<RepoList> {
    const cached = this.readCache();
    if (cached) {
      return of(cached);
    }

    const url = `https://api.github.com/users/${PROFILE.githubUser}/repos?per_page=100&sort=pushed`;
    return this.http
      .get<GithubRepoDto[]>(url, { headers: { Accept: 'application/vnd.github+json' } })
      .pipe(
        map(selectFinished),
        tap((list) => this.writeCache(list)),
      );
  }

  private readCache(): RepoList | null {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { at, list } = JSON.parse(raw) as { at: number; list: RepoList };
      return Date.now() - at < CACHE_TTL_MS ? list : null;
    } catch {
      return null;
    }
  }

  private writeCache(list: RepoList): void {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), list }));
    } catch {
      // Armazenamento indisponível (modo privado): segue sem cache.
    }
  }
}
