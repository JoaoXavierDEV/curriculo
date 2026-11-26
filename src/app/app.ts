import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Desktop } from './os/desktop';
import { Phone } from './os/phone';

const PHONE_QUERY = '(max-width: 767px)';

/** Desktop com janelas em telas largas; home de celular nas estreitas. */
@Component({
  selector: 'app-root',
  imports: [Desktop, Phone],
  template: `
    @if (isPhone()) {
      <app-phone />
    } @else {
      <app-desktop />
    }
  `,
})
export class App {
  protected readonly isPhone = signal(false);

  constructor() {
    if (typeof matchMedia !== 'function') return;
    const query = matchMedia(PHONE_QUERY);
    this.isPhone.set(query.matches);
    const onChange = (event: MediaQueryListEvent) => this.isPhone.set(event.matches);
    query.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
  }
}
