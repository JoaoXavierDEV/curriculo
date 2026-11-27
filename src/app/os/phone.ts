import {
  Component,
  computed,
  DestroyRef,
  afterNextRender,
  afterRenderEffect,
  effect,
  inject,
  signal,
} from '@angular/core';
import { APPS, AppId, DesktopIcon, PHONE_DOCK, PHONE_HOME, PhoneFolder } from '../data/apps';
import { PROFILE } from '../data/profile.data';
import { projectMeta } from '../data/projects';
import { SettingsService } from '../services/settings.service';
import { WindowManager } from '../services/window-manager.service';
import { AsciiKit, OFFSCREEN_CLEAR, loadAsciiKit } from '../ui/ascii-kit';
import { AppContent } from './app-content';
import { OsIcon } from './os-icon';
import { SvgIcon } from './svg-icon';
import { OsNavigator } from './os-navigator.service';

/** Recorte padrão quando não há ícone de origem (deep link, busca). */
const CENTER_INSET = '42% 38% 42% 38%';

function insetFrom(rect: DOMRect): string {
  const right = innerWidth - rect.right;
  const bottom = innerHeight - rect.bottom;
  return `${rect.top}px ${right}px ${bottom}px ${rect.left}px`;
}

/**
 * Celular: uma home no estilo Android. Os ícones de seção abrem "apps" em
 * tela cheia com "voltar" no topo; os atalhos abrem o link. Cada app é uma
 * rota, então o voltar do sistema (gesto ou botão) também fecha o app.
 */
@Component({
  selector: 'app-phone',
  imports: [OsIcon, SvgIcon, AppContent],
  templateUrl: './phone.html',
  styleUrl: './phone.css',
})
export class Phone {
  protected readonly wm = inject(WindowManager);
  protected readonly nav = inject(OsNavigator);
  protected readonly homeItems = PHONE_HOME;
  /** Pasta aberta no popup (null = fechada). */
  protected readonly folder = signal<PhoneFolder | null>(null);
  protected readonly dock = PHONE_DOCK;
  protected readonly apps = APPS;
  protected readonly profile = PROFILE;

  protected readonly projectName = computed(() => {
    const slug = this.wm.projectSlug();
    return slug ? projectMeta(slug).name : 'projeto';
  });
  protected readonly clock = signal('--:--');
  protected readonly date = signal('');
  /**
   * Retângulo do ícone tocado, como recorte `inset()` da tela: o app abre
   * crescendo a partir do ícone e fecha voltando para ele, como no Android.
   */
  protected readonly fromInset = signal(CENTER_INSET);
  /** De onde o popup da pasta cresce: o centro do ícone da pasta. */
  protected readonly folderOrigin = signal('50% 50%');

  private lastIcon: AppId | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Foco: entra no "voltar" do app aberto; volta para o ícone ao sair.
    afterRenderEffect(() => {
      const open = this.wm.phoneApp();
      if (open) {
        document.querySelector<HTMLElement>(`#tela-${open} .back`)?.focus({ preventScroll: true });
      } else if (this.lastIcon) {
        document
          .querySelector<HTMLElement>(`[data-app-icon="${this.lastIcon}"] .icon`)
          ?.focus({ preventScroll: true });
      }
    });

    afterNextRender(() => {
      const tick = () => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        this.clock.set(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
        this.date.set(
          now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
        );
      };
      tick();
      const timer = setInterval(tick, 15_000);

      loadAsciiKit()
        .then((loaded) => kit.set(loaded))
        .catch(() => {
          // Papel de parede estático.
        });

      destroyRef.onDestroy(() => {
        clearInterval(timer);
      });
    });

    // Papel de parede "matrix" conforme a configuração.
    const settings = inject(SettingsService);
    const kit = signal<AsciiKit | null>(null);
    let wallpaper: ReturnType<AsciiKit['background']> | null = null;
    destroyRef.onDestroy(() => wallpaper?.destroy());
    effect(() => {
      const mode = settings.settings().wallpaper;
      const asciiKit = kit();
      const host = document.querySelector<HTMLElement>('app-phone .wallpaper');
      if (!asciiKit || !host) return;
      if (mode === 'off') {
        wallpaper?.destroy();
        wallpaper = null;
        return;
      }
      const preset = mode === 'rain' ? asciiKit.cascade : asciiKit.caustics;
      if (wallpaper) wallpaper.setPreset(preset);
      else
        wallpaper = asciiKit.background(host, {
          preset,
          ink: '--ascii-ink',
          cellSize: 12,
          speed: 0.5,
          clear: OFFSCREEN_CLEAR,
        });
    });
  }

  protected open(icon: DesktopIcon, event: MouseEvent): void {
    if (icon.kind !== 'app') return;
    const target = event.currentTarget as HTMLElement;
    const art = target.querySelector<HTMLElement>('.art') ?? target;
    this.fromInset.set(insetFrom(art.getBoundingClientRect()));
    this.lastIcon = icon.id;
    this.nav.open(icon.id);
  }

  protected openFolder(folder: PhoneFolder, event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.folderOrigin.set(`${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`);
    this.folder.set(folder);
    document.querySelector<HTMLDialogElement>('app-phone .folder-popup')?.showModal();
  }

  protected closeFolder(): void {
    document.querySelector<HTMLDialogElement>('app-phone .folder-popup')?.close();
  }

  /** O <dialog> fechou (Esc, toque fora): devolve o foco ao ícone da pasta. */
  protected onFolderClosed(): void {
    const id = this.folder()?.id;
    this.folder.set(null);
    document.querySelector<HTMLElement>(`[data-folder="${id}"]`)?.focus({ preventScroll: true });
  }

  /** Toque no fundo escuro (fora do cartão) fecha a pasta. */
  protected onFolderBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeFolder();
  }

  protected openAbout(): void {
    this.fromInset.set(CENTER_INSET);
    this.lastIcon = null;
    this.nav.open('sobre');
  }

  protected home(): void {
    if (this.wm.phoneApp()) this.nav.home();
  }
}
