import {
  Component,
  DestroyRef,
  afterNextRender,
  afterRenderEffect,
  effect,
  inject,
  signal,
} from '@angular/core';
import { APPS, AppId, DesktopIcon, PHONE_ICONS } from '../data/apps';
import { PROFILE } from '../data/profile.data';
import { SettingsService } from '../services/settings.service';
import { WindowManager } from '../services/window-manager.service';
import { AsciiKit, loadAsciiKit } from '../ui/ascii-kit';
import { AppContent } from './app-content';
import { OsIcon } from './os-icon';

/**
 * Celular: uma home no estilo Android. Os ícones de seção abrem "apps" em
 * tela cheia com "voltar" no topo; os atalhos abrem o link. Cada app entra no
 * histórico, então o voltar do sistema (gesto ou botão) também fecha o app.
 */
@Component({
  selector: 'app-phone',
  imports: [OsIcon, AppContent],
  templateUrl: './phone.html',
  styleUrl: './phone.css',
})
export class Phone {
  protected readonly wm = inject(WindowManager);
  protected readonly icons = PHONE_ICONS;
  protected readonly apps = APPS;
  protected readonly profile = PROFILE;

  protected readonly clock = signal('--:--');
  protected readonly date = signal('');
  /** De onde cada app "cresce" ao abrir: o centro do ícone tocado. */
  protected readonly origin = signal('50% 50%');

  private lastIcon: AppId | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const onPop = () => this.wm.syncFromHistory();
    // Link interno para #projetos etc. (troca só o hash): abre como um app.
    const onHash = () => {
      const linked = this.wm.appFromHash();
      if (linked && this.wm.phoneApp() !== linked) {
        history.replaceState(null, '', location.pathname + location.search);
        this.wm.openPhoneApp(linked);
      }
    };

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
      addEventListener('popstate', onPop);
      addEventListener('hashchange', onHash);

      const linked = this.wm.appFromHash();
      if (linked) {
        history.replaceState(null, '', location.pathname + location.search);
        this.wm.openPhoneApp(linked);
      }

      loadAsciiKit()
        .then((loaded) => kit.set(loaded))
        .catch(() => {
          // Papel de parede estático.
        });

      destroyRef.onDestroy(() => {
        clearInterval(timer);
        removeEventListener('popstate', onPop);
        removeEventListener('hashchange', onHash);
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
      const preset = mode === 'rain' ? asciiKit.cascade : asciiKit.drift;
      if (wallpaper) wallpaper.setPreset(preset);
      else
        wallpaper = asciiKit.background(host, {
          preset,
          ink: '--ascii-ink',
          cellSize: 12,
          speed: 0.5,
        });
    });
  }

  protected open(icon: DesktopIcon, event: MouseEvent): void {
    if (icon.kind !== 'app') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.origin.set(`${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`);
    this.lastIcon = icon.id;
    this.wm.openPhoneApp(icon.id);
  }

  protected openAbout(): void {
    this.origin.set('50% 20%');
    this.lastIcon = null;
    this.wm.openPhoneApp('sobre');
  }

  protected home(): void {
    if (this.wm.phoneApp()) this.wm.phoneBack();
  }
}
