import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Desktop } from './os/desktop';
import { OsNavigator } from './os/os-navigator.service';
import { Phone } from './os/phone';
import { SettingsService } from './services/settings.service';

const PHONE_QUERY = '(max-width: 767px)';

/**
 * Desktop com janelas em telas largas; home de celular nas estreitas.
 * O HTML pré-renderizado é sempre o desktop (com o conteúdo para buscadores);
 * no celular, a troca acontece logo depois da hidratação.
 */
@Component({
  selector: 'app-root',
  imports: [Desktop, Phone, RouterOutlet],
  template: `
    <router-outlet />
    @if (isPhone()) {
      <app-phone />
    } @else {
      <app-desktop />
    }
  `,
})
export class App {
  protected readonly isPhone = signal(false);
  private readonly navigator = inject(OsNavigator);

  constructor() {
    inject(SettingsService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.navigator.redirectLegacyHash();
      const query = matchMedia(PHONE_QUERY);
      const apply = (phone: boolean) => {
        this.isPhone.set(phone);
        this.navigator.mode.set(phone ? 'phone' : 'desktop');
        document.documentElement.dataset['os'] = phone ? 'phone' : 'desktop';
      };
      apply(query.matches);
      const onChange = (event: MediaQueryListEvent) => apply(event.matches);
      query.addEventListener('change', onChange);
      destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
    });
  }
}
