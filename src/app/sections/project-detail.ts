import { NgOptimizedImage, DOCUMENT } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { caseStudy } from '../data/case-studies';
import { PROFILE } from '../data/profile.data';
import { projectMeta, repoSlug } from '../data/projects';
import { FALLBACK_REPOS } from '../data/repos.fallback';
import { GithubReposService } from '../services/github-repos.service';
import { WindowManager } from '../services/window-manager.service';

/**
 * Janela de um projeto (/projetos/:slug). Projetos curados (case-studies.ts)
 * mostram o texto escrito à mão; os demais, o README renderizado pelo GitHub.
 */
@Component({
  selector: 'app-project-detail',
  imports: [NgOptimizedImage],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {
  private readonly wm = inject(WindowManager);
  private readonly repos = inject(GithubReposService);
  private readonly document = inject(DOCUMENT);
  private readonly lightbox = viewChild<ElementRef<HTMLDialogElement>>('lightbox');

  protected readonly slug = computed(() => this.wm.projectSlug() ?? '');
  protected readonly study = computed(() => caseStudy(this.slug()));
  protected readonly meta = computed(() => projectMeta(this.slug()));

  /** Repositório (lista ao vivo ou snapshot) para projetos sem texto curado. */
  protected readonly repo = computed(() => {
    const slug = this.slug();
    if (!slug || this.study()) return undefined;
    return (
      this.repos.list().repos.find((entry) => repoSlug(entry.name) === slug) ??
      FALLBACK_REPOS.find((entry) => repoSlug(entry.name) === slug)
    );
  });

  /** README em HTML, já renderizado pela API do GitHub. */
  protected readonly readme = httpResource.text(() => {
    const repo = this.repo();
    if (!repo) return undefined;
    return {
      url: `https://api.github.com/repos/${PROFILE.githubUser}/${repo.name}/readme`,
      headers: { Accept: 'application/vnd.github.html+json' },
    };
  });

  /** Imagem aberta no visualizador (índice na galeria do projeto). */
  protected readonly zoomIndex = signal<number | null>(null);
  protected readonly gallerySize = computed(() => this.study()?.gallery.length ?? 0);
  protected readonly zoomed = computed(() => {
    const index = this.zoomIndex();
    return index === null ? null : (this.study()?.gallery[index] ?? null);
  });

  constructor() {
    // JSON-LD do projeto (vai junto no HTML pré-renderizado).
    effect(() => {
      const slug = this.slug();
      const head = this.document.head;
      head.querySelector('script[data-ld="project"]')?.remove();
      if (!slug) return;
      const study = this.study();
      const meta = this.meta();
      const data = {
        '@context': 'https://schema.org',
        '@type': study ? 'SoftwareApplication' : 'SoftwareSourceCode',
        name: meta.name,
        description: meta.description,
        url: `https://joaoxavier.dev/projetos/${slug}`,
        author: { '@type': 'Person', name: 'João Xavier', url: 'https://joaoxavier.dev/' },
        ...(study
          ? { applicationCategory: 'BusinessApplication', keywords: study.stack.join(', ') }
          : {
              codeRepository: `https://github.com/${PROFILE.githubUser}/${this.repo()?.name ?? slug}`,
            }),
      };
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-ld', 'project');
      script.textContent = JSON.stringify(data);
      head.appendChild(script);
    });
  }

  protected open(index: number): void {
    this.zoomIndex.set(index);
    const dialog = this.lightbox()?.nativeElement;
    if (dialog && !dialog.open) dialog.showModal();
  }

  /** Avança ou volta, dando a volta no fim/início da galeria. */
  protected step(delta: number): void {
    const size = this.gallerySize();
    const index = this.zoomIndex();
    if (index === null || size < 2) return;
    this.zoomIndex.set((index + delta + size) % size);
  }

  /** Clique fora da imagem e dos botões (no fundo escurecido) fecha. */
  protected onBackdrop(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target === this.lightbox()?.nativeElement || target.classList.contains('viewer'))
      this.closeZoom();
  }

  protected closeZoom(): void {
    this.lightbox()?.nativeElement.close();
    this.zoomIndex.set(null);
  }
}
