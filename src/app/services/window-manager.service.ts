import { Service, computed, signal } from '@angular/core';
import { APPS, AppId, appById } from '../data/apps';

export interface WindowState {
  readonly id: AppId;
  readonly open: boolean;
  readonly minimized: boolean;
  readonly maximized: boolean;
  readonly z: number;
  readonly x: number;
  readonly y: number;
  /** Ponto (relativo à janela) de onde ela "cresce" ao abrir: o ícone clicado. */
  readonly origin: string;
}

type WindowMap = Readonly<Record<AppId, WindowState>>;

const closedState = (id: AppId, index: number): WindowState => ({
  id,
  open: false,
  minimized: false,
  maximized: false,
  z: 0,
  x: 250 + index * 36,
  y: 36 + index * 30,
  origin: '50% 50%',
});

/**
 * Estado das janelas do desktop e do app aberto no celular. Não mexe na
 * URL: quem liga rota e janela é o OsNavigator.
 */
@Service()
export class WindowManager {
  private zCounter = 10;

  private readonly windowMap = signal<WindowMap>(
    Object.fromEntries(APPS.map((app, index) => [app.id, closedState(app.id, index)])) as WindowMap,
  );

  readonly windows = computed(() => APPS.map((app) => this.windowMap()[app.id]));

  /** Janelas que aparecem na taskbar, na ordem em que foram abertas pela primeira vez. */
  readonly running = computed(() => this.windows().filter((win) => win.open));

  readonly focused = computed<AppId | null>(() => {
    const visible = this.windows().filter((win) => win.open && !win.minimized);
    if (visible.length === 0) return null;
    return visible.reduce((top, win) => (win.z > top.z ? win : top)).id;
  });

  /** App em tela cheia no celular (null = home). Quem define é a rota. */
  readonly phoneApp = signal<AppId | null>(null);

  /** Projeto mostrado na janela/app `projeto` (rota /projetos/:slug). */
  readonly projectSlug = signal<string | null>(null);

  state(id: AppId): WindowState {
    return this.windowMap()[id];
  }

  open(id: AppId, origin?: { x: number; y: number }, viewport?: { w: number; h: number }): void {
    const current = this.state(id);
    const app = appById(id);
    let { x, y } = current;
    if (!current.open && viewport) {
      // Tamanho real depois do limite da tela (a janela tem max-width/height de 100% − 16px).
      const w = Math.min(app.size.w, viewport.w - 16);
      const h = Math.min(app.size.h, viewport.h - 16);
      if (app.center) {
        x = Math.round((viewport.w - w) / 2);
        y = Math.round((viewport.h - h) / 2);
      }
      // Mantém a janela inteira dentro da área de trabalho.
      x = Math.max(8, Math.min(x, viewport.w - w - 8));
      y = Math.max(8, Math.min(y, viewport.h - h - 8));
    }
    const originCss = origin ? `${origin.x - x}px ${origin.y - y}px` : current.origin;
    this.patch(id, { open: true, minimized: false, z: ++this.zCounter, x, y, origin: originCss });
  }

  close(id: AppId): void {
    this.patch(id, { open: false, minimized: false, maximized: false });
  }

  minimize(id: AppId): void {
    this.patch(id, { minimized: true });
  }

  toggleMaximize(id: AppId): void {
    this.patch(id, { maximized: !this.state(id).maximized, z: ++this.zCounter });
  }

  focus(id: AppId): void {
    if (this.focused() === id) return;
    this.patch(id, { z: ++this.zCounter, minimized: false });
  }

  /** Clique no botão da taskbar: restaura, foca ou minimiza, como no Windows. */
  taskbarClick(id: AppId): void {
    const win = this.state(id);
    if (win.minimized || this.focused() !== id) this.focus(id);
    else this.minimize(id);
  }

  move(id: AppId, x: number, y: number): void {
    this.patch(id, { x, y });
  }

  private patch(id: AppId, change: Partial<WindowState>): void {
    this.windowMap.update((map) => ({ ...map, [id]: { ...map[id], ...change } }));
  }
}
