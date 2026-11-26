import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FALLBACK_REPOS } from '../data/repos.fallback';
import { GithubRepoDto, GithubReposService, selectFinished } from './github-repos.service';

const dto = (name: string, overrides: Partial<GithubRepoDto> = {}): GithubRepoDto => ({
  name,
  description: `desc ${name}`,
  language: 'C#',
  stargazers_count: 1,
  html_url: `https://github.com/JoaoXavierDEV/${name}`,
  homepage: '',
  pushed_at: '2026-01-01T00:00:00Z',
  fork: false,
  archived: false,
  topics: [],
  ...overrides,
});

describe('selectFinished', () => {
  it('usa só os repositórios com a topic finalizado, mais recentes primeiro', () => {
    const list = selectFinished([
      dto('A', { topics: ['finalizado'], pushed_at: '2025-01-01T00:00:00Z' }),
      dto('B'),
      dto('C', { topics: ['finalizado'], pushed_at: '2026-05-01T00:00:00Z' }),
      dto('D', { topics: ['finalizado'], fork: true }),
    ]);
    expect(list.source).toBe('topic');
    expect(list.repos.map((repo) => repo.name)).toEqual(['C', 'A']);
    expect(list.repos[0].homepage).toBeNull();
  });

  it('sem topic, cai para a lista curada com dados da API', () => {
    const list = selectFinished([dto('ChatSignalR', { stargazers_count: 7 }), dto('Outro')]);
    expect(list.source).toBe('curated');
    expect(list.repos).toHaveLength(1);
    expect(list.repos[0].stars).toBe(7);
  });

  it('sem nada aproveitável, usa o snapshot salvo', () => {
    expect(selectFinished([dto('Outro')])).toEqual({ repos: FALLBACK_REPOS, source: 'offline' });
  });
});

describe('GithubReposService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carrega da API e guarda em cache na sessão', async () => {
    const service = TestBed.inject(GithubReposService);
    TestBed.tick();
    http
      .expectOne((req) => req.url.startsWith('https://api.github.com/users/JoaoXavierDEV/repos'))
      .flush([dto('X', { topics: ['finalizado'] })]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(service.list().source).toBe('topic');
    expect(service.list().repos[0].name).toBe('X');
    expect(sessionStorage.getItem('jx.repos.v1')).toContain('"X"');
  });

  it('com erro da API mostra o snapshot salvo', async () => {
    const service = TestBed.inject(GithubReposService);
    TestBed.tick();
    http
      .expectOne((req) => req.url.startsWith('https://api.github.com/'))
      .flush({ message: 'rate limit' }, { status: 403, statusText: 'Forbidden' });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(service.list()).toEqual({ repos: FALLBACK_REPOS, source: 'offline' });
  });
});
