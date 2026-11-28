import { DOCUMENT, Location, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Service, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AppId, appById, isAppId } from '../data/apps';
import { projectMeta } from '../data/projects';
import { WindowManager } from '../services/window-manager.service';

const SITE = 'https://joaoxavier.dev';
const SITE_NAME = 'João Xavier';
const HOME_TITLE = 'João Xavier · dev .NET + Angular';
const HOME_DESCRIPTION =
  'João Xavier, engenheiro de software .NET, Angular e IA no Rio de Janeiro. Projetos, experiência, formação e todos os meus links num lugar só.';
const TASKBAR_PX = 36;

export type OsMode = 'desktop' | 'phone';

interface OpenOptions {
  readonly origin?: { x: number; y: number };
  readonly viewport?: { w: number; h: number };
  readonly slug?: string;
}

/**
 * A URL manda nas janelas. Cada app tem uma rota real (/projetos, /projetos/salome…),
 * pré-renderizada com título e descrição próprios.
 *
 * - Desktop: abrir, focar, minimizar ou fechar janela atualiza a URL (replace, sem
 *   encher o histórico); uma URL nova (link direto, voltar/avançar) abre ou foca a janela.
 * - Celular: abrir um app empilha a rota; voltar é `Location.back()`, então o voltar do
 *   Android também fecha o app.
 */
@Service()
export class OsNavigator {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly wm = inject(WindowManager);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mode = signal<OsMode>('desktop');

  /** Quantas entradas do histórico foram empilhadas dentro do site (decide o "voltar"). */
  private depth = 0;
  private firstNavigation = true;

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.firstNavigation) return;
        if (event.navigationTrigger === 'popstate') {
          this.depth = Math.max(0, this.depth - 1);
        } else if (!this.router.currentNavigation()?.extras.replaceUrl) {
          this.depth++;
        }
      } else if (event instanceof NavigationEnd) {
        this.firstNavigation = false;
        const { app, slug } = this.currentRoute();
        this.applyRoute(app, slug);
        this.updateSeo(app, slug);
      }
    });
  }

  /** Links antigos com hash (/#projetos) viram a rota real. */
  redirectLegacyHash(): void {
    if (!this.isBrowser) return;
    const hash = location.hash.replace('#', '');
    if (isAppId(hash) && hash !== 'projeto') {
      void this.router.navigateByUrl(`/${appById(hash).route}`, { replaceUrl: true });
    }
  }

  path(id: AppId, slug?: string | null): string {
    if (id === 'projeto') return `/projetos/${slug ?? ''}`;
    return `/${appById(id).route}`;
  }

  open(id: AppId, options: OpenOptions = {}): void {
    if (options.slug !== undefined) this.wm.projectSlug.set(options.slug);
    const target = this.path(id, options.slug ?? this.wm.projectSlug());
    if (this.mode() === 'phone') {
      void this.router.navigateByUrl(target);
      return;
    }
    this.wm.open(id, options.origin, options.viewport ?? this.viewport());
    void this.router.navigateByUrl(target, { replaceUrl: true });
  }

  close(id: AppId): void {
    this.wm.close(id);
    this.syncUrlToFocus();
  }

  minimize(id: AppId): void {
    this.wm.minimize(id);
    this.syncUrlToFocus();
  }

  focus(id: AppId): void {
    if (this.wm.focused() === id) return;
    this.wm.focus(id);
    this.syncUrlToFocus();
  }

  taskbarClick(id: AppId): void {
    this.wm.taskbarClick(id);
    this.syncUrlToFocus();
  }

  /** Voltar do celular: histórico quando o usuário veio de dentro do site; senão, home. */
  back(): void {
    if (this.depth > 0) {
      this.location.back();
    } else {
      void this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }

  home(): void {
    void this.router.navigateByUrl('/');
  }

  private syncUrlToFocus(): void {
    const focused = this.wm.focused();
    const target = focused ? this.path(focused, this.wm.projectSlug()) : '/';
    if (this.router.url !== target) {
      void this.router.navigateByUrl(target, { replaceUrl: true });
    }
  }

  private applyRoute(app: AppId | null, slug: string | null): void {
    if (app === 'projeto') this.wm.projectSlug.set(slug);
    this.wm.phoneApp.set(app);

    if (!app) {
      // Página inicial no desktop: o sobre.txt abre sozinho na primeira visita.
      if (this.wm.running().length === 0) this.wm.open('sobre', undefined, this.viewport());
      return;
    }
    const state = this.wm.state(app);
    if (!state.open || state.minimized) this.wm.open(app, undefined, this.viewport());
    else this.wm.focus(app);
  }

  private currentRoute(): { app: AppId | null; slug: string | null } {
    let snapshot: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (snapshot.firstChild) snapshot = snapshot.firstChild;
    const app = (snapshot.data['app'] as AppId | undefined) ?? null;
    return { app, slug: snapshot.paramMap.get('slug') };
  }

  private updateSeo(app: AppId | null, slug: string | null): void {
    let title = HOME_TITLE;
    let description = HOME_DESCRIPTION;
    let image = `${SITE}/og.png`;
    if (app === 'projeto' && slug) {
      const project = projectMeta(slug);
      title = `${project.name} · ${SITE_NAME}`;
      description = project.description;
      if (project.image) image = `${SITE}${project.image}`;
    } else if (app) {
      const seo = appById(app).seo;
      title = `${seo.title} · ${SITE_NAME}`;
      description = seo.description;
    }
    const url = `${SITE}${app ? this.path(app, slug) : '/'}`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private viewport(): { w: number; h: number } | undefined {
    if (!this.isBrowser) return undefined;
    return { w: innerWidth, h: innerHeight - TASKBAR_PX };
  }
}
